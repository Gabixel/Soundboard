const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
	openContextMenu: (args) => ipcRenderer.send("open-context-menu", args),
});

const appendScripts = (...scripts) => {
	scripts.forEach((s) => {
		const script = window.document.createElement("script");
        script.async = false;
		script.type = "text/javascript";
		script.src = "../js/" + s + ".js";
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
