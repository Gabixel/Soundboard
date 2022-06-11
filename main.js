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
	preload: path.join(__dirname, "/preload.js"),

	devTools: !isProduction,

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

	ipcMain.on("open-context-menu", (e, args) => {
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
	});

	/* Inject script elements to the body of `mainWindows` */
	// TODO: do this in a js file
	mainWindow.webContents.on("dom-ready", () => {
		function addScripts(...scriptPaths) {
			scriptPaths.forEach((scriptPath) => {
				mainWindow.webContents.executeJavaScript(
					fs.readFileSync(path.join(__dirname, "js", scriptPath + ".js"), "utf8")
				);
			});
		}

		addScripts(
			"utility/SoundBoardApi",
			"utility/ExtendedMath",
			"utility/EventFunctions",

			"grid/ButtonsGridSizeChanger",
			"grid/ButtonsGrid",
			"grid/ButtonSwap",
			"grid/SoundButton",

			"audio/AudioPool",
			"audio/AudioStoreManager",
			"audio/AudioPlayer",
			"audio/Audio",

			"settings/UiScale",

			"TopBarManager",
			"Index"
		);
	});

	// Load HTML into the window
	mainWindow.loadFile(path.join(__dirname, "/windows/mainWindow.html"));

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

	const width = 400;
	const height = 300;

	// console.log("pos x:" + mainWindow.getPosition()[0]);
	// console.log("pos y:" + mainWindow.getPosition()[1]);
	// console.log("width: " + mainWindow.getSize()[0]);
	// console.log("height: " + mainWindow.getSize()[1]);
	// console.log("editor width: " + width);
	// console.log("editor height: " + height);

	const screenBounds = screen.getDisplayMatching(mainWindow.getBounds()).bounds;

	// Create a window
	editButtonWindow = new BrowserWindow({
		title,

		width,
		height,

		minWidth: width,
		minHeight: height,

		maxWidth: width * 2,
		maxHeight: height * 2, // TODO: unsure if this is needed

		x: screenBounds.x + (screenBounds.width - width) / 2,
		y: screenBounds.y + (screenBounds.height - height) / 2,

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
