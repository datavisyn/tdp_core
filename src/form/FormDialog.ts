/**
 * Created by Samuel Gratzl on 07.06.2017.
 */
import {FormDialog as Dialog} from 'phovea_ui/src/dialogs';
import {randomId} from 'phovea_core/src';
import FormBuilder from './FormBuilder';
import {IFormElementDesc} from './interfaces';
import {select} from 'd3';

/**
 * a utililty dialog to show a dialog modal using a FormBuilder
 * @see FormBuilder
 */
export default class FormDialog extends Dialog {
  readonly builder: FormBuilder;

  /**
   * @param {string} title popup title
   * @param {string} primaryButton name of the primary button
   * @param {string} formId form id to use to avoid conflicts
   */
  constructor(title: string, primaryButton: string, formId = 'form' + randomId(5)) {
    super(title, primaryButton, formId);
    this.body.innerHTML = ''; //clear old form since the form builder brings its own
    this.builder = new FormBuilder(select(this.body), formId);

    this.onHide(() => {
      this.destroy();
    });
  }

  /**
   * adds additional form builder elememts
   * @param {IFormElementDesc} elements
   */
  append(...elements: IFormElementDesc[]) {
    this.builder.build(elements);
  }

  /**
   * register a callback when the form is submitted
   * @param {(builder?: FormBuilder) => void} callback called when submitted
   * @returns {JQuery}
   */
  onSubmit(callback: (builder?: FormBuilder)=>void) {
    return super.onSubmit(() => {
      if (!this.builder.validate()) {
        return false;
      }
      callback(this.builder);
      return false;
    });
  }

  /**
   * utility to show this dialog and resolve as soon it has been been submitted
   * @param {(builder: FormBuilder) => T} processData converter from a form builder to the output format
   * @returns {Promise<T>}
   */
  showAsPromise<T>(processData: (builder: FormBuilder) => T) {
    return new Promise<T>((resolve) => {
      this.onSubmit((builder) => {
        const data = processData(builder);
        if (data !== null) {
          this.hide();
          resolve(data);
        }
      });
      this.show();
      setTimeout(() => {
        const first = <HTMLElement>this.body.querySelector('input, select, textarea');
        if (first) {
          first.focus();
        }
      }, 250); // till dialog is visible
    });
  }
}
