import PropTypes from 'prop-types';
import React from 'react';

import { BackIcon } from './icons.jsx';

import styles from './mobile-screen.css';

/**
 * Full page container used for the costume and sound editors.
 * The stage page doesn't use it because the stage fills the whole area.
 */
const MobileScreen = ({ children, onBack, title }) => (
  <div className={styles.screen}>
    <div className={styles.header}>
      <button className={styles.backButton} onClick={onBack}>
        <BackIcon className={styles.backIcon} />
      </button>
      <span className={styles.title}>{title}</span>
    </div>
    <div className={styles.content}>{children}</div>
  </div>
);

MobileScreen.propTypes = {
  children: PropTypes.node,
  onBack: PropTypes.func,
  title: PropTypes.node
};

export default MobileScreen;
