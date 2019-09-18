import {FormElementType, IFormElement, IFormElementDesc, IForm} from '../interfaces';
import * as d3 from 'd3';
import {EventHandler} from 'phovea_core/src/event';
import {IPluginDesc} from 'phovea_core/src/plugin';

export interface IButtonElementDesc extends IFormElementDesc {
  onClick: () => void;
  iconClass?: string;
}

export default class FormButton extends EventHandler implements IFormElement {
  private $button: d3.Selection<HTMLButtonElement>;
  private $node: d3.Selection<any>;
  private clicked: boolean = false;

  readonly type: FormElementType.BUTTON;
  readonly id: string;

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param $parent The parent node this element will be attached to
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(readonly form: IForm, private readonly $parent, readonly elementDesc: IButtonElementDesc, readonly pluginDesc: IPluginDesc) {
    super();
    this.id = elementDesc.id;
  }

  /**
   * Set the visibility of an form element - needed by IFormElement
   * @param visible
   */
  setVisible(visible: boolean) {
    this.$node.classed('hidden', !visible);
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

  build() {
    this.$node = this.$parent.append('div').classed('form-group', true);
    this.$button = this.$node.append('button').classed(this.elementDesc.attributes.clazz, true);
    this.$button.html(() => this.elementDesc.iconClass? `<i class="${this.elementDesc.iconClass}"></i> ${this.elementDesc.label}` : this.elementDesc.label);
  }

  init() {
    this.$button.on('click', () => {
      this.value = true;
      this.elementDesc.onClick();
      (<Event>d3.event).preventDefault();
      (<Event>d3.event).stopPropagation();
    });
    // TODO doesn't support show if
  }

  focus() {
    (<HTMLButtonElement>this.$button.node()).focus();
  }
}
