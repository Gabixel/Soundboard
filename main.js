const $ = require("jquery");
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const { systemPreferences } = require("electron");
// to read: https://blog.stranianelli.com/electron-ipcmain-ipcrenderer-typescript-english/

const { app, BrowserWindow, Menu, MenuItem } = electron;

// Set app to production
// process.env.NODE_ENV = "production";

const isMac = process.platform === "darwin";
const isProduction = process.env.NODE_ENV === "production";

let mainWindow; // The main soundboard
let editButtonWindow; // The button editor

const webPreferences = {
	preload: path.join(__dirname, "/preload.js"),

	spellcheck: false,

	contextIsolation: true,
	nodeIntegration: false,
	enableRemoteModule: false, // https://stackoverflow.com/a/59888788/16804863

	experimentalFeatures: false,
};

//#region Init app
const createMainWindow = () => {
	// Create a window
	mainWindow = new BrowserWindow({
		title: "Soundboard",

		width: 800,
		height: 600,

		minWidth: 400,
		minHeight: 300,

		autoHideMenuBar: !isProduction,

		webPreferences,
	});

	/* Set the `Menu` instance as the context menu */
	mainWindow.webContents.on("context-menu", (event, params) => {
		const menu = Menu.buildFromTemplate([
			{
				label: "Edit",
				submenu: [
					{
						label: "Edit button",
						click: () => {},
					},
					{
						label: "Edit sound",
						click: () => {},
					},
					{
						label: "Edit soundboard",
						click: () => {},
					},
				],
			},
			{
				label: "Help",
				submenu: [
					{
						label: "About",
						click: () => {
							createEditButtonWindow(); // test
						},
					},
					{
						label: "Help",
						click: () => {},
					},
				],
			},
		]);

		menu.popup(mainWindow, params.x, params.y);
	});

	/* Inject script elements to the body of `mainWindows` */
	mainWindow.webContents.on("dom-ready", () => {
		function addScripts(...scriptPaths) {
			scriptPaths.forEach((scriptPath) => {
				mainWindow.webContents.executeJavaScript(
					fs.readFileSync(path.join(__dirname, "js", scriptPath + ".js"), "utf8")
				);
			});
		}

		addScripts(
			"utility/ExtendedMath",
			"utility/EventFunctions",

			"audio/AudioPlayer",
			"audio/Volume",

			"grid/ButtonsGridSizeChanger",
			"grid/ButtonsGrid",
			"grid/ButtonSwap",
			"grid/SoundButton",

			"TopBarManager",
			"Index"
		);
	});

	// Load HTML into the window
	mainWindow.loadFile(path.join(__dirname, "/windows/mainWindow.html"));
};

const createEditButtonWindow = (buttonName) => {
	let title = "Edit";
	if (typeof buttonName === "undefined") {
		title += ` "${buttonName}"`;
	}
	title += " button";

	// Create a window
	editButtonWindow = new BrowserWindow({
		title,

		width: 400,
		height: 300,

		minWidth: 400,
		minHeight: 300,

		maxWidth: 400,
		maxHeight: 300,

		autoHideMenuBar: !isProduction,

		webPreferences,
	});

	editButtonWindow.once("close", () => {
		editButtonWindow = null;
	});

	// Load HTML into the window
	editButtonWindow.loadFile(
		path.join(__dirname, "/windows/editButtonWindow.html")
	);
};

// Listen for app to be ready
app.whenReady().then(() => {
	// Remove default menu
	if (isProduction) Menu.setApplicationMenu(null);

	createMainWindow();

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
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
