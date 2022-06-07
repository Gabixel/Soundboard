class EventFunctions {
	public static updateInputValueFromWheel(
		e: JQuery.TriggeredEvent,
		stepValue: number = 1,
		trigger: boolean = true,
		triggers: string[] = ["change"]
	): void {
		if ($(e.target).attr("disabled")) return;

		const $target = $(e.target);

		// @ts-ignore: TS2339
		const delta = Math.round(-e.originalEvent.deltaY / 120);
		const currentValue = parseFloat($target.val().toString());
		const max = parseFloat($target.attr("max").toString());
		const min = parseFloat($target.attr("min").toString());

		const newValue = currentValue + delta * stepValue;
		// console.log("delta is " + delta);
		// console.log("old value is " + value);
		// console.log("max is " + max);
		// console.log("min is " + min);
		// console.log("newValue is " + newValue);
		// console.log("clamped value is " + EMath.clamp(newValue, min, max));
		// console.log("------------------");

		$target.val(EMath.clamp(newValue, min, max));

		if (!trigger) return;

		triggers.forEach((trigger) => {
			$target.trigger(trigger);
		});

		return;
	}

	public static getUpdatedInputValueFromWheel(
		e: JQuery.TriggeredEvent,
		stepValue: number = 1,
	): number {
		const $target = $(e.target);

		// @ts-ignore: TS2339
		const delta = Math.round(-e.originalEvent.deltaY / 120);
		const currentValue = parseFloat($target.val().toString());
		const max = parseFloat($target.attr("max").toString());
		const min = parseFloat($target.attr("min").toString());

		const newValue = currentValue + delta * stepValue;

		return EMath.clamp(newValue, min, max);
	}

	public static getUpdatedValueFromWheel(
		e: JQuery.TriggeredEvent,
		currentValue: number,
		stepValue: number = 1,
		clamp: [number, number] | null = undefined
	): number {
		// @ts-ignore: TS2339
		const delta = Math.round(-e.originalEvent.deltaY / 120);

		const newValue = currentValue + delta * stepValue;

		if (clamp != null) return EMath.clamp(newValue, clamp[0], clamp[1]);
		else return newValue;
	}
}
