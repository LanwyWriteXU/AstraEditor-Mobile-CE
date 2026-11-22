import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import VM from 'scratch-vm';

import Blocks from '../../containers/blocks.jsx';
import CostumeTab from '../../containers/costume-tab.jsx';
import SoundTab from '../../containers/sound-tab.jsx';
import StageWrapper from '../../containers/stage-wrapper.jsx';
import Loader from '../loader/loader.jsx';
import Box from '../box/box.jsx';
import MenuBar from '../menu-bar/menu-bar.jsx';
import CostumeLibrary from '../../containers/costume-library.jsx';
import BackdropLibrary from '../../containers/backdrop-library.jsx';
import SpriteLibrary from '../../containers/sprite-library.jsx';
import MobileToolbar from '../ae-mobile/mobile-toolbar.jsx';
import MobileSpritePanel from '../ae-mobile/mobile-sprite-panel.jsx';
import MobileMorePanel from '../ae-mobile/mobile-more-panel.jsx';
import MobileScreen from '../ae-mobile/mobile-screen.jsx';
import { RotateStageIcon } from '../ae-mobile/icons.jsx';
import LanguageMenu from '../menu-bar/language-menu.jsx';
import TWGuiThemeMenu from '../menu-bar/tw-theme-gui.jsx';
import TWBlocksThemeMenu from '../menu-bar/tw-theme-blocks.jsx';
import TWAccentThemeMenu from '../menu-bar/tw-theme-accent.jsx';
import BrowserModal from '../browser-modal/browser-modal.jsx';
import TipsLibrary from '../../containers/tips-library.jsx';
import Cards from '../../containers/cards.jsx';
import Backpack from '../../containers/backpack.jsx';
import Alerts from '../../containers/alerts.jsx';
import DragLayer from '../../containers/drag-layer.jsx';
import ConnectionModal from '../../containers/connection-modal.jsx';
import TelemetryModal from '../telemetry-modal/telemetry-modal.jsx';
import TWUsernameModal from '../../containers/tw-username-modal.jsx';
import TWSettingsModal from '../../containers/tw-settings-modal.jsx';
import TWSecurityManager from '../../containers/tw-security-manager.jsx';
import TWCustomExtensionModal from '../../containers/tw-custom-extension-modal.jsx';
import TWRestorePointManager from '../../containers/tw-restore-point-manager.jsx';
import TWFontsModal from '../../containers/tw-fonts-modal.jsx';
import TWUnknownPlatformModal from '../../containers/tw-unknown-platform-modal.jsx';
import TWInvalidProjectModal from '../../containers/tw-invalid-project-modal.jsx';
import TWWindChimeSubmitter from '../../containers/tw-windchime-submitter.jsx';
import CustomThemeModal from '../../containers/tw-custom-theme-modal.jsx';
import AEReadMe from '../../containers/ae-readme.jsx';
import AeFeaturesModal from '../../containers/ae-features-modal.jsx';
import version from '../../lib/ae-version.js';
import { elementAtPoint, closestFromPoint } from '../../lib/drag-zone';
import DragConstants from '../../lib/drag-constants';
import installDropZonePatch from '../../lib/backpack-drop-zone';
import { loadData } from '../ae-readme/ae-readme.jsx';

import { openAeFeaturesModal } from '../../reducers/modals.js';

import ExtensionManager from '../extension-chooser/extension-chooser.jsx';
import MonacoEditor from '../../containers/monaco-editor.jsx';
import MoreFilePage from '../ae-mobile/more-file-page.jsx';
import MoreViewPage from '../ae-mobile/more-view-page.jsx';
import MoreAboutPage from '../ae-mobile/more-about-page.jsx';
import { persistTheme } from '../../lib/themes/themePersistance.js';
import { setTheme } from '../../reducers/theme.js';
import { setProjectTitle } from '../../reducers/project-title';
import PreviewExt from '../../containers/ae-preview-ext.jsx';

import { closeSpriteLibrary, openReadme, openSettingsModal } from '../../reducers/modals.js';
import {
  BLOCKS_TAB_INDEX,
  COSTUMES_TAB_INDEX,
  MONACO_EDITOR_TAB_INDEX,
  SOUNDS_TAB_INDEX
} from '../../reducers/editor-tab';
import { setFullScreen } from '../../reducers/mode';
import { updateAssetDrag } from '../../reducers/asset-drag';
import { setHoveredSprite } from '../../reducers/hovered-target';

import { STAGE_SIZE_MODES } from '../../lib/layout-constants';
import { resolveStageSize } from '../../lib/screen-utils';
import { Theme } from '../../lib/themes';

import { isRendererSupported, isBrowserSupported } from '../../lib/tw-environment-support-prober';

import styles from './gui.css';
import addExtensionIcon from './icon--extensions.svg';
import { get, reset, STORAGE_KEY } from '../../lib/settings.js';
/* 检测设置 */

if (localStorage.getItem(STORAGE_KEY) === 'undefined' || localStorage.getItem(STORAGE_KEY) === undefined) {
  reset();
}
const getFullscreenBackgroundColor = () => {
  const params = new URLSearchParams(location.search);
  if (params.has('fullscreen-background')) {
    return params.get('fullscreen-background');
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return '#111';
  }
  return 'white';
};

const fullscreenBackgroundColor = getFullscreenBackgroundColor();

// Drag types that transfer something into the sprite panel. Reordering a sprite inside
// the panel should leave the panel open, everything else closes it once dropped.
const PANEL_DROP_TYPES = [
  DragConstants.COSTUME,
  DragConstants.SOUND,
  DragConstants.BACKPACK_COSTUME,
  DragConstants.BACKPACK_SOUND,
  DragConstants.BACKPACK_SPRITE,
  DragConstants.BACKPACK_CODE
];

const GUIComponent = (props) => {
  const {
    accountNavOpen,
    activeTabIndex,
    alertsVisible,
    authorId,
    authorThumbnailUrl,
    authorUsername,
    basePath,
    backdropLibraryVisible,
    assetDragging,
    assetDragType,
    backpackHost,
    blockDragging,
    hoveredSpriteId,
    backpackVisible,
    blocksId,
    blocksTabVisible,
    cardsVisible,
    canChangeLanguage,
    canChangeTheme,
    canCreateNew,
    canEditTitle,
    canManageFiles,
    canRemix,
    canSave,
    canCreateCopy,
    canShare,
    canUseCloud,
    children,
    connectionModalVisible,
    costumeLibraryVisible,
    costumesTabVisible,
    customStageSize,
    editingTarget,
    enableCommunity,
    intl,
    isCreating,
    isEmbedded,
    isFullScreen,
    isPlayerHome,
    isPlayerOnly,
    isRtl,
    isShared,
    isWindowFullScreen,
    isTelemetryEnabled,
    isTotallyNormal,
    loading,
    logo,
    renderLogin,
    onClickAbout,
    onClickAccountNav,
    onCloseAccountNav,
    onClickAddonSettings,
    onClickDesktopSettings,
    onClickMinimize,
    onClickMaximize,
    isMaximize,
    onClickClose,
    onClickNewWindow,
    onClickPackager,
    onLogOut,
    onOpenRegistration,
    onToggleLoginOpen,
    onActivateCostumesTab,
    onActivateSoundsTab,
    onActivateTab,
    onClickLogo,
    onExtensionButtonClick,
    onOpenExtensionEditor,
    onOpenCustomExtensionModal,
    onProjectTelemetryEvent,
    onRequestCloseBackdropLibrary,
    onRequestCloseCostumeLibrary,
    onRequestCloseTelemetryModal,
    onSeeCommunity,
    onShare,
    onShowPrivacyPolicy,
    onStartSelectingFileUpload,
    onTelemetryModalCancel,
    onTelemetryModalOptIn,
    onTelemetryModalOptOut,
    securityManager,
    showComingSoon,
    showOpenFilePicker,
    showSaveFilePicker,
    soundsTabVisible,
    spriteLibraryVisible,
    sprites,
    stage,
    projectTitle,
    stageSizeMode,
    targetIsStage,
    telemetryModalVisible,
    theme,
    tipsLibraryVisible,
    usernameModalVisible,
    settingsModalVisible,
    customExtensionModalVisible,
    fontsModalVisible,
    unknownPlatformModalVisible,
    invalidProjectModalVisible,
    vm,
    customThemeVisible,
    readmeModalVisible,
    onOpenReadme,
    extensionManagerVisible,
    onRequestCloseExtensionManager,
    onOpenExtensionLibrary,
    previewExtVisible,
    dispatch,
    aeFeaturesModalVisible,
    ...componentProps
  } = props;
  const updateCanShowReadme = () => {
    if (!vm.editingTarget || !vm.editingTarget.comments) {
      setCanShowReadme(false);
      return;
    }
    const comments = Object.values(vm.editingTarget.comments);
    const readMe = [];
    comments.forEach((comment) => {
      if (comment.text && comment.text.slice(0, 7) === '#README') {
        readMe.push(comment.text.slice(8, comment.text.length));
      }
    });
    return readMe.length != 0;
  };

  const [canShowReadme, setCanShowReadme] = useState(() => {
    updateCanShowReadme;
  });
  const [loaderExiting, setLoaderExiting] = useState(false);
  const [spritePanelOpen, setSpritePanelOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [morePage, setMorePage] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [backpackExpanded, setBackpackExpanded] = useState(false);
  // Fullscreen only: presents the stage rotated 90 degrees so a 4:3 project can
  // fill a portrait phone instead of being letterboxed to a thin strip.
  const [stagePortrait, setStagePortrait] = useState(false);
  // Latest "which sprite tile is hovered" value, readable from timer callbacks without
  // re-creating them on every hover change.
  const hoveredSpriteRef = useRef(hoveredSpriteId);
  useEffect(() => {
    hoveredSpriteRef.current = hoveredSpriteId;
  }, [hoveredSpriteId]);
  // Pointer position shared with the drag timer; must survive the effect rebuilds caused
  // by the sprite panel opening during a drag.
  const pointerRef = useRef({ x: 0, y: 0 });
  const wasDraggingRef = useRef(false);

  // Drag zones are resolved from the pointer position: HTML5 drag targets can be the
  // drag image or the body, and Blockly drags move the stack on a drag surface that sits
  // under the cursor, so event.target is not reliable here.
  const resolveDragZone = (x, y) => {
    const element = elementAtPoint(x, y);
    if (!element || !element.closest) return null;
    if (element.closest('[data-ae-toolbar]')) return 'toolbar';
    if (element.closest('[data-ae-backpack]')) return 'backpack';
    if (element.closest('[data-ae-sprite-panel]')) return 'panel';
    return 'outside';
  };

  const applyDragZone = (zone) => {
    if (!zone) return;
    if (zone === 'toolbar') {
      if (!spritePanelOpen) {
        setSpritePanelOpen(true);
        setBackpackExpanded(false);
      }
      return;
    }
    if (zone === 'backpack') {
      setBackpackExpanded(true);
      return;
    }
    // Never close the panel while something is being dragged: the panel owns both drag
    // sources (sprite tiles) and drop targets (the sprite grid), and unmounting it mid
    // drag leaves the drag without a source to finish it.
    setBackpackExpanded(false);
  };

  // The backpack and the sprite panel float over the blocks canvas; teach Blockly that a
  // drop on them ends the drag outside the workspace.
  useEffect(() => {
    installDropZonePatch();
  }, []);

  // A drag can outlive the component that started it (its tile unmounts with the panel)
  // and then nothing dispatches `dragging: false`: the drag image stays pinned to the
  // cursor and the editor stops responding. Only the leftover case is cleaned up here,
  // after the normal end-of-drag handlers had their turn.
  const assetDragRef = useRef({ dragging: assetDragging, type: assetDragType });
  useEffect(() => {
    assetDragRef.current = { dragging: assetDragging, type: assetDragType };
  }, [assetDragging, assetDragType]);

  useEffect(() => {
    if (!assetDragging) return undefined;
    const pointer = { x: 0, y: 0 };
    const track = (event) => {
      const touch = event.touches && event.touches[0];
      const source = touch || event;
      if (typeof source.clientX !== 'number') return;
      pointer.x = source.clientX;
      pointer.y = source.clientY;
    };
    let timer = null;
    const handleRelease = () => {
      if (timer) return;
      // Let the drag source finish its own drop first (it dispatches on mouseup too).
      timer = setTimeout(() => {
        timer = null;
        const { dragging, type } = assetDragRef.current;
        if (dragging) {
          dispatch(
            updateAssetDrag({
              img: null,
              currentOffset: null,
              dragging: false,
              dragType: null,
              index: null
            })
          );
        }
        // Dropping an asset on the sprite panel is a one-shot action; leaving the panel
        // open afterwards just blocks the editor behind its scrim.
        if (PANEL_DROP_TYPES.includes(type) && closestFromPoint(pointer.x, pointer.y, '[data-ae-sprite-panel]')) {
          setSpritePanelOpen(false);
        }
      }, 0);
    };
    document.addEventListener('pointermove', track);
    document.addEventListener('touchmove', track, { passive: true });
    document.addEventListener('mouseup', handleRelease);
    document.addEventListener('touchend', handleRelease);
    document.addEventListener('touchcancel', handleRelease);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointermove', track);
      document.removeEventListener('touchmove', track, { passive: true });
      document.removeEventListener('mouseup', handleRelease);
      document.removeEventListener('touchend', handleRelease);
      document.removeEventListener('touchcancel', handleRelease);
    };
  }, [assetDragging, dispatch]);

  // Blockly drags don't fire HTML5 drag events, so watch the drag surface and the pointer.
  useEffect(() => {
    if (isFullScreen) return undefined;
    // The pointer lives in a ref: this effect is rebuilt whenever the panel opens, and a
    // local variable would lose the position and stop resolving the hovered sprite.
    const pointer = pointerRef.current;
    const handlePointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    // Touch drags go through touchmove; keep a position for those too. The check runs
    // right away because a finger drag has no hover state to fall back on.
    const handleTouchMove = (event) => {
      const touch = event.touches && event.touches[0];
      if (!touch) return;
      pointer.x = touch.clientX;
      pointer.y = touch.clientY;
      check();
    };
    // Same value, painted straight onto the DOM: the tile highlight must be visible even
    // if the component tree does not re-render fast enough during a drag.
    const highlightTile = (spriteId) => {
      const tiles = document.querySelectorAll('[data-ae-sprite-id]');
      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const isTarget = spriteId !== null && tile.getAttribute('data-ae-sprite-id') === spriteId;
        if (isTarget !== tile.classList.contains('ae-sprite-drop-hover')) {
          tile.classList.toggle('ae-sprite-drop-hover', isTarget);
        }
      }
    };
    const setHovered = (spriteId) => {
      highlightTile(spriteId);
      if (spriteId !== hoveredSpriteRef.current) {
        dispatch(setHoveredSprite(spriteId));
      }
    };
    // While dragging, mouseover is the most reliable signal: it fires on every element
    // the cursor travels over, including when the panel is inserted under a still pointer.
    const handleMouseOver = (event) => {
      if (!assetDragging && !document.querySelector('.blocklyDragging')) return;
      const target = event.target;
      const tile = target && target.closest && target.closest('[data-ae-sprite-id]');
      setHovered(tile ? tile.getAttribute('data-ae-sprite-id') : null);
    };
    const check = () => {
      // Scratch-Blocks puts .blocklyDragging on the block being dragged; costumes and
      // sounds are dragged through the assetDrag redux state instead.
      const dragging = Boolean(document.querySelector('.blocklyDragging')) || assetDragging;
      if (!dragging) {
        if (wasDraggingRef.current) {
          wasDraggingRef.current = false;
          setBackpackExpanded(false);
          highlightTile(null);
        }
        return;
      }
      wasDraggingRef.current = true;
      applyDragZone(resolveDragZone(pointer.x, pointer.y));
      // Track which sprite tile is under the pointer for the duration of the drag. Mouse
      // enter events are not dependable while something is being dragged, and both the
      // tile highlight and "drop blocks on another sprite" read this state.
      const tile = closestFromPoint(pointer.x, pointer.y, '[data-ae-sprite-id]');
      setHovered(tile ? tile.getAttribute('data-ae-sprite-id') : null);
    };
    const interval = setInterval(check, 120);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      clearInterval(interval);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('touchmove', handleTouchMove, { passive: true });
    };
  }, [assetDragging, isFullScreen, spritePanelOpen]);

  useEffect(() => {
    if (!vm) return undefined;
    const handleStart = () => setIsRunning(true);
    const handleStop = () => setIsRunning(false);
    vm.on('PROJECT_RUN_START', handleStart);
    vm.on('PROJECT_RUN_STOP', handleStop);
    return () => {
      vm.off('PROJECT_RUN_START', handleStart);
      vm.off('PROJECT_RUN_STOP', handleStop);
    };
  }, [vm]);
  const [isPaused, setIsPaused] = useState(() => Boolean(vm && vm.runtime && vm.runtime.paused));

  // The editor only works in landscape; ask the platform to lock it when possible.
  useEffect(() => {
    const orientation = window.screen && window.screen.orientation;
    if (orientation && typeof orientation.lock === 'function') {
      orientation.lock('landscape').catch(() => {});
    }
  }, []);

  // Keep the pause button in sync when the runtime is paused by something else (e.g. an addon).
  useEffect(() => {
    if (!vm || !vm.runtime) return undefined;
    const handlePauseChange = () => setIsPaused(Boolean(vm.runtime.paused));
    vm.runtime.on('PROJECT_PAUSED', handlePauseChange);
    vm.runtime.on('PROJECT_RESUMED', handlePauseChange);
    return () => {
      vm.runtime.off('PROJECT_PAUSED', handlePauseChange);
      vm.runtime.off('PROJECT_RESUMED', handlePauseChange);
    };
  }, [vm]);
  useEffect(() => {
    if (!vm) return;

    const handleCommentEvent = (e) => {
      setCanShowReadme(updateCanShowReadme);
    };
    const showReadmeDefault = (e) => {
      if (!get('enableREADMEAutoDisplay')) return;
      for (const target of vm.runtime.targets) {
        if (target.sprite.name == 'README') {
          loadData(target.comments);
          onOpenReadme();
          break;
        }
      }
    };

    vm.runtime.on('PROJECT_CHANGED', handleCommentEvent);
    vm.runtime.on('PROJECT_LOADED', handleCommentEvent);
    vm.runtime.on('PROJECT_LOADED', showReadmeDefault);
    return () => {
      vm.runtime.off('PROJECT_CHANGED', handleCommentEvent);
      vm.runtime.off('PROJECT_LOADED', handleCommentEvent);
      vm.runtime.off('PROJECT_LOADED', showReadmeDefault);
    };
  }, [vm]);

  const prevLoadingRef = useRef(Boolean(loading));
  const loaderExitTimeoutRef = useRef(null);

  // Use a layout effect so we don't "unmount then remount" the loader for one frame.
  useLayoutEffect(() => {
    const isLoadingNow = Boolean(loading);
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isLoadingNow;

    // When loading starts again, cancel any pending fade-out.
    if (isLoadingNow) {
      if (loaderExitTimeoutRef.current) {
        clearTimeout(loaderExitTimeoutRef.current);
        loaderExitTimeoutRef.current = null;
      }
      if (loaderExiting) setLoaderExiting(false);
      return;
    }

    // Trigger fade-out only on the true -> false transition.
    if (wasLoading && !isLoadingNow) {
      setLoaderExiting(true);
      if (loaderExitTimeoutRef.current) clearTimeout(loaderExitTimeoutRef.current);
      // 500ms matches loader.css animation-duration
      loaderExitTimeoutRef.current = setTimeout(() => {
        setLoaderExiting(false);
        loaderExitTimeoutRef.current = null;
      }, 500);
    }
  }, [loading, loaderExiting]);

  useEffect(
    () => () => {
      if (loaderExitTimeoutRef.current) {
        clearTimeout(loaderExitTimeoutRef.current);
        loaderExitTimeoutRef.current = null;
      }
    },
    []
  );

  if (children) {
    return <Box {...componentProps}>{children}</Box>;
  }

  // 显示AE特性MODAL
  useEffect(() => {
    if (
      !localStorage.getItem('ae:firstEnter') ||
      localStorage.getItem('ae:lastVersion') !== version.version ||
      localStorage.getItem('ae:webBuild') !== version.webBuild
    ) {
      try {
        dispatch(openAeFeaturesModal());
      } catch (e) {
        // ingore
      }
    }
  }, []);
  const stageSize = resolveStageSize(stageSizeMode, true);

  // Leaving the fullscreen stage always returns to the landscape presentation.
  useEffect(() => {
    if (!isFullScreen) setStagePortrait(false);
  }, [isFullScreen]);

  const handleRotateStage = () => {
    setStagePortrait(!stagePortrait);
    // The stage measures itself on window resize; rotating is a layout change
    // the renderer cannot see on its own.
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
  };

  // Sprites, costumes, sounds and backpack items use HTML5 drag events.
  useEffect(() => {
    const handleDragOver = (event) => {
      applyDragZone(resolveDragZone(event.clientX, event.clientY));
    };
    document.addEventListener('dragover', handleDragOver, true);
    return () => document.removeEventListener('dragover', handleDragOver, true);
  });

  const handleDragEnd = () => {
    setBackpackExpanded(false);
  };
  let activeScreen = 'code';
  if (activeTabIndex === COSTUMES_TAB_INDEX) activeScreen = 'costumes';
  else if (activeTabIndex === SOUNDS_TAB_INDEX) activeScreen = 'sounds';
  else if (activeTabIndex === MONACO_EDITOR_TAB_INDEX) activeScreen = 'monaco';

  const handleSwitchScreen = (screen) => {
    dispatch(setFullScreen(false));
    if (screen === 'costumes') {
      onActivateTab(COSTUMES_TAB_INDEX);
    } else if (screen === 'monaco') {
      onActivateTab(MONACO_EDITOR_TAB_INDEX);
    } else if (screen === 'sounds') {
      onActivateTab(SOUNDS_TAB_INDEX);
    } else {
      onActivateTab(BLOCKS_TAB_INDEX);
    }
  };

  const handleStart = () => {
    vm.start();
    vm.greenFlag();
    setIsPaused(false);
  };

  const handleStop = () => {
    vm.stopAll();
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(Boolean(vm.togglePause()));
  };

  const handleMoreEntry = (entry) => {
    if (entry === 'addons') {
      setMoreOpen(false);
      if (onClickAddonSettings) onClickAddonSettings();
      return;
    }
    setMorePage(entry);
  };

  const alwaysEnabledModals = (
    <React.Fragment>
      <TWSecurityManager securityManager={securityManager} />
      <TWRestorePointManager />
      {usernameModalVisible && <TWUsernameModal />}
      {settingsModalVisible && <TWSettingsModal />}
      {customExtensionModalVisible && <TWCustomExtensionModal />}
      {fontsModalVisible && <TWFontsModal />}
      {unknownPlatformModalVisible && <TWUnknownPlatformModal />}
      {invalidProjectModalVisible && <TWInvalidProjectModal />}
      {customThemeVisible && <CustomThemeModal />}
      {readmeModalVisible && <AEReadMe />}
      {extensionManagerVisible && (
        <ExtensionManager
          vm={vm}
          onRequestClose={onRequestCloseExtensionManager}
          onOpenExtensionLibrary={onOpenExtensionLibrary}
          onOpenCodeLibrary={onOpenExtensionEditor}
          onOpenCustomExtensionModal={onOpenCustomExtensionModal}
          dispatch={dispatch}
        />
      )}
      {previewExtVisible && <PreviewExt />}
      {aeFeaturesModalVisible && <AeFeaturesModal />}
    </React.Fragment>
  );

  const closeMorePanel = () => {
    setMoreOpen(false);
    setMorePage(null);
  };

  const morePageContent =
    morePage === 'file' ? (
      <MoreFilePage
        projectTitle={projectTitle}
        vm={vm}
        onOpenExtensionEditor={onOpenExtensionEditor}
        onStartSelectingFileUpload={onStartSelectingFileUpload}
        onToggle={closeMorePanel}
      />
    ) : morePage === 'view' ? (
      <MoreViewPage
        theme={theme}
        onChangeTheme={(key, value) => {
          const nextTheme = theme.set(key, value);
          dispatch(setTheme(nextTheme));
          persistTheme(nextTheme);
        }}
      />
    ) : morePage === 'projectSettings' ? (
      <TWSettingsModal inline where="settings" />
    ) : morePage === 'editorSettings' ? (
      <TWSettingsModal inline where="ae" />
    ) : morePage === 'about' ? (
      <MoreAboutPage />
    ) : null;

  return (
    <Box className={styles.pageWrapper} dir={isRtl ? 'rtl' : 'ltr'}>
      {alwaysEnabledModals}
      {telemetryModalVisible ? (
        <TelemetryModal
          isRtl={isRtl}
          isTelemetryEnabled={isTelemetryEnabled}
          onCancel={onTelemetryModalCancel}
          onOptIn={onTelemetryModalOptIn}
          onOptOut={onTelemetryModalOptOut}
          onRequestClose={onRequestCloseTelemetryModal}
          onShowPrivacyPolicy={onShowPrivacyPolicy}
        />
      ) : null}
      {loading || loaderExiting ? (
        <Loader isFullScreen isExiting={loaderExiting} />
      ) : isCreating ? (
        <Loader isFullScreen messageId="gui.loader.creating" />
      ) : null}
      {isBrowserSupported() ? null : <BrowserModal isRtl={isRtl} onClickDesktopSettings={onClickDesktopSettings} />}
      {tipsLibraryVisible ? <TipsLibrary /> : null}
      {cardsVisible ? <Cards /> : null}
      {alertsVisible ? <Alerts className={styles.alertsContainer} /> : null}
      {connectionModalVisible ? <ConnectionModal vm={vm} /> : null}
      {costumeLibraryVisible ? <CostumeLibrary vm={vm} onRequestClose={onRequestCloseCostumeLibrary} /> : null}
      {backdropLibraryVisible ? <BackdropLibrary vm={vm} onRequestClose={onRequestCloseBackdropLibrary} /> : null}
      {spriteLibraryVisible ? (
        <SpriteLibrary
          vm={vm}
          onActivateBlocksTab={() => onActivateTab(BLOCKS_TAB_INDEX)}
          onRequestClose={() => dispatch(closeSpriteLibrary())}
        />
      ) : null}

      {isPlayerOnly ? (
        <React.Fragment>
          {isWindowFullScreen ? (
            <div
              className={styles.fullscreenBackground}
              style={{
                backgroundColor: fullscreenBackgroundColor
              }}
            />
          ) : null}
          {isFullScreen ? (
            <Box className={classNames(styles.stageHost, { [styles.isPortrait]: stagePortrait })}>
              <StageWrapper
                hideStageHeader
                isFullScreen
                isEmbedded={isEmbedded}
                isPlayerHome={isPlayerHome}
                isPortrait={stagePortrait}
                isRendererSupported={isRendererSupported()}
                isRtl={isRtl}
                loading={loading}
                stageSize={STAGE_SIZE_MODES.full}
                vm={vm}
              />
            </Box>
          ) : (
            <StageWrapper
              isFullScreen={false}
              isEmbedded={isEmbedded}
              isPlayerHome={isPlayerHome}
              isRendererSupported={isRendererSupported()}
              isRtl={isRtl}
              loading={loading}
              stageSize={STAGE_SIZE_MODES.full}
              vm={vm}
            />
          )}
          {/* Fullscreen preview reuses the editor's floating toolbar: StageHeader
              hides itself behind a hover zone, which a touch screen never hovers. */}
          {isFullScreen ? (
            <MobileToolbar
              activeScreen="code"
              isMoreOpen={false}
              isPaused={isPaused}
              isPortraitStage={stagePortrait}
              isRunning={isRunning}
              isSpritePanelOpen={false}
              isStageOpen
              onMore={() => {}}
              onPause={handlePause}
              onSprites={() => {}}
              onStage={() => dispatch(setFullScreen(false))}
              onStart={handleStart}
              onStop={handleStop}
              onSwitchScreen={() => {}}
              vm={vm}
            />
          ) : null}
        </React.Fragment>
      ) : (
        <Box className={styles.mobileBody} onDragEnd={handleDragEnd} onDrop={handleDragEnd}>
          {/*
            The stage has to stay mounted: vm.attachRenderer() is called inside the Stage
            container, and the VM needs a renderer even while the stage is not visible.
            While editing it is parked off screen, in full screen mode it covers the viewport.
          */}
          <Box className={classNames(styles.stageHost, { [styles.isPortrait]: isFullScreen && stagePortrait })}>
            <StageWrapper
              hideStageHeader
              isFullScreen={isFullScreen}
              isRendererSupported={isRendererSupported()}
              isPortrait={stagePortrait}
              isRtl={isRtl}
              stageSize={STAGE_SIZE_MODES.full}
              vm={vm}
            />
          </Box>
          {isFullScreen ? null : (
            <Box className={styles.mobileMain}>
              {activeScreen === 'costumes' ? (
                <MobileScreen>{costumesTabVisible ? <CostumeTab vm={vm} /> : null}</MobileScreen>
              ) : null}

              {activeScreen === 'sounds' ? (
                <MobileScreen>{soundsTabVisible ? <SoundTab vm={vm} /> : null}</MobileScreen>
              ) : null}

              {activeScreen === 'monaco' ? <MonacoEditor /> : null}

              {/* Kept mounted so switching between code/costumes doesn't rebuild the Blockly workspace. */}
              <Box
                className={classNames(styles.workspaceArea, {
                  [styles.isHidden]: activeScreen !== 'code'
                })}
              >
                <Box className={styles.blocksWrapper}>
                  <Blocks
                    key={`${blocksId}/${theme.id}`}
                    canUseCloud={canUseCloud}
                    grow={1}
                    isVisible={blocksTabVisible && activeScreen === 'code'}
                    options={{
                      media: `${basePath}static/${theme.getBlocksMediaFolder()}/`
                    }}
                    stageSize={stageSize}
                    onOpenCustomExtensionModal={onOpenCustomExtensionModal}
                    theme={theme}
                    vm={vm}
                  />
                </Box>
                <Box className={styles.extensionButtonContainer}>
                  <button className={styles.extensionButton} onClick={onExtensionButtonClick}>
                    <img className={styles.extensionButtonIcon} draggable={false} src={addExtensionIcon} />
                  </button>
                </Box>
              </Box>

              {spritePanelOpen || moreOpen ? (
                <div
                  className={styles.panelScrim}
                  onClick={() => {
                    setSpritePanelOpen(false);
                    setMoreOpen(false);
                    setMorePage(null);
                  }}
                />
              ) : null}

              {/*
                The backpack has to be mounted before a drag starts: its drop area is
                measured from the DOM, and blocks / costumes / sounds are dropped based on
                state that only exists while it is alive. Keeping it inside the sprite
                panel meant it only appeared mid-drag, so every drop was lost.
              */}
              {backpackVisible ? (
                <div className={styles.backpackDock} data-ae-backpack="true">
                  <Backpack forceExpanded={backpackExpanded} host={backpackHost} />
                </div>
              ) : null}

              {spritePanelOpen ? (
                <MobileSpritePanel
                  editingTarget={editingTarget}
                  stage={stage}
                  vm={vm}
                  onClose={() => setSpritePanelOpen(false)}
                  onOpenCode={() => onActivateTab(BLOCKS_TAB_INDEX)}
                />
              ) : null}

              {moreOpen ? (
                <MobileMorePanel
                  page={morePage}
                  projectTitle={projectTitle}
                  vm={vm}
                  onClose={() => {
                    setMoreOpen(false);
                    setMorePage(null);
                  }}
                  onSelectEntry={handleMoreEntry}
                  onUpdateTitle={(title) => dispatch(setProjectTitle(title))}
                >
                  {morePageContent}
                </MobileMorePanel>
              ) : null}
            </Box>
          )}

          <MobileToolbar
            activeScreen={activeScreen}
            isMoreOpen={moreOpen}
            isPaused={isPaused}
            isPortraitStage={isFullScreen && stagePortrait}
            isRunning={isRunning}
            isSpritePanelOpen={spritePanelOpen}
            isStageOpen={isFullScreen}
            onMore={() => {
              setSpritePanelOpen(false);
              if (moreOpen) {
                setMorePage(null);
              }
              setMoreOpen(!moreOpen);
            }}
            onPause={handlePause}
            onSprites={() => {
              setMoreOpen(false);
              setMorePage(null);
              setSpritePanelOpen(!spritePanelOpen);
            }}
            onStage={() => dispatch(setFullScreen(!isFullScreen))}
            onStart={handleStart}
            onStop={handleStop}
            onSwitchScreen={handleSwitchScreen}
            vm={vm}
          />
        </Box>
      )}

      {/*
        Fullscreen stage only, for both the editor and the preview page. The button
        lives outside the rotated layer and is anchored in screen coordinates:
        top-right while landscape, bottom-left while portrait, so it never ends up
        under a thumb or off a corner.
      */}
      {isFullScreen ? (
        <button
          aria-label={intl.formatMessage({ defaultMessage: 'Rotate stage', id: 'ae.mobile.rotateStage' })}
          className={classNames(styles.stageRotateButton, {
            [styles.isPortraitAnchor]: stagePortrait
          })}
          title={intl.formatMessage({ defaultMessage: 'Rotate stage', id: 'ae.mobile.rotateStage' })}
          onClick={handleRotateStage}
        >
          <RotateStageIcon className={styles.stageRotateIcon} />
        </button>
      ) : null}

      <DragLayer />

      {isFullScreen || isPlayerOnly ? null : (
        <div className={styles.rotateHint}>
          <span className={styles.rotateHintText}>请将设备横屏使用</span>
        </div>
      )}
    </Box>
  );
};
const mapDispatchToProps = (dispatch) => ({
  onOpenReadme: () => dispatch(openReadme()),
  dispatch
});
GUIComponent.propTypes = {
  accountNavOpen: PropTypes.bool,
  activeTabIndex: PropTypes.number,
  authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // can be false
  authorThumbnailUrl: PropTypes.string,
  authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // can be false
  backdropLibraryVisible: PropTypes.bool,
  backpackHost: PropTypes.string,
  assetDragging: PropTypes.bool,
  assetDragType: PropTypes.string,
  blockDragging: PropTypes.bool,
  hoveredSpriteId: PropTypes.string,
  backpackVisible: PropTypes.bool,
  basePath: PropTypes.string,
  blocksTabVisible: PropTypes.bool,
  blocksId: PropTypes.string,
  canChangeLanguage: PropTypes.bool,
  canChangeTheme: PropTypes.bool,
  canCreateCopy: PropTypes.bool,
  canCreateNew: PropTypes.bool,
  canEditTitle: PropTypes.bool,
  canManageFiles: PropTypes.bool,
  canRemix: PropTypes.bool,
  canSave: PropTypes.bool,
  canShare: PropTypes.bool,
  canUseCloud: PropTypes.bool,
  cardsVisible: PropTypes.bool,
  children: PropTypes.node,
  costumeLibraryVisible: PropTypes.bool,
  costumesTabVisible: PropTypes.bool,
  customStageSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }),
  enableCommunity: PropTypes.bool,
  intl: intlShape.isRequired,
  isCreating: PropTypes.bool,
  isEmbedded: PropTypes.bool,
  isFullScreen: PropTypes.bool,
  isPlayerHome: PropTypes.bool,
  isPlayerOnly: PropTypes.bool,
  isRtl: PropTypes.bool,
  isShared: PropTypes.bool,
  isWindowFullScreen: PropTypes.bool,
  isTotallyNormal: PropTypes.bool,
  loading: PropTypes.bool,
  logo: PropTypes.string,
  onActivateCostumesTab: PropTypes.func,
  onActivateSoundsTab: PropTypes.func,
  onActivateTab: PropTypes.func,
  onClickAccountNav: PropTypes.func,
  onClickAddonSettings: PropTypes.func,
  onClickDesktopSettings: PropTypes.func,
  onClickMinimize: PropTypes.func,
  onClickMaximize: PropTypes.func,
  isMaximize: PropTypes.func,
  onClickClose: PropTypes.func,
  onClickNewWindow: PropTypes.func,
  onClickPackager: PropTypes.func,
  onClickLogo: PropTypes.func,
  onCloseAccountNav: PropTypes.func,
  onExtensionButtonClick: PropTypes.func,
  onOpenExtensionEditor: PropTypes.func,
  onOpenCustomExtensionModal: PropTypes.func,
  onLogOut: PropTypes.func,
  onOpenRegistration: PropTypes.func,
  onRequestCloseBackdropLibrary: PropTypes.func,
  onRequestCloseCostumeLibrary: PropTypes.func,
  onRequestCloseTelemetryModal: PropTypes.func,
  onSeeCommunity: PropTypes.func,
  onShare: PropTypes.func,
  onShowPrivacyPolicy: PropTypes.func,
  onStartSelectingFileUpload: PropTypes.func,
  onTabSelect: PropTypes.func,
  onTelemetryModalCancel: PropTypes.func,
  onTelemetryModalOptIn: PropTypes.func,
  onTelemetryModalOptOut: PropTypes.func,
  onToggleLoginOpen: PropTypes.func,
  renderLogin: PropTypes.func,
  securityManager: PropTypes.shape({}),
  showComingSoon: PropTypes.bool,
  showOpenFilePicker: PropTypes.func,
  showSaveFilePicker: PropTypes.func,
  soundsTabVisible: PropTypes.bool,
  spriteLibraryVisible: PropTypes.bool,
  stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
  targetIsStage: PropTypes.bool,
  telemetryModalVisible: PropTypes.bool,
  theme: PropTypes.instanceOf(Theme),
  tipsLibraryVisible: PropTypes.bool,
  usernameModalVisible: PropTypes.bool,
  settingsModalVisible: PropTypes.bool,
  customExtensionModalVisible: PropTypes.bool,
  fontsModalVisible: PropTypes.bool,
  unknownPlatformModalVisible: PropTypes.bool,
  invalidProjectModalVisible: PropTypes.bool,
  vm: PropTypes.instanceOf(VM).isRequired,
  customThemeVisible: PropTypes.bool,
  readmeModalVisible: PropTypes.bool,
  onOpenReadme: PropTypes.func,
  extensionManagerVisible: PropTypes.bool,
  onRequestCloseExtensionManager: PropTypes.func,
  onOpenExtensionLibrary: PropTypes.func,
  previewExtVisible: PropTypes.bool,
  aeFeaturesModalVisible: PropTypes.bool
};
GUIComponent.defaultProps = {
  backpackHost: null,
  backpackVisible: false,
  basePath: './',
  blocksId: 'original',
  canChangeLanguage: true,
  canChangeTheme: true,
  canCreateNew: false,
  canEditTitle: false,
  canManageFiles: true,
  canRemix: false,
  canSave: false,
  canCreateCopy: false,
  canShare: false,
  canUseCloud: false,
  enableCommunity: false,
  isCreating: false,
  isShared: false,
  isTotallyNormal: false,
  loading: false,
  showComingSoon: false,
  stageSizeMode: STAGE_SIZE_MODES.large
};

const mapStateToProps = (state) => ({
  customStageSize: state.scratchGui.customStageSize,
  isWindowFullScreen: state.scratchGui.tw.isWindowFullScreen,
  // This is the button's mode, as opposed to the actual current state
  blocksId: state.scratchGui.timeTravel.year.toString(),
  stageSizeMode: state.scratchGui.stageSize.stageSize,
  theme: state.scratchGui.theme.theme,
  customThemeVisible: state.scratchGui.modals.customtheme,
  readmeModalVisible: state.scratchGui.modals.readme,
  previewExtVisible: state.scratchGui.modals.previewExt,
  aeFeaturesModalVisible: state.scratchGui.modals.aeFeaturesModal,
  editingTarget: state.scratchGui.targets.editingTarget,
  sprites: state.scratchGui.targets.sprites,
  stage: state.scratchGui.targets.stage,
  spriteLibraryVisible: state.scratchGui.modals.spriteLibrary,
  projectTitle: state.scratchGui.projectTitle
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(GUIComponent));
