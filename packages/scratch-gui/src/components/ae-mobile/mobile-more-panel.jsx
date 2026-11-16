import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import getProjectStats from '../../lib/project-stats';
import fileIcon from '../menu-bar/icon--file.svg';
import settingsIcon from '../menu-bar/icon--settings.svg';
import toolsIcon from '../menu-bar/tools.svg';
import addonsIcon from '../menu-bar/addons.svg';
import { BackIcon, MaskIcon } from './icons.jsx';

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
  view: {
    id: 'ae.mobile.view',
    defaultMessage: 'View',
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
  { id: 'file', label: messages.file, icon: fileIcon },
  { id: 'view', label: messages.view, icon: settingsIcon },
  { id: 'settings', label: messages.settings, icon: toolsIcon },
  { id: 'addons', label: messages.addons, icon: addonsIcon }
];

const MobileMorePanel = ({ children, intl, onSelectEntry, onUpdateTitle, page, projectTitle, vm }) => {
  const [blockCount, setBlockCount] = useState(0);
  const [titleDraft, setTitleDraft] = useState(projectTitle || '');
  const timeoutRef = useRef(null);

  useEffect(() => {
    setTitleDraft(projectTitle || '');
  }, [projectTitle]);

  const commitTitle = () => {
    const next = titleDraft.trim();
    if (next && next !== projectTitle && onUpdateTitle) onUpdateTitle(next);
  };

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
              <input
                className={styles.projectTitleInput}
                value={titleDraft}
                onBlur={commitTitle}
                onChange={(event) => setTitleDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur();
                }}
              />
              <span className={styles.blockCount}>{intl.formatMessage(messages.blocks, { num: blockCount })}</span>
            </React.Fragment>
          )}
        </div>
      </div>

      {activeEntry ? (
        <div className={styles.content}>{children}</div>
      ) : (
        <div className={styles.entries}>
          {ENTRIES.map(({ id, label, icon }) => (
            <button className={styles.entry} key={id} onClick={() => onSelectEntry(id)}>
              <MaskIcon className={styles.entryIcon} src={icon} />
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
  onUpdateTitle: PropTypes.func,
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
