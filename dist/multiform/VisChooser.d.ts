import { IMultiForm } from './IMultiForm';
export declare class VisChooser {
    /**
     * computes the selectable vis techniques for a given set of multi form objects
     * @param forms
     * @return {*}
     */
    static toAvailableVisses(forms: IMultiForm[]): import("..").IVisPluginDesc[];
    static addIconVisChooser(toolbar: HTMLElement, ...forms: IMultiForm[]): void;
    static addSelectVisChooser(toolbar: HTMLElement, ...forms: IMultiForm[]): void;
}
//# sourceMappingURL=VisChooser.d.ts.map