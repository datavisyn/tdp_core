import { IAreYouSureOptions, Dialog, PHOVEA_UI_FormDialog } from '../components';
import { I18nextManager } from '../i18n';
import { CLUEGraphManager } from './CLUEGraphManager';

export interface IDialogModule {
  generateDialog(title: string, primaryBtnText?: string, additionalCSSClasses?: string): Dialog;

  areyousure(msg?: string, options?: IAreYouSureOptions | string): Promise<boolean>;

  FormDialog: { new (title: string, primaryBtnText?: string, formId?: string, additionalCSSClasses?: string): PHOVEA_UI_FormDialog };
}

export class DialogUtils {
  /**
   * utility dialog when a session was not found
   * @param {CLUEGraphManager} manager
   * @param {string} id session id
   */
  static showProveanceGraphNotFoundDialog(manager: CLUEGraphManager, id: string, additionalCSSClasses = '') {
    const dialog = Dialog.generateDialog(
      I18nextManager.getInstance().i18n.t('tdp:core.sessionNotFound'),
      I18nextManager.getInstance().i18n.t('tdp:core.newSession'),
      additionalCSSClasses,
    );
    // append bg-danger to the dialog parent element
    dialog.body.parentElement.parentElement.parentElement.classList.add('bg-danger');
    dialog.body.innerHTML = `
        <p>
          ${I18nextManager.getInstance().i18n.t('tdp:core.notAccessibleMessage', { id })}
        </p>
        <p>
        ${I18nextManager.getInstance().i18n.t('tdp:core.possibleReasons')}
        <ul>
            <li>${I18nextManager.getInstance().i18n.t('tdp:core.possibleReason1')}</li>
            <li>${I18nextManager.getInstance().i18n.t('tdp:core.possibleReason2')}</li>
            <li>${I18nextManager.getInstance().i18n.t('tdp:core.possibleReason3')}</li>
        </ul>
        </p>
        <p>
          ${I18nextManager.getInstance().i18n.t('tdp:core.contactOwnerMessage')}
        </p>`;
    dialog.onSubmit(() => {
      dialog.hide();
      return false;
    });
    dialog.onHide(() => {
      dialog.destroy();
      manager.newGraph();
    });

    dialog.show();
  }
}
