/**
 * Extra messages that only the mobile shell needs.
 *
 * Everything that already exists in Scratch's own catalog must use the original
 * message id (gui.menuBar.*, gui.controls.*, gui.SpriteInfo.*, ...) so it comes
 * with the translations that ship with @turbowarp/scratch-l10n. Only words that
 * don't exist there are listed here, and they are merged into the same catalog
 * by reducers/locales.js.
 */

const messages = {
  en: {
    'ae.mobile.more': 'More',
    'ae.mobile.view': 'View',
    'ae.mobile.pause': 'Pause',
    'ae.mobile.resume': 'Resume',
    'ae.mobile.blockCount': '{num} blocks',
    'ae.mobile.close': 'Close',
    'ae.mobile.codeEditor': 'Code editor',
    'ae.mobile.editorSettings': 'Editor settings',

    'ae.mobile.projectSettings': 'Project settings'
  },
  'zh-cn': {
    'ae.mobile.more': '更多',
    'ae.mobile.view': '视图',
    'ae.mobile.pause': '暂停',
    'ae.mobile.resume': '继续',
    'ae.mobile.blockCount': '{num} 块积木',
    'ae.mobile.close': '关闭',
    'ae.mobile.codeEditor': '代码编辑器',
    'ae.mobile.editorSettings': '编辑器设置',

    'ae.mobile.projectSettings': '项目设置'
  },
  'zh-tw': {
    'ae.mobile.more': '更多',
    'ae.mobile.view': '檢視',
    'ae.mobile.pause': '暫停',
    'ae.mobile.resume': '繼續',
    'ae.mobile.blockCount': '{num} 塊積木',
    'ae.mobile.close': '關閉',
    'ae.mobile.codeEditor': '程式碼編輯器',
    'ae.mobile.editorSettings': '編輯器設定',
    'ae.mobile.projectSettings': '專案設定'
  },
  ja: {
    'ae.mobile.more': 'その他',
    'ae.mobile.view': '表示',
    'ae.mobile.pause': '一時停止',
    'ae.mobile.resume': '再開',
    'ae.mobile.blockCount': '{num} 個のブロック',
    'ae.mobile.close': '閉じる',
    'ae.mobile.codeEditor': 'コードエディター',
    'ae.mobile.editorSettings': 'エディター設定',
    'ae.mobile.projectSettings': 'プロジェクト設定'
  }
};

const addAeTranslations = (editorMessages) => {
  for (const locale of Object.keys(messages)) {
    if (editorMessages[locale]) {
      Object.assign(editorMessages[locale], messages[locale]);
    }
  }
};

export default addAeTranslations;
