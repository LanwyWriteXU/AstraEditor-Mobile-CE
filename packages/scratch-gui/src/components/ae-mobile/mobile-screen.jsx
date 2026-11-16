import PropTypes from 'prop-types';
import React from 'react';

import styles from './mobile-screen.css';

/**
 * Full page container used for the costume and sound editors. There is no header:
 * the toolbar's editor switch is the way back.
 */
const MobileScreen = ({ children }) => <div className={styles.screen}>{children}</div>;

MobileScreen.propTypes = {
  children: PropTypes.node
};

export default MobileScreen;
