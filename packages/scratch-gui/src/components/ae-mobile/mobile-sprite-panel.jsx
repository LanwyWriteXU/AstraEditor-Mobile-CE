import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import TargetPane from '../../containers/target-pane.jsx';
import { STAGE_DISPLAY_SIZES } from '../../lib/layout-constants';
import { BackIcon } from './icons.jsx';

import styles from './mobile-sprite-panel.css';

const messages = defineMessages({
  sprites: {
    id: 'gui.SpriteInfo.sprite',
    defaultMessage: 'Sprite',
    description: 'Sprite info label, reused as the title of the mobile sprite panel'
  },
  back: {
    id: 'gui.modal.back',
    defaultMessage: 'Back',
    description: 'Button used to leave the sprite panel'
  }
});

/**
 * The sprite panel is the desktop target pane, laid out vertically:
 * sprite grid on top, sprite info below it, stage selector at the bottom.
 * Those parts keep their original styles; only the stacking order is ours.
 */
const MobileSpritePanel = ({ intl, onClose, vm }) => (
  <div className={styles.panel}>
    <div className={styles.header}>
      <button aria-label={intl.formatMessage(messages.back)} className={styles.backButton} onClick={onClose}>
        <BackIcon className={styles.backIcon} />
      </button>
      <span className={styles.title}>{intl.formatMessage(messages.sprites)}</span>
    </div>
    <div className={styles.content}>
      <TargetPane hideSpriteLibrary stageSize={STAGE_DISPLAY_SIZES.large} vm={vm} />
    </div>
  </div>
);

MobileSpritePanel.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func,
  vm: PropTypes.shape({}).isRequired
};

export default injectIntl(MobileSpritePanel);
