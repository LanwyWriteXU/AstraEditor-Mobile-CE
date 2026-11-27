import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import { getEventXY } from '../../lib/touch-utils';

import styles from './slider.css';

const CONTAINER_WIDTH = 150;
const HANDLE_WIDTH = 26;

class SliderComponent extends React.Component {
  constructor(props) {
    super(props);
    bindAll(this, [
      'handleMouseDown',
      'handleMouseUp',
      'handleMouseMove',
      'handleClickBackground',
      'setBackground',
      'setHandle'
    ]);

    // Distance from the left edge of the slider handle to the mouse down/click event
    this.handleClickOffset = 0;
  }

  handleMouseDown(event) {
    event.preventDefault();
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchmove', this.handleMouseMove, { passive: false });
    document.addEventListener('touchend', this.handleMouseUp);

    this.handleClickOffset = getEventXY(event).x - this.handle.getBoundingClientRect().left;
  }

  // The handle grows with the breakpoint and the popover is zoomed, so the
  // measured box is the only trustworthy width. The hard coded constant made
  // the drag math drift whenever either of those changed.
  _handleWidth() {
    return this.handle ? this.handle.getBoundingClientRect().width : HANDLE_WIDTH;
  }

  handleMouseUp() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchmove', this.handleMouseMove, { passive: false });
    document.removeEventListener('touchend', this.handleMouseUp);
  }

  handleMouseMove(event) {
    event.preventDefault();
    this.props.onChange(this.scaleMouseToSliderPosition(event));
  }

  handleClickBackground(event) {
    // Because the slider handle is a child of the "background" element this handler is registered to, it calls this
    // when clicked as well. We only want to change the slider value if the user clicked on the background itself.
    if (event.target !== this.background) return;
    // Move slider handle's center to the cursor
    this.handleClickOffset = this._handleWidth() / 2;
    this.props.onChange(this.scaleMouseToSliderPosition(event));
  }

  scaleMouseToSliderPosition(event) {
    const { x } = getEventXY(event);
    const backgroundBBox = this.background.getBoundingClientRect();
    const scaledX = x - backgroundBBox.left - this.handleClickOffset;
    // Both the bounding boxes and the pointer coordinates are in zoomed pixels,
    // so mixing in the unzoomed HANDLE_WIDTH would skew the ratio.
    const handleWidth = this._handleWidth();
    return Math.max(0, Math.min(100, (100 * scaledX) / (backgroundBBox.width - handleWidth)));
  }

  setBackground(ref) {
    this.background = ref;
  }

  setHandle(ref) {
    this.handle = ref;
  }

  render() {
    // Percentage based offset: the track is 150px on desktop but fills the
    // picker on phones, and the handle size changes with the breakpoint. Doing
    // the math here would freeze both values at their defaults.
    const travel = (this.props.value / 100).toFixed(4);
    return (
      <div
        className={classNames({
          [styles.container]: true,
          [styles.last]: this.props.lastSlider
        })}
        ref={this.setBackground}
        style={{
          backgroundImage: this.props.background
        }}
        onClick={this.handleClickBackground}
      >
        <div
          className={styles.handle}
          ref={this.setHandle}
          style={{
            left: `calc(${this.props.value}% - ${travel} * var(--handle-size, ${HANDLE_WIDTH}px))`
          }}
          onMouseDown={this.handleMouseDown}
          onTouchStart={this.handleMouseDown}
        />
      </div>
    );
  }
}

SliderComponent.propTypes = {
  background: PropTypes.string,
  lastSlider: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired
};

SliderComponent.defaultProps = {
  background: 'yellow'
};

export default SliderComponent;
export { CONTAINER_WIDTH, HANDLE_WIDTH };
