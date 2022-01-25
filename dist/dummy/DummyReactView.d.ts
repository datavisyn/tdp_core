import { ISelector } from '../views/AReactView';
import { AReactChooserView } from '../views/AReactChooserView';
export declare class DummyReactView extends AReactChooserView {
    getItemType(): import("..").IDType;
    createSelectionChooserOptions(): {
        target: string;
    };
    render(inputSelection: string[], itemSelection: string[], itemSelector: ISelector): JSX.Element;
}
//# sourceMappingURL=DummyReactView.d.ts.map