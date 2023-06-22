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
		SoundboardApi.editButtonWindow.onAskCompareChanges(
			() => this.compareChangesAndClose()
		);

		$(document).on("keydown", (e) => {
			// Try closing window when pressing escape
			if (e.key === "Escape") {
				this.compareChangesAndClose();
			}
		});
	}

	/**
	 * Called when the window gets closed (receiving a trigger from the main process) or when the user presses the escape key.
	 */
	private static compareChangesAndClose(): void {
		// Trigger blur event in case an input is still focused (since when closing the window it doesn't unfocus, which could result in data loss with the current `change` event logic)
		this._editorForm.$focusedFormElement.trigger("blur");

		SoundboardApi.editButtonWindow.sendCompareChanges(
			this._editorForm.buttonId,
			this._editorForm.buttonData
		);
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
