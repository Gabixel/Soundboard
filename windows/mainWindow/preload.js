const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
	openContextMenu: (args) => ipcRenderer.send("open-context-menu", args),

	isPathFile: (args) => ipcRenderer.send("is-path-file", args),
	// isPathFileAsync: async (args) => ipcRenderer.send("is-path-file-async", args),

	// isPathFolder: (args) => ipcRenderer.send("open-context-menu", args),
	// isPathFolderAsync: async (args) => ipcRenderer.send("open-context-menu", args),

	isProduction: process.env.NODE_ENV === "production",
});

const appendScripts = (...scripts) => {
	scripts.forEach((s) => {
		const script = window.document.createElement("script");
		script.async = false;
		script.type = "text/javascript";
		script.src = "../../js/" + s + ".js";
		window.document.body.appendChild(script);
	});
};

window.onload = () => {
	appendScripts(
		"utility/SoundBoardApi",
		"utility/ExtendedMath",
		"utility/EventFunctions",
		"utility/Logger",

		"grid/GridResizer",
		"grid/Grid",
		"grid/ButtonSwap",
		"grid/ButtonFilter",
		"grid/SoundButton",

		"audio/AudioPool",
		"audio/AudioStoreManager",
		"audio/AudioPlayer",
		"audio/Audio",

		"controls/Presets_Panel",
		"controls/UiScale",

		"TopBarManager",
		"Index"
	);
};
