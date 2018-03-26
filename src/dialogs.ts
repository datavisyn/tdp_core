/**
 * Created by Holger Stitz on 18.08.2016.
 */

import CLUEGraphManager from 'phovea_clue/src/CLUEGraphManager';
import {IAreYouSureOptions, Dialog, FormDialog} from 'phovea_ui/src/dialogs';

export {setGlobalErrorTemplate} from 'phovea_ui/src/errors';

export {errorAlert as showErrorModalDialog} from './notifications';

export interface IDialogModule {
  generateDialog(title: string, primaryBtnText?: string): Dialog;

  areyousure(msg?: string, options?: IAreYouSureOptions | string): Promise<boolean>;

  FormDialog: {new(title: string, primaryBtnText?: string, formId?: string): FormDialog};
}

export function lazyDialogModule(): Promise<IDialogModule> {
  return System.import('phovea_ui/src/dialogs');
}

/**
 * utility dialog when a session was not found
 * @param {CLUEGraphManager} manager
 * @param {string} id session id
 */
export function showProveanceGraphNotFoundDialog(manager: CLUEGraphManager, id: string) {
  lazyDialogModule().then(({generateDialog}) => {
    const dialog = generateDialog('Session Not Found!', 'Create New Temporary Session');
    // append bg-danger to the dialog parent element
    dialog.body.parentElement.parentElement.parentElement.classList.add('bg-danger');
    dialog.body.innerHTML = `
        <p>
            The requested session <strong>"${id}"</strong> was not found or is not accessible.
        </p>
        <p>
            Possible reasons are that you
            <ul>
                <li>requested a <i>temporary session</i> that is already expired</li>
                <li>tried to access a <i>temporary session</i> of another user</li>
                <li>tried to access a <i>private persistent session</i> of another user</li>
            </ul>
        </p>
        <p>
            In the latter two cases, please contact the original owner of the session to create a public persistent session.
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
