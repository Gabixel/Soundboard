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
// to read: https://blog.stranianelli.com/electron-ipcmain-ipcrenderer-typescript-english/

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
 */
const windowRootPath = path.join(__dirname, "windows");

/**
 * The main soundboard window, with grid, toolbar and controls.
 */
let mainWindow: BrowserWindow;

/**
 * The edit window for any SoundButton.
 */
let editButtonWindow: BrowserWindow;

const webPreferences = {
	// preload: path.join(__dirname, "/preload.js"),
	preload: "/preload.js",

	devTools: !isProduction,

	spellcheck: false,

	contextIsolation: true,
	nodeIntegration: false,
	enableRemoteModule: false, // https://stackoverflow.com/a/59888788/16804863

	experimentalFeatures: false,
};

// Main windows
const mainWindowPath = path.join(windowRootPath, "mainWindow");
let mainWindowPreferences = { ...webPreferences };
mainWindowPreferences.preload = path.join(mainWindowPath, "preload.js");

// Edit button window
const editButtonWindowPath = path.join(windowRootPath, "editButtonWindow");
let editButtonWindowPreferences = { ...webPreferences };
editButtonWindowPreferences.preload = path.join(
	__dirname,
	"windows",
	"editButtonWindow",
	"preload.js"
);

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

		width,
		height,

		useContentSize: true,

		minWidth: 534,
		minHeight: 400,

		autoHideMenuBar: !isProduction,

		show: false,

		webPreferences: mainWindowPreferences,
	});

	mainWindow.once("ready-to-show", () => {
		initIpc();
		mainWindow.show();
	});

	// Load HTML into the window
	mainWindow.loadFile(path.join(mainWindowPath, "/mainWindow.html"));

	if (!isProduction) {
		mainWindow.webContents.openDevTools({
			mode: "detach",
		});
	}
}

// TODO: remove 'any'
function createEditButtonWindow(
	buttonData: any,
	screenWidth: number,
	screenHeight: number
) {
	if (mainWindow == null) return;

	let name = buttonData.title;

	let title;
	if (name != null) {
		title = `Edit "${name}" button`;
	} else {
		title = "Edit button";
	}

	let width = 400;
	let height = 300;

	width = Math.min(width, screenWidth / 2);
	height = Math.min(height, screenHeight / 2);

	const screenBounds = screen.getDisplayMatching(mainWindow.getBounds()).bounds;

	// Create a window
	editButtonWindow = new BrowserWindow({
		title,

		width,
		height,

		useContentSize: true,

		minWidth: width,
		minHeight: height,

		maxWidth: width * 2,
		maxHeight: height * 2, // TODO: unsure if max size is nice

		x: screenBounds.x + (screenBounds.width - width) / 2,
		y: screenBounds.y + (screenBounds.height - height) / 2,

		autoHideMenuBar: !isProduction,
		maximizable: false,

		parent: mainWindow,
		modal: true,
		show: false,

		webPreferences: editButtonWindowPreferences,
	});

	editButtonWindow.once("ready-to-show", () => {
		editButtonWindow.show();
	});

	editButtonWindow.once("close", () => {
		editButtonWindow = null;
	});

	// Load HTML into the window
	editButtonWindow.loadFile(
		path.join(editButtonWindowPath, "editButtonWindow.html")
	);
}

function showContextMenu(
	x: number,
	y: number,
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
		.on("is-path-file", async (_e, args) => {
			console.log(await fileSystem.lstat(args));
		});
}

// Listen for app to be ready
app.whenReady().then(() => {
	let screenWidth = screen.getPrimaryDisplay().workAreaSize.width;
	let screenHeight = screen.getPrimaryDisplay().workAreaSize.height;

	// // Remove default menu
	// if (isProduction) Menu.setApplicationMenu(null);

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

//#region Types
type ContextMenuArgs =
	| null
	| (
			| { type: "soundbutton"; buttonData: any }
			| { type: "test1"; coolThing: number }
			| { type: "test999"; a: 1; b: 2 }
	  );
//#endregion
