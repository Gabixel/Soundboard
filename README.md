# Soundboard
 A soundboard for your friends!

**This project is still very WIP. Everything is subject to change.**

This is one of my first projects to be published on GitHub, so you can expect it to be less than perfect!

At the moment I am not very active on this project, partly due to the implementation of [Discord's built-in soundboard](https://support.discord.com/hc/en-us/articles/12612888127767-Soundboard-FAQ), but I would like to get back into it at some point (since Discord's built-in one is quite limited anyway).

[Watch a simple preview here](https://www.youtube.com/watch?v=uimVPY7H3O8)

<hr/>

The project uses [Electron](https://www.electronjs.org/) as its core, [TypeScript](https://www.typescriptlang.org/) for JavaScript management and [LESS](https://lesscss.org/) for the CSS part (still not very great for my expectations).

## Debug 'n Run
To start debugging the app:
- Open your terminal in the root directory of this project
- To compile JavaScript (using TypeScript), run the following command: `npm run tsc-all`. This will compile all the `.ts` files present in the `/app` and `/src/ts` folders.
  - You can also [compile in "watch mode"](https://www.typescriptlang.org/docs/handbook/configuring-watch.html) by running `npm run tsc-all-w`
- To compile CSS (using LESS), see the [*Easy LESS* extension](https://marketplace.visualstudio.com/items?itemName=mrcrowl.easy-less) in VSCode (you can search `mrcrowl.easy-less` in the extensions list)
  - Go on each `.less` file and do <kbd>CTRL</kbd> + <kbd>S</kbd> to generate the `.css` format
  - (TODO: use official LESS npm compiler for making this process easier)
- If you use [VSCode](https://code.visualstudio.com/), you can use the debug shortcut (by default, on Windows it sould be <kbd>F5</kbd>).<br />
  There are different debugging options available here. You can check them in the [launch.json](./.vscode/launch.json) file and in VSCode.
- You can simply run the app by typing `npm run debug`.

<!-- TODO: add explanation for forced TS compilation (i.e. "--force") -->

## Notes:
- There's an issue with antiviruses when the app tries to list the OS audio devices, probably because the logic attempts to filter out anything that is not output at the beginning:
  https://github.com/Gabixel/Soundboard/blob/f69f7430667be0f34ab75b82e8ceac8536519275/src/ts/audio/AudioPlayer.ts#L96-L100
  As a result, there's the risk that the app gets flagged for trying to access other types (like microphones and webcams). Here's the example on my end:
  
  ![avast one](https://user-images.githubusercontent.com/43073074/224540986-0cfaa501-bcf2-4a44-9505-21c21e71b398.png)
