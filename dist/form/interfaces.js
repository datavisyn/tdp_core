/**
 * List of all available for elements that the form builder can handle
 * @see FormBuilder.appendElement()
 */
export var FormElementType;
(function (FormElementType) {
    /**
     * shows a simple select box
     * @see IFormSelectDesc
     */
    FormElementType["SELECT"] = "FormSelect";
    /**
     * shows a select box based on select2
     * @see IFormSelect2
     */
    FormElementType["SELECT2"] = "FormSelect2";
    /**
     * similar to SELECT2 but with multiple selections allowed
     */
    FormElementType["SELECT2_MULTIPLE"] = "FormSelect2Multiple";
    /**
     * SELECT2 with additional functionality such as validation, tokenize and file drag
     */
    FormElementType["SELECT3"] = "FormSelect3";
    /**
     * similar to SELECT3 but with multiple selections allowed
     */
    FormElementType["SELECT3_MULTIPLE"] = "FormSelect3Multiple";
    /**
     * a text field
     * @see IFormInputTextDesc
     */
    FormElementType["INPUT_TEXT"] = "FormInputText";
    /**
     * a complex dynamic sub map form element
     * @see IFormMapDesc
     */
    FormElementType["MAP"] = "FormMap";
    /**
     * a simple button
     * @see IButtonElementDesc
     */
    FormElementType["BUTTON"] = "FormButton";
    /**
     * a checkbox
     * @see ICheckBoxElementDesc
     */
    FormElementType["CHECKBOX"] = "FormCheckBox";
    /**
     * a checkbox
     * @see IRadioElementDesc
     */
    FormElementType["RADIO"] = "FormRadio";
})(FormElementType || (FormElementType = {}));
//# sourceMappingURL=interfaces.js.map