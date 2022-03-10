import * as React from 'react';
import { IBaseViewPluginDesc } from '../base/interfaces';
export interface ITreeGroup {
    name: string;
    items: ITreeElement[];
    defaultOpen: boolean;
}
export interface ITreeElement {
    name: string;
    group: string;
    id: string;
}
export declare function viewPluginDescToTreeElementHelper(views: IBaseViewPluginDesc[], openGroups?: string[]): ITreeGroup[];
export interface ITreeRendererProps {
    groups: ITreeGroup[];
    selection: {
        isSelectable: boolean;
        inputNameAttribute: string;
    };
    readOnly: boolean;
    activeElement: ITreeElement;
    securityNotAllowedText: string;
    getItemURL(id: string): string;
    itemAction(item: ITreeElement): void;
    itemSelectAction(item: ITreeElement, group: ITreeGroup, selected: boolean): void;
    selectionChanged(items: ITreeElement[]): void;
}
interface ITreeRendererState {
    activeElement: ITreeElement;
    selectedElements: ITreeElement[];
}
export declare class TreeRenderer extends React.Component<Partial<ITreeRendererProps>, ITreeRendererState> {
    static defaultProps: {
        /**
         * specify if the tree should be rendered as read only
         */
        readOnly: boolean;
        selection: {
            isSelectable: boolean;
            inputNameAttribute: string;
        };
        securityNotAllowedText: string;
        /**
         * specify the URL when an item is clicked if any
         */
        getItemURL: (item: ITreeElement) => string;
        /**
         * determines what should happen when an item is clicked
         */
        itemAction: (item: ITreeElement) => any;
        /**
         * determines what should happen when an items checkbox status is changed
         */
        itemSelectAction: (item: ITreeElement, group: ITreeGroup, selected: boolean) => any;
        /**
         * determines what should happen when an items checkbox status is changed
         */
        selectionChanged: (items: ITreeElement[]) => any;
    };
    constructor(props: any);
    handleItemClick: (e: React.MouseEvent, item: ITreeElement) => void;
    handleSelectionChanged: (item: any, group: any, selected: any) => void;
    setSelectedIds: (itemIds?: string[]) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=TreeRenderer.d.ts.map