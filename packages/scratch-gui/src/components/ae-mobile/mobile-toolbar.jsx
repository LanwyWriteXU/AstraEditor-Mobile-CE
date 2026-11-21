import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import codeIcon from '../gui/icon--code.svg';
import costumesIcon from '../gui/icon--costumes.svg';
import soundsIcon from '../gui/icon--sounds.svg';
import monacoIcon from '../gui/icon--monaco.svg';
import spriteIcon from '../action-menu/icon--sprite.svg';
import fullscreenIcon from '../stage-header/icon--fullscreen.svg';
import unfullscreenIcon from '../stage-header/icon--unfullscreen.svg';
import stopIcon from '../stop-all/icon--stop-all.svg';
import greenFlagIcon from '../green-flag/icon--green-flag.svg';
import pauseIcon from './icons/icon--pause.svg';
import playIcon from './icons/icon--play.svg';
import AddSpriteMenu from './add-sprite-menu.jsx';
import { CloseIcon, MoreIcon } from './icons.jsx';

import styles from './mobile-toolbar.css';

const messages = defineMessages({
  more: {
    id: 'ae.mobile.more',
    defaultMessage: 'More',
    description: 'Tooltip for the more actions button in the mobile toolbar'
  },
  sprites: {
    id: 'gui.SpriteInfo.sprite',
    defaultMessage: 'Sprite',
    description: 'Tooltip for the sprite panel button in the mobile toolbar'
  },
  code: {
    id: 'gui.gui.codeTab',
    defaultMessage: 'Code',
    description: 'Label for the blocks editor'
  },
  costumes: {
    id: 'gui.gui.costumesTab',
    defaultMessage: 'Costumes',
    description: 'Label for the costume editor'
  },
  sounds: {
    id: 'gui.gui.soundsTab',
    defaultMessage: 'Sounds',
    description: 'Label for the sound editor'
  },
  monaco: {
    id: 'ae.mobile.codeEditor',
    defaultMessage: 'Code editor',
    description: 'Label for the text code editor'
  },
  stage: {
    id: 'gui.stageHeader.stageSizeFull',
    defaultMessage: 'Enter full screen mode',
    description: 'Tooltip for the full screen stage button'
  },
  stop: {
    id: 'gui.controls.stop',
    defaultMessage: 'Stop',
    description: 'Tooltip for the stop button in the mobile toolbar'
  },
  pause: {
    id: 'ae.mobile.pause',
    defaultMessage: 'Pause',
    description: 'Tooltip for the pause button in the mobile toolbar'
  },
  resume: {
    id: 'ae.mobile.resume',
    defaultMessage: 'Resume',
    description: 'Tooltip for the resume button while the project is paused'
  },
  start: {
    id: 'gui.controls.go',
    defaultMessage: 'Go',
    description: 'Tooltip for the green flag button in the mobile toolbar'
  }
});

const SCREENS = [
  { id: 'code', label: messages.code, icon: codeIcon },
  { id: 'costumes', label: messages.costumes, icon: costumesIcon },
  { id: 'sounds', label: messages.sounds, icon: soundsIcon },
  { id: 'monaco', label: messages.monaco, icon: monacoIcon }
];

// The SVGs are drawn in Scratch's purple; masking them lets CSS decide the colour
// so they match the other toolbar icons in both light and dark themes.
const ScreenIcon = ({ className, icon }) => (
  <span className={classNames(styles.screenIcon, className)} style={{ '--screen-icon': `url("${icon}")` }} />
);

ScreenIcon.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string
};

const MobileToolbar = ({
  activeScreen,
  intl,
  isMoreOpen,
  isPaused,
  isPortraitStage,
  isRunning,
  isSpritePanelOpen,
  isStageOpen,
  onMore,
  onPause,
  onSprites,
  onStage,
  onStart,
  onStop,
  onSwitchScreen,
  vm
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);

  const handleSwitchScreen = (screen) => {
    setSwitchOpen(false);
    onSwitchScreen(screen);
  };

  const activeScreenConfig = SCREENS.find((screen) => screen.id === activeScreen) || SCREENS[0];

  return (
    <div
      className={classNames(styles.toolbar, {
        [styles.isOverlay]: isStageOpen,
        [styles.isPortrait]: isStageOpen && isPortraitStage
      })}
      data-ae-toolbar="true"
    >
      {isStageOpen ? null : (
        <div className={styles.topGroup}>
          <button
            aria-label={intl.formatMessage(messages.more)}
            className={classNames(styles.toolButton, { [styles.isActive]: isMoreOpen })}
            title={intl.formatMessage(messages.more)}
            onClick={() => {
              setAddOpen(false);
              setSwitchOpen(false);
              onMore();
            }}
          >
            {isMoreOpen ? <CloseIcon className={styles.glyph} /> : <MoreIcon className={styles.glyph} />}
          </button>
          <button
            aria-label={intl.formatMessage(messages.sprites)}
            className={classNames(styles.toolButton, { [styles.isActive]: isSpritePanelOpen })}
            title={intl.formatMessage(messages.sprites)}
            onClick={() => {
              setAddOpen(false);
              setSwitchOpen(false);
              onSprites();
            }}
          >
            {isSpritePanelOpen ? (
              <CloseIcon className={styles.glyph} />
            ) : (
              <img className={styles.icon} draggable={false} src={spriteIcon} alt="" />
            )}
          </button>
          <AddSpriteMenu open={addOpen} vm={vm} onToggle={setAddOpen} />
          <div className={styles.switchWrapper}>
            <button
              aria-label={intl.formatMessage(activeScreenConfig.label)}
              className={classNames(styles.toolButton, { [styles.isActive]: switchOpen })}
              title={intl.formatMessage(activeScreenConfig.label)}
              onClick={() => {
                setAddOpen(false);
                setSwitchOpen((open) => !open);
              }}
            >
              <ScreenIcon icon={activeScreenConfig.icon} />
            </button>
            {switchOpen ? (
              <div className={styles.switchPopup}>
                {SCREENS.filter((screen) => screen.id !== activeScreen).map(({ id, label, icon }) => (
                  <button className={styles.switchOption} key={id} onClick={() => handleSwitchScreen(id)}>
                    <ScreenIcon className={styles.switchOptionIcon} icon={icon} />
                    <span className={styles.switchOptionLabel}>{intl.formatMessage(label)}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
      <div className={styles.spacer} />
      <div className={styles.playControls}>
        <button
          aria-label={intl.formatMessage(messages.stage)}
          className={classNames(styles.playButton, { [styles.isActive]: isStageOpen })}
          title={intl.formatMessage(messages.stage)}
          onClick={onStage}
        >
          <img className={styles.icon} draggable={false} src={isStageOpen ? unfullscreenIcon : fullscreenIcon} alt="" />
        </button>
        <button
          aria-label={intl.formatMessage(messages.stop)}
          className={classNames(styles.playButton, 'stop-all')}
          title={intl.formatMessage(messages.stop)}
          onClick={onStop}
        >
          <img className={styles.icon} draggable={false} src={stopIcon} alt="" />
        </button>
        <button
          aria-label={intl.formatMessage(isPaused ? messages.resume : messages.pause)}
          className={classNames(styles.playButton, { [styles.isActive]: isPaused })}
          title={intl.formatMessage(isPaused ? messages.resume : messages.pause)}
          onClick={onPause}
        >
          <img className={styles.icon} draggable={false} src={isPaused ? playIcon : pauseIcon} alt="" />
        </button>
        <button
          aria-label={intl.formatMessage(messages.start)}
          className={classNames(styles.playButton, 'green-flag', { [styles.isActive]: isRunning })}
          title={intl.formatMessage(messages.start)}
          onClick={onStart}
        >
          <img className={styles.icon} draggable={false} src={greenFlagIcon} alt="" />
        </button>
      </div>
    </div>
  );
};

MobileToolbar.propTypes = {
  activeScreen: PropTypes.oneOf(['code', 'costumes', 'sounds', 'monaco']),
  intl: intlShape.isRequired,
  isMoreOpen: PropTypes.bool,
  isPaused: PropTypes.bool,
  isPortraitStage: PropTypes.bool,
  isRunning: PropTypes.bool,
  isSpritePanelOpen: PropTypes.bool,
  isStageOpen: PropTypes.bool,
  onMore: PropTypes.func,
  onPause: PropTypes.func,
  onSprites: PropTypes.func,
  onStage: PropTypes.func,
  onStart: PropTypes.func,
  onStop: PropTypes.func,
  onSwitchScreen: PropTypes.func,
  vm: PropTypes.shape({})
};

export default injectIntl(MobileToolbar);
