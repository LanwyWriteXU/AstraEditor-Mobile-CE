import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import Popover from 'react-popover';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './dropdown.css';

import dropdownIcon from '!../../tw-recolor/build!./dropdown-caret.svg';
import TWRenderRecoloredImage from '../../tw-recolor/render.jsx';

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    bindAll(this, ['handleClosePopover', 'handleToggleOpenState', 'isOpen']);
    this.state = {
      isOpen: false,
      // Keeping the menu mounted for the length of the exit animation: the
      // popover's own exit timer does not fire, it unmounts on the next tick.
      closing: false
    };
  }
  handleClosePopover() {
    if (this.state.closing) return;
    if (!this.state.isOpen) return;
    this.setState({ closing: true });
    clearTimeout(this.exitTimer);
    this.exitTimer = setTimeout(() => {
      this.setState({ isOpen: false, closing: false });
    }, 160);
  }
  handleToggleOpenState() {
    clearTimeout(this.exitTimer);
    if (this.state.closing) {
      // Reopening while the exit animation plays: just cancel the exit.
      this.setState({ closing: false });
      return;
    }
    if (this.state.isOpen) {
      // Closing always goes through the animated path, otherwise the menu
      // disappears on the next frame and the exit animation never plays.
      this.handleClosePopover();
      return;
    }
    this.setState({ isOpen: true });
    if (this.props.onOpen) {
      this.props.onOpen();
    }
  }
  isOpen() {
    return this.state.isOpen;
  }
  render() {
    // Wrapped so the menu can play a matching exit animation: react-popover
    // keeps the body mounted for `enterExitTransitionDurationMs` after closing,
    // which is the window we animate in.
    const body = (
      <div className={classNames(styles.menu, { [styles.menuClosing]: !this.state.isOpen })}>
        {this.props.popoverContent}
      </div>
    );
    return (
      <Popover
        body={body}
        isOpen={this.state.isOpen}
        preferPlace="below"
        onOuterAction={this.props.onOuterAction ? this.props.onOuterAction : this.handleClosePopover}
        {...this.props}
        enterExitTransitionDurationMs={180}
      >
        <div
          className={classNames(styles.dropdown, this.props.className, {
            [styles.modOpen]: this.state.isOpen,
            [styles.modClosed]: !this.state.isOpen
          })}
          onClick={this.handleToggleOpenState}
        >
          {this.props.children}
          <TWRenderRecoloredImage
            className={classNames(styles.dropdownIcon, {
              [styles.modCaretUp]: this.state.isOpen
            })}
            draggable={false}
            src={dropdownIcon}
          />
        </div>
      </Popover>
    );
  }
}

Dropdown.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onOpen: PropTypes.func,
  onOuterAction: PropTypes.func,
  popoverContent: PropTypes.node.isRequired
};

export default Dropdown;
