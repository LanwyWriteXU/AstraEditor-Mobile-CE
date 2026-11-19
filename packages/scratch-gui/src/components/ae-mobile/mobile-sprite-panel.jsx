import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import Backpack from '../../containers/backpack.jsx';
import getCostumeUrl from '../../lib/get-costume-url';
import TargetPane from '../../containers/target-pane.jsx';
import { STAGE_DISPLAY_SIZES } from '../../lib/layout-constants';

import styles from './mobile-sprite-panel.css';

const messages = defineMessages({
  backdrop: {
    id: 'gui.stageSelector.backdrops',
    defaultMessage: 'Backdrops',
    description: 'Label of the stage row at the bottom of the sprite panel'
  }
});

/**
 * The sprite panel reuses the original target pane (sprite grid + sprite info),
 * with the stage pulled out into its own row at the bottom so backdrops read as
 * a different kind of target.
 */
const MobileSpritePanel = ({
  backpackExpanded,
  backpackHost,
  backpackVisible,
  editingTarget,
  intl,
  onClose,
  onOpenCode,
  stage,
  vm
}) => {
  const stageAsset = stage && stage.costume && stage.costume.asset;
  const isStageSelected = Boolean(stage && stage.id && stage.id === editingTarget);

  const handleStageClick = () => {
    if (!stage || !stage.id) return;
    vm.setEditingTarget(stage.id);
    if (onOpenCode) onOpenCode();
    onClose();
  };

  return (
    <div className={styles.panel} data-ae-sprite-panel="true">
      <div className={styles.content}>
        <TargetPane hideSpriteLibrary stageSize={STAGE_DISPLAY_SIZES.large} vm={vm} />
      </div>
      {backpackVisible ? (
        <div className={styles.backpackSlot} data-ae-backpack="true">
          <Backpack forceExpanded={backpackExpanded} host={backpackHost} />
        </div>
      ) : null}
      <button
        className={[styles.stageRow, isStageSelected ? styles.stageRowSelected : ''].join(' ').trim()}
        onClick={handleStageClick}
      >
        <span className={styles.stageThumbWrapper}>
          {stageAsset ? (
            <img className={styles.stageThumb} draggable={false} src={getCostumeUrl(stageAsset)} alt="" />
          ) : null}
        </span>
        <span className={styles.stageText}>
          <span className={styles.stageTitle}>{intl.formatMessage(messages.backdrop)}</span>
          <span className={styles.stageCount}>{stage && stage.costumeCount ? stage.costumeCount : 0}</span>
        </span>
      </button>
    </div>
  );
};

MobileSpritePanel.propTypes = {
  backpackExpanded: PropTypes.bool,
  backpackHost: PropTypes.string,
  backpackVisible: PropTypes.bool,
  editingTarget: PropTypes.string,
  intl: intlShape.isRequired,
  onClose: PropTypes.func,
  onOpenCode: PropTypes.func,
  stage: PropTypes.shape({
    costume: PropTypes.shape({
      asset: PropTypes.shape({})
    }),
    costumeCount: PropTypes.number,
    id: PropTypes.string
  }),
  vm: PropTypes.shape({
    setEditingTarget: PropTypes.func
  }).isRequired
};

export default injectIntl(MobileSpritePanel);
