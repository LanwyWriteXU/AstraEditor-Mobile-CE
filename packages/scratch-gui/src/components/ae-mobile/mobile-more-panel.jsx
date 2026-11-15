import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import getProjectStats from '../../lib/project-stats';
import { BackIcon, FileIcon, PuzzleIcon, SettingsIcon, ViewIcon } from './icons.jsx';

import styles from './mobile-more-panel.css';

const messages = defineMessages({
  more: {
    id: 'ae.mobile.more',
    defaultMessage: 'More',
    description: 'Title of the mobile more panel'
  },
  file: {
    id: 'gui.menuBar.file',
    defaultMessage: 'File',
    description: 'Entry that opens the file menu'
  },
  viewport: {
    id: 'ae.mobile.viewport',
    defaultMessage: 'Viewport',
    description: 'Entry that opens language and theme settings'
  },
  addons: {
    id: 'tw.menuBar.addons',
    defaultMessage: 'Addons',
    description: 'Entry that opens the addon settings'
  },
  settings: {
    id: 'gui.menuBar.settings',
    defaultMessage: 'Settings',
    description: 'Entry that opens the advanced settings'
  },
  blocks: {
    id: 'ae.mobile.blockCount',
    defaultMessage: '{num} blocks',
    description: 'Number of blocks in the project'
  }
});

const ENTRIES = [
  { id: 'file', label: messages.file, Icon: FileIcon },
  { id: 'viewport', label: messages.viewport, Icon: ViewIcon },
  { id: 'addons', label: messages.addons, Icon: PuzzleIcon },
  { id: 'settings', label: messages.settings, Icon: SettingsIcon }
];

const MobileMorePanel = ({ children, intl, onClose, onSelectEntry, page, projectTitle, vm }) => {
  const [blockCount, setBlockCount] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!vm) return undefined;

    const update = () => {
      setBlockCount(getProjectStats(vm).blockCount);
    };

    const scheduleUpdate = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(update, 1000);
    };

    update();
    vm.on('PROJECT_CHANGED', scheduleUpdate);
    vm.runtime.on('PROJECT_LOADED', scheduleUpdate);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      vm.off('PROJECT_CHANGED', scheduleUpdate);
      vm.runtime.off('PROJECT_LOADED', scheduleUpdate);
    };
  }, [vm]);

  const activeEntry = page ? ENTRIES.find((entry) => entry.id === page) : null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        {activeEntry ? (
          <button className={styles.backButton} onClick={() => onSelectEntry(null)}>
            <BackIcon className={styles.backIcon} />
          </button>
        ) : null}
        <div className={styles.headerText}>
          {activeEntry ? (
            <span className={styles.title}>{intl.formatMessage(activeEntry.label)}</span>
          ) : (
            <React.Fragment>
              <span className={styles.projectTitle}>{projectTitle}</span>
              <span className={styles.blockCount}>{intl.formatMessage(messages.blocks, { num: blockCount })}</span>
            </React.Fragment>
          )}
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          {intl.formatMessage({ id: 'ae.mobile.close', defaultMessage: 'Close', description: 'Close a panel' })}
        </button>
      </div>

      {activeEntry ? (
        <div className={styles.content}>{children}</div>
      ) : (
        <div className={styles.entries}>
          {ENTRIES.map(({ id, label, Icon }) => (
            <button className={styles.entry} key={id} onClick={() => onSelectEntry(id)}>
              <Icon className={styles.entryIcon} />
              <span className={styles.entryLabel}>{intl.formatMessage(label)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

MobileMorePanel.propTypes = {
  children: PropTypes.node,
  intl: intlShape.isRequired,
  onClose: PropTypes.func,
  onSelectEntry: PropTypes.func,
  page: PropTypes.string,
  projectTitle: PropTypes.string,
  vm: PropTypes.shape({
    on: PropTypes.func,
    off: PropTypes.func,
    runtime: PropTypes.shape({
      on: PropTypes.func,
      off: PropTypes.func
    })
  })
};

export default injectIntl(MobileMorePanel);
