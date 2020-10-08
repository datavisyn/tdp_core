/**
 * Created by Samuel Gratzl on 18.05.2016.
 */
import { IObjectRef, ProvenanceGraph, ActionNode } from 'phovea_core';
import { IViewProvider } from '../IViewProvider';
export declare class ScoreUtils {
    static readonly CMD_ADD_SCORE = "tdpAddScore";
    static readonly CMD_REMOVE_SCORE = "tdpRemoveScore";
    private static addScoreLogic;
    static addScoreImpl(inputs: IObjectRef<IViewProvider>[], parameter: any): Promise<{
        inverse: import("phovea_core").IAction;
    }>;
    static addScoreAsync(inputs: IObjectRef<IViewProvider>[], parameter: any): Promise<{
        inverse: import("phovea_core").IAction;
    }>;
    static removeScoreImpl(inputs: IObjectRef<IViewProvider>[], parameter: any): Promise<{
        inverse: import("phovea_core").IAction;
    }>;
    static addScore(provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any): import("phovea_core").IAction;
    static pushScoreAsync(graph: ProvenanceGraph, provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any): Promise<any>;
    static removeScore(provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any, columnId: string | string[]): import("phovea_core").IAction;
    private static shallowEqualObjects;
    /**
     * compresses score creation and removal
     */
    static compress(path: ActionNode[]): ActionNode[];
    private static compressImpl;
    static compressComp(path: ActionNode[]): ActionNode[];
}
