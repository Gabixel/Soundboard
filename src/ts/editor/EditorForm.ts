class EditorForm {
	private DATA_PREFIX: string = "#button-data-";

	private _$form: JQuery<HTMLFormElement>;

	private _parsedButtonId: string;
	public get buttonId(): string {
		return this._parsedButtonId;
	}

	private _buttonData: SoundButtonData;
	public get buttonData(): SoundButtonData {
		return this._buttonData;
	}

	private get _$focusedFormInput(): JQuery<HTMLInputElement> {
		return this._$form.find<HTMLInputElement>("input:focus");
	}

	constructor($form: JQuery<HTMLFormElement>) {
		this._$form = $form;

		this.setupInputsEvents();
		this.setupFormSubmitEvent();
	}

	public fillInputs(buttonId: string, buttonData: SoundButtonData): this {
		this._parsedButtonId = buttonId;
		this._buttonData = buttonData;

		// FIXME: windows popup seems to focus this first input on launch.
		// in some unknown cases. not sure if it's because of the devtool
		this.$input()
			// Title
			.add(this.$dataInput("title").val(buttonData.title))
			// Color
			.add(
				this.$dataInput("color")
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
					// The initial value is just a placeholder
					.removeProp("value")
			)
			// Volume
			.add(this.$dataInput("volume").val(buttonData.volume ?? 1))
			// Path
			.add(this.$dataInput("path").val(decodeURIComponent(buttonData.path ?? "")));
		// .add($(``));
		// $("#editor-submit").focus();

		return this;
	}

	/**
	 * Triggers a `blur` event in case an input is still focused
	 * (since when closing the window it doesn't unfocus,
	 * which could result in data loss with the `change` event logic)
	 */
	public unfocusInputs(): void {
		this._$focusedFormInput.trigger("blur");
	}

	//#region Input setup

	private setupInputsEvents(): void {
		// TODO: make every element call a function to update the preview

		this.$dataInput("title").on("change", (e) => {
			// Apply title data
			this.updateProperty("title", e.target.value);
		});

		this.$dataInput("color")
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

		this.$dataInput("volume").on("change", (e) => {
			let volume = parseFloat(e.target.value);

			// Apply volume
			this.updateProperty("volume", volume);
		});

		// File picker
		this.$input("#button-path-file").on("change", (e) => {
			// TODO: check if valid?
			let path = e.target.files[0].path;

			console.log(path);

			// Apply path data (from hidden file input)
			this.$dataInput("path").val(path);
			// Don't store the file in the hidden file input
			this.$input("#button-path-file").val(null);

			// Apply path (from file picker)
			this.updateProperty("path", StringUtilities.encodeFilePath(path));
		});
		// File picker (text input)
		this.$dataInput("path").on("change", (e) => {
			// TODO: warn if it's invalid?
			let path = e.target.value;

			// Apply path data (from text input)
			this.updateProperty(
				"path",
				path.length === 0 ? null : StringUtilities.encodeFilePath(path)
			);
		});
	}

	private setupFormSubmitEvent(): void {
		// Prevent default submit feature
		// (since even a single text input can trigger this by pressing "enter")
		this._$form.on("submit", (e) => e.preventDefault());

		// Use a specific button for submit
		let $submitButton = $("input#editor-submit").one("click", (_e) => {
			Logger.logDebug(
				"Submit button",
				"Form submitted\n",
				"Data:",
				this._buttonData
			);

			this.submitForm();
		});

		// Submit when pressing enter on text inputs
		$("input[type='text']").on("keydown", (e) => {
			if (e.key != "Enter") {
				return;
			}

			this.unfocusInputs();
			$submitButton.trigger("click");
		});
	}

	//#endregion

	private submitForm(): void {
		SoundboardApi.editButtonWindow.updateButtonData(
			this._parsedButtonId,
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

	/**
	 * Returns the {@link JQuery<HTMLInputElement> jQuery} version of the selector.
	 */
	private $input(selector?: string): JQuery<HTMLInputElement> {
		return $(selector);
	}

	/**
	 * Returns the {@link JQuery<HTMLInputElement> jQuery} of a key in {@link SoundButtonData}.
	 */
	private $dataInput<TKey extends keyof SoundButtonData>(
		data: TKey
	): JQuery<HTMLInputElement> {
		// TODO: probably needs to be changed if there will be more complex input elements
		return this.$input(`${this.DATA_PREFIX}${data}`);
	}
}
