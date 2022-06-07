class EventFunctions {
    static updateInputValueFromWheel(e, stepValue = 1, trigger = true, triggers = ["change"]) {
        if ($(e.target).attr("disabled"))
            return;
        const $target = $(e.target);
        const delta = Math.round(-e.originalEvent.deltaY / 120);
        const currentValue = parseFloat($target.val().toString());
        const max = parseFloat($target.attr("max").toString());
        const min = parseFloat($target.attr("min").toString());
        const newValue = currentValue + delta * stepValue;
        $target.val(EMath.clamp(newValue, min, max));
        if (!trigger)
            return;
        triggers.forEach((trigger) => {
            $target.trigger(trigger);
        });
        return;
    }
    static getUpdatedInputValueFromWheel(e, stepValue = 1) {
        const $target = $(e.target);
        const delta = Math.round(-e.originalEvent.deltaY / 120);
        const currentValue = parseFloat($target.val().toString());
        const max = parseFloat($target.attr("max").toString());
        const min = parseFloat($target.attr("min").toString());
        const newValue = currentValue + delta * stepValue;
        return EMath.clamp(newValue, min, max);
    }
    static getUpdatedValueFromWheel(e, currentValue, stepValue = 1, clamp = undefined) {
        const delta = Math.round(-e.originalEvent.deltaY / 120);
        const newValue = currentValue + delta * stepValue;
        if (clamp != null)
            return EMath.clamp(newValue, clamp[0], clamp[1]);
        else
            return newValue;
    }
}
