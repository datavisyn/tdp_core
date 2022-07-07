import 'select2';
import * as d3v3 from 'd3v3';
import { AFormElement } from './AFormElement';
import { IFormElementDesc, IForm, FormElementType } from '../interfaces';
import { ISelectOptions } from './FormSelect';
import type { IFormElement } from '..';
import { ISelect3Options, IdTextPair } from './Select3';
import { IPluginDesc } from '../../base';
export interface ISubDesc {
    name: string;
    value: string;
}
export interface ISubInputDesc extends ISubDesc {
    type: FormElementType.INPUT_TEXT;
}
export interface ISubSelectDesc extends ISubDesc {
    type: FormElementType.SELECT;
    /**
     * the data, a promise of the data or a function computing the data or promise
     */
    optionsData: ISelectOptions | (() => ISelectOptions);
}
export interface ISubSelect2Desc extends ISubDesc {
    type: FormElementType.SELECT2;
    optionsData?: ISelectOptions | (() => ISelectOptions);
    return?: 'text' | 'id';
    multiple?: boolean;
    ajax?: any;
}
export interface ISubSelect3Desc extends Partial<ISelect3Options<IdTextPair>>, ISubDesc {
    type: FormElementType.SELECT3;
    return?: 'text' | 'id';
    name: string;
}
declare type ISubDescs = ISubInputDesc | ISubSelectDesc | ISubSelect2Desc | ISubSelect3Desc;
/**
 * Add specific options for input form elements
 */
export interface IFormMapDesc extends IFormElementDesc {
    type: FormElementType.MAP;
    /**
     * Additional options
     */
    options?: {
        badgeProvider?: (value: IFormRow[], ...dependent: IFormElement[]) => Promise<string> | string;
        entries: ISubDescs[] | ((...dependent: IFormElement[]) => ISubDescs[]);
        /**
         * whether an element can just be selected once
         */
        uniqueKeys?: boolean;
        sessionKeySuffix?: string;
        /**
         * @default true
         */
        defaultSelection?: boolean;
    } & IFormElementDesc['options'];
}
export interface IFormRow {
    key: string;
    value: any;
}
export declare class FormMap extends AFormElement<IFormMapDesc> {
    readonly pluginDesc: IPluginDesc;
    private $group;
    private rows;
    private inline;
    private inlineOnChange;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, elementDesc: IFormMapDesc, pluginDesc: IPluginDesc);
    private updateBadge;
    private get sessionKey();
    protected updateStoredValue(): void;
    protected getStoredValue<T>(defaultValue: T): T;
    /**
     * Build the label and input element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode: d3v3.Selection<any>): void;
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init(): void;
    private addValueEditor;
    private buildMap;
    private buildMapImpl;
    /**
     * Sets the value
     * @param v
     */
    set value(v: IFormRow[]);
    /**
     * Returns the value
     * @returns {string}
     */
    get value(): IFormRow[];
    hasValue(): boolean;
    focus(): void;
    isEqual(a: IFormRow[], b: IFormRow[]): boolean;
    static convertRow2MultiMap(rows: IFormRow[]): IFormMultiMap;
}
export declare type IFormMultiMap = {
    [key: string]: any | any[];
};
export {};
//# sourceMappingURL=FormMap.d.ts.map