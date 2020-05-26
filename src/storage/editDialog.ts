import {IStoredNamedSet} from './interfaces';
import {FormDialog} from 'phovea_ui';
import {ISecureItem, I18nextManager} from 'phovea_core';
import {permissionForm} from '../utils/utils';


export function editDialog(namedSet: IStoredNamedSet, result: (name: string, description: string, sec: Partial<ISecureItem>) => void) {
  const isCreate = namedSet === null;
  const title = isCreate ? I18nextManager.getInstance().i18n.t('tdp:core.editDialog.save') : I18nextManager.getInstance().i18n.t('tdp:core.editDialog.edit');
  const dialog = new FormDialog(title + I18nextManager.getInstance().i18n.t('tdp:core.editDialog.listOfEntities'), title, 'namedset_form');

  const permissions = permissionForm(namedSet);

  dialog.form.innerHTML = `
    <p> ${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.dialog1')}</p>
    <p style="margin-bottom: 15px">${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.dialog2')}</p>
    <div class="form-group">
      <label for="namedset_name">${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.name')}</label>
      <input type="text" class="form-control" name="name" id="namedset_name" placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.name')}" required="required" ${namedSet ? `value="${namedSet.name}"` : ''}>
    </div>
    <div class="form-group">
      <label for="namedset_description">${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.description')}</label>
      <textarea class="form-control" name="description" id="namedset_description" rows="5" placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.description')}">${namedSet ? namedSet.description : ''}</textarea>
    </div>
  `;
  dialog.form.appendChild(permissions.node);

  dialog.onHide(() => dialog.destroy());

  dialog.onSubmit(() => {
    const data = new FormData(dialog.form);
    const name = data.get('name').toString();
    const description = data.get('description').toString();
    const sec = permissions.resolve(data);

    result(name, description, sec);
    dialog.hide();
    return false;
  });

  dialog.show();
}
