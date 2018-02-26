import {IInstantView, IInstantViewOptions, ISelection} from '../extensions';

export class AInstantView implements IInstantView {
  readonly node: HTMLElement;

  constructor(protected readonly selection: ISelection, options: Readonly<IInstantViewOptions>) {
    this.node = options.document.createElement('article');
    this.node.classList.add('tdp-instant-view');

    this.initImpl();
  }

  protected initImpl() {
    // hook
  }

  destroy() {
    this.node.remove();
  }
}

export default AInstantView;
