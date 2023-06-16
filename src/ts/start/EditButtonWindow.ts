abstract class EditButtonWindow extends Main {
	private static _editorForm: EditorForm;

	public static async initWindow() {
		await super.init();

		let buttonDataRequest = SoundboardApi.getButtonData();

		// Create editor and wait for buttonData retrieval
		this._editorForm = new EditorForm($("#metadata-editor")).fillInputs(
			await buttonDataRequest
		);

		console.log("Testing buttonData", await buttonDataRequest);
	}

	// TODO: include with future loader event
	public static showWindowContent() {
		// TODO: a fade-in here isn't actually needed, so it should be changed in the future
		$(document.body).find("#soundbutton-editor").attr("style", "opacity: 1");
	}
}

// On page load
$(() => {
	// TODO: give a different feedback to the user if the retrieval fails
	EditButtonWindow.initWindow().then(EditButtonWindow.showWindowContent);
});
