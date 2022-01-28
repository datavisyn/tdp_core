import '../webpack/_bootstrap';
import { IInstanceViewExtensionDesc, IItemSelection } from '../base/interfaces';
export declare class InstantViewWrapper {
    readonly node: HTMLElement;
    private selection;
    constructor(doc?: Document);
    pushView(view: IInstanceViewExtensionDesc): void;
    hide(): void;
    private clear;
    setSelection(selection?: IItemSelection): void;
}
//# sourceMappingURL=InstantViewWrapper.d.ts.map