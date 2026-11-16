import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { createStore, combineReducers, compose } from 'redux';
import ConnectedIntlProvider from './connected-intl-provider.jsx';
import AddonHooks from '../addons/hooks';

import localesReducer, { initLocale, localesInitialState } from '../reducers/locales';

import { setPlayer, setFullScreen } from '../reducers/mode.js';

import locales from '@turbowarp/scratch-l10n';
import { detectLocale } from './detect-locale';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Loaded eagerly. Reading it lazily inside the constructor raced with the addon bundle
// (which also pulls this module in) and surfaced as
// "Cannot access 'guiReducer' before initialization" on slower devices.
const guiRedux = require('../reducers/gui');

/*
 * Higher Order Component to provide redux state. If an `intl` prop is provided
 * it will override the internal `intl` redux state
 * @param {React.Component} WrappedComponent - component to provide state for
 * @param {boolean} localesOnly - only provide the locale state, not everything
 *                      required by the GUI. Used to exclude excess state when
                        only rendering modals, not the GUI.
 * @returns {React.Component} component with redux and intl state provided
 */
const AppStateHOC = function (WrappedComponent, localesOnly) {
  class AppStateWrapper extends React.Component {
    constructor(props) {
      super(props);
      let initialState = {};
      let reducers = {};
      let enhancer;

      let initializedLocales = localesInitialState;
      const locale = detectLocale(Object.keys(locales));
      if (locale !== 'en') {
        initializedLocales = initLocale(initializedLocales, locale);
      }
      if (localesOnly) {
        // Used for instantiating minimal state for the unsupported
        // browser modal
        reducers = { locales: localesReducer };
        initialState = { locales: initializedLocales };
        enhancer = composeEnhancers();
      } else {
        const guiReducer = guiRedux.default;
        const { guiInitialState, guiMiddleware, initFullScreen, initPlayer, initEmbedded, initTelemetryModal } =
          guiRedux;
        const { ScratchPaintReducer } = require('./tw-scratch-paint');

        let initializedGui = guiInitialState;
        if (props.isFullScreen || props.isPlayerOnly) {
          if (props.isFullScreen) {
            initializedGui = initFullScreen(initializedGui);
          }
          if (props.isPlayerOnly) {
            initializedGui = initPlayer(initializedGui);
          }
        } else if (props.showTelemetryModal) {
          initializedGui = initTelemetryModal(initializedGui);
        }
        if (props.isEmbedded) {
          initializedGui = initEmbedded(initializedGui);
        }
        reducers = {
          locales: localesReducer,
          scratchGui: guiReducer,
          scratchPaint: ScratchPaintReducer
        };
        initialState = {
          locales: initializedLocales,
          scratchGui: initializedGui
        };
        enhancer = composeEnhancers(guiMiddleware);
      }
      const reducer = combineReducers(reducers);
      const reducer2 = (previousState, action) => {
        const nextState = reducer(previousState, action);
        AddonHooks.appStateReducer(action, previousState, nextState);
        return nextState;
      };
      this.store = createStore(reducer2, initialState, enhancer);
      window.ReduxStore = this.store;
      AddonHooks.appStateStore = this.store;
    }
    componentDidUpdate(prevProps) {
      if (localesOnly) return;
      if (prevProps.isPlayerOnly !== this.props.isPlayerOnly) {
        this.store.dispatch(setPlayer(this.props.isPlayerOnly));
      }
      if (prevProps.isFullScreen !== this.props.isFullScreen) {
        this.store.dispatch(setFullScreen(this.props.isFullScreen));
      }
    }
    render() {
      const {
        isFullScreen, // eslint-disable-line no-unused-vars
        isPlayerOnly, // eslint-disable-line no-unused-vars
        showTelemetryModal, // eslint-disable-line no-unused-vars
        ...componentProps
      } = this.props;
      return (
        <Provider store={this.store}>
          <ConnectedIntlProvider>
            <WrappedComponent {...componentProps} />
          </ConnectedIntlProvider>
        </Provider>
      );
    }
  }
  AppStateWrapper.propTypes = {
    isFullScreen: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isTelemetryEnabled: PropTypes.bool,
    showTelemetryModal: PropTypes.bool,
    isEmbedded: PropTypes.bool
  };
  return AppStateWrapper;
};

export default AppStateHOC;
