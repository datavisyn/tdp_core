import {BaseUtils, I18nextManager, Permission, UserSession, EPermission, ISecureItem, UserUtils, IObjectRef, ActionUtils, ActionMetaData, ObjectRefUtils, ProvenanceGraph, ActionNode} from 'phovea_core';
import {Compression} from 'phovea_clue';


export interface IPermissionFormOptions {
  /**
   * extra html
   */
  extra: string;

  doc: Document;
}

export interface IParameterAble {
  getParameter(name: string): any;

  setParameterImpl(name: string, value: any);
}

export class TDPApplicationUtils {

  static readonly MIN = 60;
  static readonly HOUR = TDPApplicationUtils.MIN * 60;
  static readonly DAY = TDPApplicationUtils.HOUR * 24;
  //old name
  static readonly CMD_INIT_SESSION = 'tdpInitSession';
  static readonly CMD_SET_PARAMETER = 'tdpSetParameter';

  static readonly getAreas: () => [number, string | ((d: number) => string)][] = () => {
    return [
      [-1, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.future')],
      [43, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.fewSecondsAgo')],
      [44, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.secondsAgo')],
      [89, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.minute')],
      [44 * TDPApplicationUtils.MIN, (d) => I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.minute', {count: Math.ceil(d / TDPApplicationUtils.MIN)})],
      [89 * TDPApplicationUtils.MIN, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.hour')],
      [21 * TDPApplicationUtils.HOUR, (d) => I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.hour', {count: Math.ceil(d / TDPApplicationUtils.HOUR)})],
      [35 * TDPApplicationUtils.HOUR, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.day')],
      [25 * TDPApplicationUtils.DAY, (d) => I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.day', {count: Math.ceil(d / TDPApplicationUtils.DAY)})],
      [45 * TDPApplicationUtils.DAY, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.month')],
      [319 * TDPApplicationUtils.DAY, (d) => I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.month', {count: Math.ceil(d / TDPApplicationUtils.DAY / 30)})],
      [547 * TDPApplicationUtils.DAY, (d) => I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.year')]
    ];
  }

  /**
   * see http://momentjs.com/docs/#/displaying/fromnow/
   * @param {Date} date
   */

  static fromNow(date: Date | number) {
    const now = Date.now();
    const deltaInSeconds = Math.floor((now - (typeof date === 'number' ? date : date.getTime())) / 1000);

    const area = TDPApplicationUtils.getAreas().find((d) => deltaInSeconds <= d[0]);
    if (area) {
      const formatter = area[1];
      return typeof formatter === 'string' ? formatter : formatter(deltaInSeconds);
    }
    return I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.farAway');
  }

  static notAllowedText(notAllowed: boolean | string) {
    return (typeof notAllowed === 'string' ? notAllowed : I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.notAllowed'));
  }

  /**
   * utilitly for adding a permission form as used in TDP by default
   * @param item
   */
  static permissionForm(item?: ISecureItem, options: Partial<IPermissionFormOptions> = {}) {
    const o: Readonly<IPermissionFormOptions> = Object.assign({
      extra: '',
      doc: document
    }, options);
    const user = UserSession.getInstance().currentUser();
    const roles = user ? user.roles : UserUtils.ANONYMOUS_USER.roles;

    const permission = Permission.decode(item ? item.permissions : Permission.ALL_ALL_READ_NONE);

    const id = BaseUtils.randomId();
    const div = o.doc.createElement('div');
    div.classList.add('mb-3');
    div.innerHTML = `
      <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="permission_public" id="global_permission_private_${id}" value="private" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}>
          <label class="form-label form-check-label" for="global_permission_private_${id}"> <i class="fas fa-user"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.private')}</label>
      </div>
      <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="permission_public" id="global_permission_public_${id}" value="public" ${permission.others.has(EPermission.READ) ? 'checked' : ''}>
          <label class="form-label form-check-label" for="global_permission_public_${id}"><i class="fas fa-users"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.publicMsg')}</label>
      </div>

      <button type="button" name="permission_advanced" class="btn btn-outline-secondary btn-sm float-end">${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.advanced')}</button>
      ${o.extra}
      <div class="tdp-permissions">
        <div class="tdp-permissions-entry row d-flex align-items-center">
          <label class="form-label col-sm-auto ps-2">${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.public')}</label>
          <span></span>
          <div class="btn-group col-sm-auto" role="group">
            <input type="radio" class="btn-check" name="permission_others" id="btnradio_permissions_public_${id}_none" value="none" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}>
            <label for="btnradio_permissions_public_${id}_none" class="form-label btn btn-outline-secondary btn-sm">
               <i class="fas fa-user"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.noPermission')}
            </label>
            <input type="radio" class="btn-check" name="permission_others" id="btnradio_permissions_public_${id}_read" value="read" autocomplete="off" ${permission.others.has(EPermission.READ) && !permission.others.has(EPermission.WRITE) ? 'checked' : ''}>
            <label for="btnradio_permissions_public_${id}_read" class="form-label btn btn-outline-secondary btn-sm">
               <i class="fas fa-eye"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.read')}
            </label>
            <input type="radio" class="btn-check" name="permission_others" id="btnradio_permissions_public_${id}_write" value="write" autocomplete="off" ${permission.others.has(EPermission.WRITE) ? 'checked' : ''}>
            <label for="btnradio_permissions_public_${id}_write" class="form-label btn btn-outline-secondary btn-sm">
              <i class="fas fa-edit"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.write')}
            </label>
          </div>
        </div>
        <p class="form-text">
        ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.definePermissions')}
        </p>
        <div class="tdp-permissions-entry row">
          <label class="form-label col-sm-auto ps-2" for="permission_group_name_${id}">${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.group')}</label>
          <select id="permission_group_name_${id}" name="permission_group_name" class="form-select form-select-sm">
            ${roles.map((d) => `<option value="${d}" ${item && item.group === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
          <div class="btn-group col-sm-auto" role="group">
          <input type="radio" class="btn-check" name="permission_group" id="btnradio_permissions_group_${id}_none" value="none" autocomplete="off" ${!permission.group.has(EPermission.READ) ? 'checked' : ''}>
            <label for="btnradio_permissions_group_${id}_none" class="form-label btn btn-outline-secondary btn-sm">
              <i class="fas fa-user"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.noPermission')}
            </label>
            <input type="radio" class="btn-check" name="permission_group" id="btnradio_permissions_group_${id}_read" value="read" autocomplete="off" ${permission.group.has(EPermission.READ) && !permission.group.has(EPermission.WRITE) ? 'checked' : ''}>
            <label for="btnradio_permissions_group_${id}_read" class="form-label btn btn-outline-secondary btn-sm">
               <i class="fas fa-eye"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.read')}
            </label>
            <input type="radio" class="btn-check" name="permission_group" id="btnradio_permissions_group_${id}_write" value="write" autocomplete="off" ${permission.group.has(EPermission.WRITE) ? 'checked' : ''}>
            <label for="btnradio_permissions_group_${id}_write" class="form-label btn btn-outline-secondary btn-sm">
               <i class="fas fa-edit"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.write')}
            </label>
          </div>
        </div>
        <p class="form-text">
        ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.specifyRole')}
        </p>
        <div class="tdp-permissions-entry row">
          <label class="form-label col-sm-auto ps-2" for="permission_buddies_name_${id}">${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.buddies')}</label>
          <input id="permission_buddies_name_${id}" name="permission_buddies_name" class="form-control form-control-sm" placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.buddiesPlaceholder')}" value="${item && item.buddies ? item.buddies.join(';') : ''}">
          <div class="btn-group col-sm-auto" role="group">
            <input type="radio" class="btn-check" name="permission_buddies" id="btnradio_permissions_buddies_${id}_none" value="none" autocomplete="off" ${!permission.buddies.has(EPermission.READ) ? 'checked' : ''}>
            <label for="btnradio_permissions_buddies_${id}_none" class="form-label btn btn-outline-secondary btn-sm">
               <i class="fas fa-user"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.noPermission')}
            </label>
            <input type="radio" class="btn-check" name="permission_buddies" id="btnradio_permissions_buddies_${id}_read" value="read" autocomplete="off" ${permission.buddies.has(EPermission.READ) && !permission.buddies.has(EPermission.WRITE) ? 'checked' : ''}>
            <label for="btnradio_permissions_buddies_${id}_read" class="form-label btn btn-outline-secondary btn-sm">
               <i class="fas fa-eye"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.read')}
            </label>
            <input type="radio" class="btn-check" name="permission_buddies" id="btnradio_permissions_buddies_${id}_write" value="write" autocomplete="off" ${permission.buddies.has(EPermission.WRITE) ? 'checked' : ''}>
            <label for="btnradio_permissions_buddies_${id}_write" class="form-label btn btn-outline-secondary btn-sm">
               <i class="fas fa-edit"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.write')}
            </label>
          </div>
        </div>
        <p class="form-text">
        ${I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.buddiesDescription')}
        </p>
      </div>`;

    div.querySelector<HTMLElement>('button[name=permission_advanced]').onclick = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      div.classList.toggle('tdp-permissions-open');
      (<HTMLElement>evt.target).toggleAttribute('checked', true);
    };

    const publicSimple = Array.from(div.querySelectorAll<HTMLInputElement>('input[name=permission_public]'));
    const others = Array.from(div.querySelectorAll<HTMLInputElement>('input[name=permission_others]'));
    const group = Array.from(div.querySelectorAll<HTMLInputElement>('input[name=permission_group]'));
    const buddies = Array.from(div.querySelectorAll<HTMLInputElement>('input[name=permission_buddies]'));

    const syncActive = () => {
      others.forEach((d) => d.parentElement.toggleAttribute('checked', d.checked));
      group.forEach((d) => d.parentElement.toggleAttribute('checked', d.checked));
      buddies.forEach((d) => d.parentElement.toggleAttribute('checked', d.checked));
    };

    publicSimple.forEach((d) => {
      d.onchange = () => {
        if (!d.checked) {
          return;
        }
        // sync with others
        const target = d.value === 'public' ? 'read' : 'none';
        others.forEach((o) => o.checked = o.value === target);
        const groupSelected = group.find((d) => d.checked);
        if (groupSelected && groupSelected.value === 'none') {
          group.forEach((i) => i.checked = i.value === target);
        }
        const buddiesSelected = buddies.find((d) => d.checked);
        if (buddiesSelected && buddiesSelected.value === 'none') {
          buddies.forEach((d) => d.checked = d.value === target);
        }
        syncActive();
      };
    });
    others.forEach((clicked) => {
      clicked.onchange = () => {
        if (!clicked.checked) {
          return;
        }
        // sync with public
        {
          const target = clicked.value === 'none' ? 'private' : 'public';
          publicSimple.forEach((o) => o.checked = o.value === target);
        }
        // others at least with the same right
        if (clicked.value === 'read' || clicked.value === 'write') {
          const groupSelected = group.find((d) => d.checked);
          if (groupSelected && (groupSelected.value === 'none' || (groupSelected.value === 'read' && clicked.value === 'write'))) {
            group.forEach((i) => i.checked = i.value === clicked.value);
          }
          const buddiesSelected = buddies.find((d) => d.checked);
          if (buddiesSelected && (buddiesSelected.value === 'none' || (buddiesSelected.value === 'read' && clicked.value === 'write'))) {
            buddies.forEach((d) => d.checked = d.value === clicked.value);
          }
        }
        syncActive();
      };
    });

    const toSet = (value: string) => {
      if (value === 'read') {
        return new Set([EPermission.READ]);
      } else if (value === 'write') {
        return new Set([EPermission.READ, EPermission.WRITE]);
      }
      return new Set();
    };

    return {
      node: div,
      resolve: (data: FormData): Partial<ISecureItem> => {
        const others = toSet(data.get('permission_others').toString());
        const group = toSet(data.get('permission_group').toString());
        const groupName = data.get('permission_group_name').toString();
        const buddies = toSet(data.get('permission_buddies').toString());
        const buddiesName = data.get('permission_buddies_name').toString().split(';').map((d) => d.trim()).filter((d) => d.length > 0);
        return {
          permissions: Permission.encode(new Set([EPermission.READ, EPermission.WRITE, EPermission.EXECUTE]), <Set<EPermission>>group, <Set<EPermission>>others, <Set<EPermission>>buddies),
          group: groupName,
          buddies: buddiesName
        };
      }
    };
  }

  /**
   * Get key-value pairs from `parameters` and persist them in the session storage
   * @param _inputs
   * @param parameters
   */
  static initSessionImpl(_inputs: IObjectRef<any>[], parameters: object) {
    const old = {};
    // clear the session as part of it?
    Object.keys(parameters).forEach((key) => {
      old[key] = UserSession.getInstance().retrieve(key, null);
      const value = parameters[key];
      if (value !== null) {
        UserSession.getInstance().store(key, parameters[key]);
      }
    });
    return {
      inverse: TDPApplicationUtils.initSession(old)
    };
  }

  static initSession(map: object) {
    return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.initializeSession'), ObjectRefUtils.category.custom, ObjectRefUtils.operation.update), TDPApplicationUtils.CMD_INIT_SESSION, TDPApplicationUtils.initSessionImpl, [], map);
  }

  static async setParameterImpl(inputs: IObjectRef<any>[], parameter, graph: ProvenanceGraph) {
    const view: IParameterAble = await inputs[0].v;
    const name = parameter.name;
    const value = parameter.value;
    const previousValue = parameter.previousValue === undefined ? view.getParameter(name) : parameter.previousValue;
    view.setParameterImpl(name, value);
    return {
      inverse: TDPApplicationUtils.setParameter(inputs[0], name, previousValue, value)
    };
  }

  static setParameter(view: IObjectRef<IParameterAble>, name: string, value: any, previousValue: any) {
    //assert view
    return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.setParameter', {name}), ObjectRefUtils.category.visual, ObjectRefUtils.operation.update), TDPApplicationUtils.CMD_SET_PARAMETER, TDPApplicationUtils.setParameterImpl, [view], {
      name,
      value,
      previousValue
    });
  }

  static compressSetParameter(path: ActionNode[]) {
    return Compression.lastOnly(path, TDPApplicationUtils.CMD_SET_PARAMETER, (p: ActionNode) => `${p.requires[0].id}_${p.parameter.name}`);
  }


  /**
   * @deprecated
   */
  static compressSetParameterOld(path: ActionNode[]) {
    return Compression.lastOnly(path, 'targidSetParameter', (p: ActionNode) => `${p.requires[0].id}_${p.parameter.name}`);
  }
}
