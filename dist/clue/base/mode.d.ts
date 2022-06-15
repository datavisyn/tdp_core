import { EventHandler } from '../../base/event';
/**
 * generic version of the CLUE mode, a combination of exploration, authoring, and normalization
 */
export declare class CLUEMode {
    private coord;
    constructor(exploration: number, authoring: number, presentation: number);
    get exploration(): number;
    get authoring(): number;
    get presentation(): number;
    value(index: number | string): number;
    /**
     * whether this mode is extreme, i.e., in one corner of the triangle
     * @returns {boolean}
     */
    get isAtomic(): boolean;
    toString(): string;
    /**
     * mode factory by the given components
     * @param exploration
     * @param authoring
     * @param presentation
     * @returns {CLUEMode}
     */
    static mode(exploration: number, authoring: number, presentation: number): CLUEMode;
    /**
     * shortcuts for the atomic modes
     * @type {{Exploration: CLUEMode, Authoring: CLUEMode, Presentation: CLUEMode}}
     */
    static modes: {
        Exploration: CLUEMode;
        Authoring: CLUEMode;
        Presentation: CLUEMode;
    };
    static fromString(s: string): CLUEMode;
    /**
     * returns the default mode either stored in the hash or by default exploration
     */
    static defaultMode(): CLUEMode;
}
/**
 * wrapper containing the current mode
 */
export declare class ModeWrapper extends EventHandler {
    private _mode;
    constructor();
    setMode(value: CLUEMode): void;
    getMode(): CLUEMode;
    private static instance;
    static getInstance(): ModeWrapper;
}
/**
 * utility to select the mode using three buttons to the atomic versions using bootstrap buttons
 */
export declare class ButtonModeSelector {
    private options;
    private readonly node;
    constructor(parent: Element, options?: any);
    private build;
    static createButton(parent: Element, options?: any): ButtonModeSelector;
}
//# sourceMappingURL=mode.d.ts.map