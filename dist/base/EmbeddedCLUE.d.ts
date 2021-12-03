export declare class EmbeddedCLUE {
    private readyCallback;
    private iframe;
    private l;
    private callbacks;
    ready: boolean;
    constructor(parent: HTMLElement, url: string, readyCallback: (c: EmbeddedCLUE) => void);
    private onMessage;
    send(type: string, msg: any): Promise<unknown>;
    showSlide(slide: number): Promise<unknown>;
    jumpToState(state: number): Promise<unknown>;
    nextSlide(): Promise<unknown>;
    previousSlide(): Promise<unknown>;
    private onCLUEMessage;
    clue_random_id(length?: number): string;
    static embedCLUE(parent: HTMLElement, server: string, app: string, provenanceGraph: string): Promise<unknown>;
}
