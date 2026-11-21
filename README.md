<p align="center">
  <img src="assets/logo.svg" alt="AstraEditor Mobile" width="40%"/>
</p>

# AstraEditor Mobile-CE

<p>
  <img src="https://img.shields.io/badge/version-1.2.9-4dabf7?style=flat-square" alt="version"/>
  <img src="https://img.shields.io/badge/TurboWarp-based-ff4c4c?style=flat-square" alt="TurboWarp"/>
  <img src="https://img.shields.io/badge/React-16.14-61dafb?style=flat-square&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Redux-3.7-764abc?style=flat-square&logo=redux&logoColor=white" alt="Redux"/>
  <img src="https://img.shields.io/badge/Webpack-5-8dd6f9?style=flat-square&logo=webpack&logoColor=black" alt="Webpack"/>
  <img src="https://img.shields.io/badge/Monaco-0.34-0078d7?style=flat-square" alt="Monaco"/>
  <img src="https://img.shields.io/badge/Node-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"/>
  <img src="https://img.shields.io/badge/pnpm-11.17-f69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm"/>
  <img src="https://img.shields.io/badge/license-GPL--3.0-8b5cf6?style=flat-square" alt="license"/>
</p>

The mobile branch of AstraEditor, with the editor relaid out for landscape phones.

![Editor](docs/images/editor.png)

- The workspace fills the screen; the toolbar runs down the right side.
- Stage, costumes, sounds, code and settings are separate pages.
- The fullscreen stage can switch between landscape and portrait framing.

![Fullscreen stage](docs/images/fullscreen.png)

![More panel](docs/images/more.png)

## Development

Requires Node.js >= 18 and pnpm 11.17.

```bash
pnpm install
pnpm fetch     # generates gitignored files such as the microbit hex
pnpm start     # http://localhost:1145, reachable from phones on the same LAN
```

After editing a package under `packages/`, rebuild it (the GUI uses each package's `dist`), e.g. `pnpm build:vm`.

Full build, in dependency order:

```bash
pnpm build:l10n && pnpm build:audio && pnpm build:blocks && pnpm build:render && pnpm build:vm && pnpm build:paint && pnpm build:gui
```

Two things can go wrong: `--colors` was removed in webpack-cli 6, and skipping `pnpm fetch` leaves `microbit-hex-url.cjs` missing.

## Layout

```
packages/
├── scratch-gui/     editor UI, mobile code in src/components/ae-mobile/
├── scratch-vm/      virtual machine
├── scratch-blocks/  block editor
├── scratch-render/  WebGL renderer
├── scratch-paint/   paint editor
├── scratch-audio/   audio engine
└── scratch-l10n/    translations
docs/                layout design, touch checklist, addon index
```

## Docs

- [Mobile layout design](docs/ae-mobile-layout.md)
- [Touch adaptation checklist](docs/ae-mobile-refactor-checklist.md)
- [Addon index](docs/addons.md)

## License

`scratch-gui` is GPL-3.0; see each package for the rest. Scratch is a trademark of MIT; this project is not affiliated with MIT.
