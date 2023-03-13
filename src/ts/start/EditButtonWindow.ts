abstract class EditButtonWindow extends Main {
	public static async initWindow() {
		super.init();

		console.log("test"); 
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

// 	private static setupFormSubmitEvent() {
// 		this.$form.on("submit", (e) => {
// 			e.preventDefault();
// 			this.logInfo(this.setupFormSubmitEvent, "Form submitted.");
// 		});
// 	}
// }
