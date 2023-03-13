class VolumeSlider extends Logger {
	private _$slider: JQuery<HTMLInputElement>;
	public get $slider(): JQuery<HTMLInputElement> {
		return this._$slider;
	}

	private _valueDecimals: number;
	private _exponentialBase: number;

	public value = 0;
	private get _maxSliderValue(): number {
		return parseInt(this._$slider.attr("max"));
	}

	constructor(
		$slider: JQuery<HTMLInputElement>,
		inputCallback: (
			handler: JQuery.Event
		) =>
			| void
			| false
			| JQuery.TypeEventHandler<
					HTMLInputElement,
					undefined,
					HTMLInputElement,
					HTMLInputElement,
					"input"
			  >,
		decimals: number = 0,
		exponentialBase: number = 50
	) {
		super();

		this._valueDecimals = decimals;
		this._exponentialBase = exponentialBase;

		this._$slider = $slider
			// On change
			.on("input", (e) => {
				this.updateVolume();
				inputCallback(e);
			})
			// On scroll wheel
			.on("wheel", { passive: true }, (e) => {
				// Update volume slider on scroll (only when CTRL key is not active)
				if (e.ctrlKey) return;
				// e.preventDefault();
				e.stopImmediatePropagation();
				EventFunctions.updateInputValueFromWheel(e, this._$slider, 50, ["input"]);
			});

		this.updateVolume();
	}

	private updateVolume() {
		this.value = EMath.getExponentialValue(
			parseInt(this._$slider.val() as string) / this._maxSliderValue,
			this._valueDecimals,
			this._exponentialBase
		);
	}
}
