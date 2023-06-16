class EditorForm extends Logger {
	private _$form: JQuery<HTMLFormElement>;
	private _buttonData: SoundButtonData;
	private DATA_PREFIX: string = "#button-data-";

	constructor($form: JQuery<HTMLFormElement>) {
		super();

		this._$form = $form;

		this.setupInputsEvents();
		this.setupFormSubmitEvent();
	}

	// TODO: also, clone the button data for it(?) - maybe a clone is not needed

	public fillInputs(buttonData: SoundButtonData): this {
		this._buttonData = buttonData;

		// FIXME: windows popup seems to focus this first input on launch. not sure if it's because of the devtool
		$()
			.add($(`${this.DATA_PREFIX}title`).val(buttonData.title))
			.add(
				$(`${this.DATA_PREFIX}color`)
					.val(
						"#" +
							StringUtilities.HSLToHex(
								buttonData.color.h,
								buttonData.color.s,
								buttonData.color.l
							)
					)
					.css(
						"--data-color",
						`hsl(${
							buttonData.color.h.toString() +
							"deg," +
							buttonData.color.s.toString() +
							"%," +
							buttonData.color.l.toString() +
							"%"
						})`
					)
			)
			.add($(`${this.DATA_PREFIX}path`).val(decodeURIComponent(buttonData.path)));
		// .add($(``));
		// $("#editor-submit").focus();

		return this;
	}

	private setupInputsEvents() {
		// TODO: make every element call a function to update the preview

		// File picker
		($("#button-path-file") as JQuery<HTMLInputElement>).on("change", (e) => {
			e.preventDefault();
			// TODO: check if valid?
			// TODO: encode on submit
			let path = e.target.files[0].path;
			console.log(path);
			$("#button-path-txt").val(path);
		});
	}

	private setupFormSubmitEvent() {
		// Prevent default submit feature (since even a text input can trigger this by pressing "enter" for example)
		this._$form.on("submit", (e) => e.preventDefault());

		// Use a specific button for submit
		$("input#editor-submit").on("click", (_e) => {
			// TODO: call api


			EditorForm.logInfo("Submit button", "Form submitted\n", "Data:", this._buttonData);
		});
	}

	private updateProperty(property: SoundButtonProperties, data: any) {
		this._buttonData[property] = data;
	}
}
