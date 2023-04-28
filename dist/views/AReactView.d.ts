/** *******************************************************
 * Copyright (c) 2022 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 ******************************************************** */
import { ReactElement } from 'react';
import { IDTypeLike } from 'visyn_core/idtype';
import { AView } from './AView';
import { ISelection, IViewContext } from '../base';
/**
 * definition how to select elements within the react view
 */
export interface ISelector {
    (name: string | string[], op?: 'add' | 'set' | 'remove' | 'toggle'): void;
}
/**
 * to have a shortcut for react in react
 */
export interface IReactHandler {
    forceUpdate(): void;
}
export interface IReactViewOptions {
    reactHandler: IReactHandler;
}
/**
 * a TDP view that is internally implemented using react.js
 */
export declare abstract class AReactView extends AView {
    private readonly select;
    private readonly handler?;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<Readonly<IReactViewOptions>>);
    protected initImpl(): Promise<void | (({ generateDialog }: {
        generateDialog(title: string, primaryBtnText: string, additionalCSSClasses?: string): import("../components").Dialog;
    }) => Promise<unknown>)>;
    protected initReact(): Promise<void | (({ generateDialog }: {
        generateDialog(title: string, primaryBtnText: string, additionalCSSClasses?: string): import("../components").Dialog;
    }) => Promise<unknown>)>;
    private selectImpl;
    get itemIDType(): import("visyn_core/idtype").IDType;
    /**
     * return the IDType of contained items needed for the selection
     * @returns {IDTypeLike}
     */
    protected abstract getItemType(): IDTypeLike;
    private update;
    /**
     * render this view with the given input
     * @param {string[]} inputSelection the current input selection
     * @param {string[]} itemSelection the current item selection
     * @param {ISelector} itemSelector utility to select items
     * @returns {Promise<React.ReactElement<any>> | React.ReactElement<any>} the react element of this view
     */
    abstract render(inputSelection: string[], itemSelection: string[], itemSelector: ISelector): Promise<ReactElement<any>> | ReactElement<any>;
    protected forceUpdate(): Promise<void | (({ generateDialog }: {
        generateDialog(title: string, primaryBtnText: string, additionalCSSClasses?: string): import("../components").Dialog;
    }) => Promise<unknown>)>;
    selectionChanged(): Promise<void | (({ generateDialog }: {
        generateDialog(title: string, primaryBtnText: string, additionalCSSClasses?: string): import("../components").Dialog;
    }) => Promise<unknown>)>;
    itemSelectionChanged(): Promise<void | (({ generateDialog }: {
        generateDialog(title: string, primaryBtnText: string, additionalCSSClasses?: string): import("../components").Dialog;
    }) => Promise<unknown>)>;
    protected parameterChanged(name: string): Promise<void | (({ generateDialog }: {
        generateDialog(title: string, primaryBtnText: string, additionalCSSClasses?: string): import("../components").Dialog;
    }) => Promise<unknown>)>;
}
//# sourceMappingURL=AReactView.d.ts.map