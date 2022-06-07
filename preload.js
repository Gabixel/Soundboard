const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("api", {
    openContextMenu: (args) => ipcRenderer.send("open-context-menu", args),
});
