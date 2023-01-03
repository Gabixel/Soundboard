# Soundboard
 A soundboard for your friends!

**This project is still very WIP. Everything is subject to change.**

<hr/>

The project uses [Electron](https://www.electronjs.org/) (which is based on [Node.js](https://nodejs.org/en/))

Current way to debug the app (with each file compiled):
 - Use [*Easy LESS* in Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=mrcrowl.easy-less) (search "mrcrowl.easy-less" in the extensions list) to compile CSS files
 - Go on each `.less` file and do <kbd>CTRL</kbd> + <kbd>S</kbd> to generate the `.css` format
 - Use [TypeScript](https://www.typescriptlang.org/download) **in the root folder** to compile the JavaScript file (by doing `tsc` or `tsc --w` to [compile in "watch mode"](https://www.typescriptlang.org/docs/handbook/configuring-watch.html)).<br/>
  If the `.js` files doesn't generate correctly, or doesn't always update, you can do `tsc --b --force` to force re-building
 - Press <kbd>F5</kbd> to start the debugger
