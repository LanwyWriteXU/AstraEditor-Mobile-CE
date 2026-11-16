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
import LanguageMenu from '../menu-bar/language-menu.jsx';
import TWGuiThemeMenu from '../menu-bar/tw-theme-gui.jsx';
import TWBlocksThemeMenu from '../menu-bar/tw-theme-blocks.jsx';
import TWAccentThemeMenu from '../menu-bar/tw-theme-accent.jsx';
import Backpack from '../../containers/backpack.jsx';
import BrowserModal from '../browser-modal/browser-modal.jsx';
import TipsLibrary from '../../containers/tips-library.jsx';
import Cards from '../../containers/cards.jsx';
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
import { loadData } from '../ae-readme/ae-readme.jsx';

import { openAeFeaturesModal } from '../../reducers/modals.js';

import ExtensionManager from '../extension-chooser/extension-chooser.jsx';
import MonacoEditor from '../../containers/monaco-editor.jsx';
import MoreFilePage from '../ae-mobile/more-file-page.jsx';
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
    backpackHost,
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

  const viewportMenu = (
    <div className={styles.viewportMenu}>
      {canChangeLanguage ? <LanguageMenu onRequestCloseSettings={() => {}} /> : null}
      {canChangeTheme ? (
        <React.Fragment>
          <TWGuiThemeMenu />
          <TWBlocksThemeMenu />
          <TWAccentThemeMenu />
        </React.Fragment>
      ) : null}
    </div>
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
      viewportMenu
    ) : morePage === 'settings' ? (
      <TWSettingsModal inline />
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
          <StageWrapper
            isFullScreen={isFullScreen}
            isEmbedded={isEmbedded}
            isRendererSupported={isRendererSupported()}
            isRtl={isRtl}
            loading={loading}
            stageSize={STAGE_SIZE_MODES.full}
            vm={vm}
          />
        </React.Fragment>
      ) : (
        <Box className={styles.mobileBody}>
          {/*
            The stage has to stay mounted: vm.attachRenderer() is called inside the Stage
            container, and the VM needs a renderer even while the stage is not visible.
            While editing it is parked off screen, in full screen mode it covers the viewport.
          */}
          <Box className={styles.stageHost}>
            <StageWrapper
              hideStageHeader
              isFullScreen={isFullScreen}
              isRendererSupported={isRendererSupported()}
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

              {backpackVisible ? <Backpack host={backpackHost} /> : null}

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

      <DragLayer />

      <div className={styles.rotateHint}>
        <span className={styles.rotateHintText}>请将设备横屏使用</span>
      </div>
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
