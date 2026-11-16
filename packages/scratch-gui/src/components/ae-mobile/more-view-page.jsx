import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import locales from '@turbowarp/scratch-l10n';

import { selectLocale } from '../../reducers/locales.js';
import {
  ACCENT_AE,
  ACCENT_BLUE,
  ACCENT_CE,
  ACCENT_COSTOM,
  ACCENT_MIKU,
  ACCENT_PURPLE,
  ACCENT_RAINBOW,
  ACCENT_RED,
  ACCENT_TY,
  BLOCKS_CUSTOM,
  BLOCKS_DARK,
  BLOCKS_HIGH_CONTRAST,
  BLOCKS_THREE,
  GUI_DARK,
  GUI_DEEKDARK,
  GUI_LIGHT,
  GUI_MODERNWHITE
} from '../../lib/themes/index.js';

import styles from './more-view-page.css';

const messages = defineMessages({
  language: {
    id: 'gui.menuBar.language',
    defaultMessage: 'Language',
    description: 'Entry that opens the language list'
  },
  gui: {
    id: 'tw.menuBar.theme',
    defaultMessage: 'Interface theme',
    description: 'Entry that opens the interface theme list'
  },
  blocks: {
    id: 'tw.menuBar.blockColors',
    defaultMessage: 'Block colours',
    description: 'Entry that opens the block colour list'
  },
  accent: {
    id: 'tw.menuBar.accent',
    defaultMessage: 'Accent colour',
    description: 'Entry that opens the accent colour list'
  }
});

// Same labels (and therefore the same translations) as the desktop menus.
const THEME_GROUPS = {
  gui: [
    { value: GUI_LIGHT, label: { id: 'tw.darkMode', defaultMessage: 'Light' } },
    { value: GUI_MODERNWHITE, label: { id: 'tw.modernLightMode', defaultMessage: 'Modern Light' } },
    { value: GUI_DARK, label: { id: 'tw.lightMode', defaultMessage: 'Dark' } },
    { value: GUI_DEEKDARK, label: { id: 'tw.deepDarkMode', defaultMessage: 'Deeper Dark' } }
  ],
  blocks: [
    { value: BLOCKS_THREE, label: { id: 'tw.blockColors.three', defaultMessage: 'Three' } },
    { value: BLOCKS_HIGH_CONTRAST, label: { id: 'tw.blockColors.highContrast', defaultMessage: 'High Contrast' } },
    { value: BLOCKS_DARK, label: { id: 'tw.blockColors.dark', defaultMessage: 'Dark' } },
    { value: BLOCKS_CUSTOM, label: { id: 'tw.blockColors.custom', defaultMessage: 'Custom' } }
  ],
  accent: [
    { value: ACCENT_RED, label: { id: 'tw.accent.red', defaultMessage: 'Red' } },
    { value: ACCENT_PURPLE, label: { id: 'tw.accent.purple', defaultMessage: 'Purple' } },
    { value: ACCENT_BLUE, label: { id: 'tw.accent.blue', defaultMessage: 'Blue' } },
    { value: ACCENT_AE, label: { id: 'tw.accent.ae', defaultMessage: 'AstraEditor' } },
    { value: ACCENT_CE, label: { id: 'tw.accent.cybere', defaultMessage: 'Cybere' } },
    { value: ACCENT_MIKU, label: { id: 'tw.accent.miku', defaultMessage: 'Miku' } },
    { value: ACCENT_TY, label: { id: 'tw.accent.tianyi', defaultMessage: 'Tianyi' } },
    { value: ACCENT_RAINBOW, label: { id: 'tw.accent.rainbow', defaultMessage: 'Rainbow' } },
    { value: ACCENT_COSTOM, label: { id: 'tw.accent.custom', defaultMessage: 'Custom' } }
  ]
};

const GROUP_LABELS = { gui: messages.gui, blocks: messages.blocks, accent: messages.accent };

const MoreViewPage = ({ intl, locale, onChangeLanguage, onChangeTheme, theme }) => {
  const [group, setGroup] = useState(null);

  const entries = [
    { id: 'language', label: intl.formatMessage(messages.language) },
    { id: 'gui', label: intl.formatMessage(messages.gui) },
    { id: 'blocks', label: intl.formatMessage(messages.blocks) },
    { id: 'accent', label: intl.formatMessage(messages.accent) }
  ];

  if (group) {
    const isLanguage = group === 'language';
    const options = isLanguage
      ? Object.keys(locales).map((code) => ({ value: code, label: locales[code].name }))
      : (THEME_GROUPS[group] || []).map(({ value, label }) => ({
          value,
          label: intl.formatMessage(label)
        }));
    const current = isLanguage
      ? locale
      : group === 'gui'
        ? theme.gui
        : group === 'blocks'
          ? theme.blocks
          : theme.accent;

    return (
      <div className={styles.page}>
        <button className={styles.backRow} onClick={() => setGroup(null)}>
          <span className={styles.backArrow}>‹</span>
          <span>{intl.formatMessage(GROUP_LABELS[group] || messages.language)}</span>
        </button>
        <div className={styles.scroll}>
          <ul className={styles.list}>
            {options.map(({ value, label }) => (
              <li key={value}>
                <button
                  className={classNames(styles.item, { [styles.isSelected]: current === value })}
                  onClick={() => {
                    if (isLanguage) {
                      onChangeLanguage(value);
                    } else {
                      onChangeTheme(group, value);
                    }
                    setGroup(null);
                  }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {entries.map(({ id, label }) => (
        <li key={id}>
          <button className={styles.item} onClick={() => setGroup(id)}>
            {label}
            <span className={styles.caret}>›</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

MoreViewPage.propTypes = {
  intl: intlShape.isRequired,
  locale: PropTypes.string,
  onChangeLanguage: PropTypes.func,
  onChangeTheme: PropTypes.func,
  theme: PropTypes.shape({
    accent: PropTypes.string,
    blocks: PropTypes.string,
    gui: PropTypes.string
  })
};

const mapStateToProps = (state) => ({
  locale: state.locales.locale
});

const mapDispatchToProps = (dispatch) => ({
  onChangeLanguage: (code) => dispatch(selectLocale(code))
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(MoreViewPage));
