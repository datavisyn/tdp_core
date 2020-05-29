import { IInstantView, IInstantViewOptions, IItemSelection } from '../base/interfaces';
export declare class AInstantView implements IInstantView {
    protected readonly selection: IItemSelection;
    readonly node: HTMLElement;
    constructor(selection: IItemSelection, options: Readonly<IInstantViewOptions>);
    protected initImpl(): void;
    destroy(): void;
}
