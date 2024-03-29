import { contextBridge, ipcRenderer } from "electron";
const SOURCES_ROOT = "../../../src";

const api: MainWindowApiBridge = {
	isProduction: process.env.NODE_ENV === "production",

	openContextMenu: (args: any): void =>
		ipcRenderer.send("open-context-menu", args),

	// isPathFile: (args: string) => ipcRenderer.send("is-path-file", args),
	// isPathFileAsync: async (args) => ipcRenderer.send("is-path-file-async", args),

	// isPathFolder: (args) => ipcRenderer.send("open-context-menu", args),
	// isPathFolderAsync: async (args) => ipcRenderer.send("open-context-menu", args),

	getAppPath: async (): Promise<string> => ipcRenderer.invoke("get-app-path"),

	joinPaths: async (...paths: string[]): Promise<string> =>
		ipcRenderer.invoke("join-paths", ...paths),

	onButtonDataUpdate: (callback) => {
		ipcRenderer.on("buttondata-updated", (_e, parsedId, buttonData, reset) => {
			callback(parsedId, buttonData, reset);
		});
	},
};

// Keep updated with "~/src/ts/utility/SoundboardApi.ts"
type MainWindowApiBridge = {
	/*
	 * Global
	 */

	isProduction: boolean;
	getAppPath: () => Promise<string>;

	/*
	 * MainWindow
	 */

	openContextMenu: (args: any) => void;
	// isPathFile: (args: string) => boolean;
	joinPaths: (...paths: string[]) => Promise<string>;
	onButtonDataUpdate: (
		callback: (id: string, buttonData: SoundButtonData, reset: boolean) => void
	) => void;
};

const styles = [
	"colors",
	"base",
	"base_restyling",

	"mainWindow",

	"toolbar",
	"audio_controls",
	"buttons_area",
	"sound_button",
	"volume_slider",
];

const scripts = [
	"utility/Semaphore",
	"utility/Logger",
	"utility/JQueryFixes",
	"utility/EMath",
	"utility/EventFunctions",
	"utility/SoundBoardApi",
	"utility/UserInterface",
	"utility/StringUtilities",

	"soundbutton/SoundButtonCollectionCache",
	"soundbutton/SoundButtonCollectionStore",
	"soundbutton/SoundButtonSanitizer",
	"soundbutton/SoundButtonFactory",
	"soundbutton/SoundButtonDispatcher",

	"grid/events/GridSoundButtonEdit",
	"grid/events/GridSoundButtonSwap",
	"grid/events/GridEvents",
	"grid/GridSoundButtonIdGenerator",
	"grid/GridSoundButtonChildFactory",
	"grid/GridSoundButtonFilter",
	"grid/GridResizer",
	"grid/GridDispatcher",

	"control/VolumeSlider",
	"control/PresetsPanel",
	"control/UiScale",
	"control/ToolbarManager",

	"collection_tab/CollectionTabGridFactory",
	"collection_tab/CollectionTabDispatcher",

	"audio/AudioSource",
	"audio/AudioCouple",
	"audio/AudioDeviceSelect",
	"audio/AudioOutput",
	"audio/AudioStore",
	"audio/AudioPlayer",

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
