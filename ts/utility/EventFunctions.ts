class EventFunctions {
	public static updateInputFromWheel(
		e: JQuery.TriggeredEvent,
		stepValue: number = 1,
		trigger: boolean = true,
		triggers: string[] = ["change"]
	): void {
		e.preventDefault();
		const $target = $(e.target);

		// @ts-ignore: Property 'deltaY' does not exist on type 'Event'. ts(2339)
		const delta = Math.round((-e.originalEvent.deltaY / 120));
		const value = parseFloat($target.val().toString());
		const max = parseFloat($target.attr("max").toString());
		const min = parseFloat($target.attr("min").toString());

		const newValue = value + (delta * stepValue);
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
	}
}
