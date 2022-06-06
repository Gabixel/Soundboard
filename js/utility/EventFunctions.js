class EventFunctions {
    static updateInputFromWheel(e, stepValue = 1, trigger = true, triggers = ["change"]) {
        e.preventDefault();
        const $target = $(e.target);
        const delta = Math.round((-e.originalEvent.deltaY / 120));
        const value = parseFloat($target.val().toString());
        const max = parseFloat($target.attr("max").toString());
        const min = parseFloat($target.attr("min").toString());
        const newValue = value + (delta * stepValue);
        $target.val(EMath.clamp(newValue, min, max));
        if (!trigger)
            return;
        triggers.forEach((trigger) => {
            $target.trigger(trigger);
        });
    }
}
