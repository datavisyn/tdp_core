import { IViewProvider } from '../IViewProvider';
import { IObjectRef, ProvenanceGraph, ActionNode } from '../../provenance';
export declare class ScoreUtils {
    static readonly CMD_ADD_SCORE = "tdpAddScore";
    static readonly CMD_REMOVE_SCORE = "tdpRemoveScore";
    private static addScoreLogic;
    static addScoreImpl(inputs: IObjectRef<IViewProvider>[], parameter: any): any;
    static addScoreAsync(inputs: IObjectRef<IViewProvider>[], parameter: any): Promise<any>;
    static removeScoreImpl(inputs: IObjectRef<IViewProvider>[], parameter: any): any;
    static addScore(provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any): any;
    static pushScoreAsync(graph: ProvenanceGraph, provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any): Promise<any>;
    static removeScore(provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any, columnId: string | string[]): any;
    private static shallowEqualObjects;
    /**
     * compresses score creation and removal
     */
    static compress(path: ActionNode[]): ActionNode[];
    private static compressImpl;
    static compressComp(path: ActionNode[]): ActionNode[];
}
