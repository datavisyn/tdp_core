/**
 * Created by Holger Stitz on 18.08.2016.
 */

import {generateDialog} from 'phovea_ui/src/dialogs';

let globalErrorTemplate = (details: string) => details;

export function setGlobalErrorTemplate(template: (details: string)=>string) {
  globalErrorTemplate = template;
}

/**
 * Use this modal dialog to show errors that were catched when an XHR request in a promise fails.
 * The dialog returns a promise that is resolved when the dialog is closed.
 * You can use that to clean up things in an error case.
 *
 * Usage:
 * ```
 * Promise(...)
 * .then(() => { ... }) //success
 * .catch(showErrorModalDialog) // open error dialog
 * .then((xhr) => { ... }); // do something after the error dialog has been closed
 * ```
 *
 * @param error
 * @returns {Promise<any>|Promise}
 */
export function showErrorModalDialog(error:any) {
  function commonDialog(title: string, body: string) {
     return new Promise((resolve, reject) => {
       const dialog = generateDialog(title, 'Dismiss');

       dialog.body.innerHTML = globalErrorTemplate(body);

       dialog.onSubmit(() => {
         dialog.hide();
         return false;
       });

       dialog.onHide(() => {
         reject(error);
         dialog.destroy();
       });

       dialog.show();
     });
  }

  if (error instanceof Response || error.response instanceof Response) {
    const xhr: Response = error instanceof Response ? error : error.response;
    return xhr.text().then((body: string) => {
      const title = `Error ${xhr.status} (${xhr.statusText})`;
      if (xhr.status !== 400) {
        body = `${body}<hr>
          The requested URL was:<br><a href="${xhr.url}" target="_blank">${(xhr.url.length > 100) ? xhr.url.substring(0, 100)+'...' : xhr.url}</a>`;
      }
      return commonDialog(title, body);
    });
  } else if (error instanceof Error) {
    return commonDialog(error.name, error.message);
  } else {
    return commonDialog('Unknown Error', error.toString());
  }
}
