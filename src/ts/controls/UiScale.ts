abstract class UiScale extends Logger {
	private static $slider: JQuery<HTMLElement>;
	private static $lock: JQuery<HTMLElement>;
	private static $reset: JQuery<HTMLElement>;
	private static min: number;
	private static max: number;

	public static setControls(
		$slider: JQuery<HTMLElement>,
		$lock: JQuery<HTMLElement>,
		$reset: JQuery<HTMLElement>
	): void {
		this.$slider = $slider;
		this.min = parseFloat(this.$slider.attr("min"));
		this.max = parseFloat(this.$slider.attr("max"));

		this.initSlider();
		this.initSliderWheelShortcut();

		this.setLock($lock);
		this.setReset($reset);
	}

	private static setLock($lock: JQuery<HTMLElement>): void {
		this.$lock = $lock;
		this.initLock();
	}

	private static setReset($reset: JQuery<HTMLElement>): void {
		this.$reset = $reset;
		this.initReset();
	}

	private static initSliderWheelShortcut(): void {
		$(document).on("wheel", (e) => {
			if (!e.ctrlKey || !this.canChangeValue) return;

			const value = EventFunctions.getUpdatedValueFromWheel(
				e,
				parseFloat($(document.body).css("zoom").toString()),
				parseFloat(this.$slider.attr("step")),
				[this.min, this.max]
			);

			$(document.body).stop(true, false);
			this.setSliderValue(value);
			$(document.body).css("zoom", value);
		});
	}

	private static initSlider(): void {
		this.setSliderPrevValue();

		this.$slider
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

	private static setSliderPrevValue(): void {
		this.$slider.attr("data-prev-value", this.$slider.val().toString());
	}

	private static getSliderPrevValue(): number {
		return parseFloat(this.$slider.attr("data-prev-value").toString());
	}

	private static getSliderValue(): number {
		return parseFloat(this.$slider.val().toString());
	}

	private static initLock() {
		this.$lock.on("change", (e: JQuery.ChangeEvent) => {
			const checked = e.target.checked;
			this.$slider.prop("disabled", checked);
			this.$reset.prop("disabled", checked);
			const lock = $(
				`<i class="fa-solid fa-lock${!checked ? "-open" : ""}"></i>`
			)[0];
			$(`label[for="${this.$lock.attr("id")}"]`).html(lock);
		});
	}

	private static initReset(): void {
		this.$reset.on("click", () => {
			this.$slider.val(this.$slider.attr("--data-default")).trigger("click");
		});
	}

	private static get canChangeValue(): boolean {
		return !this.$lock.prop("checked");
	}

	private static setSliderValue(value: number): void {
		this.$slider.val(EMath.clamp(value, this.min, this.max).toString());
	}
}