import { IInstantView, IInstantViewOptions, ISelection } from '../base/interfaces';
export declare class AInstantView implements IInstantView {
    protected readonly selection: ISelection;
    readonly node: HTMLElement;
    constructor(selection: ISelection, options: Readonly<IInstantViewOptions>);
    protected initImpl(): void;
    destroy(): void;
}
//# sourceMappingURL=AInstantView.d.ts.map