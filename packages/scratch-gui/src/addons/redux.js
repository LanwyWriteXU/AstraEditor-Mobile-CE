import EventTargetShim from './event-target';
import AddonHooks from './hooks';

// The addon bundle can be evaluated before the GUI store exists (the store is created
// when React mounts). Reading `state` that early used to throw, taking the whole page
// down, so answer with a minimal default until the real store is available.
const createFallbackState = () => ({
  locales: {
    locale: typeof navigator !== 'undefined' && navigator.language ? navigator.language.toLowerCase() : 'en',
    isRtl: false
  },
  scratchGui: {
    mode: {
      isPlayerOnly: false,
      isEmbedded: false,
      isFullScreen: false
    }
  }
});

class AddonRedux extends EventTargetShim {
  constructor() {
    super();

    this._isInReducer = false;
    this._nextState = null;

    AddonHooks.appStateReducer = (action, prev, next) => {
      this._isInReducer = true;
      this._nextState = next;
      this.dispatchEvent(
        new CustomEvent('statechanged', {
          detail: {
            action,
            prev,
            next
          }
        })
      );
      this._nextState = null;
      this._isInReducer = false;
    };
  }

  initialize() {
    // no-op; it is always initialized
  }

  dispatch(m) {
    const store = AddonHooks.appStateStore;
    // Drop anything dispatched before the GUI store exists; nothing is listening yet.
    if (!store) return;
    if (this._isInReducer) {
      queueMicrotask(() => store.dispatch(m));
    } else {
      store.dispatch(m);
    }
  }

  get state() {
    if (this._nextState) return this._nextState;
    if (!AddonHooks.appStateStore) return createFallbackState();
    return AddonHooks.appStateStore.getState();
  }
}

const reduxInstance = new AddonRedux();

export default reduxInstance;
