import { app, ipcMain, screen, shell, dialog } from "electron";
import { BrowserWindow, Menu, MenuItem } from "electron";
import path from "path";
import fileSystem from "fs/promises";
const Process = process;

/*
// To check if app is running with admistrator privileges
// https://stackoverflow.com/a/37670360/16804863
let exec = require("child_process").exec;
exec("NET SESSION", function (_err: any, _so: any, se: any) {
	console.log(se.length === 0 ? "admin" : "not admin");
});
*/

// TODO: Set app to production
// process.env.NODE_ENV = "production";

// Set chromium environment language
app.commandLine.appendSwitch("lang", "en-US");

const isMac = Process.platform === "darwin";
const isWindows = Process.platform === "win32";
const isLinux = Process.platform === "linux";

const isProduction = Process.env.NODE_ENV === "production";

/**
 * Root path for any app window.
 *
 * **Note: `__dirname` already points to the `/app` folder.**
 */
const appWindowRootPath = path.join(__dirname, "windows");

/**
 * Basic web preferences (which can be used for any window).
 */
const webPreferences: Electron.WebPreferences = {
	// preload: path.join(__dirname, "/preload.js"),
	preload: "/preload.js",

	devTools: !isProduction,

	spellcheck: false,

	// Context isolation
	contextIsolation: true,
	nodeIntegration: false,
	nodeIntegrationInWorker: false,
	nodeIntegrationInSubFrames: false,

	// TODO: Can probably be removed as TS no longer recognizes this
	// @ts-ignore
	enableRemoteModule: false, // https://stackoverflow.com/a/59888788/16804863

	// https://www.electronjs.org/docs/latest/tutorial/security#9-do-not-enable-experimental-features
	experimentalFeatures: false,

	navigateOnDragDrop: false,

	// TODO: autoplayPolicy, just in case

	webviewTag: false,
};

/**
 * The main soundboard window, with grid, toolbar and controls.
 */
let mainWindow: BrowserWindow;

const mainWindowPath = path.join(appWindowRootPath, "mainWindow");
let mainWindowPreferences: Electron.WebPreferences = {
	...webPreferences,
	preload: path.join(mainWindowPath, "preload.js"),
};

/**
 * The soundbutton editor window.
 */
let editButtonWindow: BrowserWindow;

const editButtonWindowPath = path.join(appWindowRootPath, "editButtonWindow");
let editButtonWindowPreferences: Electron.WebPreferences = {
	...webPreferences,
	preload: path.join(editButtonWindowPath, "preload.js"),
};

//#region Init app
function createMainWindow(screenWidth: number, screenHeight: number) {
	const defaultWidth = 800;
	const defaultHeight = 600;

	// Best value between default and screen size, but not bigger than screen size
	let width = Math.min(Math.max(defaultWidth, screenWidth / 2), screenWidth);
	let height = Math.min(Math.max(defaultHeight, screenHeight / 2), screenHeight);

	// Create a window
	mainWindow = new BrowserWindow({
		title: "Soundboard",

		useContentSize: true,

		width,
		height,

		minWidth: 534,
		minHeight: 400,

		frame: true,
		transparent: false,

		autoHideMenuBar: !isProduction,

		show: false,

		webPreferences: mainWindowPreferences,
	});

	mainWindow.once("ready-to-show", () => {
		mainWindow.show();
	});

	// Load HTML into the window
	mainWindow.loadFile(path.join(mainWindowPath, "/mainWindow.html"));

	// Dev tools
	if (!isProduction) {
		mainWindow.webContents.openDevTools({
			mode: "detach",
			activate: true,
		});
	}
}

function createEditButtonWindow(
	parsedButtonId: string,
	originalButtonData: SoundButtonData,
	screenWidth: number,
	screenHeight: number
) {
	if (mainWindow == null || editButtonWindow != null) return;

	let name = originalButtonData.title;

	let title = "Edit button";
	if (name != null) {
		title += ` "${name}"`;
	}

	let width = 400;
	let height = 300;

	width = Math.min(width, screenWidth / 2);
	height = Math.min(height, screenHeight / 2);

	const screenBounds = screen.getDisplayMatching(mainWindow.getBounds()).bounds;

	// Create a window
	editButtonWindow = new BrowserWindow({
		title,

		useContentSize: true,

		width,
		height,

		minWidth: width,
		minHeight: height,

		maxWidth: width * 2,
		maxHeight: height * 2, // TODO: unsure if max size is nice

		frame: true,
		transparent: false,

		x: screenBounds.x + (screenBounds.width - width) / 2,
		y: screenBounds.y + (screenBounds.height - height) / 2,

		autoHideMenuBar: !isProduction,
		maximizable: false,
		minimizable: false,

		parent: mainWindow,
		modal: true,
		show: false,

		webPreferences: editButtonWindowPreferences,
	});

	/* Editor API */

	// Opening window
	editButtonWindow.once("ready-to-show", () => {
		// Note: do not use `handleOnce` since the editor page can be reloaded
		// TODO: prevent CTRL-R ?
		ipcMain.handle("editor-request-buttondata", (_e, _args) => {
			return { parsedId: parsedButtonId, buttonData: originalButtonData };
		});

		// On submit
		ipcMain.handleOnce("editor-update-buttondata", (_e, parsedId, buttonData) => {
			saveSoundButtonChanges(parsedId, buttonData);
			editButtonWindow.destroy();
		});

		// Check on close to see if there are unsaved changes
		ipcMain.handle(
			"editor-onclose-compare-changes",
			(_e, parsedId, buttonData) => {
				// (Should be taken for granted that `parsedButtonId === parsedId`)
				if (shouldQuitCheckingChanges(parsedId, buttonData)) {
					editButtonWindow.destroy();
				}
			}
		);

		editButtonWindow.show();
	});

	// Closing window
	editButtonWindow.on("close", (e) => {
		e.preventDefault();
		editButtonWindow.webContents.send("editor-ask-compare-changes");
	});

	// Dispose window
	editButtonWindow.on("closed", () => {
		editButtonWindow.removeAllListeners();
		ipcMain.removeHandler("editor-request-buttondata");
		ipcMain.removeHandler("editor-update-buttondata");
		ipcMain.removeHandler("editor-onclose-compare-changes");
		editButtonWindow = null;
	});

	function shouldQuitCheckingChanges(
		id: string,
		buttonData: SoundButtonData
	): boolean {
		let editorHasUnsavedChanges =
			JSON.stringify(originalButtonData) != JSON.stringify(buttonData);

		if (editorHasUnsavedChanges) {
			/**
			 * Possible outputs:
			 * 0 - Wait/Cancel,
			 * 1 - Forget/Discard,
			 * 2 - Save & close.
			 * Note: the 'X' button is equal to pressing the first element (0).
			 */
			let prompt = dialog.showMessageBoxSync(editButtonWindow, {
				title: "Unsaved changes",
				message: "Did you want to save your changes?",
				type: "warning",
				buttons: ["Wait, go back", "Forget changes", "Save and close"],
				defaultId: 2, // Focused button
				cancelId: 0, // Esc key equivalent
				// detail: "",
				noLink: true,
			});

			// Handle special operations
			switch (prompt) {
				// "Wait/Cancel"
				case 0:
					return false;

				// "Save and close"
				case 2:
					// Save changes and close
					saveSoundButtonChanges(id, buttonData);

				// "Forget/Discard" (case 1) can be ignored
			}
		}

		return true;
	}

	/* Final load */

	// Load HTML into the window
	editButtonWindow.loadFile(
		path.join(editButtonWindowPath, "editButtonWindow.html")
	);
}

function showContextMenu(extraMenuItems: MenuItem[] = []) {
	const menu = Menu.buildFromTemplate([
		{
			label: "nothing to see here 👀",
			enabled: false,
			toolTip: "test tooltip",
		},
	]);

	// Add extra items (if present)
	if (extraMenuItems != null && extraMenuItems.length > 0) {
		extraMenuItems.forEach((item, index) => {
			menu.insert(index, item);
		});

		menu.insert(
			extraMenuItems.length,
			new MenuItem({
				type: "separator",
			})
		);
	}

	menu.popup({
		window: mainWindow,
	});
}

// TODO: Different OS variants(?)
async function openFileInExplorer(filePath: string): Promise<void> {
	// Empty path
	if (filePath == "") {
		console.log("Path is empty");
		return;
	}

	// TODO: add more safety if path is invalid?
	// TODO: open containing folder if file no longer exists + warn the user?

	// Try to open file
	await fileSystem.access(filePath).then(
		() => {
			// Success
			console.log(`Path: "${filePath}"`);
			shell.showItemInFolder(filePath);
		},
		(error) => {
			console.log(error);
		}
	);
}

// Listen for app to be ready
// TODO: (Squirrel packaging) https://www.electronforge.io/import-existing-project#adding-squirrel.windows-boilerplate
app.whenReady().then(() => {
	let screenWidth = screen.getPrimaryDisplay().workAreaSize.width;
	let screenHeight = screen.getPrimaryDisplay().workAreaSize.height;

	// Remove default menu
	if (isProduction) {
		Menu.setApplicationMenu(null);
	}

	initIpc();

	createMainWindow(screenWidth, screenHeight);

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow(screenWidth, screenHeight);
		}
	});
});

// Quit stuff
app.on("will-quit", () => {
	// TODO: saving stuff
	// console.log(app.getPath("documents"));
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// https://www.electronjs.org/docs/latest/tutorial/quick-start#manage-your-windows-lifecycle
app.on("window-all-closed", () => {
	if (!isMac) {
		app.quit();
	}
});

// macOS about panel
app.setAboutPanelOptions({
	applicationName: "Soundboard",
	applicationVersion: "Version 1.0",
	copyright: "Copyright (c) 2022 Gabixel",
	version: "1.0",
	credits: undefined,
	authors: ["Gabixel"],
	website: "https://github.com/Gabixel/Soundboard",
	iconPath: undefined,
});

//#endregion Init App

//#region API

//#region Global API
function initIpc(): void {
	ipcMain.on("open-context-menu", (_e, args: ContextMenuArgs) => {
		const primaryScreenWidth = screen.getPrimaryDisplay().workAreaSize.width;
		const primaryScreenHeight = screen.getPrimaryDisplay().workAreaSize.height;

		let extraMenuItems: MenuItem[] = [];

		if (args != null) {
			switch (args.type) {
				case "soundbutton":
					extraMenuItems.push(
						new MenuItem({
							label: "Edit",
							click: () => {
								createEditButtonWindow(
									args.parsedId,
									args.buttonData,
									primaryScreenWidth,
									primaryScreenHeight
								);
							},
						}),
						new MenuItem({
							label: "Open in file explorer",
							click: () => {
								openFileInExplorer(decodeURIComponent(args.buttonData.path ?? ""));
							},
						}),
						new MenuItem({
							type: "separator",
						}),
						new MenuItem({
							label: "Clear",
							click: () => {
								saveSoundButtonChanges(args.parsedId, args.buttonData, true);
							},
						})
					);
			}
		}

		showContextMenu(extraMenuItems);
	});

	// TODO:
	// .on("is-path-file", async (_e, args) => {
	// 	console.log(await fileSystem.lstat(args));
	// });

	ipcMain.handle("get-app-path", (_e) => {
		return path.join(__dirname, "../");
	});

	ipcMain.handle("join-paths", (_e, ...paths: string[]) => {
		return path.join(...paths);
	});
}
//#endregion Global API

//#region EditButtonWindow API
function saveSoundButtonChanges(
	parsedId: string,
	buttonData: SoundButtonData,
	reset = false
): void {
	// Send updated button
	mainWindow.webContents.send("buttondata-updated", parsedId, buttonData, reset);
}
//#endregion

//#endregion API
