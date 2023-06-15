import { contextBridge, ipcRenderer } from "electron";
const SOURCES_ROOT = "../../../src";

const api: MainWindowApiBridge = {
	/* Global */
	isProduction: process.env.NODE_ENV === "production",
	/**
	 * Starts the desired path from the application directory.
	 */
	resolveAppPath: (...paths: string[]): string =>
		path.resolve(__dirname, ...paths),

	/* MainWindow */
	openContextMenu: (args: any): void =>
		ipcRenderer.send("open-context-menu", args),

	// isPathFile: (args: string) => ipcRenderer.send("is-path-file", args),
	// isPathFileAsync: async (args) => ipcRenderer.send("is-path-file-async", args),

	// isPathFolder: (args) => ipcRenderer.send("open-context-menu", args),
	// isPathFolderAsync: async (args) => ipcRenderer.send("open-context-menu", args),

	getAppPath: async (): Promise<string> => ipcRenderer.invoke("get-app-path"),

	joinPaths: async (...paths: string[]): Promise<string> =>
		ipcRenderer.invoke("join-paths", ...paths),
};

// Keep updated with "~/src/ts/utility/SoundboardApi.ts"
type MainWindowApiBridge = {
	/* Global */
	isProduction: boolean;
	/**
	 * Starts the desired path from the application directory.
	 */
	resolveAppPath: (...path: string[]) => string;

	/* MainWindow */
	openContextMenu: (args: any) => void;
	// isPathFile: (args: string) => boolean;
	getAppPath: () => Promise<string>;
	joinPaths: (...paths: string[]) => Promise<string>;
};

const styles = [
	"colors",
	"base",
	"base_restyling",

	"mainWindow",

	"toolbar",
	"audio_controls",
	"buttons_grid",
	"sound_button",
	"volume_slider",
];

const scripts = [
	"utility/Logger",
	"utility/JQueryFixes",
	"utility/EMath",
	"utility/EventFunctions",
	"utility/SoundBoardApi",
	"utility/UserInterface",
	"utility/StringUtilities",

	"grid/GridManager",
	"grid/GridResizer",
	"grid/ButtonSwap",
	"grid/ButtonFilterer",
	"grid/SoundButtonManager",

	"controls/VolumeSlider",
	"controls/PresetsPanel",
	"controls/UiScale",

	"audio/AudioPool",
	"audio/AudioStoreManager",
	"audio/AudioPlayer",

	"ToolbarManager",

	"start/Main",
	"start/MainWindow",
];

//#region Assignment

// Create API bridge
contextBridge.exposeInMainWorld("api", api);

window.onload = () => {
	appendStyles(styles);
	appendScripts(scripts);
};

function appendStyles(styles: string[]) {
	styles.forEach((s) => {
		const stylesheet = window.document.createElement("link");
		stylesheet.type = "text/css";
		stylesheet.rel = "stylesheet";
		// Stylesheet path
		stylesheet.href = SOURCES_ROOT + "/css/" + s + ".css";
		window.document.head.appendChild(stylesheet);
	});
}

function appendScripts(scripts: string[]) {
	scripts.forEach((s) => {
		const script = window.document.createElement("script");
		script.async = false;
		script.defer = true;
		script.type = "text/javascript";
		// Script path
		script.src = SOURCES_ROOT + "/js/" + s + ".js";
		window.document.head.appendChild(script);
	});
}

//#endregion
