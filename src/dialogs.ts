/**
 * Created by Holger Stitz on 18.08.2016.
 */

import CLUEGraphManager from 'phovea_clue/src/CLUEGraphManager';
import {IAreYouSureOptions, Dialog, FormDialog} from 'phovea_ui/src/dialogs';
import i18next from 'phovea_core/src/i18n';

export {setGlobalErrorTemplate} from 'phovea_ui/src/errors';

export {errorAlert as showErrorModalDialog} from './notifications';

export interface IDialogModule {
  generateDialog(title: string, primaryBtnText?: string, additionalCSSClasses?: string): Dialog;

  areyousure(msg?: string, options?: IAreYouSureOptions | string): Promise<boolean>;

  FormDialog: {new(title: string, primaryBtnText?: string, formId?: string, additionalCSSClasses?: string): FormDialog};
}

export function lazyDialogModule(): Promise<IDialogModule> {
  return System.import('phovea_ui/src/dialogs');
}

/**
 * utility dialog when a session was not found
 * @param {CLUEGraphManager} manager
 * @param {string} id session id
 */
export function showProveanceGraphNotFoundDialog(manager: CLUEGraphManager, id: string, additionalCSSClasses: string = '') {
  lazyDialogModule().then(({generateDialog}) => {
    const dialog = generateDialog(i18next.t('tdp:core.sessionNotFound'), i18next.t('tdp:core.newSession'), additionalCSSClasses);
    // append bg-danger to the dialog parent element
    dialog.body.parentElement.parentElement.parentElement.classList.add('bg-danger');
    dialog.body.innerHTML = `
        <p>
           ${i18next.t('tdp:core.notAccessibleMessage', {id})}
        </p>
        <p>
        ${i18next.t('tdp:core.possibleReasons')}
        <ul>
            <li>${i18next.t('tdp:core.possibleReason1')}</li>
            <li>${i18next.t('tdp:core.possibleReason2')}</li>
            <li>${i18next.t('tdp:core.possibleReason3')}</li>
        </ul>
        </p>
        <p>
          ${i18next.t('tdp:core.contactOwnerMessage')}
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
  });
}
