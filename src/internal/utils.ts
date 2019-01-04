import {ISecureItem, hasPermission, EEntity, ALL_READ_NONE, ALL_READ_READ, ALL_NONE_NONE, ALL_ALL_NONE_NONE, ALL_ALL_READ_READ, decode} from 'phovea_core/src/security';

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
}

/**
 * utilitly for adding a permission form as used in TDP by default
 * @param item
 */
export function permissionForm(item?: ISecureItem, options: Partial<IPermissionFormOptions> = {}) {
  const o: Readonly<IPermissionFormOptions> = Object.assign({
    extra: ''
  }, options);
  return {
    template: `
    <div class="radio">
      <label class="radio-inline">
        <input type="radio" name="permission_public" value="private" ${!(item && hasPermission(item, EEntity.OTHERS)) ? 'checked="checked"' : ''}> <i class="fa fa-user"></i> Private
      </label>
      <label class="radio-inline">
        <input type="radio" name="permission_public" value="public" ${item && hasPermission(item, EEntity.OTHERS) ? 'checked="checked"' : ''}> <i class="fa fa-users"></i> Public (everybody can see and use it)
      </label>
      ${o.extra}
    </div>
    `,
    resolve: (data: FormData): Partial<ISecureItem> => {
      const makePublic = data.get('permission_public').toString();
      return {
        permissions: makePublic === 'public' ? ALL_ALL_READ_READ : ALL_ALL_NONE_NONE
      };
    }
  };
}

const per = decode();
const a =
`<div class="tdp-permissions">
  <div>
    <label>Public</label>
    <span></span>
    <div class="btn-group" data-toggle="buttons">
      <label class="btn btn-primary active">
        <input type="radio" name="permission_public" value="none" autocomplete="off" checked> <i class="fa fa-user"></i> Private
      </label>
      <label class="btn btn-primary">
        <input type="radio" name="permission_public" value="read" autocomplete="off"> <i class="fa fa-eye"></i> Read
      </label>
      <label class="btn btn-primary">
        <input type="radio" name="permission_public" value="write" autocomplete="off"> <i class="fa fa-edit"></i> Write
      </label>
    </div>
    <p class="help-block">
      define which are the default permissions for other users to access this item
    </p>
  </div>
  <div>
     <label>Group</label>
     <select name="permission_group_name" class="form-control">
     </select
     <div class="btn-group" data-toggle="buttons">
       <label class="btn btn-primary active">
         <input type="radio" name="permission_group" value="none" autocomplete="off" checked> <i class="fa fa-user"></i> Private
       </label>
       <label class="btn btn-primary">
         <input type="radio" name="permission_group" value="read" autocomplete="off"> <i class="fa fa-eye"></i> Read
       </label>
       <label class="btn btn-primary">
         <input type="radio" name="permission_group" value="write" autocomplete="off"> <i class="fa fa-edit"></i> Write
       </label>
     </div>
     <p class="help-block">
       specify a group / role which you are part of that should extra rights, such as a group of administrators
     </p>
  </div>
  <div>
    <label>Buddies</label>
    <input name="permission_buddies_name" class="form-control">
    <div class="btn-group" data-toggle="buttons">
      <label class="btn btn-primary active">
        <input type="radio" name="permission_buddies" value="none" autocomplete="off" checked> <i class="fa fa-user"></i> Private
      </label>
      <label class="btn btn-primary">
        <input type="radio" name="permission_buddies" value="read" autocomplete="off"> <i class="fa fa-eye"></i> Read
      </label>
      <label class="btn btn-primary">
        <input type="radio" name="permission_buddies" value="write" autocomplete="off"> <i class="fa fa-edit"></i> Write
      </label>
    </div>
    <p class="help-block">
      Buddies are a list of user names that can have advanced rights, such as backup administrators
    </p>
  </div>
`
