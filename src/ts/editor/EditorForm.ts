class EditorForm extends Logger {
	private DATA_PREFIX: string = "#button-data-";

	private _$form: JQuery<HTMLFormElement>;

	private _buttonId: string;
	public get buttonId(): string {
		return this._buttonId;
	}

	private _buttonData: SoundButtonData;
	public get buttonData(): SoundButtonData {
		return this._buttonData;
	}

	private get _$focusedFormInput(): JQuery<HTMLInputElement> {
		return this._$form.find("input:focus") as JQuery<HTMLInputElement>;
	}

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
			// Title
			.add($(`${this.DATA_PREFIX}title`).val(buttonData.title))
			// Color
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
			// Volume
			.add($(`${this.DATA_PREFIX}volume`).val(buttonData.volume ?? 1))
			// Path
			.add(
				$(`${this.DATA_PREFIX}path`).val(decodeURIComponent(buttonData.path ?? ""))
			) as JQuery<HTMLInputElement>;
		// .add($(``));
		// $("#editor-submit").focus();

		return this;
	}

	public unfocusInputs(): void {
		// Trigger blur event in case an input is still focused (since when closing the window it doesn't unfocus, which could result in data loss with the current `change` event logic)
		this._$focusedFormInput.trigger("blur");
	}

	private setupInputsEvents(): void {
		// TODO: make every element call a function to update the preview

		$input(`${this.DATA_PREFIX}title`).on("change", (e) => {
			// Apply title data
			this.updateProperty("title", e.target.value);
		});

		$input(`${this.DATA_PREFIX}color`)
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
		$input(`${this.DATA_PREFIX}file`).on("change", (e) => {
			// TODO: check if valid?
			let path = e.target.files[0].path;

			console.log(path);

			// Apply path data (from hidden file input)
			$("#button-data-path").val(path);
			// Don't store the file in the hidden file input
			$input("#button-path-file").val(null);
			this.updateProperty("path", StringUtilities.encodeFilePath(path));
		});

		$input(`${this.DATA_PREFIX}volume`).on("change", (e) => {
			let volume = +e.target.value;

			// Apply volume
			this.updateProperty("volume", volume);
		});

		$input(`${this.DATA_PREFIX}path`).on("change", (e) => {
			// TODO: warn if it's invalid?
			let path = e.target.value;

			// Apply path data (from text input)
			this.updateProperty(
				"path",
				path.length === 0 ? null : StringUtilities.encodeFilePath(path)
			);
		});

		function $input(selector: string): JQuery<HTMLInputElement> {
			return $(selector);
		}
	}

	private setupFormSubmitEvent(): void {
		// Prevent default submit feature (since even a text input can trigger this by pressing "enter" for example)
		this._$form.on("submit", (e) => e.preventDefault());

		// Use a specific button for submit
		let $submitButton = $("input#editor-submit").one("click", (_e) => {
			EditorForm.logDebug(
				"Submit button",
				"Form submitted\n",
				"Data:",
				this._buttonData
			);

			this.submitForm();
		});

		// Submit when pressing enter on text inputs
		$('input[type="text"]').on("keydown", (e) => {
			if (e.key != "Enter") {
				return;
			}

			this.unfocusInputs();
			$submitButton.trigger("click");
		});
	}

	private submitForm(): void {
		SoundboardApi.editButtonWindow.updateButtonData(
			this._buttonId,
			this._buttonData
		);
	}

	private updateProperty<
		TKey extends keyof SoundButtonData,
		TValue extends SoundButtonData[TKey]
	>(key: TKey, data: TValue) {
		if (key in this._buttonData) {
			this._buttonData[key] = data;
		}
	}
}
