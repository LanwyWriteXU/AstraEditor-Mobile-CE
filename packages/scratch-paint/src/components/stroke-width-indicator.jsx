import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Popover from 'react-popover';

import Input from './forms/input.jsx';
import LiveInputHOC from './forms/live-input-hoc.jsx';

import { MAX_STROKE_WIDTH } from '../reducers/stroke-width';

import styles from './stroke-width-indicator.css';

const LiveInput = LiveInputHOC(Input);

const PRESETS = [0, 2, 4, 8, 16];

/**
 * Stroke width used to be an inline number field, which is unusable on a phone.
 * It is now a single button:
 *   - tap        -> opens the width panel (slider + number field + presets)
 *   - long press -> opens the same panel, so the finger that is still down can
 *                   drag the slider straight away
 */
class StrokeWidthIndicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.longPressTimer = null;
    this.didLongPress = false;
  }

  componentWillUnmount() {
    this.clearLongPress();
  }

  clearLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  handlePointerDown = () => {
    if (this.props.disabled) return;
    this.didLongPress = false;
    this.clearLongPress();
    this.longPressTimer = setTimeout(() => {
      this.longPressTimer = null;
      this.didLongPress = true;
      this.setState({ open: true });
    }, 500);
  };

  handlePointerUp = () => {
    const wasPending = Boolean(this.longPressTimer);
    this.clearLongPress();
    if (this.props.disabled) return;
    if (wasPending && !this.didLongPress) {
      this.setState((prev) => ({ open: !prev.open }));
    }
  };

  handlePointerCancel = () => {
    this.clearLongPress();
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleChange = (value) => {
    const width = Number(value);
    if (Number.isNaN(width)) return;
    this.props.onChangeStrokeWidth(Math.max(0, Math.min(MAX_STROKE_WIDTH, width)));
  };

  render() {
    const width = this.props.strokeWidth ? this.props.strokeWidth : 0;
    const fillRatio = Math.min(1, width / MAX_STROKE_WIDTH);

    return (
      <Popover
        body={
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <FormattedMessage
                defaultMessage="Stroke width"
                description="Title of the stroke width panel"
                id="paint.strokeWidth.title"
              />
              <span className={styles.panelValue}>{width}</span>
            </div>
            <input
              className={styles.slider}
              max={MAX_STROKE_WIDTH}
              min="0"
              step="1"
              type="range"
              value={width}
              onChange={(event) => this.handleChange(event.target.value)}
            />
            <div className={styles.panelRow}>
              {PRESETS.filter((preset) => preset <= MAX_STROKE_WIDTH).map((preset) => (
                <button
                  key={preset}
                  className={preset === width ? styles.presetActive : styles.preset}
                  onClick={() => this.handleChange(preset)}
                >
                  {preset}
                </button>
              ))}
              <LiveInput
                range
                small
                max={MAX_STROKE_WIDTH}
                min="0"
                type="number"
                value={width}
                onSubmit={this.handleChange}
              />
            </div>
          </div>
        }
        isOpen={this.state.open}
        preferPlace="above"
        onOuterAction={this.handleClose}
      >
        <button
          className={styles.button}
          disabled={this.props.disabled}
          onContextMenu={(event) => event.preventDefault()}
          onPointerCancel={this.handlePointerCancel}
          onPointerDown={this.handlePointerDown}
          onPointerLeave={this.handlePointerCancel}
          onPointerUp={this.handlePointerUp}
        >
          <span className={styles.preview}>
            <span className={styles.previewBar} style={{ height: `${2 + fillRatio * 16}px` }} />
          </span>
          <span className={styles.value}>{width}</span>
        </button>
      </Popover>
    );
  }
}

StrokeWidthIndicator.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onChangeStrokeWidth: PropTypes.func.isRequired,
  strokeWidth: PropTypes.number
};

export default StrokeWidthIndicator;
