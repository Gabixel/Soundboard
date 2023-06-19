class EditorForm extends Logger {
	private DATA_PREFIX: string = "#button-data-";
	private _$form: JQuery<HTMLFormElement>;
	private _buttonId: string;
	private _buttonData: SoundButtonData;

	constructor($form: JQuery<HTMLFormElement>) {
		super();

		this._$form = $form;

		this.setupInputsEvents();
		this.setupFormSubmitEvent();
	}

	// TODO: also, clone the button data for it(?) - maybe a clone is not needed

	public fillInputs(buttonId: string, buttonData: SoundButtonData): this {
		this._buttonId = buttonId;
		this._buttonData = buttonData;

		// FIXME: windows popup seems to focus this first input on launch. not sure if it's because of the devtool
		$()
			.add($(`${this.DATA_PREFIX}title`).val(buttonData.title))
			.add(
				$(`${this.DATA_PREFIX}color`)
					// Apply base color
					.val(
						"#" +
							StringUtilities.HSLToHex(
								buttonData.color.h,
								buttonData.color.s,
								buttonData.color.l
							)
					)
					// Apply base shadow color
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
					// It's just a placeholder
					.removeProp("value")
			)
			.add($(`${this.DATA_PREFIX}path`).val(decodeURIComponent(buttonData.path)));
		// .add($(``));
		// $("#editor-submit").focus();

		return this;
	}

	private setupInputsEvents() {
		// TODO: make every element call a function to update the preview

		($("#button-data-title") as JQuery<HTMLInputElement>).on("change", (e) => {
			// Apply title data
			this.updateProperty("title", e.target.value);
		});

		($("#button-data-color") as JQuery<HTMLInputElement>)
			// Constant color dragging
			.on("input", (e) => {
				// Change shadow color
				$(e.target).css("--data-color", e.target.value);
			})
			// Final color
			.on("change", (e) => {
				let hsl = EMath.RGBToHSL(...EMath.HexToRGB(e.target.value));

				// Apply color data
				this.updateProperty("color", { h: hsl[0], s: hsl[1], l: hsl[2] });
			});

		// File picker
		($("#button-path-file") as JQuery<HTMLInputElement>).on("change", (e) => {
			// Don't store the file in the hidden file input
			e.preventDefault();

			// TODO: check if valid?
			// TODO: encode on submit
			let path = e.target.files[0].path;

			console.log(path);

			// Apply path data (from hidden file input)
			$("#button-data-path").val(path);
			this.updateProperty("path", StringUtilities.encodeFilePath(path));
		});

		($("#button-data-path") as JQuery<HTMLInputElement>).on("change", (e) => {
			let path = e.target.value;

			// Apply path data (from text input)
			this.updateProperty(
				"path",
				path.length === 0 ? null : StringUtilities.encodeFilePath(path)
			);
		});
	}

	private setupFormSubmitEvent() {
		// Prevent default submit feature (since even a text input can trigger this by pressing "enter" for example)
		this._$form.on("submit", (e) => e.preventDefault());

		// Use a specific button for submit
		$("input#editor-submit").on("click", (_e) => {
			SoundboardApi.EditButtonWindow.updateButtonData(
				this._buttonId,
				this._buttonData
			);

			EditorForm.logInfo(
				"Submit button",
				"Form submitted\n",
				"Data:",
				this._buttonData
			);
		});
	}

	private updateProperty(key: SoundButtonProperties, data: any) {
		if (key in this._buttonData) {
			this._buttonData[key] = data;
		}
	}
}
