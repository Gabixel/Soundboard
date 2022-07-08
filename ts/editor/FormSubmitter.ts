class FormSubmitter extends LogExtend {
	private static $form: JQuery<HTMLElement>;

	public static initForm($form: JQuery<HTMLElement>): void {
		this.$form = $form;
		this.setupFormSubmitEvent();
	}

	private static setupFormSubmitEvent() {
		this.$form.on('submit', (e) => {
			e.preventDefault();
			this.log(this.setupFormSubmitEvent, "Form submitted.");
		});
	}
}