import {IProvenanceGraphDataDescription, I18nextManager, EEntity, ISecureItem, UserSession, BaseUtils} from 'phovea_core';
import {DialogUtils} from '../base/dialogs';
import {TDPApplicationUtils} from './TDPApplicationUtils';

export class ProvenanceGraphMenuUtils {

    public static GLOBAL_EVENT_MANIPULATED = 'provenanceGraphMenuManipulated';

    static isPersistent(d: IProvenanceGraphDataDescription) {
        return d.local === false || d.local === undefined;
      }

      static persistProvenanceGraphMetaData(d: IProvenanceGraphDataDescription) {
        const name = d.name.startsWith('Temporary') ? `Persistent ${d.name.slice(10)}` : d.name;
        return ProvenanceGraphMenuUtils.editProvenanceGraphMetaData(d, {
          title: `<i class="fa fa-cloud"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.persistSession')}`,
          button: `<i class="fa fa-cloud"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.persist')}`,
          name
        });
      }

      static isPublic(d: ISecureItem) {
        return UserSession.getInstance().hasPermission(d, EEntity.OTHERS);
      }

      static editProvenanceGraphMetaData(d: IProvenanceGraphDataDescription, args: {button?: string, title?: string, permission?: boolean, name?: string} = {}) {
        args = BaseUtils.mixin({
          button: 'Edit',
          title: `<i class="fa fa-edit" aria-hidden="true"></i>${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.editSessionDetails')}`,
          permission: true,
          name: d.name
        }, args);
        return import('phovea_ui/dist/components/dialogs').then(({FormDialog}) => {
          const dialog = new FormDialog(args.title, args.button);
          const prefix = 'd' + BaseUtils.randomId();
          const permissions = TDPApplicationUtils.permissionForm(d, {
            extra: `<div class="help-block">
            ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.isPublicMessage')}
          </div>`
          });
          dialog.form.innerHTML = `
              <div class="form-group">
                <label for="${prefix}_name">${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.name')}</label>
                <input type="text" class="form-control" id="${prefix}_name" value="${args.name}" required="required">
              </div>
              <div class="form-group">
                <label for="${prefix}_desc">${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.description')}</label>
                <textarea class="form-control" id="${prefix}_desc" rows="3">${d.description || ''}</textarea>
              </div>
              <div class="checkbox">
                <label class="radio-inline">
                  <input type="checkbox" name="${prefix}_agree" required="required">
                  ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.confirmMessage')} <strong>'${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.openExisting')}'</strong> ${I18nextManager.getInstance().i18n.t('tdp:core.EditProvenanceMenu.dialog')}.
                </label>
              </div>
          `;
          dialog.form.lastElementChild!.insertAdjacentElement('beforebegin', permissions.node);
          return new Promise((resolve) => {
            dialog.onHide(() => {
              resolve(null);
            });
            dialog.onSubmit(() => {
              const extras = Object.assign({
                name: (<HTMLInputElement>dialog.body.querySelector(`#${prefix}_name`)).value,
                description: (<HTMLTextAreaElement>dialog.body.querySelector(`#${prefix}_desc`)).value,
              }, args.permission ? permissions.resolve(new FormData(dialog.form)) : d.permissions);
              resolve(extras);
              dialog.hide();
              return false;
            });
            dialog.show();
          });
        });
    }
}
