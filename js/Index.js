init();
async function init() {
    window.addEventListener("dragover", (event) => event.preventDefault());
    window.addEventListener("drop", (event) => event.preventDefault());
    Grid.initGrid($("#buttons-grid"));
    initResizer();
    await AudioPlayer.updateAudioDevicesList();
    AudioPlayer.setVolumeSlider($("#volume-slider"));
    SoundButton.setGrid(Grid.$grid);
    UiScale.setControls($("#ui-scale-slider"), $("#ui-scale-lock"), $("#ui-scale-reset"));
}
$(document).on("contextmenu", (e) => {
    SoundboardApi.openContextMenu();
});
$(window).on("dragover", (e) => {
    e.preventDefault();
    e.originalEvent.dataTransfer.dropEffect = "none";
    return false;
});
