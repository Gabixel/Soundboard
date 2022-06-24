// const $ = require("jquery");
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const { systemPreferences, screen, ipcMain } = require("electron");
// to read: https://blog.stranianelli.com/electron-ipcmain-ipcrenderer-typescript-english/

const { app, BrowserWindow, Menu, MenuItem } = electron;

// Set app to production
// process.env.NODE_ENV = "production";

const isMac = process.platform === "darwin";
const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";

const isProduction = process.env.NODE_ENV === "production";

let mainWindow; // The main soundboard
let editButtonWindow; // The button editor

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

const mainWindowPath = path.join(__dirname, "windows", "mainWindow");
let mainWindowPreferences = JSON.parse(JSON.stringify(webPreferences));
mainWindowPreferences.preload = path.join(mainWindowPath, "preload.js");

const editButtonWindowPath = path.join(
	__dirname,
	"windows",
	"editButtonWindow"
);
let editButtonWindowPreferences = JSON.parse(JSON.stringify(webPreferences));
editButtonWindowPreferences.preload = path.join(
	editButtonWindowPath,
	"preload.js"
);

//#region Init app
const createMainWindow = (screenWidth, screenHeight) => {
	const defaultWidth = 800;
	const defaultHeight = 600;

	// Best value between default and screen size, but not bigger than screen size
	let width = Math.min(
		Math.max(defaultWidth, parseInt(screenWidth / 2)),
		screenWidth
	);
	let height = Math.min(
		Math.max(defaultHeight, parseInt(screenHeight / 2)),
		screenHeight
	);

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
};

const createEditButtonWindow = (buttonData) => {
	if (mainWindow == null) return;

	const name = buttonData.title;

	let title = "Edit";
	if (name != null) {
		title += ` "${name}"`;
	}
	title += " button";

	let width = 400;
	let height = 300;

	width = Math.min(width, parseInt(screenWidth / 2));
	height = Math.min(height, parseInt(screenHeight / 2));

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
		maxHeight: height * 2, // TODO: unsure if max size is needed

		x: screenBounds.x + (screenBounds.width - width) / 2,
		y: screenBounds.y + (screenBounds.height - height) / 2,

		autoHideMenuBar: !isProduction,

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
};

const showContextMenu = (extraElements, x, y) => {
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

	if (extraElements != null) {
		menu.insert(0, extraElements);
	}

	menu.popup(mainWindow, x, y);
};

const initIpc = () => {
	ipcMain
		.on("open-context-menu", (e, args) => {
			// console.log(event);
			// console.log(event.sender);
			// console.log(args);

			let extraMenu;

			if (args != null) {
				switch (args.type) {
					case "soundbutton":
						extraMenu = new MenuItem({
							label: "Edit",
							click: () => {
								createEditButtonWindow(args.buttonData);
							},
						});
				}
			}

			showContextMenu(extraMenu, e.x, e.y);
		})
		.on("is-path-file", (e, args) => {
			console.log(fs.lstatSync(args));
		});
};

// Listen for app to be ready
app.whenReady().then(() => {
	let screenWidth = screen.getPrimaryDisplay().workAreaSize.width;
	let screenHeight = screen.getPrimaryDisplay().workAreaSize.height;

	// Remove default menu
	if (isProduction) Menu.setApplicationMenu(null);

	createMainWindow(screenWidth, screenHeight);

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow(screenWidth, screenHeight);
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
	if (!isMac) app.quit();
});
//#endregion
