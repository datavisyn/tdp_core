import * as d3v3 from 'd3v3';
import { FormElementType, IFormElement, IFormElementDesc, IForm } from '../interfaces';
import { EventHandler, IPluginDesc } from '../../base';

export interface IButtonElementDesc extends IFormElementDesc {
  type: FormElementType.BUTTON;
  onClick: () => void;
  iconClass?: string;
}

export class FormButton extends EventHandler implements IFormElement {
  private $button: d3v3.Selection<HTMLButtonElement>;

  private $node: d3v3.Selection<any>;

  private clicked = false;

  readonly type: FormElementType.BUTTON;

  readonly id: string;

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(readonly form: IForm, readonly elementDesc: IButtonElementDesc, readonly pluginDesc: IPluginDesc) {
    super();
    this.id = elementDesc.id;
  }

  /**
   * Set the visibility of an form element - needed by IFormElement
   * @param visible
   */
  setVisible(visible: boolean) {
    this.$node.attr('hidden', !visible);
  }

  get value(): boolean {
    return this.clicked;
  }

  set value(clicked: boolean) {
    this.clicked = clicked;
  }

  validate() {
    return true;
  }

  /**
   * Build the current element and add the DOM element to the form DOM element.
   * @param $formNode The parent node this element will be attached to
   */
  build($formNode) {
    this.$node = $formNode.append('div').classed(this.elementDesc.options.inlineForm ? 'col-sm-auto' : 'col-sm-12 mt-1 mb-1', true);
    this.$button = this.$node.append('button').classed(this.elementDesc.attributes.clazz, true);
    this.$button.html(() => (this.elementDesc.iconClass ? `<i class="${this.elementDesc.iconClass}"></i> ${this.elementDesc.label}` : this.elementDesc.label));
  }

  init() {
    this.$button.on('click', () => {
      this.value = true;
      this.elementDesc.onClick();
      (<Event>d3v3.event).preventDefault();
      (<Event>d3v3.event).stopPropagation();
    });
    // TODO doesn't support show if
  }

  focus() {
    (<HTMLButtonElement>this.$button.node()).focus();
  }
}
