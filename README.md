# Soundboard
A soundboard for everyone!

**This project is still very WIP. Everything is subject to change.**

This is one of my first projects to be published on GitHub, so you can expect it to be less than perfect!

At the moment I am not very active on this project, partly due to the implementation of [Discord's built-in soundboard](https://support.discord.com/hc/en-us/articles/12612888127767-Soundboard-FAQ), but I would like to get back into it at some point (since Discord's built-in one is quite limited anyway).

You can watch this small preview:

https://github.com/Gabixel/Soundboard/assets/43073074/6e798cbc-766c-46fb-871f-51a9f39789ee

---

> [!NOTE]
> ## How do I use a Soundboard?
> You can only use your soundboard to send tracks on your desired **real** output by default. If you want to send some sounds to a microphone and use it for online meetings, you must install a "virtual cable" (aka a _driver_). This cable is responsible for sending the audio _**output**_ to a _virtual **input**_ device. A common driver is [VB-Cable](https://vb-audio.com/Cable/) (for Mac and Windows).

## Programming
The project uses [Electron](https://www.electronjs.org/) as its core, [TypeScript](https://www.typescriptlang.org/) for JavaScript management and [LESS](https://lesscss.org/) for the CSS part (but still not very great for my expectations).

## Debug 'n Run
To start debugging the app:
- Open your terminal in the root directory of this project
- To compile JavaScript (using TypeScript), run the following command: `npm run tsc-all`. This will compile all the `.ts` files present in the `/app` and `/src/ts` folders.
  - You can also [compile in "watch mode"](https://www.typescriptlang.org/docs/handbook/configuring-watch.html) by running `npm run tsc-all-w`
- To compile CSS (using LESS), see the [*Easy LESS* extension](https://marketplace.visualstudio.com/items?itemName=mrcrowl.easy-less) in VSCode (you can search `mrcrowl.easy-less` in the extensions list)
  - Go on each `.less` file and do <kbd>CTRL</kbd> + <kbd>S</kbd> to generate the `.css` format
  - (TODO: use official LESS npm compiler to make this process easier)
- If you use [VSCode](https://code.visualstudio.com/), you can use the debug shortcut (by default, on Windows it should be <kbd>F5</kbd>).<br />
  There are different debugging options available here. You can check them in the [launch.json](./.vscode/launch.json) file and VSCode.
- You can run the app by typing `npm run debug`.

<!-- TODO: add an explanation for forced TS compilation (i.e. "--force") -->

## Notes
- There's an issue with antiviruses when the app tries to list the OS audio devices, probably because the logic attempts to filter out anything that is not output at the beginning:
  https://github.com/Gabixel/Soundboard/blob/f69f7430667be0f34ab75b82e8ceac8536519275/src/ts/audio/AudioPlayer.ts#L96-L100
  As a result, there's the risk that the app gets flagged for trying to access other types (like microphones and webcams). Here's the example on my end:
  ![avast one](https://user-images.githubusercontent.com/43073074/224540986-0cfaa501-bcf2-4a44-9505-21c21e71b398.png)
- For some reason, VB-Cable audio can sometimes be glitchy, with strange interference in the sound (and it only seems to happen with Discord, but I'm not sure). You can watch [this tutorial](https://youtu.be/Y9DLLxeY5vo) which explains some functional remedies to solve the problem (sometimes only temporarily). [I have written a script](https://github.com/users/Gabixel/projects/2/views/1?itemId=22765111&pane=issue) to make this step semi-automatic, but it still needs to be integrated into this soundboard and I would like to make it as automatic as possible.
