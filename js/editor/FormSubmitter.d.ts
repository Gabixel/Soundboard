/// <reference types="jquery" />
/// <reference types="jquery" />
declare class FormSubmitter extends LogExtend {
    private static $form;
    static initForm($form: JQuery<HTMLElement>): void;
    private static setupFormSubmitEvent;
}
