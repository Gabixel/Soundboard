abstract class EditButtonWindow extends Main {
	private static _editorForm: EditorForm;

	public static async initWindow() {
		await super.init();

		SoundboardApi.getButtonData((buttonData) => {
			console.log("Testing data", buttonData);

			this._editorForm = new EditorForm($("#metadata-editor"), buttonData);

			// Show window content
			this.showWindowContent();
		});
	}

	public static showWindowContent() {
		$(document.body).find("#soundbutton-editor").attr("style", "opacity: 1");
	}
}

// On page load
$(() => {
	EditButtonWindow.initWindow().then(EditButtonWindow.showWindowContent);
});

// initButtonEditor();

// async function initButtonEditor() {
// 	const form = $("#button-editor");
// 	FormSubmitter.initForm(form);
// }

// abstract class FormSubmitter extends Logger {
// 	private static $form: JQuery<HTMLElement>;

// 	public static initForm($form: JQuery<HTMLElement>): void {
// 		this.$form = $form;
// 		this.setupFormSubmitEvent();
// 	}
