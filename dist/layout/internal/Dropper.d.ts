import { ALayoutContainer } from './ALayoutContainer';
import { TabbingLayoutContainer } from './TabbingLayoutContainer';
import { IDropArea, ILayoutContainer } from '../interfaces';
export declare class Dropper {
    static determineDropArea(x: number, y: number): IDropArea;
    static dropViews(node: HTMLElement, reference: ALayoutContainer<any> & ILayoutContainer): void;
    static dropLogic(item: ILayoutContainer, reference: ALayoutContainer<any> & ILayoutContainer, area: IDropArea): any;
    static autoWrap(item: ILayoutContainer): ILayoutContainer | TabbingLayoutContainer;
}
//# sourceMappingURL=Dropper.d.ts.map