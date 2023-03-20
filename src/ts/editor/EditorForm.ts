class EditorForm extends Logger {
	private _$form: JQuery<HTMLFormElement>;
	private _buttonData: SoundButtonData;

	constructor($form: JQuery<HTMLFormElement>, buttonData: SoundButtonData) {
		super();

		this._$form = $form;

		this.fillInputs(buttonData);
		this.setupInputsEvents();
		this.setupFormSubmitEvent();
	}

	// TODO: custom event that fires when any thing gets changed in the form, so that a possible injected sound button previewer can check for it
	// TODO: also, clone the button data for it(?) - maybe a clone is not needed

	private fillInputs(buttonData: SoundButtonData) {
		this._buttonData = buttonData;
		// TODO: can probably rename all inputs with a prefix and use .map() to the data object instead

		// this._buttonData.map
		const prefix = "#button-data-";

		// FIXME: windows popup seems to focus this input on launch. not sure if it's because of the devtool
		$()
			.add($(`${prefix}title`).val(buttonData.title))
			.add(
				$(`${prefix}color`).val(
					"#" +
						StringUtilities.HSLToHex(
							buttonData.color.h,
							buttonData.color.s,
							buttonData.color.l
						)
				)
			)
			.add($(`${prefix}path`).val(decodeURIComponent(buttonData.path)));
		// .add($(``));
		// $("#editor-submit").focus();
	}

	private setupInputsEvents() {
		// File picker
		($("#button-path-file") as JQuery<HTMLInputElement>).on("change", (e) => {
			e.preventDefault();
			// TODO: check if valid?
			// TODO: encode on submit
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

	private updateProperty(property: SoundButtonProperties, data: any) {
		this._buttonData[property] = data;
	}
}
