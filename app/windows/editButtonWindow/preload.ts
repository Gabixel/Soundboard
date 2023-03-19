import { contextBridge, ipcRenderer } from "electron";
import path from "path";
const SOURCES_ROOT = "../../../src";

const api: EditButtonWindowApiBridge = {
	/* Global */
	isProduction: process.env.NODE_ENV === "production",
	/**
	 * Starts the desired path from the application directory.
	 */
	resolveAppPath: (...paths: string[]): string =>
		path.resolve(__dirname, ...paths),

	/* EditButtonWindow */
	getButtonData: (callback: (buttonData: SoundButtonData) => void) => {
		ipcRenderer.once("editor-return-buttondata", (_e, arg: SoundButtonData) => {
			callback(arg);
		});

		ipcRenderer.send("editor-request-buttondata");
	},
};

ipcRenderer.on(
	"editor-get-buttondata",
	(_event, buttonData: SoundButtonData) => {
		console.log(buttonData);
	}
);

type EditButtonWindowApiBridge = {
	/* Global */
	isProduction: boolean;
	/**
	 * Starts the desired path from the application directory.
	 */
	resolveAppPath: (...path: string[]) => string;

	/* EditButtonWindow */
	getButtonData: (callback: (buttonData: SoundButtonData) => void) => void;
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
	"utility/SoundboardApi",
	"utility/StringUtilities",

	"grid/SoundButtonManager",

	"editor/EditorForm",

	"start/Main",
	"start/EditButtonWindow",
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
