abstract class EventFunctions {
	/**
	 * Updates the input value based on the wheel event.
	 *
	 * @param e - The wheel event or triggered event
	 * @param stepValue - The step value for incrementing or decrementing the input value. Defaults to 1
	 * @param postTriggers - An array of post triggers to call after updating the input value. Defaults to ["change"]
	 * @param $targetInput - The target input JQuery element. If not proivded, the target gets retrieved {@link e from the event} parameter
	 * @returns {void}
	 */
	public static updateInputValueFromWheel(
		e: WheelEvent | JQuery.TriggeredEvent,
		stepValue: number = 1,
		postTriggers: string[] = ["change"],
		$targetInput?: JQuery<HTMLInputElement>
	): void {
		if (!this.canUpdateInput(e)) {
			return;
		}

		let $target: JQuery<HTMLInputElement> = $targetInput ?? $(e.target);

		let delta = this.getDeltaY(e);
		let currentValue = parseFloat($target.val().toString());
		let max = parseFloat($target.attr("max").toString());
		let min = parseFloat($target.attr("min").toString());

		let newValue = EMath.clamp(currentValue + delta * stepValue, min, max);

		let previousValue = parseFloat($target.val().toString());

		if (previousValue === newValue) return;

		$target.val(newValue);

		// If there are post triggers to call
		postTriggers.forEach((trigger) => {
			$target.trigger(trigger);
		});
	}

	/**
	 * Retrieves the updated input value from a wheel event.
	 *
	 * @param e - The wheel event or triggered event
	 * @param stepValue - The step value to increment or decrement the input value. Default is 1
	 * @returns The updated input value
	 */
	public static getUpdatedInputValueFromWheel(
		e: WheelEvent | JQuery.TriggeredEvent,
		stepValue: number = 1
	): number {
		let $target = $(e.target);
		let currentValue = parseFloat($target.val().toString());

		if (!this.canUpdateInput(e)) {
			return currentValue;
		}

		e.stopPropagation();

		let delta = this.getDeltaY(e);
		let max = parseFloat($target.attr("max").toString());
		let min = parseFloat($target.attr("min").toString());

		let newValue = currentValue + delta * stepValue;

		return EMath.clamp(newValue, min, max);
	}

	/**
	 * Calculates the updated value based on the wheel event and the current value.
	 * 
	 * @param e - The wheel event or triggered event
	 * @param currentValue - The current value
	 * @param stepValue - The step value to be multiplied with the delta
	 * @param clamp - Optional range to clamp the new value
	 * @returns The updated value
	 */
	public static getUpdatedValueFromWheel(
		e: WheelEvent | JQuery.TriggeredEvent,
		currentValue: number,
		stepValue: number = 1,
		clamp?: [number, number]
	): number {
		if (!this.canUpdateInput(e)) {
			return currentValue;
		}

		let delta = this.getDeltaY(e);
		let newValue = currentValue + delta * stepValue;

		if (clamp != null) return EMath.clamp(newValue, clamp[0], clamp[1]);
		else return newValue;
	}

	public static isLeftClick(e: JQuery.Event): boolean {
		return e?.button === 0;
	}

	public static isSubmitKey(e: JQuery.Event): boolean {
		return e?.key === "Enter" || e?.key === " ";
	}

	private static getDeltaY(e: WheelEvent | JQuery.TriggeredEvent) {
		return Math.round(
			-((e as JQuery.TriggeredEvent).originalEvent != null
				? ((e as JQuery.TriggeredEvent).originalEvent as WheelEvent).deltaY
				: (e as WheelEvent).deltaY) / 120
		);
	}

	private static canUpdateInput(e: WheelEvent | JQuery.TriggeredEvent): boolean {
		if ($(e.target).attr("disabled")) {
			return false;
		}

		return true;
	}
}
