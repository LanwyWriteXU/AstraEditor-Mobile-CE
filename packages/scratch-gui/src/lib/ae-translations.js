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
    'ae.mobile.rotateStage': 'Rotate stage',
    'ae.mobile.editorSettings': 'AstraEditor',
    'tw.guiAccent': 'Interface theme',
    'tw.menuBar.blockColors': 'Block colours',
    'tw.menuBar.accent': 'Accent colour',
    'tw.darkMode': 'Light',
    'tw.modernLightMode': 'Modern light',
    'tw.lightMode': 'Dark',
    'tw.deepDarkMode': 'Deeper dark',
    'tw.blockColors.three': 'Classic',
    'tw.blockColors.highContrast': 'High contrast',
    'tw.blockColors.dark': 'Dark blocks',
    'tw.blockColors.custom': 'Custom',
    'tw.accent.red': 'Red',
    'tw.accent.purple': 'Purple',
    'tw.accent.blue': 'Blue',
    'tw.accent.ae': 'AstraEditor',
    'tw.accent.cybere': 'Cybere',
    'tw.accent.miku': 'Miku',
    'tw.accent.tianyi': 'Tianyi',
    'tw.accent.rainbow': 'Rainbow',
    'tw.accent.custom': 'Custom',
    'ae.mobile.fpsOn': 'Use 60 FPS',
    'ae.mobile.fpsOff': 'Use 30 FPS',

    'ae.mobile.projectSettings': 'Project',
    'ae.mobile.about': 'About',
    'ae.mobile.about.title': 'AstraEditor Mobile',
    'ae.mobile.about.slogan1': 'Hammer, Not a Bouquet.',
    'ae.mobile.about.slogan2': 'Now, Re-recognize Me.',
    'ae.mobile.about.version': 'Version',
    'ae.mobile.about.basedOn': 'Built on Scratch and TurboWarp',
    'ae.mobile.about.github': 'Project home',
    'tw.settingsModal.project': 'Project'
  },
  'zh-cn': {
    'ae.mobile.more': '更多',
    'ae.mobile.view': '视图',
    'ae.mobile.pause': '暂停',
    'ae.mobile.resume': '继续',
    'ae.mobile.blockCount': '{num} 块积木',
    'ae.mobile.close': '关闭',
    'ae.mobile.codeEditor': '代码编辑器',
    'ae.mobile.rotateStage': '旋转舞台',
    'ae.mobile.editorSettings': 'AstraEditor',
    'tw.guiAccent': '界面主题',
    'tw.menuBar.blockColors': '积木颜色',
    'tw.menuBar.accent': '强调色',
    'tw.darkMode': '浅色',
    'tw.modernLightMode': '现代浅色',
    'tw.lightMode': '深色',
    'tw.deepDarkMode': '更深色',
    'tw.blockColors.three': '经典三色',
    'tw.blockColors.highContrast': '高对比度',
    'tw.blockColors.dark': '深色积木',
    'tw.blockColors.custom': '自定义',
    'tw.accent.red': '红色',
    'tw.accent.purple': '紫色',
    'tw.accent.blue': '蓝色',
    'tw.accent.ae': 'AstraEditor',
    'tw.accent.cybere': 'Cybere',
    'tw.accent.miku': 'Miku',
    'tw.accent.tianyi': '天依',
    'tw.accent.rainbow': '彩虹',
    'tw.accent.custom': '自定义',
    'ae.mobile.fpsOn': '开启 60 帧模式',
    'ae.mobile.fpsOff': '关闭 60 帧模式',

    'ae.mobile.projectSettings': '项目',
    'ae.mobile.about': '关于',
    'ae.mobile.about.title': 'AstraEditor Mobile',
    'ae.mobile.about.slogan1': '锤子，而不是花束。',
    'ae.mobile.about.slogan2': '现在，重新认识我。',
    'ae.mobile.about.version': '版本',
    'ae.mobile.about.basedOn': '基于 Scratch 与 TurboWarp 构建',
    'ae.mobile.about.github': '项目主页',
    'tw.settingsModal.project': '项目'
  },
  'zh-tw': {
    'ae.mobile.more': '更多',
    'ae.mobile.view': '檢視',
    'ae.mobile.pause': '暫停',
    'ae.mobile.resume': '繼續',
    'ae.mobile.blockCount': '{num} 塊積木',
    'ae.mobile.close': '關閉',
    'ae.mobile.codeEditor': '程式碼編輯器',
    'ae.mobile.rotateStage': '旋轉舞台',
    'ae.mobile.editorSettings': 'AstraEditor',
    'ae.mobile.projectSettings': '專案',
    'ae.mobile.about': '關於',
    'ae.mobile.about.title': 'AstraEditor Mobile',
    'ae.mobile.about.slogan1': '錘子，而不是花束。',
    'ae.mobile.about.slogan2': '現在，重新認識我。',
    'ae.mobile.about.version': '版本',
    'ae.mobile.about.basedOn': '基於 Scratch 與 TurboWarp 建構',
    'ae.mobile.about.github': '專案首頁',
    'tw.settingsModal.project': '專案'
  },
  ja: {
    'ae.mobile.more': 'その他',
    'ae.mobile.view': '表示',
    'ae.mobile.pause': '一時停止',
    'ae.mobile.resume': '再開',
    'ae.mobile.blockCount': '{num} 個のブロック',
    'ae.mobile.close': '閉じる',
    'ae.mobile.codeEditor': 'コードエディター',
    'ae.mobile.rotateStage': 'ステージを回転',
    'ae.mobile.editorSettings': 'AstraEditor',
    'ae.mobile.projectSettings': 'プロジェクト',
    'ae.mobile.about': 'このアプリについて',
    'ae.mobile.about.title': 'AstraEditor Mobile',
    'ae.mobile.about.slogan1': 'Hammer, Not a Bouquet.',
    'ae.mobile.about.slogan2': 'Now, Re-recognize Me.',
    'ae.mobile.about.version': 'バージョン',
    'ae.mobile.about.basedOn': 'Scratch と TurboWarp をベースにしています',
    'ae.mobile.about.github': 'プロジェクトページ',
    'tw.settingsModal.project': 'プロジェクト'
  }
};

// Only fill gaps: never override a translation that the upstream catalog already has.
const addAeTranslations = (editorMessages) => {
  for (const locale of Object.keys(messages)) {
    const target = editorMessages[locale];
    if (!target) continue;
    for (const key of Object.keys(messages[locale])) {
      if (!Object.prototype.hasOwnProperty.call(target, key)) {
        target[key] = messages[locale][key];
      }
    }
  }
};

export default addAeTranslations;
