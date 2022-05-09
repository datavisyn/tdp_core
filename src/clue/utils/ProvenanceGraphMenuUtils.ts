import { merge, uniqueId } from 'lodash';
import { UserSession } from '../../app';
import { PHOVEA_UI_FormDialog } from '../../components';
import { I18nextManager } from '../../i18n';
import { IProvenanceGraphDataDescription } from '../provenance';
import { ISecureItem, EEntity } from '../../security';
import { TDPApplicationUtils } from '../../utils/TDPApplicationUtils';

export class ProvenanceGraphMenuUtils {
  public static GLOBAL_EVENT_MANIPULATED = 'provenanceGraphMenuManipulated';

  static isPersistent(d: IProvenanceGraphDataDescription) {
    return d.local === false || d.local === undefined;
  }

  static persistProvenanceGraphMetaData(d: IProvenanceGraphDataDescription) {
    const name = d.name.startsWith('Temporary') ? `Saved ${d.name.slice(10)}` : d.name;
    return ProvenanceGraphMenuUtils.editProvenanceGraphMetaData(d, {
      title: `<i class="fas fa-cloud"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.saveSession')}`,
      button: `<i class="fas fa-cloud"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.save')}`,
      name,
    });
  }

  static isPublic(d: ISecureItem) {
    return UserSession.getInstance().hasPermission(d, EEntity.OTHERS);
  }

  static editProvenanceGraphMetaData(d: IProvenanceGraphDataDescription, args: { button?: string; title?: string; permission?: boolean; name?: string } = {}) {
    args = merge(
      {
        button: I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.save'),
        title: `<i class="fas fa-edit" aria-hidden="true"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.editSessionDetails')}`,
        permission: true,
        name: d.name,
      },
      args,
    );
    const dialog = new PHOVEA_UI_FormDialog(args.title, args.button, undefined, 'modal-lg');
    const prefix = `d${uniqueId()}`;
    const permissions = TDPApplicationUtils.permissionForm(d, {
      extra: `<div class="form-text">
          ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.isPublicMessage')}
        </div>`,
    });
    dialog.form.innerHTML = `
            <div class="mb-3">
              <label class="form-label" for="${prefix}_name">${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.name')}</label>
              <input type="text" class="form-control" data-testid="name-input" id="${prefix}_name" value="${args.name}" required="required">
            </div>
            <div class="mb-3">
              <label class="form-label" for="${prefix}_desc">${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.description')}</label>
              <textarea class="form-control" data-testid="description-textarea" id="${prefix}_desc" rows="3">${d.description || ''}</textarea>
            </div>
            <div class="mb-3">
              <div class="checkbox form-check">
                <input type="checkbox" data-testid="agree-input" id="${prefix}_agree" name="${prefix}_agree" required="required" class="form-check-input">
                <label class="form-label radio-inline form-check-label" for="${prefix}_agree">${I18nextManager.getInstance().i18n.t(
      'tdp:core.EditProvenanceMenu.confirmMessage',
    )} <strong>'${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.openExisting')}'</strong> ${I18nextManager.getInstance().i18n.t(
      'tdp:core.EditProvenanceMenu.dialog',
    )}.</label>
              </div>
            </div>
        `;
    dialog.form.lastElementChild!.insertAdjacentElement('beforebegin', permissions.node);
    return new Promise((resolve) => {
      dialog.onHide(() => {
        resolve(null);
      });
      dialog.onSubmit(() => {
        const extras = {
          name: (<HTMLInputElement>dialog.body.querySelector(`#${prefix}_name`)).value,
          description: (<HTMLTextAreaElement>dialog.body.querySelector(`#${prefix}_desc`)).value,
          ...(args.permission ? permissions.resolve(new FormData(dialog.form)) : { permissions: d.permissions, group: d.group, buddies: d.buddies }),
        };
        resolve(extras);
        dialog.hide();
        return false;
      });
      dialog.show();
    });
  }
}
