class UiScale extends LogExtend {
    static $slider;
    static $lock;
    static $reset;
    static min;
    static max;
    static setControls($slider, $lock, $reset) {
        this.$slider = $slider;
        this.min = parseFloat(this.$slider.attr("min"));
        this.max = parseFloat(this.$slider.attr("max"));
        this.initSlider();
        this.initSliderWheelShortcut();
        this.setLock($lock);
        this.setReset($reset);
    }
    static setLock($lock) {
        this.$lock = $lock;
        this.initLock();
    }
    static setReset($reset) {
        this.$reset = $reset;
        this.initReset();
    }
    static initSliderWheelShortcut() {
        $(document).on("wheel", (e) => {
            if (!e.ctrlKey || !this.canChangeValue)
                return;
            const value = EventFunctions.getUpdatedValueFromWheel(e, parseFloat($(document.body).css("zoom").toString()), parseFloat(this.$slider.attr("step")), [this.min, this.max]);
            $(document.body).stop(true, false);
            this.setSliderValue(value);
            $(document.body).css("zoom", value);
        });
    }
    static initSlider() {
        this.setSliderPrevValue();
        this.$slider
            .on("keyup", (e) => {
            $(e.target).trigger("click");
        })
            .on("blur", (e) => {
            $(e.target).trigger("click");
        })
            .on("click", (e) => {
            if (this.getSliderPrevValue() === this.getSliderValue())
                return;
            this.setSliderPrevValue();
            $(document.body).stop(true, false);
            $(document.body).animate({
                zoom: parseFloat($(e.target).val().toString()),
            }, 325);
            this.log(this.initSlider, "UI Scale changed:", parseFloat($(e.target).val().toString()));
        });
    }
    static setSliderPrevValue() {
        this.$slider.attr("data-prev-value", this.$slider.val().toString());
    }
    static getSliderPrevValue() {
        return parseFloat(this.$slider.attr("data-prev-value").toString());
    }
    static getSliderValue() {
        return parseFloat(this.$slider.val().toString());
    }
    static initLock() {
        this.$lock.on("change", (e) => {
            const checked = e.target.checked;
            this.$slider.prop("disabled", checked);
            this.$reset.prop("disabled", checked);
            const lock = $(`<i class="fa-solid fa-lock${!checked ? "-open" : ""}"></i>`)[0];
            $(`label[for="${this.$lock.attr("id")}"]`).html(lock);
        });
    }
    static initReset() {
        this.$reset.on("click", () => {
            this.$slider.val(this.$slider.attr("--data-default")).trigger("click");
        });
    }
    static get canChangeValue() {
        return !this.$lock.prop("checked");
    }
    static setSliderValue(value) {
        this.$slider.val(EMath.clamp(value, this.min, this.max).toString());
    }
}
