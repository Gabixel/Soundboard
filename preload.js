const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
	openContextMenu: (args) => ipcRenderer.send("open-context-menu", args),
});

const appendScripts = (...scripts) => {
	scripts.forEach((s) => {
		const script = window.document.createElement("script");
		script.type = "text/javascript";
		script.src = "../js/" + s + ".js";
        script.async = false;
		window.document.body.appendChild(script);
	});
};

window.onload = () => {
	appendScripts(
		"utility/SoundBoardApi",
		"utility/ExtendedMath",
		"utility/EventFunctions",

		"grid/GridResizer",
		"grid/Grid",
		"grid/ButtonSwap",
		"grid/SoundButton",

		"audio/AudioPool",
		"audio/AudioStoreManager",
		"audio/AudioPlayer",
		"audio/Audio",

		"settings/UiScale",

		"TopBarManager",
		"Index"
	);
};
