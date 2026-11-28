import React from 'react';
import { IntlProvider as ReactIntlProvider } from 'react-intl';
import { connect } from 'react-redux';

/*
 * The shell carries its own copy: strings that live only in this fork (the
 * `ae.mobile.*` entries, the mobile empty states, the AstraEditor pages) are
 * written with a Chinese defaultMessage and are not part of the upstream locale
 * bundles. react-intl therefore warns about every one of them on each render,
 * with "using default message as fallback" — which is not a problem, that
 * fallback IS the text we meant to show.
 *
 * Only that exact case is dropped. A missing defaultMessage, or a message whose
 * ICU syntax fails to format, still reaches the console.
 */
const MISSING_WITH_FALLBACK = /^\[React Intl\] Missing message: .* using default message as fallback\.$/;

const handleIntlError = (error) => {
  if (MISSING_WITH_FALLBACK.test(String(error))) return;
  // eslint-disable-next-line no-console
  console.error(error);
};

const mapStateToProps = (state) => ({
  key: state.locales.locale,
  locale: state.locales.locale,
  messages: state.locales.messages
});

/**
 * IntlProvider that keeps the messages from redux and filters the one class of
 * react-intl warning that is pure noise for this fork.
 * @param {object} props - locale, messages and children from the connected state
 * @returns {React.ReactElement} the provider
 */
function IntlProviderWithErrorHandler(props) {
  return <ReactIntlProvider {...props} onError={handleIntlError} />;
}

export default connect(mapStateToProps)(IntlProviderWithErrorHandler);
