# Soundboard
 A soundboard for your friends!

**This project is still very WIP. Everything is subject to change.**

<hr/>

The project uses [Electron](https://www.electronjs.org/) (which is based on [Node.js](https://nodejs.org/en/)), [TypeScript](https://www.typescriptlang.org/) for JavaScript management and [LESS](https://lesscss.org/) for the CSS part.

## Debug 'n Run
To start debugging the app:
- Open your terminal in the root directory of this project
- To compile JavaScript (using TypeScript), run the following command: `npm run tsc-all`. This will compile all the `.ts` files present in the `/app` and `/src/ts` folders.
  - You can also [compile in "watch mode"](https://www.typescriptlang.org/docs/handbook/configuring-watch.html) by running `npm run tsc-all-w`
  <!-- TODO: use official LESS Node.js compilation as primary option -->
- To compile CSS (using LESS), see the [*Easy LESS* extension](https://marketplace.visualstudio.com/items?itemName=mrcrowl.easy-less) in VSCode (you can search `mrcrowl.easy-less` in the extensions list)
  - Go on each `.less` file and do <kbd>CTRL</kbd> + <kbd>S</kbd> to generate the `.css` format
- If you use [VSCode](https://code.visualstudio.com/), you can use the debug shortcut (by default, on Windows it sould be <kbd>F5</kbd>).<br />
  There are different debugging options available here. You can check them in the [launch.json](./.vscode/launch.json) file and in VSCode.
- If you use the terminal, you can run `npm run debug`.

<!-- TODO: add forced TS compilation -->