import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import aeVersion from '../../lib/ae-version.js';
import logo from './icons/icon--logo.svg';

import styles from './more-about-page.css';

const messages = defineMessages({
  title: {
    id: 'ae.mobile.about.title',
    defaultMessage: 'AstraEditor Mobile',
    description: 'Editor name shown on the about page'
  },
  version: {
    id: 'ae.mobile.about.version',
    defaultMessage: 'Version',
    description: 'Label of the editor version'
  },
  slogan1: {
    id: 'ae.mobile.about.slogan1',
    defaultMessage: 'Hammer, Not a Bouquet.',
    description: 'First slogan line'
  },
  slogan2: {
    id: 'ae.mobile.about.slogan2',
    defaultMessage: 'Now, Re-recognize Me.',
    description: 'Second slogan line'
  },
  github: {
    id: 'ae.mobile.about.github',
    defaultMessage: 'Project home',
    description: 'Link to the project repository'
  }
});

const MoreAboutPage = ({ intl }) => (
  <div className={styles.page}>
    <div className={styles.brandRow}>
      <img className={styles.logoMark} draggable={false} src={logo} alt="" />
      <div className={styles.brandText}>
        <span className={styles.title}>{intl.formatMessage(messages.title)}</span>
        <span className={styles.edition}>Cyberexplorer Edition</span>
      </div>
    </div>
    <div className={styles.version}>
      {intl.formatMessage(messages.version)} {aeVersion.version}
    </div>
    <div className={styles.slogans}>
      <div>{intl.formatMessage(messages.slogan1)}</div>
      <div>{intl.formatMessage(messages.slogan2)}</div>
    </div>
    <a className={styles.link} href="https://github.com/AstraEditor/scratch-gui" rel="noreferrer" target="_blank">
      {intl.formatMessage(messages.github)}
    </a>
  </div>
);

MoreAboutPage.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(MoreAboutPage);
