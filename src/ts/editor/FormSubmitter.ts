class FormSubmitter extends Logger {
	private _$form: JQuery<HTMLFormElement>;

	constructor($form: JQuery<HTMLFormElement>) {
		super();

		this._$form = $form;

		this.setupFormSubmitEvent();
	}

	private setupFormSubmitEvent() {
		this._$form.on("submit", (e) => {
			e.preventDefault();

			FormSubmitter.logInfo(this.setupFormSubmitEvent, "Form submitted.");
		});
	}
}
