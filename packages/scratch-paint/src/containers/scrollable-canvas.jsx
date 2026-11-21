import paper from '@turbowarp/paper';
import PropTypes from 'prop-types';

import React from 'react';
import { connect } from 'react-redux';
import ScrollableCanvasComponent from '../components/scrollable-canvas/scrollable-canvas.jsx';

import { clampViewBounds, pan, zoomOnFixedPoint, getWorkspaceBounds } from '../helper/view';
import { updateViewBounds } from '../reducers/view-bounds';
import { redrawSelectionBox } from '../reducers/selected-items';

import { getEventXY } from '../lib/touch-utils';
import bindAll from 'lodash.bindall';

class ScrollableCanvas extends React.Component {
  static get ZOOM_INCREMENT() {
    return 0.5;
  }
  constructor(props) {
    super(props);
    bindAll(this, [
      'handleMouseDown',
      'handleDragMove',
      'handleDragEnd',
      'handleHorizontalScrollbarMouseDown',
      'handleHorizontalScrollbarMouseMove',
      'handleHorizontalScrollbarMouseUp',
      'handleVerticalScrollbarMouseDown',
      'handleVerticalScrollbarMouseMove',
      'handleVerticalScrollbarMouseUp',
      'handleWheel',
      'handlePinchPointerDown',
      'handlePinchPointerMove',
      'handlePinchPointerUp'
    ]);
    // Paper draws from pointer events, so a two-finger gesture has to intercept
    // them before the canvas does, otherwise pinching also paints a stroke.
    this.activePointers = new Map();
    this.pinchDistance = null;
    this.pinchMidpoint = null;
    this.pointerHost = null;
  }
  componentDidMount() {
    if (this.props.canvas) {
      this.props.canvas.addEventListener('wheel', this.handleWheel);
      this.props.canvas.addEventListener('mousedown', this.handleMouseDown);
      this.attachPinchListeners(this.props.canvas);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.canvas) {
      if (this.props.canvas) {
        this.props.canvas.removeEventListener('wheel', this.handleWheel);
        this.props.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.detachPinchListeners();
      }
      nextProps.canvas.addEventListener('wheel', this.handleWheel);
      nextProps.canvas.addEventListener('mousedown', this.handleMouseDown);
      this.attachPinchListeners(nextProps.canvas);
    }
  }
  componentWillUnmount() {
    this.detachPinchListeners();
  }
  attachPinchListeners(canvas) {
    // Captured on the parent element: the capture phase runs before the canvas
    // listeners paper registered, which is the only way to keep it from drawing.
    this.pointerHost = canvas.parentElement || canvas;
    this.pointerHost.addEventListener('pointerdown', this.handlePinchPointerDown, true);
    this.pointerHost.addEventListener('pointermove', this.handlePinchPointerMove, true);
    this.pointerHost.addEventListener('pointerup', this.handlePinchPointerUp, true);
    this.pointerHost.addEventListener('pointercancel', this.handlePinchPointerUp, true);
  }
  detachPinchListeners() {
    if (this.pointerHost) {
      this.pointerHost.removeEventListener('pointerdown', this.handlePinchPointerDown, true);
      this.pointerHost.removeEventListener('pointermove', this.handlePinchPointerMove, true);
      this.pointerHost.removeEventListener('pointerup', this.handlePinchPointerUp, true);
      this.pointerHost.removeEventListener('pointercancel', this.handlePinchPointerUp, true);
    }
    this.pointerHost = null;
    this.activePointers.clear();
    this.pinchDistance = null;
    this.pinchMidpoint = null;
  }
  getPinchPair() {
    const points = Array.from(this.activePointers.values());
    if (points.length < 2) return null;
    return [points[0], points[1]];
  }
  handlePinchPointerDown(event) {
    if (event.pointerType !== 'touch') return;
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.activePointers.size < 2) return;
    // Second finger down: start the gesture and swallow the event so paper does
    // not begin a stroke with it.
    const pair = this.getPinchPair();
    if (!pair) return;
    event.preventDefault();
    event.stopPropagation();
    this.pinchDistance = Math.hypot(pair[0].x - pair[1].x, pair[0].y - pair[1].y);
    this.pinchMidpoint = { x: (pair[0].x + pair[1].x) / 2, y: (pair[0].y + pair[1].y) / 2 };
  }
  /**
   * Two fingers zoom around their midpoint (and dragging both pans the view).
   * Paper has no pinch support, so the gesture is translated into the same view
   * helpers the scrollbars and the wheel already use.
   */
  handlePinchPointerMove(event) {
    if (!this.activePointers.has(event.pointerId)) return;
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pinchDistance === null) return;

    // While pinching, no pointer (including the first finger) may reach paper.
    event.preventDefault();
    event.stopPropagation();

    const pair = this.getPinchPair();
    if (!pair) return;

    const distance = Math.hypot(pair[0].x - pair[1].x, pair[0].y - pair[1].y);
    const midpoint = { x: (pair[0].x + pair[1].x) / 2, y: (pair[0].y + pair[1].y) / 2 };
    const rect = this.props.canvas.getBoundingClientRect();
    const fixedPoint = paper.view.viewToProject(new paper.Point(midpoint.x - rect.left, midpoint.y - rect.top));

    if (distance > 0 && this.pinchDistance > 0) {
      const ratio = distance / this.pinchDistance;
      const deltaZoom = paper.view.zoom * (ratio - 1);
      if (Math.abs(deltaZoom) > 0.0001) {
        zoomOnFixedPoint(deltaZoom, fixedPoint);
      }
    }

    if (this.pinchMidpoint) {
      const dx = (this.pinchMidpoint.x - midpoint.x) / paper.view.zoom;
      const dy = (this.pinchMidpoint.y - midpoint.y) / paper.view.zoom;
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        pan(dx, dy);
      }
    }

    this.pinchDistance = distance;
    this.pinchMidpoint = midpoint;
    this.props.updateViewBounds(paper.view.matrix);
    this.props.redrawSelectionBox();
  }
  handlePinchPointerUp(event) {
    this.activePointers.delete(event.pointerId);
    if (this.activePointers.size < 2) {
      this.pinchDistance = null;
      this.pinchMidpoint = null;
    }
  }
  handleMouseDown(event) {
    if (event.button === 1) {
      event.preventDefault();
      const { x, y } = getEventXY(event);
      this.initialMouseX = x;
      this.initialMouseY = y;
      this.initialScreenX = paper.view.matrix.tx;
      this.initialScreenY = paper.view.matrix.ty;
      this.initialCursor = this.props.canvas.style.cursor;
      this.props.canvas.style.cursor = 'move';
      window.addEventListener('mousemove', this.handleDragMove);
      window.addEventListener('mouseup', this.handleDragEnd);
    }
  }
  handleDragMove(event) {
    event.preventDefault();
    const { x, y } = getEventXY(event);
    paper.view.matrix.ty = this.initialScreenY - (this.initialMouseY - y);
    paper.view.matrix.tx = this.initialScreenX - (this.initialMouseX - x);
    clampViewBounds();
    this.props.updateViewBounds(paper.view.matrix);
    if (this.props.canvas) {
      this.props.canvas.style.cursor = 'move';
    }
  }
  handleDragEnd(event) {
    event.preventDefault();
    window.removeEventListener('mousemove', this.handleDragMove);
    window.removeEventListener('mouseup', this.handleDragEnd);
    if (this.props.canvas) {
      this.props.canvas.style.cursor = this.initialCursor;
    }
  }
  handleHorizontalScrollbarMouseDown(event) {
    this.initialMouseX = getEventXY(event).x;
    this.initialScreenX = paper.view.matrix.tx;
    window.addEventListener('mousemove', this.handleHorizontalScrollbarMouseMove);
    window.addEventListener('touchmove', this.handleHorizontalScrollbarMouseMove, { passive: false });
    window.addEventListener('mouseup', this.handleHorizontalScrollbarMouseUp);
    window.addEventListener('touchend', this.handleHorizontalScrollbarMouseUp);
    event.preventDefault();
  }
  handleHorizontalScrollbarMouseMove(event) {
    const dx = this.initialMouseX - getEventXY(event).x;
    paper.view.matrix.tx = this.initialScreenX + dx * paper.view.zoom * 2;
    clampViewBounds();
    this.props.updateViewBounds(paper.view.matrix);
    event.preventDefault();
  }
  handleHorizontalScrollbarMouseUp() {
    window.removeEventListener('mousemove', this.handleHorizontalScrollbarMouseMove);
    window.removeEventListener('touchmove', this.handleHorizontalScrollbarMouseMove, { passive: false });
    window.removeEventListener('mouseup', this.handleHorizontalScrollbarMouseUp);
    window.removeEventListener('touchend', this.handleHorizontalScrollbarMouseUp);
    this.initialMouseX = null;
    this.initialScreenX = null;
    event.preventDefault();
  }
  handleVerticalScrollbarMouseDown(event) {
    this.initialMouseY = getEventXY(event).y;
    this.initialScreenY = paper.view.matrix.ty;
    window.addEventListener('mousemove', this.handleVerticalScrollbarMouseMove);
    window.addEventListener('touchmove', this.handleVerticalScrollbarMouseMove, { passive: false });
    window.addEventListener('mouseup', this.handleVerticalScrollbarMouseUp);
    window.addEventListener('touchend', this.handleVerticalScrollbarMouseUp);
    event.preventDefault();
  }
  handleVerticalScrollbarMouseMove(event) {
    const dy = this.initialMouseY - getEventXY(event).y;
    paper.view.matrix.ty = this.initialScreenY + dy * paper.view.zoom * 2;
    clampViewBounds();
    this.props.updateViewBounds(paper.view.matrix);
    event.preventDefault();
  }
  handleVerticalScrollbarMouseUp(event) {
    window.removeEventListener('mousemove', this.handleVerticalScrollbarMouseMove);
    window.removeEventListener('touchmove', this.handleVerticalScrollbarMouseMove, { passive: false });
    window.removeEventListener('mouseup', this.handleVerticalScrollbarMouseUp);
    window.removeEventListener('touchend', this.handleVerticalScrollbarMouseUp);
    this.initialMouseY = null;
    this.initialScreenY = null;
    event.preventDefault();
  }
  handleWheel(event) {
    // Multiplier variable, so that non-pixel-deltaModes are supported. Needed for Firefox.
    // See #529 (or LLK/scratch-blocks#1190).
    const multiplier = event.deltaMode === 0x1 ? 15 : 1;
    const deltaX = event.deltaX * multiplier;
    const deltaY = event.deltaY * multiplier;
    const canvasRect = this.props.canvas.getBoundingClientRect();
    const offsetX = event.clientX - canvasRect.left;
    const offsetY = event.clientY - canvasRect.top;
    const fixedPoint = paper.view.viewToProject(new paper.Point(offsetX, offsetY));
    if (event.metaKey || event.ctrlKey) {
      // Zoom keeping mouse location fixed
      zoomOnFixedPoint(-deltaY / 500, fixedPoint);
      this.props.updateViewBounds(paper.view.matrix);
      this.props.redrawSelectionBox(); // Selection handles need to be resized after zoom
    } else if (event.shiftKey && event.deltaX === 0) {
      // Scroll horizontally (based on vertical scroll delta)
      // This is needed as for some browser/system combinations which do not set deltaX.
      // See #156.
      const dx = deltaY / paper.view.zoom;
      pan(dx, 0);
      this.props.updateViewBounds(paper.view.matrix);
    } else {
      const dx = deltaX / paper.view.zoom;
      const dy = deltaY / paper.view.zoom;
      pan(dx, dy);
      this.props.updateViewBounds(paper.view.matrix);
      if (paper.tool) {
        paper.tool.view._handleMouseEvent('mousemove', event, fixedPoint);
      }
    }
    event.preventDefault();
  }
  render() {
    let widthPercent = 0;
    let heightPercent = 0;
    let topPercent = 0;
    let leftPercent = 0;
    if (paper.project) {
      const bounds = getWorkspaceBounds();
      const { x, y, width, height } = paper.view.bounds;
      widthPercent = Math.min(100, (100 * width) / bounds.width);
      heightPercent = Math.min(100, (100 * height) / bounds.height);
      const centerX = (x + width / 2 - bounds.x) / bounds.width;
      const centerY = (y + height / 2 - bounds.y) / bounds.height;
      topPercent = Math.max(0, 100 * centerY - heightPercent / 2);
      leftPercent = Math.max(0, 100 * centerX - widthPercent / 2);
    }
    return (
      <ScrollableCanvasComponent
        hideScrollbars={this.props.hideScrollbars}
        horizontalScrollLengthPercent={widthPercent}
        horizontalScrollStartPercent={leftPercent}
        style={this.props.style}
        verticalScrollLengthPercent={heightPercent}
        verticalScrollStartPercent={topPercent}
        onHorizontalScrollbarMouseDown={this.handleHorizontalScrollbarMouseDown}
        onVerticalScrollbarMouseDown={this.handleVerticalScrollbarMouseDown}
      >
        {this.props.children}
      </ScrollableCanvasComponent>
    );
  }
}

ScrollableCanvas.propTypes = {
  canvas: PropTypes.instanceOf(Element),
  children: PropTypes.node.isRequired,
  hideScrollbars: PropTypes.bool,
  redrawSelectionBox: PropTypes.func.isRequired,
  style: PropTypes.string,
  updateViewBounds: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  viewBounds: state.scratchPaint.viewBounds
});
const mapDispatchToProps = (dispatch) => ({
  redrawSelectionBox: () => {
    dispatch(redrawSelectionBox());
  },
  updateViewBounds: (matrix) => {
    dispatch(updateViewBounds(matrix));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ScrollableCanvas);
