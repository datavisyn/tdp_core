import {randomId} from 'phovea_core/src';
import {ALL_ALL_NONE_NONE, ALL_ALL_READ_NONE, ALL_ALL_READ_READ, ANONYMOUS_USER, currentUser, decode, EPermission, ISecureItem} from 'phovea_core/src/security';

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
  return (typeof notAllowed === 'string' ? notAllowed : 'Not Allowed, please contact your system administrator');
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
      <input type="radio" name="permission_public" value="private" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-user"></i> Private
    </label>
    <label class="radio-inline">
      <input type="radio" name="permission_public" value="public" ${permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-users"></i> Public (everybody can see and use it)
    </label>
    <button type="button" name="permission_advanced" class="btn btn-default btn-xs pull-right">Advanced</button>
    ${o.extra}
    <div class="tdp-permissions">
      <div class="tdp-permissions-entry">
        <label>Public</label>
        <span></span>
        <div class="btn-group btn-group-xs" data-toggle="buttons">
          <label class="btn btn-primary ${!permission.others.has(EPermission.READ)} ? 'active' : ''">
            <input type="radio" name="permission_public" value="none" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-user"></i> Private
          </label>
          <label class="btn btn-primary ${permission.others.has(EPermission.READ)} ? 'active' : ''">
            <input type="radio" name="permission_public" value="read" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-eye"></i> Read
          </label>
          <label class="btn btn-primary ${permission.others.has(EPermission.WRITE)} ? 'active' : ''">
            <input type="radio" name="permission_public" value="write" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-edit"></i> Write
          </label>
        </div>
      </div>
      <p class="help-block">
        define which are the default permissions for other users to access this item
      </p>
      <div class="tdp-permissions-entry">
        <label for="permission_group_name_${id}">Group</label>
        <select id="permission_group_name_${id}" name="permission_group_name" class="form-control input-sm">
          ${roles.map((d) => `<option value="${d}" ${item && item.group === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
        <div class="btn-group btn-group-xs" data-toggle="buttons">
          <label class="btn btn-primary ${!permission.others.has(EPermission.READ)} ? 'active' : ''">
            <input type="radio" name="permission_group" value="none" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-user"></i> Private
          </label>
          <label class="btn btn-primary ${!permission.others.has(EPermission.READ)} ? 'active' : ''">
            <input type="radio" name="permission_group" value="read" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-eye"></i> Read
          </label>
          <label class="btn btn-primary ${!permission.others.has(EPermission.READ)} ? 'active' : ''">
            <input type="radio" name="permission_group" value="write" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-edit"></i> Write
          </label>
        </div>
      </div>
      <p class="help-block">
        specify a group / role which you are part of that should have extra rights, such as a group of administrators
      </p>
      <div class="tdp-permissions-entry">
        <label for="permission_buddies_name_${id}">Buddies</label>
        <input id="permission_buddies_name_${id}" name="permission_buddies_name" class="form-control input-sm" placeholder="list of usernames separated by semicolon" value="${item && item.buddies ? item.buddies.join(';') : ''}">
        <div class="btn-group btn-group-xs" data-toggle="buttons">
          <label class="btn btn-primary ${!permission.others.has(EPermission.READ)} ? 'active' : ''">
            <input type="radio" name="permission_buddies" value="none" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-user"></i> Private
          </label>
          <label class="btn btn-primary ${!permission.others.has(EPermission.READ)} ? 'active' : ''">
            <input type="radio" name="permission_buddies" value="read" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-eye"></i> Read
          </label>
          <label class="btn btn-primary ${!permission.others.has(EPermission.READ)} ? 'active' : ''">
            <input type="radio" name="permission_buddies" value="write" autocomplete="off" ${!permission.others.has(EPermission.READ) ? 'checked' : ''}> <i class="fa fa-edit"></i> Write
          </label>
        </div>
      </div>
      <p class="help-block">
        Buddies are a list of user names that can have advanced rights, such as backup administrators
      </p>
    </div>`;

  div.querySelector<HTMLElement>('button[name=permission_advanced]').onclick = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    div.classList.toggle('tdp-permissions-open');
  };

  return {
    node: div,
    resolve: (data: FormData): Partial<ISecureItem> => {
      const makePublic = data.get('permission_public').toString();
      return {
        permissions: makePublic === 'public' ? ALL_ALL_READ_READ : ALL_ALL_NONE_NONE
      };
    }
  };
}
