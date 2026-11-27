import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { MAX_STROKE_WIDTH } from '../reducers/stroke-width';

import styles from './stroke-width-indicator.css';

/**
 * Stroke width used to be an inline number field, which is unusable on a phone.
 *
 * The control is one button with two gestures:
 *   - press and hold (or press and drag sideways) -> a track slides out over the
 *     colour swatches and the finger that is still down scrubs the width, capped
 *     at whatever the track shows
 *   - tap -> a small popover next to the button for accurate work: tenth steps
 *     and a field that takes any value
 *
 * The pointer is captured for the whole press so the finger can travel across
 * the track without the events being retargeted to whatever it is over.
 */
const LONG_PRESS_MS = 240;
const DRAG_START_PX = 6;
// The track spans 0-32 rather than 0-100: everything above that is a blob, and
// stretching the whole range across the track made one stroke unit sub-pixel.
const SCALE_MAX = 32;
const PRESETS = [0, 1, 2, 4, 8, 16];

const round2 = (value) => Math.round(value * 100) / 100;
const format = (value) => `${round2(value)}`;
// The knob sits inside the track, with a gap at each end, so the filled part can
// wrap around it and the knob never touches the track's caps. --knob is the knob
// diameter and --inset the gap, both set in the CSS.
const knobPosition = (ratio) => `calc(var(--inset) + ${ratio} * (100% - var(--knob) - 2 * var(--inset)))`;
const fillWidth = (ratio) =>
  `calc(var(--knob) + 2 * var(--inset) + ${ratio} * (100% - var(--knob) - 2 * var(--inset)))`;

class StrokeWidthIndicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scrubbing: false,
      dialogOpen: false,
      popoverStyle: null,
      // null means "show the value from props"; a string means the user is typing.
      typed: null
    };
    this.pressTimer = null;
    this.pointerId = null;
    this.track = null;
    this.buttonEl = null;
    this.popoverEl = null;
    this.moved = false;
  }

  componentWillUnmount() {
    this.clearPress();
    this.detachOutside();
  }

  clearPress() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  // Linear in the stroke width, so the thumb keeps up with the finger 1:1.
  // A project can already hold a wider value than the track covers; scale to
  // that instead of squashing the thumb against the end.
  scaleMax(width) {
    return Math.max(SCALE_MAX, width || 0);
  }

  thumbRatio(width) {
    return Math.min(1, (width || 0) / this.scaleMax(width));
  }

  setWidth(value, max = MAX_STROKE_WIDTH) {
    const next = round2(Math.max(0, Math.min(max, value)));
    if (next !== this.props.strokeWidth) this.props.onChangeStrokeWidth(next);
  }

  startScrubbing() {
    this.clearPress();
    if (this.state.dialogOpen) this.closeDialog();
    if (this.state.scrubbing) return;
    this.setState({ scrubbing: true });
  }

  attachOutside() {
    if (this.outsideAttached) return;
    document.addEventListener('pointerdown', this.handleOutsideDown, true);
    this.outsideAttached = true;
  }

  detachOutside() {
    if (!this.outsideAttached) return;
    document.removeEventListener('pointerdown', this.handleOutsideDown, true);
    this.outsideAttached = false;
  }

  handleOutsideDown = (event) => {
    if (!this.state.dialogOpen) return;
    const target = event.target;
    if (this.popoverEl && this.popoverEl.contains(target)) return;
    if (this.buttonEl && this.buttonEl.contains(target)) return;
    this.closeDialog();
  };

  openDialog() {
    const rect = this.buttonEl ? this.buttonEl.getBoundingClientRect() : null;
    this.setState({
      dialogOpen: true,
      typed: null,
      popoverStyle: rect
        ? {
            right: Math.max(8, window.innerWidth - rect.right),
            bottom: Math.max(8, window.innerHeight - rect.top + 8)
          }
        : null
    });
    this.attachOutside();
  }

  closeDialog() {
    this.detachOutside();
    if (this.state.dialogOpen) this.setState({ dialogOpen: false, typed: null });
  }

  handlePointerDown = (event) => {
    if (this.props.disabled) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startValue = this.props.strokeWidth || 0;
    this.scrubSpan = this.scaleMax(this.startValue);
    this.moved = false;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (e) {
      // Without pointer capture the gesture still works, just less precisely.
    }
    this.clearPress();
    this.pressTimer = setTimeout(() => {
      this.pressTimer = null;
      this.startScrubbing();
    }, LONG_PRESS_MS);
  };

  handlePointerMove = (event) => {
    if (!this.state.scrubbing) {
      // Dragging sideways without waiting is also a valid way to start.
      if (this.pressTimer && Math.abs(event.clientX - this.startX) > DRAG_START_PX) {
        this.moved = true;
        this.startScrubbing();
      }
      return;
    }
    if (!this.track) return;
    const trackWidth = this.track.getBoundingClientRect().width || 1;
    const delta = ((event.clientX - this.startX) / trackWidth) * this.scrubSpan;
    // Capped at the track's own range: dragging past the end used to keep
    // climbing to 100 while the thumb sat pinned at the end.
    this.setWidth(this.startValue + delta, this.scrubSpan);
  };

  handlePointerUp = (event) => {
    const wasPending = Boolean(this.pressTimer);
    this.clearPress();
    if (this.pointerId !== null) {
      try {
        event.currentTarget.releasePointerCapture(this.pointerId);
      } catch (e) {
        // Already released by the browser.
      }
      this.pointerId = null;
    }
    if (this.state.scrubbing) {
      this.setState({ scrubbing: false });
    } else if (wasPending && !this.moved) {
      // A plain tap: open the accurate popover.
      this.openDialog();
    }
  };

  handlePointerCancel = () => {
    this.clearPress();
    if (this.state.scrubbing) this.setState({ scrubbing: false });
  };

  handleRangeChange = (event) => {
    this.setWidth(Number(event.target.value), this.scaleMax(this.props.strokeWidth));
    this.setState({ typed: null });
  };

  handleTypedChange = (event) => {
    const text = event.target.value;
    this.setState({ typed: text });
    const parsed = parseFloat(text);
    if (Number.isFinite(parsed)) this.setWidth(parsed);
  };

  handleTypedBlur = () => {
    this.setState({ typed: null });
  };

  nudge(step) {
    this.setWidth((this.props.strokeWidth || 0) + step);
    this.setState({ typed: null });
  }

  renderPopover(width) {
    const max = this.scaleMax(width);
    const ratio = this.thumbRatio(width);
    return (
      <div
        className={styles.popover}
        style={this.state.popoverStyle}
        ref={(el) => {
          this.popoverEl = el;
        }}
      >
        <div className={styles.head}>
          <span className={styles.title}>
            <FormattedMessage
              defaultMessage="Stroke width"
              description="Label of the stroke width control"
              id="paint.strokeWidth.title"
            />
          </span>
          <input
            className={styles.number}
            inputMode="decimal"
            value={this.state.typed === null ? format(width) : this.state.typed}
            onBlur={this.handleTypedBlur}
            onChange={this.handleTypedChange}
          />
        </div>

        {/* The visible track is drawn here; the real range input sits on top of
            it, transparent, so the knob can look the same everywhere. */}
        <div className={styles.sliderWrap}>
          <div className={styles.dialogTrack}>
            <div className={styles.dialogFill} style={{ width: fillWidth(ratio) }} />
            <div className={styles.dialogThumb} style={{ left: knobPosition(ratio) }} />
          </div>
          <input
            className={styles.range}
            max={max}
            min="0"
            step="0.01"
            type="range"
            value={Math.min(width, max)}
            onChange={this.handleRangeChange}
          />
        </div>

        <div className={styles.stepperRow}>
          <button className={styles.stepper} onClick={() => this.nudge(-1)}>
            −1
          </button>
          <button className={styles.stepper} onClick={() => this.nudge(-0.1)}>
            −0.1
          </button>
          <button className={styles.stepper} onClick={() => this.nudge(0.1)}>
            +0.1
          </button>
          <button className={styles.stepper} onClick={() => this.nudge(1)}>
            +1
          </button>
        </div>

        <div className={styles.presetRow}>
          {PRESETS.map((preset) => (
            <button
              key={preset}
              className={Math.abs(preset - width) < 0.005 ? styles.presetActive : styles.preset}
              onClick={() => {
                this.setWidth(preset);
                this.setState({ typed: null });
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const width = this.props.strokeWidth ? this.props.strokeWidth : 0;
    const ratio = this.thumbRatio(width);
    // While a gesture is running the folded label is only there to hold the
    // button's width, so it keeps the text it had when the press started:
    // otherwise every step of the drag resizes the button and the tool bar
    // slides sideways under the finger.
    const frozen = typeof this.startValue === 'number' ? this.startValue : width;
    const foldedWidth = this.state.scrubbing || this.state.dialogOpen ? frozen : width;
    return (
      <React.Fragment>
        <button
          className={styles.button}
          disabled={this.props.disabled}
          ref={(el) => {
            this.buttonEl = el;
          }}
          onContextMenu={(event) => event.preventDefault()}
          onPointerCancel={this.handlePointerCancel}
          onPointerDown={this.handlePointerDown}
          onPointerMove={this.handlePointerMove}
          onPointerUp={this.handlePointerUp}
        >
          <span className={styles.srOnly}>
            <FormattedMessage
              defaultMessage="Stroke width"
              description="Label of the stroke width control"
              id="paint.strokeWidth.title"
            />
          </span>
          {/* Kept in the layout while scrubbing: the strip is absolutely
              positioned, so without this the button would collapse to its
              min-width and the whole tool bar would shift sideways. */}
          <span className={styles.folded} style={this.state.scrubbing ? { visibility: 'hidden' } : null}>
            <span className={styles.preview}>
              <span className={styles.previewBar} style={{ height: `${2 + Math.min(1, width / SCALE_MAX) * 16}px` }} />
            </span>
            <span className={styles.value}>{format(foldedWidth)}</span>
          </span>
          {this.state.scrubbing ? (
            <span className={styles.strip}>
              <span
                className={styles.track}
                ref={(el) => {
                  this.track = el;
                }}
              >
                <span className={styles.fill} style={{ width: fillWidth(ratio) }} />
                <span className={styles.thumb} style={{ left: knobPosition(ratio) }} />
              </span>
              <span className={styles.stripValue}>{format(width)}</span>
            </span>
          ) : null}
        </button>
        {this.state.dialogOpen ? ReactDOM.createPortal(this.renderPopover(width), document.body) : null}
      </React.Fragment>
    );
  }
}

StrokeWidthIndicator.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onChangeStrokeWidth: PropTypes.func.isRequired,
  strokeWidth: PropTypes.number
};

export default StrokeWidthIndicator;
