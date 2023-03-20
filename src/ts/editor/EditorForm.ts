class EditorForm extends Logger {
	private _$form: JQuery<HTMLFormElement>;

	constructor($form: JQuery<HTMLFormElement>, buttonData: SoundButtonData) {
		super();

		this._$form = $form;

		this.fillInputs(buttonData);
		this.setupInputsEvents();
		this.setupFormSubmitEvent();
	}

	/*
	Inputs are:
	- #button-text - Button title
	- #button-path-txt - Button path as text
	*/
	private fillInputs(buttonData: SoundButtonData) {
		// TODO: can probably rename all inputs with a prefix and use .map() to the data object instead

		// FIXME: windows popup seems to focus this input on launch. not sure if it's because of the devtool
		$("#button-text").val(buttonData.title);
		$("#button-path-txt").val(buttonData.path);

		// $("#editor-submit").focus();
	}

	private setupInputsEvents() {
		// File picker
		($("#button-path-file") as JQuery<HTMLInputElement>).on("change", (e) => {
			e.preventDefault();
			// TODO: check if valid?
			// TODO: convert uri on the fly / check if it's malformed on submit and fix missing conversions (e.g. spaces)
			let path = (e.target.files[0] as ElectronFile).path;
			console.log(path);
			$("#button-path-txt").val(path);
		});
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
