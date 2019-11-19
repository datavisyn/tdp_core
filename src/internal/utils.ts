import {randomId} from 'phovea_core/src';
import {ALL_ALL_NONE_NONE, ALL_ALL_READ_NONE, ALL_ALL_READ_READ, ANONYMOUS_USER, currentUser, decode, EPermission, ISecureItem, Permission, encode} from 'phovea_core/src/security';
import i18next from 'phovea_core/src/i18n';

const MIN = 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;

const areas: [number, string | ((d: number) => string)][] = [
  [-1, 'in the future'],
  [43, 'a few seconds ago'],
  [44, '44 seconds ago'],
  [89, 'a minute ago'],
  [44 * MIN, (d) => `${Math.ceil(d / MIN)} minutes ago`],
  [89 * MIN, 'an hour ago'],
  [21 * HOUR, (d) => `${Math.ceil(d / HOUR)} hours ago`],
  [35 * HOUR, 'a day ago'],
  [25 * DAY, (d) => `${Math.ceil(d / DAY)} days ago`],
  [45 * DAY, 'a month ago'],
  [319 * DAY, (d) => `${Math.ceil(d / DAY / 30)} months ago`],
  [547 * DAY, (d) => 'a year ago']
];

/**
 * see http://momentjs.com/docs/#/displaying/fromnow/
 * @param {Date} date
 */

export function fromNow(date: Date | number) {
  const now = Date.now();
  const deltaInSeconds = Math.floor((now - (typeof date === 'number' ? date : date.getTime())) / 1000);

  const area = areas.find((d) => deltaInSeconds <= d[0]);
  if (area) {
    const formatter = area[1];
    return typeof formatter === 'string' ? formatter : formatter(deltaInSeconds);
  }
  return 'far far away';
}

export function notAllowedText(notAllowed: boolean | string) {
  return (typeof notAllowed === 'string' ? notAllowed : i18next.t('tdp:core.utilsInternal.notAllowed'));
}


export interface IPermissionFormOptions {
  /**
   * extra html
   */
  extra: string;

  doc: Document;
}

/**
 * utilitly for adding a permission form as used in TDP by default
 * @param item
 */
export function permissionForm(item?: ISecureItem, options: Partial<IPermissionFormOptions> = {}) {
  const o: Readonly<IPermissionFormOptions> = Object.assign({
    extra: '',
    doc: document
  }, options);
  const user = currentUser();
  const roles = user ? user.roles : ANONYMOUS_USER.roles;

  const permission = decode(item ? item.permissions : ALL_ALL_READ_NONE);

  const id = randomId();
  const div = o.doc.createElement('div');
  div.classList.add('radio');
  div.innerHTML = `
    <label class="radio-inline">
      <input type="radio" name="permission_public" value="private" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-user"></i> ${i18next.t('tdp:core.utilsInternal.private')}
    </label>
    <label class="radio-inline">
      <input type="radio" name="permission_public" value="public" ${permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-users"></i> ${i18next.t('tdp:core.utilsInternal.publicMsg')}
    </label>
    <button type="button" name="permission_advanced" class="btn btn-default btn-xs pull-right">${i18next.t('tdp:core.utilsInternal.advanced')}</button>
    ${o.extra}
    <div class="tdp-permissions">
      <div class="tdp-permissions-entry">
        <label>${i18next.t('tdp:core.utilsInternal.public')}</label>
        <span></span>
        <div class="btn-group btn-group-xs" data-toggle="buttons">
          <label class="btn btn-primary ${!permission.others.has(EPermission.READ) ? 'active' : ''}">
            <input type="radio" name="permission_others" value="none" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-user"></i> ${i18next.t('tdp:core.utilsInternal.noPermission')}
          </label>
          <label class="btn btn-primary ${permission.others.has(EPermission.READ) && !permission.others.has(EPermission.WRITE) ? 'active' : ''}">
            <input type="radio" name="permission_others" value="read" autocomplete="off" ${permission.others.has(EPermission.READ) && !permission.others.has(EPermission.WRITE) ? 'checked' : ''}> <i class="fa fa-eye"></i> ${i18next.t('tdp:core.utilsInternal.read')}
          </label>
          <label class="btn btn-primary ${permission.others.has(EPermission.WRITE) ? 'active' : ''}">
            <input type="radio" name="permission_others" value="write" autocomplete="off" ${permission.others.has(EPermission.WRITE) ? 'checked' : ''}> <i class="fa fa-edit"></i> ${i18next.t('tdp:core.utilsInternal.write')}
          </label>
        </div>
      </div>
      <p class="help-block">
      ${i18next.t('tdp:core.utilsInternal.definePermissions')}
      </p>
      <div class="tdp-permissions-entry">
        <label for="permission_group_name_${id}">${i18next.t('tdp:core.utilsInternal.group')}</label>
        <select id="permission_group_name_${id}" name="permission_group_name" class="form-control input-sm">
          ${roles.map((d) => `<option value="${d}" ${item && item.group === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
        <div class="btn-group btn-group-xs" data-toggle="buttons">
          <label class="btn btn-primary ${!permission.group.has(EPermission.READ) ? 'active' : ''}">
            <input type="radio" name="permission_group" value="none" autocomplete="off" ${!permission.group.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-user"></i> ${i18next.t('tdp:core.utilsInternal.noPermission')}
          </label>
          <label class="btn btn-primary ${permission.group.has(EPermission.READ) && !permission.group.has(EPermission.WRITE) ? 'active' : ''}">
            <input type="radio" name="permission_group" value="read" autocomplete="off" ${permission.group.has(EPermission.READ) && !permission.group.has(EPermission.WRITE) ? 'checked' : ''}> <i class="fa fa-eye"></i> ${i18next.t('tdp:core.utilsInternal.read')}
          </label>
          <label class="btn btn-primary ${permission.group.has(EPermission.WRITE) ? 'active' : ''}">
            <input type="radio" name="permission_group" value="write" autocomplete="off" ${permission.group.has(EPermission.WRITE) ? 'checked' : ''}> <i class="fa fa-edit"></i> ${i18next.t('tdp:core.utilsInternal.write')}
          </label>
        </div>
      </div>
      <p class="help-block">
      ${i18next.t('tdp:core.utilsInternal.specifyRole')}
      </p>
      <div class="tdp-permissions-entry">
        <label for="permission_buddies_name_${id}">${i18next.t('tdp:core.utilsInternal.buddies')}</label>
        <input id="permission_buddies_name_${id}" name="permission_buddies_name" class="form-control input-sm" placeholder="${i18next.t('tdp:core.utilsInternal.buddiesPlaceholder')}" value="${item && item.buddies ? item.buddies.join(';') : ''}">
        <div class="btn-group btn-group-xs" data-toggle="buttons">
          <label class="btn btn-primary ${!permission.buddies.has(EPermission.READ) ? 'active' : ''}">
            <input type="radio" name="permission_buddies" value="none" autocomplete="off" ${!permission.buddies.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-user"></i> ${i18next.t('tdp:core.utilsInternal.noPermission')}
          </label>
          <label class="btn btn-primary ${permission.buddies.has(EPermission.READ) && !permission.buddies.has(EPermission.WRITE) ? 'active' : ''}">
            <input type="radio" name="permission_buddies" value="read" autocomplete="off" ${permission.buddies.has(EPermission.READ) && !permission.buddies.has(EPermission.WRITE) ? 'checked' : ''}> <i class="fa fa-eye"></i> ${i18next.t('tdp:core.utilsInternal.read')}
          </label>
          <label class="btn btn-primary ${permission.buddies.has(EPermission.WRITE) ? 'active' : ''}">
            <input type="radio" name="permission_buddies" value="write" autocomplete="off" ${permission.buddies.has(EPermission.WRITE) ? 'checked' : ''}> <i class="fa fa-edit"></i> ${i18next.t('tdp:core.utilsInternal.write')}
          </label>
        </div>
      </div>
      <p class="help-block">
      ${i18next.t('tdp:core.utilsInternal.buddiesDescription')}
      </p>
    </div>`;

  div.querySelector<HTMLElement>('button[name=permission_advanced]').onclick = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    div.classList.toggle('tdp-permissions-open');
    (<HTMLElement>evt.target).classList.toggle('active');
  };

  const publicSimple = Array.from(div.querySelectorAll<HTMLInputElement>('input[name=permission_public]'));
  const others = Array.from(div.querySelectorAll<HTMLInputElement>('input[name=permission_others]'));
  const group = Array.from(div.querySelectorAll<HTMLInputElement>('input[name=permission_group]'));
  const buddies = Array.from(div.querySelectorAll<HTMLInputElement>('input[name=permission_buddies]'));

  const syncActive = () => {
    others.forEach((d) => d.parentElement.classList.toggle('active', d.checked));
    group.forEach((d) => d.parentElement.classList.toggle('active', d.checked));
    buddies.forEach((d) => d.parentElement.classList.toggle('active', d.checked));
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
        permissions: encode(new Set([EPermission.READ, EPermission.WRITE, EPermission.EXECUTE]), group, others, buddies),
        group: groupName,
        buddies: buddiesName
      };
    }
  };
}
