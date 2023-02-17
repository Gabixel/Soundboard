abstract class UiScale extends Logger {
	private static $scaleInput: JQuery<HTMLInputElement>;
	private static $lockCheckbox: JQuery<HTMLInputElement>;
	private static $resetButton: JQuery<HTMLButtonElement>;
	private static min: number;
	private static max: number;

	public static setControls(
		$scaleInput: JQuery<HTMLInputElement>,
		$lockCheckbox: JQuery<HTMLInputElement>,
		$resetButton: JQuery<HTMLButtonElement>
	): void {
		this.$scaleInput = $scaleInput;
		this.min = parseFloat(this.$scaleInput.attr("min"));
		this.max = parseFloat(this.$scaleInput.attr("max"));

		this.initSlider();
		this.initSliderWheelShortcut();

		this.setLock($lockCheckbox);
		this.setReset($resetButton);
	}

	public static getSliderValue(): number {
		return parseFloat(this.$scaleInput.val() as string);
	}

	private static setLock($lock: JQuery<HTMLInputElement>): void {
		this.$lockCheckbox = $lock;
		this.initLock();
	}

	private static setReset($reset: JQuery<HTMLButtonElement>): void {
		this.$resetButton = $reset;
		this.initReset();
	}

	private static initSliderWheelShortcut(): void {
		$(document).on("wheel", (e) => {
			if (!e.ctrlKey || !this.canChangeValue) return;

			if (ButtonSwap.isDragging) return;

			const value = EventFunctions.getUpdatedValueFromWheel(
				e,
				parseFloat($(document.body).css("zoom").toString()),
				parseFloat(this.$scaleInput.attr("step")),
				[this.min, this.max]
			);

			$(document.body).stop(true, false);
			this.setSliderValue(value);
			$(document.body).css("zoom", value);
		});
	}

	private static initSlider(): void {
		this.setSliderPrevValue();

		this.$scaleInput
			// .on("keydown", (e) => {
			// 	$(e.target).attr("step", "0.2");
			// })
			.on("keyup", (e) => {
				$(e.target).trigger("click"); //.attr("step", "0.1")
			})
			.on("blur", (e) => {
				$(e.target).trigger("click");
			})
			// .on("focusout", (e) => {
			// 	$(e.target).attr("step", "0.1"); // In case the user clicks away from the input while still holding the left or right arrow keys
			// })
			.on("click", (e) => {
				if (this.getSliderPrevValue() === this.getSliderValue()) return;

				this.setSliderPrevValue();

				$(document.body).stop(true, false);
				$(document.body).animate(
					{
						zoom: parseFloat($(e.target).val().toString()),
					},
					325
				);
				this.logDebug(
					"(ui scale slider click)",
					"UI Scale changed:",
					parseFloat($(e.target).val().toString())
				);
			});
	}

	private static getSliderPrevValue(): number {
		return parseFloat(this.$scaleInput.attr("data-prev-value").toString());
	}

	private static setSliderPrevValue(): void {
		this.$scaleInput.attr("data-prev-value", this.$scaleInput.val().toString());
	}

	private static initLock() {
		this.$lockCheckbox.on("change", (e: JQuery.ChangeEvent) => {
			const checked = e.target.checked;
			this.$scaleInput.prop("disabled", checked);
			this.$resetButton.prop("disabled", checked);
			const lock = $(
				`<i class="fa-solid fa-lock${!checked ? "-open" : ""}"></i>`
			)[0];
			$(`label[for="${this.$lockCheckbox.attr("id")}"]`).html(lock);
		});
	}

	private static initReset(): void {
		this.$resetButton.on("click", () => {
			this.$scaleInput
				.val(this.$scaleInput.attr("--data-default"))
				.trigger("click");
		});
	}

	private static get canChangeValue(): boolean {
		return !this.$lockCheckbox.prop("checked");
	}

	private static setSliderValue(value: number): void {
		this.$scaleInput.val(EMath.clamp(value, this.min, this.max).toString());
	}
}
