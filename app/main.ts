import {
	app,
	systemPreferences,
	ipcMain,
	session,
	screen,
	shell,
	dialog,
} from "electron";
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

	// FIXME: Can probably be removed as TS no longer recognizes this
	// @ts-ignore
	enableRemoteModule: false, // https://stackoverflow.com/a/59888788/16804863

	// https://www.electronjs.org/docs/latest/tutorial/security#9-do-not-enable-experimental-features
	experimentalFeatures: false,

	navigateOnDragDrop: false,

	// todo: autoplayPolicy, just in case

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

	if (!isProduction) {
		mainWindow.webContents.openDevTools({
			mode: "detach",
			activate: true,
		});
	}
}

function createEditButtonWindow(
	buttonData: SoundButtonData,
	screenWidth: number,
	screenHeight: number
) {
	if (mainWindow == null) return;

	let name = buttonData.title;

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

		alwaysOnTop: true,

		webPreferences: editButtonWindowPreferences,
	});

	let assignButtonData = function (
		event: Electron.IpcMainEvent,
		..._args: any[]
	): void {
		event.reply("editor-return-buttondata", buttonData);
	};

	editButtonWindow.once("ready-to-show", () => {
		ipcMain.on("editor-request-buttondata", assignButtonData);

		editButtonWindow.show();
	});

	editButtonWindow.once("close", () => {
		// Remove the request (just in case it didn't go well)
		ipcMain.removeListener("editor-request-buttondata", assignButtonData);

		editButtonWindow = null;
	});

	// Load HTML into the window
	editButtonWindow.loadFile(
		path.join(editButtonWindowPath, "editButtonWindow.html")
	);

	if (!isProduction) {
		editButtonWindow.webContents.openDevTools({
			mode: "detach",
			activate: true,
		});
	}
}

function showContextMenu(
	_x: number,
	_y: number,
	extraMenuItems: MenuItem[] = []
) {
	const menu = Menu.buildFromTemplate([
		/*{
				label: "Help",
				submenu: [
					{
						label: "About",
						click: () => {},
					},
					{
						label: "Help",
						click: () => {},
					},
				],
			},*/
		{
			label: "nothing to see here 👀",
			enabled: false,
			toolTip: "test tooltip",
		},
	]);

	// Add exra items (if present)
	if (extraMenuItems != null && extraMenuItems.length > 0) {
		extraMenuItems.forEach((item, index) => {
			menu.insert(index, item);
		});
	}

	// TODO: ??
	menu.popup({
		window: mainWindow,
		// x: x,
		// y: y,
	});
}

// TODO: Different OS variants(?)
async function openFileInExplorer(path: string) {
	await fileSystem.access(path).then(
		() => {
			// Success
			console.log(`Path: "${path}"`);
			shell.showItemInFolder(path);
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
	website: undefined,
	iconPath: undefined,
});

//#endregion

//#region IPC
function initIpc() {
	ipcMain
		.on("open-context-menu", (_e, args: ContextMenuArgs) => {
			// console.log(event);
			// console.log(event.sender);
			// console.log(args);

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
										args.buttonData,
										primaryScreenWidth,
										primaryScreenHeight
									);
								},
							}),
							new MenuItem({
								label: "Open in file explorer",
								click: () => {
									openFileInExplorer(decodeURIComponent(args.buttonData.path));
								},
							})
						);
				}
			}

			// showContextMenu(extraMenu, e.x, e.y);
			showContextMenu(null, null, extraMenuItems);
		})
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
//#endregion
