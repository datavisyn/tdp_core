import '../webpack/_bootstrap';
import $ from 'jquery';
import { merge } from 'lodash';
import { Modal } from 'bootstrap';
import { I18nextManager } from '../i18n';
import { TourUtils } from '../tour/TourUtils';
import { BaseUtils } from '../base/BaseUtils';

export interface IDialogOptions {
  title?: string;
  placeholder?: string;
  primaryBtnText?: string;
  additionalCSSClasses?: string;
}
export interface IPromptOptions extends IDialogOptions {
  multiline?: boolean;
}

export interface IChooseOptions extends IDialogOptions {
  editable?: boolean;
}

export interface IAreYouSureOptions extends Pick<IDialogOptions, 'title' | 'additionalCSSClasses'> {
  button?: string;
  cancelButton?: string;
}

export class Dialog {
  // Bootstrap modal dialog instance
  protected readonly bsModal: Modal;

  // Root DOM element of the modal dialog
  protected readonly modalElement: Element;

  private bakKeyDownListener: (ev: KeyboardEvent) => any = null; // temporal for restoring an old keydown listener

  static openDialogs = 0;

  /**
   * @param title Dialog title
   * @param primaryBtnText Label for primary button
   * @param additionalCSSClasses additional css classes for the dialog
   * @param backdrop sets backdrop option for bootstrap modal
   *
   * false: show no backdrop;
   *
   * true: show backdrop, dialog closes on click outside;
   *
   * static: show backdrop, dialog does not close on click outside;
   * @default backdrop true
   */
  constructor(title: string, primaryBtnText = 'OK', additionalCSSClasses = '', backdrop: boolean | 'static' = true) {
    this.modalElement = document.createElement('div');
    this.modalElement.setAttribute('role', 'dialog');
    this.modalElement.classList.add('modal', 'fade');
    this.modalElement.innerHTML = `
       <div class="modal-dialog ${additionalCSSClasses}" role="document">
        <div class="modal-content" data-testid="${title
          .replace(/<\/?[^>]+(>|$)/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase()}">
          <div class="modal-header">
            <h4 class="modal-title">${title}</h4>
            <button type="button" class="btn-close" data-testid="close-button" data-bs-dismiss="modal" aria-label="${I18nextManager.getInstance().i18n.t(
              'phovea:ui.close',
            )}"></button>
          </div>
          <div class="modal-body">

          </div>
          <div class="modal-footer">
            <button type="button" data-testid="primary-dialog-button" class="btn btn-primary btn-primary submit-dialog">${primaryBtnText}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(this.modalElement);

    this.bsModal = new Modal(this.modalElement, {
      // Closes the modal when escape key is pressed
      keyboard: true,

      // Puts the focus on the modal when initialized and keeps the focus inside modal with a focus trap.
      // Set focus to `false` if a tour is visible to avoid focus conflicts between this modal and the tour dialog that automatically focus on the next button.
      // Otherwise the flag is set to `true` and keep the focus on this dialog.
      focus: TourUtils.isTourVisible() !== true,

      // Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
      backdrop,
    });
  }

  show() {
    this.bakKeyDownListener = document.onkeydown;
    document.onkeydown = (evt) => {
      evt = evt || <KeyboardEvent>window.event;
      if (evt.key === 'Escape') {
        this.hide();
      }
    };

    ++Dialog.openDialogs;
    return this.bsModal.show();
  }

  hide() {
    document.onkeydown = this.bakKeyDownListener;
    return this.bsModal.hide();
  }

  get body() {
    return this.modalElement.querySelector<HTMLDivElement>('.modal-body');
  }

  get footer() {
    return this.modalElement.querySelector<HTMLDivElement>('.modal-footer');
  }

  get header() {
    return this.modalElement.querySelector<HTMLDivElement>('.modal-header');
  }

  onHide(callback: () => void) {
    this.modalElement.addEventListener('hidden.bs.modal', callback);
  }

  onSubmit(callback: () => any) {
    this.modalElement.querySelector('.modal-footer > .submit-dialog').addEventListener('click', callback);
  }

  hideOnSubmit() {
    this.onSubmit(this.hide.bind(this));
  }

  destroy() {
    if (--Dialog.openDialogs > 0) {
      $('body').addClass('modal-open');
    }
    this.bsModal.dispose();
    this.modalElement.remove();
  }

  static generateDialog(title: string, primaryBtnText = 'OK', additionalCSSClasses = '') {
    return new Dialog(title, primaryBtnText, additionalCSSClasses);
  }

  static msg(text: string, category = 'info'): Promise<void> {
    return new Promise<void>((resolve) => {
      const div = $(`<div class="alert alert-${category} alert-dismissible fade in" role="alert">
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${I18nextManager.getInstance().i18n.t('phovea:ui.close')}"></button>
          ${text}
      </div>`).appendTo('body');
      div.on('closed.bs.alert', () => resolve);
      div.alert();
    });
  }

  /**
   * simple prompt dialog
   * @param text
   * @param options
   * @returns {Promise}
   */
  static prompt(text: string, options: IPromptOptions | string = {}): Promise<string> {
    const o: IPromptOptions = {
      title: 'Input',
      placeholder: 'Enter...',
      multiline: false,
    };
    if (typeof options === 'string') {
      options = { title: options };
    }
    merge(o, options);
    return new Promise((resolve) => {
      const dialog = Dialog.generateDialog(o.title, o.primaryBtnText, o.additionalCSSClasses);
      if (o.multiline) {
        dialog.body.innerHTML = `<form><textarea class="form-control" rows="5" placeholder="${o.placeholder}" autofocus="autofocus">${text}</textarea></form>`;
      } else {
        dialog.body.innerHTML = `<form><input type="text" class="form-control" value="${text}" autofocus="autofocus" placeholder="${o.placeholder}"></form>`;
      }
      // Resolve with content of form
      const submit = () => {
        resolve((<HTMLInputElement>dialog.body.querySelector('input, textarea')).value);
        dialog.hide();
      };
      // Resolve when dialog is submitted (on button click)
      dialog.onSubmit(submit);
      // Resolve when form is submitted
      (<HTMLFormElement>dialog.body.querySelector('form')).onsubmit = () => {
        submit();
        return false;
      };
      dialog.onHide(() => {
        // Resolve with null if dialog is hidden (by clicking the x).
        // This might be the second call to resolve after the actual form resolve, but it will not have any effect.
        resolve(null);
        dialog.destroy();
      });
      dialog.show();
    });
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export class PHOVEA_UI_FormDialog extends Dialog {
  constructor(title: string, primaryBtnText = 'OK', formId = `form${BaseUtils.randomId(5)}`, additionalCSSClasses = '') {
    super(title, primaryBtnText, additionalCSSClasses);

    this.body.innerHTML = `<form id="${formId}"></form>`;
    const b = this.footer.querySelector('button');
    b.setAttribute('type', 'submit');
    b.setAttribute('form', formId);
  }

  get form() {
    return this.body.querySelector('form');
  }

  getFormData() {
    return new FormData(this.form);
  }

  onSubmit(callback: () => boolean) {
    return this.modalElement.querySelector('.modal-body > form').addEventListener('submit', (e: SubmitEvent) => {
      e.preventDefault();
      return callback();
    });
  }

  /**
   * simple choose dialog
   * @param items
   * @param options
   * @returns {Promise}
   */
  static choose(items: string[], options: IChooseOptions | string = {}): Promise<string> {
    const o: IChooseOptions = {
      title: 'Choose',
      placeholder: 'Enter...',
      editable: false,
    };
    if (typeof options === 'string') {
      options = { title: options };
    }
    merge(o, options);

    return new Promise((resolve) => {
      const dialog = Dialog.generateDialog(o.title, o.primaryBtnText, o.additionalCSSClasses);
      const option = items.map((d) => `<option value="${d}">${d}</option>`).join('\n');
      if (o.editable) {
        dialog.body.innerHTML = `<form><input type="text" list="chooseList" class="form-control" autofocus="autofocus" placeholder="${o.placeholder}">
          <datalist id="chooseList">${option}</datalist>
        </form>`;
      } else {
        dialog.body.innerHTML = `<form><select class="form-control">${option}</select></form>`;
      }

      (<HTMLFormElement>dialog.body.querySelector('form')).onsubmit = () => {
        dialog.hide();
        return false;
      };
      dialog.hideOnSubmit();
      dialog.onHide(() => {
        if (o.editable) {
          resolve((<HTMLInputElement>dialog.body.querySelector('input')).value);
        } else {
          resolve(items[(<HTMLSelectElement>dialog.body.querySelector('select')).selectedIndex]);
        }
        dialog.destroy();
      });
      dialog.show();
    });
  }

  static areyousure(msg = '', options: IAreYouSureOptions | string = {}): Promise<boolean> {
    const o: IAreYouSureOptions = {
      title: I18nextManager.getInstance().i18n.t('phovea:ui.areYouSure'),
      button: `<i class="fas fa-trash" aria-hidden="true"></i>  ${I18nextManager.getInstance().i18n.t('phovea:ui.delete')}`,
      cancelButton: I18nextManager.getInstance().i18n.t('phovea:ui.cancel'),
    };
    if (typeof options === 'string') {
      options = { title: options };
    }
    merge(o, options);

    return new Promise((resolve) => {
      const dialog = Dialog.generateDialog(o.title, o.cancelButton, o.additionalCSSClasses);
      dialog.body.innerHTML = msg;
      $(`<button class="btn btn-danger" data-testid="delete-button">${o.button}</button>`).appendTo(dialog.footer);
      let clicked = false;
      $(dialog.footer)
        .find('button.btn-primary')
        .on('click', function () {
          dialog.hide();
        });
      $(dialog.footer)
        .find('button.btn-danger')
        .on('click', function () {
          clicked = true;
          dialog.hide();
        });
      dialog.onHide(() => {
        dialog.destroy();
        resolve(clicked);
      });
      dialog.show();
    });
  }
}
