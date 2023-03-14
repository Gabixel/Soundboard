abstract class EditButtonWindow extends Main {
	private static _formSubmitter: FormSubmitter;

	public static async initWindow() {
		super.init();

		this._formSubmitter = new FormSubmitter($("#metadata-editor"));


		// Show window content
		$(document.body).find("#soundbutton-editor").attr("style", "opacity: 1");
	}
}

// On page load
$(() => {
	EditButtonWindow.initWindow();
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
