abstract class EventFunctions {
	public static updateInputValueFromWheel(
		e: WheelEvent | JQuery.TriggeredEvent,
		$targetInput: JQuery<HTMLInputElement> = null,
		stepValue: number = 1,
		postTriggers: string[] = ["change"]
	): void {
		if (!this.shouldDoEvent(e)) {
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

	public static getUpdatedInputValueFromWheel(
		e: WheelEvent | JQuery.TriggeredEvent,
		stepValue: number = 1
	): number {
		let $target = $(e.target);
		let currentValue = parseFloat($target.val().toString());

		if (!this.shouldDoEvent(e)) {
			return currentValue;
		}

		// e.preventDefault();
		e.stopPropagation();

		let delta = this.getDeltaY(e);
		let max = parseFloat($target.attr("max").toString());
		let min = parseFloat($target.attr("min").toString());

		let newValue = currentValue + delta * stepValue;

		return EMath.clamp(newValue, min, max);
	}

	public static getUpdatedValueFromWheel(
		e: WheelEvent | JQuery.TriggeredEvent,
		currentValue: number,
		stepValue: number = 1,
		clamp: [number, number] | null = undefined
	): number {
		if (!this.shouldDoEvent(e)) {
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

	private static shouldDoEvent(e: WheelEvent | JQuery.TriggeredEvent): boolean {
		if ($(e.target).attr("disabled")) {
			return false;
		}

		return true;
	}
}
