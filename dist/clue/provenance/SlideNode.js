import { GraphNode, GraphEdge } from '../graph/graph';
export class SlideNode extends GraphNode {
    constructor() {
        super('story');
    }
    get name() {
        return super.getAttr('name', '');
    }
    set name(value) {
        super.setAttr('name', value);
    }
    get description() {
        return super.getAttr('description', '');
    }
    set description(value) {
        super.setAttr('description', value);
    }
    get isTextOnly() {
        return !this.outgoing.some(GraphEdge.isGraphType('jumpTo'));
    }
    get state() {
        const edge = this.outgoing.filter(GraphEdge.isGraphType('jumpTo'))[0];
        return edge ? edge.target : null;
    }
    static restore(dump) {
        return new SlideNode().restore(dump);
    }
    get next() {
        const n = this.outgoing.filter(GraphEdge.isGraphType('next'))[0];
        return n ? n.target : null;
    }
    get nexts() {
        return this.outgoing.filter(GraphEdge.isGraphType('next')).map((n) => n.target);
    }
    get previous() {
        const n = this.incoming.filter(GraphEdge.isGraphType('next'))[0];
        return n ? n.source : null;
    }
    get slideIndex() {
        const p = this.previous;
        return 1 + (p ? p.slideIndex : 0);
    }
    get duration() {
        return this.getAttr('duration', SlideNode.DEFAULT_DURATION);
    }
    set duration(value) {
        this.setAttr('duration', value);
    }
    /**
     * the number of milliseconds for the transitions
     * @returns {number}
     */
    get transition() {
        return this.getAttr('transition', SlideNode.DEFAULT_TRANSITION);
    }
    set transition(value) {
        this.setAttr('transition', value);
    }
    get annotations() {
        return this.getAttr('annotations', []);
    }
    setAnnotation(index, ann) {
        const old = this.annotations;
        old[index] = ann;
        this.setAttr('annotations', old);
    }
    updateAnnotation(ann) {
        // since it is a reference just updated
        this.setAttr('annotations', this.annotations);
    }
    removeAnnotation(index) {
        const old = this.annotations;
        old.splice(index, 1);
        this.setAttr('annotations', old);
    }
    removeAnnotationElem(elem) {
        const old = this.annotations;
        old.splice(old.indexOf(elem), 1);
        this.setAttr('annotations', old);
    }
    pushAnnotation(ann) {
        const old = this.annotations;
        old.push(ann);
        this.setAttr('annotations', old);
        this.fire('push-annotations', ann, old);
    }
    get isStart() {
        return this.previous == null;
    }
    static makeText(title) {
        const s = new SlideNode();
        if (title) {
            s.pushAnnotation({
                type: 'text',
                pos: [25, 25],
                // eslint-disable-next-line no-template-curly-in-string
                text: '# ${name}',
            });
            s.name = title;
        }
        return s;
    }
    static toSlidePath(s) {
        const r = [];
        while (s) {
            if (r.indexOf(s) >= 0) {
                return r;
            }
            r.push(s);
            s = s.next;
        }
        return r;
    }
}
SlideNode.DEFAULT_DURATION = 1500; // ms
SlideNode.DEFAULT_TRANSITION = 0; // ms
//# sourceMappingURL=SlideNode.js.map