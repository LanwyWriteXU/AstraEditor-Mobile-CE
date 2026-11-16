import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';

import { openRestorePointModal } from '../../reducers/modals';
import { manualUpdateProject, requestNewProject, saveProjectAsCopy } from '../../reducers/project-state';
import { setFileHandle } from '../../reducers/tw.js';
import { exportAllImagesAsPNG } from '../../lib/export-images.js';
import downloadBlob from '../../lib/download-blob';
import sharedMessages from '../../lib/shared-messages';
import log from '../../lib/log';

import styles from './more-file-page.css';

const messages = defineMessages({
  newProject: {
    id: 'gui.menuBar.new',
    defaultMessage: 'New project',
    description: 'Create a new project'
  },
  saveNow: {
    id: 'gui.menuBar.saveNow',
    defaultMessage: 'Save now',
    description: 'Save the project'
  },
  saveAsCopy: {
    id: 'gui.menuBar.saveAsCopy',
    defaultMessage: 'Save as a copy',
    description: 'Save a copy of the project'
  },
  downloadToComputer: {
    id: 'gui.menuBar.downloadToComputer',
    defaultMessage: 'Save to your computer',
    description: 'Download the project to the computer'
  },
  exportImage: {
    id: 'gui.menuBar.exportImage',
    defaultMessage: 'Export images',
    description: 'Export all the images of the project'
  },
  turboOn: {
    id: 'gui.menuBar.turboModeOn',
    defaultMessage: 'Turn on turbo mode',
    description: 'Enable turbo mode'
  },
  turboOff: {
    id: 'gui.menuBar.turboModeOff',
    defaultMessage: 'Turn off turbo mode',
    description: 'Disable turbo mode'
  },
  fpsOn: {
    id: 'ae.mobile.fpsOn',
    defaultMessage: 'Use 60 FPS',
    description: 'Enable the 60 FPS mode'
  },
  fpsOff: {
    id: 'ae.mobile.fpsOff',
    defaultMessage: 'Use 30 FPS',
    description: 'Disable the 60 FPS mode'
  },
  extensionEditor: {
    id: 'tw.menuBar.extensionEditor',
    defaultMessage: 'Extension editor',
    description: 'Open the extension editor'
  },
  restorePoints: {
    id: 'tw.menuBar.restorePoints',
    defaultMessage: 'Restore points',
    description: 'Manage restore points'
  }
});

/**
 * File actions as a plain list. The desktop menu bar is not reused here: it brings
 * its own logo, title field and account block, none of which belong in this panel.
 */
const MoreFilePage = ({
  intl,
  onExportImages,
  onNewProject,
  onOpenExtensionEditor,
  onRestorePoints,
  onSaveAsCopy,
  onSaveNow,
  onStartSelectingFileUpload,
  onToggle,
  projectTitle,
  vm
}) => {
  const handleDownload = () => {
    onToggle();
    vm.saveProjectSb3()
      .then((content) => {
        downloadBlob(`${projectTitle || 'project'}.sb3`, content);
      })
      .catch((error) => log.error(error));
  };

  const turboMode = Boolean(vm.runtime && vm.runtime.turboMode);
  const sixtyFps = Boolean(vm.runtime && vm.runtime.framerate === 60);

  // Same three groups as the desktop File / Edit / Tools menus, separated by dividers.
  const sections = [
    {
      id: 'file',
      items: [
        { id: 'new', label: messages.newProject, onClick: onNewProject },
        { id: 'save', label: messages.saveNow, onClick: onSaveNow },
        { id: 'saveAsCopy', label: messages.saveAsCopy, onClick: onSaveAsCopy },
        { id: 'upload', label: sharedMessages.loadFromComputerTitle, onClick: onStartSelectingFileUpload },
        { id: 'download', label: messages.downloadToComputer, onClick: handleDownload },
        { id: 'exportImages', label: messages.exportImage, onClick: () => onExportImages(vm) },
        { id: 'restorePoints', label: messages.restorePoints, onClick: onRestorePoints }
      ]
    },
    {
      id: 'edit',
      items: [
        {
          id: 'turbo',
          label: turboMode ? messages.turboOff : messages.turboOn,
          onClick: () => vm.setTurboMode(!turboMode)
        },
        {
          id: 'framerate',
          label: sixtyFps ? messages.fpsOff : messages.fpsOn,
          onClick: () => vm.setFramerate(sixtyFps ? 30 : 60)
        }
      ]
    },
    {
      id: 'tools',
      items: [{ id: 'extensionEditor', label: messages.extensionEditor, onClick: onOpenExtensionEditor }]
    }
  ];

  return (
    <div className={styles.page}>
      {sections.map((section, index) => (
        <ul className={classNames(styles.list, { [styles.withDivider]: index > 0 })} key={section.id}>
          {section.items.map(({ id, label, onClick }) => (
            <li key={id}>
              <button
                className={styles.item}
                onClick={() => {
                  onToggle();
                  if (onClick) onClick();
                }}
              >
                {intl.formatMessage(label)}
              </button>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
};

MoreFilePage.propTypes = {
  intl: intlShape.isRequired,
  onExportImages: PropTypes.func,
  onNewProject: PropTypes.func,
  onOpenExtensionEditor: PropTypes.func,
  onRestorePoints: PropTypes.func,
  onSaveAsCopy: PropTypes.func,
  onSaveNow: PropTypes.func,
  onStartSelectingFileUpload: PropTypes.func,
  onToggle: PropTypes.func,
  projectTitle: PropTypes.string,
  vm: PropTypes.shape({
    saveProjectSb3: PropTypes.func
  }).isRequired
};

const mapDispatchToProps = (dispatch) => ({
  onNewProject: () => {
    dispatch(requestNewProject(true));
    dispatch(setFileHandle(null));
  },
  onSaveNow: () => dispatch(manualUpdateProject()),
  onSaveAsCopy: () => dispatch(saveProjectAsCopy()),
  onRestorePoints: () => dispatch(openRestorePointModal()),
  onExportImages: (vm) => exportAllImagesAsPNG(vm, false)
});

export default injectIntl(connect(null, mapDispatchToProps)(MoreFilePage));
