class EditorForm extends Logger {
	private DATA_PREFIX: string = "#button-data-";

	public $form: JQuery<HTMLFormElement>;

	private _$inputs: JQuery<HTMLInputElement>;

	private _buttonId: string;
	public get buttonId(): string {
		return this._buttonId;
	}

	private _buttonData: SoundButtonData;
	public get buttonData(): SoundButtonData {
		return this._buttonData;
	}

	constructor($form: JQuery<HTMLFormElement>) {
		super();

		this.$form = $form;

		this.setupInputsEvents();
		this.setupFormSubmitEvent();
	}

	// TODO: also, clone the button data for it(?) - maybe a clone is not needed

	public fillInputs(buttonId: string, buttonData: SoundButtonData): this {
		this._buttonId = buttonId;
		this._buttonData = buttonData;

		// FIXME: windows popup seems to focus this first input on launch. not sure if it's because of the devtool
		this._$inputs = $()
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
			// Path
			.add(
				$(`${this.DATA_PREFIX}path`).val(decodeURIComponent(buttonData.path ?? ""))
			) as JQuery<HTMLInputElement>;
		// .add($(``));
		// $("#editor-submit").focus();

		return this;
	}

	private setupInputsEvents() {
		// TODO: make every element call a function to update the preview

		$input("#button-data-title").on("change", (e) => {
			// Apply title data
			this.updateProperty("title", e.target.value);
		});

		$input("#button-data-color")
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
		$input("#button-path-file").on("change", (e) => {
			// Don't store the file in the hidden file input
			e.preventDefault();

			// TODO: check if valid?
			let path = e.target.files[0].path;

			console.log(path);

			// Apply path data (from hidden file input)
			$("#button-data-path").val(path);
			this.updateProperty("path", StringUtilities.encodeFilePath(path));
		});

		$input("#button-data-path").on("change", (e) => {
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

	private setupFormSubmitEvent() {
		// Prevent default submit feature (since even a text input can trigger this by pressing "enter" for example)
		this.$form.on("submit", (e) => e.preventDefault());

		// Use a specific button for submit
		$("input#editor-submit").on("click", (_e) => {
			SoundboardApi.editButtonWindow.updateButtonData(
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
