import { contextBridge, ipcRenderer } from "electron";
import path from "path";
const SOURCES_ROOT = "../../../src";

const api: MainWindowApiBridge = {
	isProduction: process.env.NODE_ENV === "production",

	openContextMenu: (args: any): void =>
		ipcRenderer.send("open-context-menu", args),

	// isPathFile: (args: string) => ipcRenderer.send("is-path-file", args),
	// isPathFileAsync: async (args) => ipcRenderer.send("is-path-file-async", args),

	// isPathFolder: (args) => ipcRenderer.send("open-context-menu", args),
	// isPathFolderAsync: async (args) => ipcRenderer.send("open-context-menu", args),

	resolveAppPath: (...paths: string[]): string =>
		path.resolve(__dirname, ...paths),

	joinPaths: (...paths: string[]): string => path.join(...paths),
};

// Keep updated with "~/src/ts/utility/SoundboardApi.ts"
type MainWindowApiBridge = {
	/*
	 * Global
	 */

	isProduction: boolean;

	/*
	 * MainWindow
	 */

	openContextMenu: (args: any) => void;
	// isPathFile: (args: string) => boolean;
	resolveAppPath: (...path: string[]) => string;
	joinPaths: (...paths: string[]) => string;
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
	"utility/ExtendedMath",
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
		stylesheet.href = path.join(SOURCES_ROOT, "css", s + ".css");
		window.document.head.appendChild(stylesheet);
	});
}

function appendScripts(scripts: string[]) {
	scripts.forEach((s) => {
		const script = window.document.createElement("script");
		script.async = false;
		script.defer = true;
		script.type = "text/javascript";
		script.src = "";
		script.src = path.join(SOURCES_ROOT, "js", s + ".js");
		window.document.head.appendChild(script);
	});
}
