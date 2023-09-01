import { contextBridge, ipcRenderer } from "electron";
const SOURCES_ROOT = "../../../src";

const api: EditButtonWindowApiBridge = {
	isProduction: process.env.NODE_ENV === "production",

	getAppPath: async (): Promise<string> => ipcRenderer.invoke("get-app-path"),

	getButtonData: async (): Promise<SoundButtonData> =>
		ipcRenderer.invoke("editor-request-buttondata"),

	updateButtonData: async (parsedId, buttonData): Promise<void> =>
		ipcRenderer.invoke("editor-update-buttondata", parsedId, buttonData),

	onAskCompareChanges: (callback: () => void): void => {
		ipcRenderer.on("editor-ask-compare-changes", callback);
	},

	sendCompareChanges: async (
		id: string,
		buttonData: SoundButtonData
	): Promise<void> =>
		ipcRenderer.invoke("editor-onclose-compare-changes", id, buttonData),
};

type EditButtonWindowApiBridge = {
	/*
	 * Global
	 */

	isProduction: boolean;
	getAppPath: () => Promise<string>;

	/*
	 * EditButtonWindow
	 */

	getButtonData: () => Promise<SoundButtonData>;
	/**
	 * Sends the updated soundbutton data to the main process
	 * @param buttonData The new data for the soundbutton
	 */
	updateButtonData: (parsedId: string, buttonData: SoundButtonData) => Promise<void>;
	// openContextMenu: (args: object) => void;
	// isPathFile: (args: string) => boolean;

	onAskCompareChanges: (callback: () => void) => void;

	sendCompareChanges: (parsedId: string, buttonData: SoundButtonData) => Promise<void>;
};

const styles = [
	"colors",
	"base",
	"base_restyling",

	"editButtonWindow",

	"buttons_area",
	"sound_button",
];

const scripts = [
	"utility/Logger",
	"utility/JQueryFixes",
	"utility/EMath",
	"utility/SoundboardApi",
	"utility/StringUtilities",

	"editor/EditorForm",

	"start/Main",
	"start/EditButtonWindow",
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
