/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import { ISelection, IViewContext } from '../base/interfaces';
import { AView } from './AView';
import { Selection } from 'd3';
/**
 * utiltity view to work with the node using d3
 * @deprecated
 */
export declare abstract class AD3View extends AView {
    protected readonly $node: Selection<this>;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement);
}
