import { contextBridge, ipcRenderer } from "electron";
import path from "path";
const SOURCES_ROOT = "../../../src";

const api: EditButtonWindowApiBridge = {
	isProduction: process.env.NODE_ENV === "production",
};

type EditButtonWindowApiBridge = {
	// openContextMenu: (args: object) => void;
	// isPathFile: (args: string) => boolean;
	isProduction: boolean;
};

const styles = ["colors", "base", "base_restyling", "editButtonWindow"];

const scripts = [
	"utility/Logger",
	"utility/SoundboardApi",

	"editor/FormSubmitter",
	"editor/ButtonEditor",

	"editor/ButtonEditor",
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
