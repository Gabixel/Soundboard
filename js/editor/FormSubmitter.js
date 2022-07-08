class FormSubmitter extends LogExtend {
    static $form;
    static initForm($form) {
        this.$form = $form;
        this.setupFormSubmitEvent();
    }
    static setupFormSubmitEvent() {
        this.$form.on('submit', (e) => {
            e.preventDefault();
            this.log(this.setupFormSubmitEvent, "Form submitted.");
        });
    }
}
