const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
	isProduction: process.env.NODE_ENV === "production",
});

// const appendScripts = (...scripts) => {
// 	scripts.forEach((s) => {
// 		const script = window.document.createElement("script");
// 		script.async = false;
// 		script.type = "text/javascript";
// 		script.src = "../../js/" + s + ".js";
// 		window.document.body.appendChild(script);
// 	});
// };

// window.onload = () => {
// 	appendScripts(
// 		"utility/Logger",
// 		"utility/SoundboardApi",
// 		"editor/FormSubmitter",
// 		"editor/ButtonEditor",
// 		"editor/Index"
// 	);
// };
