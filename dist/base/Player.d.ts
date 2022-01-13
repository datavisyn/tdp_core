import { ProvenanceGraph, SlideNode } from '../provenance';
export declare namespace StoryTransition {
    const FACTOR = 1;
    const MIN_DURATION = -1;
    const MIN_TRANSITION = -1;
}
/**
 * story player interface and logic
 */
export declare class Player {
    private graph;
    private anim;
    private options;
    private $play;
    constructor(graph: ProvenanceGraph, controls: Element, options?: any);
    start(): boolean;
    render(story: SlideNode): PromiseLike<SlideNode>;
    private stopAnim;
    stop(): void;
    pause(): void;
    /**
     * renders the next slide in an animated fashion
     */
    private next;
    /**
     * jumps to the next slide
     * @returns {any}
     */
    forward(): PromiseLike<SlideNode>;
    /**
     * jumps to the previous slide
     * @returns {any}
     */
    backward(): PromiseLike<SlideNode>;
}
