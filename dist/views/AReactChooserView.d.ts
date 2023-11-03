import { IDTypeLike } from 'visyn_core/idtype';
import { AReactView } from './AReactView';
import { ISelectionChooserOptions, SelectionChooser } from './SelectionChooser';
/**
 * definition how to select elements within the react view
 */
export interface IChooserViewSelector {
    (name: string | string[], op?: 'add' | 'set' | 'remove' | 'toggle'): void;
}
/**
 * to have a shortcut for react in react
 */
export interface IReactChooserViewHandler {
    forceUpdate(): void;
}
export interface IReactChooserViewOptions {
    reactHandler: IReactChooserViewHandler;
}
/**
 * a TDP view that is internally implemented using react.js
 */
export declare abstract class AReactChooserView extends AReactView {
    protected readonly chooser: SelectionChooser;
    private createSelectionChooser;
    protected abstract createSelectionChooserOptions(): Partial<ISelectionChooserOptions> & {
        target: IDTypeLike;
    };
    protected initReact(): Promise<void | (({ generateDialog }: {
        generateDialog(title: string, primaryBtnText: string, additionalCSSClasses?: string): import("..").Dialog;
    }) => Promise<unknown>)>;
    protected resolveSelection(): Promise<string[]>;
    protected getParameterFormDescs(): import("..").IFormElementDesc[];
    selectionChanged(): Promise<void | (({ generateDialog }: {
        generateDialog(title: string, primaryBtnText: string, additionalCSSClasses?: string): import("..").Dialog;
    }) => Promise<unknown>)>;
}
//# sourceMappingURL=AReactChooserView.d.ts.map