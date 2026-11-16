import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';

import spriteSelectorStyles from '../sprite-selector/sprite-selector.css';
import { closeAlertWithId, showStandardAlert } from '../../reducers/alerts';
import { activateTab, BLOCKS_TAB_INDEX, COSTUMES_TAB_INDEX } from '../../reducers/editor-tab';
import { openSpriteLibrary } from '../../reducers/modals';
import { emptySprite } from '../../lib/empty-assets';
import { getSpriteLibrary } from '../../lib/libraries/tw-async-libraries';
import { handleFileUpload, spriteUpload } from '../../lib/file-uploader.js';
import randomizeSpritePosition from '../../lib/randomize-sprite-position';
import sharedMessages from '../../lib/shared-messages';
import log from '../../lib/log';

import fileUploadIcon from '../action-menu/icon--file-upload.svg';
import paintIcon from '../action-menu/icon--paint.svg';
import surpriseIcon from '../action-menu/icon--surprise.svg';
import searchIcon from '../action-menu/icon--search.svg';
import { PlusIcon } from './icons.jsx';

import styles from './add-sprite-menu.css';

const messages = defineMessages({
  addSpriteFromLibrary: {
    id: 'gui.spriteSelector.addSpriteFromLibrary',
    defaultMessage: 'Choose a Sprite',
    description: 'Button to add a sprite from the library'
  },
  addSpriteFromPaint: {
    id: 'gui.spriteSelector.addSpriteFromPaint',
    defaultMessage: 'Paint',
    description: 'Button to add a sprite from the paint editor'
  },
  addSpriteFromSurprise: {
    id: 'gui.spriteSelector.addSpriteFromSurprise',
    defaultMessage: 'Surprise',
    description: 'Button to add a random sprite'
  },
  addSpriteFromFile: {
    id: 'gui.spriteSelector.addSpriteFromFile',
    defaultMessage: 'Upload Sprite',
    description: 'Button to upload a sprite from a file'
  }
});

const AddSpriteMenu = ({
  intl,
  onActivateTab,
  onCloseImporting,
  onOpenLibrary,
  onShowImporting,
  onToggle,
  open,
  vm
}) => {
  const fileInputRef = useRef(null);

  const activateBlocksTab = () => onActivateTab(BLOCKS_TAB_INDEX);
  const finish = () => {
    if (onToggle) onToggle(false);
  };

  const addSprite = (spriteJson) =>
    vm
      .addSprite(spriteJson)
      .then(activateBlocksTab)
      .catch((error) => log.error(error));

  const handleSurprise = async () => {
    finish();
    const spriteLibrary = await getSpriteLibrary();
    const surprises = spriteLibrary.filter(
      (sprite) => sprite.tags.indexOf('letters') === -1 && sprite.tags.indexOf('numbers') === -1
    );
    const item = surprises[Math.floor(Math.random() * surprises.length)];
    randomizeSpritePosition(item);
    addSprite(JSON.stringify(item));
  };

  const handlePaint = () => {
    finish();
    const emptyItem = emptySprite(
      intl.formatMessage(sharedMessages.sprite, { index: 1 }),
      intl.formatMessage(sharedMessages.pop),
      intl.formatMessage(sharedMessages.costume, { index: 1 })
    );
    vm.addSprite(JSON.stringify(emptyItem)).then(() => {
      setTimeout(() => onActivateTab(COSTUMES_TAB_INDEX));
    });
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleUpload = (event) => {
    finish();
    onShowImporting();
    handleFileUpload(
      event.target,
      (buffer, fileType, fileName, fileIndex, fileCount) => {
        spriteUpload(
          buffer,
          fileType,
          fileName,
          vm,
          (newSprite) => {
            addSprite(newSprite)
              .then(() => {
                if (fileIndex === fileCount - 1) onCloseImporting();
              })
              .catch(onCloseImporting);
          },
          onCloseImporting
        );
      },
      onCloseImporting
    );
  };

  const handleLibrary = () => {
    finish();
    onOpenLibrary();
  };

  return (
    <div className={[styles.wrapper, spriteSelectorStyles.addButton].join(' ')}>
      <button
        aria-label={intl.formatMessage(messages.addSpriteFromLibrary)}
        className={styles.mainButton}
        title={intl.formatMessage(messages.addSpriteFromLibrary)}
        onClick={(event) => {
          event.stopPropagation();
          if (onToggle) onToggle(!open);
        }}
      >
        <PlusIcon className={styles.plusIcon} />
      </button>
      {open ? (
        <div className={styles.popup}>
          <button
            className={styles.popupButton}
            title={intl.formatMessage(messages.addSpriteFromFile)}
            onClick={handleUploadClick}
          >
            <img className={styles.popupIcon} draggable={false} src={fileUploadIcon} alt="" />
          </button>
          <button
            className={styles.popupButton}
            title={intl.formatMessage(messages.addSpriteFromSurprise)}
            onClick={handleSurprise}
          >
            <img className={styles.popupIcon} draggable={false} src={surpriseIcon} alt="" />
          </button>
          <button
            className={styles.popupButton}
            title={intl.formatMessage(messages.addSpriteFromPaint)}
            onClick={handlePaint}
          >
            <img className={styles.popupIcon} draggable={false} src={paintIcon} alt="" />
          </button>
          <button
            className={styles.popupButton}
            title={intl.formatMessage(messages.addSpriteFromLibrary)}
            onClick={handleLibrary}
          >
            <img className={styles.popupIcon} draggable={false} src={searchIcon} alt="" />
          </button>
        </div>
      ) : null}
      <input
        accept=".svg, .png, .bmp, .jpg, .jpeg, .jfif, .webp, .sprite2, .sprite3, .gif"
        className={styles.fileInput}
        multiple
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
      />
    </div>
  );
};

AddSpriteMenu.propTypes = {
  intl: intlShape.isRequired,
  onActivateTab: PropTypes.func,
  onCloseImporting: PropTypes.func,
  onOpenLibrary: PropTypes.func,
  onShowImporting: PropTypes.func,
  onToggle: PropTypes.func,
  open: PropTypes.bool,
  vm: PropTypes.shape({
    addSprite: PropTypes.func
  }).isRequired
};

const mapDispatchToProps = (dispatch) => ({
  onActivateTab: (tabIndex) => dispatch(activateTab(tabIndex)),
  onOpenLibrary: () => dispatch(openSpriteLibrary()),
  onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
  onShowImporting: () => dispatch(showStandardAlert('importingAsset'))
});

export default injectIntl(connect(null, mapDispatchToProps)(AddSpriteMenu));
