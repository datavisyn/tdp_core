import { I18nextManager } from 'visyn_core';
import { PHOVEA_UI_FormDialog } from '../components';
import { TDPApplicationUtils } from '../utils/TDPApplicationUtils';
export class StoreUtils {
    static editDialog(namedSet, entitiesTitle, result) {
        const isCreate = namedSet === null;
        const title = isCreate ? I18nextManager.getInstance().i18n.t('tdp:core.editDialog.save') : I18nextManager.getInstance().i18n.t('tdp:core.editDialog.edit');
        const dialog = new PHOVEA_UI_FormDialog(title + entitiesTitle, I18nextManager.getInstance().i18n.t('tdp:core.editDialog.save'), 'namedset_form');
        const permissions = TDPApplicationUtils.permissionForm(namedSet);
        dialog.form.innerHTML = `
      <p> ${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.dialog1')}</p>
      <p style="margin-bottom: 15px">${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.dialog2')}</p>
      <div class="mb-3">
        <label class="form-label" for="namedset_name">${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.name')}</label>
        <input type="text" data-testid="name-input" class="form-control" name="name" id="namedset_name" placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.name')}" required="required" ${namedSet ? `value="${namedSet.name}"` : ''}>
      </div>
      <div class="mb-3">
        <label class="form-label" for="namedset_description">${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.description')}</label>
        <textarea class="form-control" data-testid="description-input" name="description" id="namedset_description" rows="5" placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.editDialog.description')}">${namedSet ? namedSet.description : ''}</textarea>
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
}
//# sourceMappingURL=StoreUtils.js.map