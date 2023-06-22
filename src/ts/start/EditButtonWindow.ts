abstract class EditButtonWindow extends Main {
	private static _editorForm: EditorForm;

	public static async initWindow() {
		await super.init();

		let buttonDataRequest = SoundboardApi.editButtonWindow.getButtonData();

		// Create editor and wait for buttonData retrieval
		this._editorForm = new EditorForm($("#metadata-editor")).fillInputs(
			(await buttonDataRequest).id,
			(await buttonDataRequest).buttonData
		);

		// Send id and data when requested (during `close` event) for comparing changes
		SoundboardApi.editButtonWindow.onAskCompareChanges(() => {
			// Check for focused form element (since when closing the window it doesn't unfocus, which could result in data loss with the current `change` event logic)
			let $focusedFormElement = this._editorForm.$form.find("input:focus");
			if ($focusedFormElement.length > 0) {
				$focusedFormElement.trigger("blur");
			}

			SoundboardApi.editButtonWindow.sendCompareChanges(
				this._editorForm.buttonId,
				this._editorForm.buttonData
			);
		});

		// $(window).one("keydown", (e) => {
		// 	if (e.key === "Escape") {
		// TODO: close window by keypress (probably with an IPC call)
		// note: the following code seems to break everything:
		// it bypasses all events of the main process and just hides the window
		// window.close();
		// 	}
		// });
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
