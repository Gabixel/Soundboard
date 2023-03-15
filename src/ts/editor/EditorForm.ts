class EditorForm extends Logger {
	private _$form: JQuery<HTMLFormElement>;

	constructor($form: JQuery<HTMLFormElement>) {
		super();

		this._$form = $form;

		this.setupFormSubmitEvent();
	}

	private setupFormSubmitEvent() {
		// Prevent default submit feature (since even a text input can trigger this by pressing ENTER)
		this._$form.on("submit", (e) => {
			e.preventDefault();
		});

		// Use a specific button for submission
		$("input#editor-submit").on("click", (_e) => {
			// TODO: call api

			EditorForm.logInfo("Submit button", "Form submitted");
		});
	}
}
