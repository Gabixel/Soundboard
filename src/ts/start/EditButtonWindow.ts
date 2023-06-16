abstract class EditButtonWindow extends Main {
	private static _editorForm: EditorForm;

	public static async initWindow() {
		await super.init();

		SoundboardApi.getButtonData((buttonData) => {
			console.log("Testing data", buttonData);

			this._editorForm = new EditorForm($("#metadata-editor"), buttonData);

			// Show window content (only when data actually gets retrieved)
			// TODO: give a different feedback to the user if the retrieval fails
			this.showWindowContent();
		});
	}

	private static showWindowContent() {
		// TODO: a fade-in here isn't actually needed, so it should be changed in the future
		$(document.body).find("#soundbutton-editor").attr("style", "opacity: 1");
	}
}

// On page load
$(() => {
	EditButtonWindow.initWindow();
});
