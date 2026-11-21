import React, { useCallback, useState } from 'react';

import Box from '../box/box.jsx';
import { BackIcon } from '../ae-mobile/icons.jsx';
import Selector from './selector.jsx';
import styles from './asset-panel.css';

const STORAGE_KEY = 'ae:assetPanelCollapsed';

const readCollapsed = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) {
    return false;
  }
};

const writeCollapsed = (collapsed) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
  } catch (e) {
    // Private mode / storage disabled: the state just won't persist.
  }
};

const AssetPanel = (props) => {
  // The thumbnail column stays on the left (the "add costume" flow lives there),
  // it can just be folded away to give the canvas the width back.
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => {
      writeCollapsed(!prev);
      return !prev;
    });
  }, []);

  return (
    <Box className={styles.wrapper}>
      <Selector {...props} className={styles.selector} collapsed={collapsed} />
      <button
        aria-expanded={!collapsed}
        className={styles.collapseToggle}
        title={collapsed ? 'Show list' : 'Hide list'}
        onClick={handleToggle}
      >
        <BackIcon className={collapsed ? `${styles.collapseIcon} ${styles.isFlipped}` : styles.collapseIcon} />
      </button>
      <Box className={styles.detailArea}>{props.children}</Box>
    </Box>
  );
};

AssetPanel.propTypes = {
  ...Selector.propTypes
};

export default AssetPanel;
