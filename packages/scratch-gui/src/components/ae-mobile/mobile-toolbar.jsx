import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import codeIcon from '../gui/icon--code.svg';
import costumesIcon from '../gui/icon--costumes.svg';
import soundsIcon from '../gui/icon--sounds.svg';
import spriteIcon from '../action-menu/icon--sprite.svg';
import fullscreenIcon from '../stage-header/icon--fullscreen.svg';
import stopIcon from '../stop-all/icon--stop-all.svg';
import greenFlagIcon from '../green-flag/icon--green-flag.svg';
import { MoreIcon, PauseIcon, PlayIcon, PlusIcon } from './icons.jsx';

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
  addSprite: {
    id: 'gui.spriteSelector.addSpriteFromLibrary',
    defaultMessage: 'Choose a Sprite',
    description: 'Tooltip for the add sprite button in the mobile toolbar'
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
  { id: 'sounds', label: messages.sounds, icon: soundsIcon }
];

const MobileToolbar = ({
  activeScreen,
  intl,
  isPaused,
  isStageOpen,
  onAddSprite,
  onMore,
  onPause,
  onSprites,
  onStage,
  onStart,
  onStop,
  onSwitchScreen
}) => {
  const [switchOpen, setSwitchOpen] = useState(false);

  const handleSwitchScreen = (screen) => {
    setSwitchOpen(false);
    onSwitchScreen(screen);
  };

  const activeScreenConfig = SCREENS.find((screen) => screen.id === activeScreen) || SCREENS[0];

  return (
    <div className={classNames(styles.toolbar, { [styles.isOverlay]: isStageOpen })}>
      {isStageOpen ? null : (
        <div className={styles.topGroup}>
          <button className={styles.toolButton} title={intl.formatMessage(messages.more)} onClick={onMore}>
            <MoreIcon className={styles.glyph} />
          </button>
          <button className={styles.toolButton} title={intl.formatMessage(messages.sprites)} onClick={onSprites}>
            <img className={styles.icon} draggable={false} src={spriteIcon} alt="" />
          </button>
          <button className={styles.toolButton} title={intl.formatMessage(messages.addSprite)} onClick={onAddSprite}>
            <PlusIcon className={styles.glyph} />
          </button>
          <div className={styles.switchWrapper}>
            <button
              className={classNames(styles.toolButton, { [styles.isActive]: switchOpen })}
              title={intl.formatMessage(activeScreenConfig.label)}
              onClick={() => setSwitchOpen((open) => !open)}
            >
              <img className={styles.icon} draggable={false} src={activeScreenConfig.icon} alt="" />
            </button>
            {switchOpen ? (
              <div className={styles.switchPopup}>
                {SCREENS.map(({ id, label, icon }) => (
                  <button
                    className={classNames(styles.switchOption, { [styles.isActive]: id === activeScreen })}
                    key={id}
                    onClick={() => handleSwitchScreen(id)}
                  >
                    <img className={styles.switchIcon} draggable={false} src={icon} alt="" />
                    <span>{intl.formatMessage(label)}</span>
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
          className={classNames(styles.playButton, { [styles.isActive]: isStageOpen })}
          title={intl.formatMessage(messages.stage)}
          onClick={onStage}
        >
          <img className={styles.icon} draggable={false} src={fullscreenIcon} alt="" />
        </button>
        <button className={styles.playButton} title={intl.formatMessage(messages.stop)} onClick={onStop}>
          <img className={styles.icon} draggable={false} src={stopIcon} alt="" />
        </button>
        <button
          className={classNames(styles.playButton, { [styles.isActive]: isPaused })}
          title={intl.formatMessage(isPaused ? messages.resume : messages.pause)}
          onClick={onPause}
        >
          {isPaused ? <PlayIcon className={styles.glyph} /> : <PauseIcon className={styles.glyph} />}
        </button>
        <button className={styles.playButton} title={intl.formatMessage(messages.start)} onClick={onStart}>
          <img className={styles.icon} draggable={false} src={greenFlagIcon} alt="" />
        </button>
      </div>
    </div>
  );
};

MobileToolbar.propTypes = {
  activeScreen: PropTypes.oneOf(['code', 'costumes', 'sounds']),
  intl: intlShape.isRequired,
  isPaused: PropTypes.bool,
  isStageOpen: PropTypes.bool,
  onAddSprite: PropTypes.func,
  onMore: PropTypes.func,
  onPause: PropTypes.func,
  onSprites: PropTypes.func,
  onStage: PropTypes.func,
  onStart: PropTypes.func,
  onStop: PropTypes.func,
  onSwitchScreen: PropTypes.func
};

export default injectIntl(MobileToolbar);
