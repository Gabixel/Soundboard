import { contextBridge, ipcRenderer } from "electron";
import path from "path";
const SOURCES_ROOT = "../../../src/"

const api: MainWindowApiBridge = {
	openContextMenu: (args) => ipcRenderer.send("open-context-menu", args),

	// isPathFile: (args: string) => ipcRenderer.send("is-path-file", args),
	// isPathFileAsync: async (args) => ipcRenderer.send("is-path-file-async", args),

	// isPathFolder: (args) => ipcRenderer.send("open-context-menu", args),
	// isPathFolderAsync: async (args) => ipcRenderer.send("open-context-menu", args),

	isProduction: process.env.NODE_ENV === "production",
};

// Keep updated with "/src/ts/utility/SoundboardApi.ts"
type MainWindowApiBridge = {
	openContextMenu: (args: object) => void;
	// isPathFile: (args: string) => boolean;
	isProduction: boolean;
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
	"utility/ExtendedMath",
	"utility/EventFunctions",
	"utility/SoundBoardApi",

	"grid/Grid",
	"grid/GridResizer",
	"grid/ButtonSwap",
	"grid/ButtonFilter",
	"grid/SoundButton",

	"audio/AudioPool",
	"audio/AudioStoreManager",
	"audio/AudioPlayer",
	"audio/Audio",

	"controls/Presets_Panel",
	"controls/UiScale",

	"ToolbarManager",

	"Index",
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
