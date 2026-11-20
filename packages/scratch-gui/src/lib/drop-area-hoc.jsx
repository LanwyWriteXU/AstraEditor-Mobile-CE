import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import omit from 'lodash.omit';
import { connect } from 'react-redux';

/**
 * Higher Order Component to give components the ability to react to drag overs
 * and drops of objects stored in the assetDrag redux state.
 *
 * Example: You want to enable MyComponent to receive drops from a drag type
 *    Wrapped = DropAreaHOC([...dragTypes])(
 *      <MyComponent />
 *    )
 *
 * MyComponent now receives 2 new props
 *      containerRef: a ref that must be set on the container element
 *      dragOver: boolean if an asset is being dragged above the component
 *
 * Use the wrapped component:
 *    <Wrapped onDrop={yourDropHandler} />
 *
 * NB: This HOC _only_ works with objects that drag using the assetDrag reducer.
 *     This _does not_ handle drags for blocks coming from the workspace.
 *
 * @param {Array.<string>} dragTypes Types to respond to, from DragConstants
 * @returns {function} The HOC, specialized for those drag types
 */
const DropAreaHOC = function (dragTypes) {
  /**
   * Return the HOC, specialized for the dragTypes
   * @param {React.Component} WrappedComponent component to receive drop behaviors
   * @returns {React.Component} component with drag over/drop behavior
   */
  return function (WrappedComponent) {
    class DropAreaWrapper extends React.Component {
      constructor(props) {
        super(props);
        bindAll(this, ['setRef', 'handlePointerMove', 'handleTouchMove']);

        this.state = {
          dragOver: false
        };

        this.ref = null;
        this.pointer = null;
      }

      componentDidMount() {
        // The wrapped area can mount or expand in the middle of a drag, so highlight it
        // from the live pointer position rather than from a rectangle cached at drag start.
        document.addEventListener('pointermove', this.handlePointerMove);
        document.addEventListener('touchmove', this.handleTouchMove, { passive: true });
        this.updateDragOver(this.props.dragInfo);
      }

      componentDidUpdate() {
        // The area can change size while a drag is in progress (the backpack expands
        // under the pointer), and then no mouse event fires to update the highlight.
        this.updateDragOver(this.props.dragInfo);
      }

      componentWillUnmount() {
        document.removeEventListener('pointermove', this.handlePointerMove);
        document.removeEventListener('touchmove', this.handleTouchMove, { passive: true });
      }

      handlePointerMove(e) {
        this.pointer = { x: e.clientX, y: e.clientY };
        this.updateDragOver(this.props.dragInfo);
      }

      handleTouchMove(e) {
        const touch = e.touches && e.touches[0];
        if (!touch) return;
        this.pointer = { x: touch.clientX, y: touch.clientY };
        this.updateDragOver(this.props.dragInfo);
      }

      UNSAFE_componentWillReceiveProps(newProps) {
        // If `dragging` becomes false, call the drop handler
        if (
          !newProps.dragInfo.dragging &&
          this.props.dragInfo.dragging &&
          this.state.dragOver &&
          dragTypes.includes(this.props.dragInfo.dragType)
        ) {
          this.props.onDrop(this.props.dragInfo);
          this.setState({ dragOver: false });
          return;
        }

        this.updateDragOver(newProps.dragInfo);
      }

      /**
       * Highlight the drop area while a matching asset is dragged over it. The rectangle
       * is measured live: the area may not exist yet when the drag starts (collapsed
       * backpack) and it may move or resize while the drag is in progress.
       * @param {object} dragInfo The assetDrag state
       */
      updateDragOver(dragInfo) {
        if (!dragInfo || !dragInfo.dragging || !dragTypes.includes(dragInfo.dragType)) {
          if (this.state.dragOver) this.setState({ dragOver: false });
          return;
        }
        const rect = this.ref && this.ref.getBoundingClientRect();
        const point = this.pointer || dragInfo.currentOffset;
        if (!rect || !point) return;
        const isOver = point.x > rect.left && point.x < rect.right && point.y > rect.top && point.y < rect.bottom;
        if (isOver !== this.state.dragOver) {
          this.setState({ dragOver: isOver });
        }
      }
      setRef(el) {
        this.ref = el;
        if (this.props.componentRef) {
          this.props.componentRef(this.ref);
        }
      }
      render() {
        const componentProps = omit(this.props, ['onDrop', 'dragInfo', 'componentRef']);
        return <WrappedComponent containerRef={this.setRef} dragOver={this.state.dragOver} {...componentProps} />;
      }
    }

    DropAreaWrapper.propTypes = {
      componentRef: PropTypes.func,
      dragInfo: PropTypes.shape({
        currentOffset: PropTypes.shape({
          x: PropTypes.number,
          y: PropTypes.number
        }),
        dragType: PropTypes.string,
        dragging: PropTypes.bool,
        index: PropTypes.number
      }),
      onDrop: PropTypes.func
    };

    const mapStateToProps = (state) => ({
      dragInfo: state.scratchGui.assetDrag
    });

    const mapDispatchToProps = () => ({});

    return connect(mapStateToProps, mapDispatchToProps)(DropAreaWrapper);
  };
};

export default DropAreaHOC;
