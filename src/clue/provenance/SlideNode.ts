import { StateNode } from './StateNode';
import { GraphEdge, GraphNode } from '../graph/graph';

export interface IStateAnnotation {
  readonly type: string;
  pos: [number, number] | { anchor: string; offset: [number, number] };
  readonly styles?: { [key: string]: string };

  readonly [key: string]: any;
}

export interface ITextStateAnnotation extends IStateAnnotation {
  text: string;
  size?: [number, number];
  rotation?: number;
}

export interface IArrowStateAnnotation extends IStateAnnotation {
  at: [number, number];
}

export interface IFrameStateAnnotation extends IStateAnnotation {
  size?: [number, number];
  pos2?: [number, number];
  rotation?: number;
}

export class SlideNode extends GraphNode {
  public static DEFAULT_DURATION = 1500; // ms

  public static DEFAULT_TRANSITION = 0; // ms

  constructor() {
    super('story');
  }

  get name(): string {
    return super.getAttr('name', '');
  }

  set name(value: string) {
    super.setAttr('name', value);
  }

  get description(): string {
    return super.getAttr('description', '');
  }

  set description(value: string) {
    super.setAttr('description', value);
  }

  get isTextOnly() {
    return !this.outgoing.some(GraphEdge.isGraphType('jumpTo'));
  }

  get state() {
    const edge = this.outgoing.filter(GraphEdge.isGraphType('jumpTo'))[0];
    return edge ? <StateNode>edge.target : null;
  }

  static restore(dump: any) {
    return new SlideNode().restore(dump);
  }

  get next() {
    const n = this.outgoing.filter(GraphEdge.isGraphType('next'))[0];
    return n ? <SlideNode>n.target : null;
  }

  get nexts() {
    return this.outgoing.filter(GraphEdge.isGraphType('next')).map((n) => <SlideNode>n.target);
  }

  get previous() {
    const n = this.incoming.filter(GraphEdge.isGraphType('next'))[0];
    return n ? <SlideNode>n.source : null;
  }

  get slideIndex(): number {
    const p = this.previous;
    return 1 + (p ? p.slideIndex : 0);
  }

  get duration() {
    return <number>this.getAttr('duration', SlideNode.DEFAULT_DURATION);
  }

  set duration(value: number) {
    this.setAttr('duration', value);
  }

  /**
   * the number of milliseconds for the transitions
   * @returns {number}
   */
  get transition() {
    return <number>this.getAttr('transition', SlideNode.DEFAULT_TRANSITION);
  }

  set transition(value: number) {
    this.setAttr('transition', value);
  }

  get annotations() {
    return <IStateAnnotation[]>this.getAttr('annotations', []);
  }

  setAnnotation(index: number, ann: IStateAnnotation) {
    const old = this.annotations;
    old[index] = ann;
    this.setAttr('annotations', old);
  }

  updateAnnotation(ann: IStateAnnotation) {
    // since it is a reference just updated
    this.setAttr('annotations', this.annotations);
  }

  removeAnnotation(index: number) {
    const old = this.annotations;
    old.splice(index, 1);
    this.setAttr('annotations', old);
  }

  removeAnnotationElem(elem: IStateAnnotation) {
    const old = this.annotations;
    old.splice(old.indexOf(elem), 1);
    this.setAttr('annotations', old);
  }

  pushAnnotation(ann: IStateAnnotation) {
    const old = this.annotations;
    old.push(ann);
    this.setAttr('annotations', old);
    this.fire('push-annotations', ann, old);
  }

  get isStart() {
    return this.previous == null;
  }

  static makeText(title?: string) {
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

  static toSlidePath(s?: SlideNode) {
    const r: SlideNode[] = [];
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
