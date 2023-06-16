import { contextBridge, ipcRenderer } from "electron";
const SOURCES_ROOT = "../../../src";

const api: EditButtonWindowApiBridge = {
	isProduction: process.env.NODE_ENV === "production",

	getAppPath: async (): Promise<string> => ipcRenderer.invoke("get-app-path"),

	getButtonData: async (): Promise<SoundButtonData> =>
		ipcRenderer.invoke("editor-request-buttondata"),
};

ipcRenderer.on(
	"editor-get-buttondata",
	(_event, buttonData: SoundButtonData) => {
		console.log(buttonData);
	}
);

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
	// openContextMenu: (args: object) => void;
	// isPathFile: (args: string) => boolean;
	// TODO: editButton
};

const styles = [
	"colors",
	"base",
	"base_restyling",

	"editButtonWindow",

	"buttons_grid",
	"sound_button",
];

const scripts = [
	"utility/Logger",
	"utility/JQueryFixes",
	"utility/EMath",
	"utility/SoundboardApi",
	"utility/StringUtilities",

	"grid/SoundButtonManager",

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
