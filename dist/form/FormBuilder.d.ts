import * as d3 from 'd3';
import { IFormElementDesc, IForm } from './interfaces';
/**
 * Builds a form from a given collection of form elements
 */
export declare class FormBuilder {
    private readonly formId;
    private readonly formInline;
    /**
     * The form that will be build
     */
    private readonly form;
    /**
     * Map of all future elements
     */
    private readonly elementPromises;
    /**
     * Constructor
     * @param $parent Node that the form should be attached to
     * @param formId unique form id
     * @param formInline whether the form is in inline mode or not
     */
    constructor($parent: d3.Selection<any>, formId?: string, formInline?: boolean);
    /**
     * Creates a form element instance from a form element description and
     * appends it to the form
     * @param elementDesc
     */
    appendElement(elementDesc: IFormElementDesc): void;
    /**
     * Append multiple elements at once to the form
     * @param elements list of element descriptions
     */
    appendElements(elements: IFormElementDesc[]): void;
    /**
     * Builds a form from a list of given form element descriptions
     * Once everything is initialized the form is returned
     *
     * @returns {IForm} Loaded and initialized form
     */
    build(): Promise<IForm>;
}
//# sourceMappingURL=FormBuilder.d.ts.map