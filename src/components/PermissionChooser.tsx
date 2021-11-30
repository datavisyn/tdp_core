import * as React from 'react';
import { uniqueId } from 'lodash';
import { EPermission, Permission, UserUtils } from '../security';
import { I18nextManager } from '../i18n';
import { UserSession } from '../app';

function PermissionsEntry({
  permission,
  setPermission,
  setGetter,
}: {
  permission: Permission;
  setPermission: (permission: Permission) => void;
  setGetter: (permission: Permission) => Set<EPermission>;
}) {
  const id = React.useMemo(() => uniqueId('PermissionsEntry'), []);

  return (
    <div className="btn-group col-sm-auto" role="group">
      <input
        type="radio"
        className="btn-check"
        name={`permission_${id}`}
        id={`btnradio_permissions_${id}_none`}
        autoComplete="off"
        checked={!setGetter(permission).has(EPermission.READ)}
        onChange={() => {
          const p = permission.clone();
          setGetter(p).clear();
          setPermission(p);
        }}
      />
      <label htmlFor={`btnradio_permissions_${id}_none`} className="form-label btn btn-outline-secondary btn-sm">
        <i className="fas fa-ban"></i> {I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.noPermission')}
      </label>
      <input
        type="radio"
        className="btn-check"
        name={`permission_${id}`}
        id={`btnradio_permissions_${id}_read`}
        autoComplete="off"
        checked={setGetter(permission).has(EPermission.READ) && !setGetter(permission).has(EPermission.WRITE)}
        onChange={() => {
          const p = permission.clone();
          setGetter(p).clear();
          setGetter(p).add(EPermission.READ);
          setPermission(p);
        }}
      />
      <label htmlFor={`btnradio_permissions_${id}_read`} className="form-label btn btn-outline-secondary btn-sm">
        <i className="fas fa-eye"></i> {I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.read')}
      </label>
      <input
        type="radio"
        className="btn-check"
        name={`permission_${id}`}
        id={`btnradio_permissions_${id}_write`}
        autoComplete="off"
        checked={setGetter(permission).has(EPermission.WRITE)}
        onChange={() => {
          const p = permission.clone();
          setGetter(p).clear();
          setGetter(p).add(EPermission.READ);
          setGetter(p).add(EPermission.WRITE);
          setPermission(p);
        }}
      />
      <label htmlFor={`btnradio_permissions_${id}_write`} className="form-label btn btn-outline-secondary btn-sm">
        <i className="fas fa-edit"></i> {I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.write')}
      </label>
    </div>
  );
}

export function PermissionChooser({
  permission,
  buddies,
  group,
  setPermission,
  setBuddies,
  setGroup,
  extra = null,
}: {
  permission: Permission;
  buddies: string[];
  group: string;
  setPermission: (permission: Permission) => void;
  setBuddies: (buddies: string[]) => void;
  setGroup: (group: string) => void;
  extra?: React.ReactNode;
}) {
  const id = React.useMemo(() => uniqueId('PermissionChooser'), []);
  const user = UserSession.getInstance().currentUser();
  const roles = user ? user.roles : UserUtils.ANONYMOUS_USER.roles;
  const [advancedOpen, setAdvancedOpen] = React.useState<boolean>(false);

  return (
    <>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          name="permission_public"
          id={`global_permission_private_${id}`}
          checked={!permission.others.has(EPermission.READ)}
          onChange={() => {
            const p = permission.clone();
            p.others.clear();
            setPermission(p);
          }}
        />
        <label className="form-label form-check-label" htmlFor={`global_permission_private_${id}`}>
          {' '}
          <i className="fas fa-user"></i> {I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.private')}
        </label>
      </div>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          name="permission_public"
          id={`global_permission_public_${id}`}
          checked={permission.others.has(EPermission.READ)}
          onChange={() => {
            const p = permission.clone();
            p.others.clear();
            p.others.add(EPermission.READ);
            setPermission(p);
          }}
        />
        <label className="form-label form-check-label" htmlFor={`global_permission_public_${id}`}>
          <i className="fas fa-users"></i> {I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.publicMsg')}
        </label>
      </div>

      <button type="button" name="permission_advanced" className="btn btn-outline-secondary btn-sm float-end" onClick={() => setAdvancedOpen((o) => !o)}>
        {I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.advanced')}
      </button>
      {extra}
      <div className={advancedOpen ? 'd-block' : 'd-none'}>
        <div className="tdp-permissions-entry row d-flex align-items-center mt-1">
          <label className="form-label col-sm-auto ps-2">{I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.public')}</label>
          <span></span>
          <PermissionsEntry permission={permission} setPermission={setPermission} setGetter={(p) => p.others} />
        </div>

        <p className="form-text">{I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.definePermissions')}</p>

        <div className="tdp-permissions-entry row d-flex align-items-center mt-1">
          <label className="form-label col-sm-auto ps-2" htmlFor={`permission_group_name_${id}`}>
            {I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.group')}
          </label>
          <select
            id={`permission_group_name_${id}`}
            name="permission_group_name"
            className="form-select form-select-sm"
            value={group}
            onChange={(e) => setGroup(e.currentTarget.value)}
          >
            <option value="">None</option>
            {roles.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <PermissionsEntry permission={permission} setPermission={setPermission} setGetter={(p) => p.group} />
        </div>

        <p className="form-text">{I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.specifyRole')}</p>

        <div className="tdp-permissions-entry row d-flex align-items-center mt-1">
          <label className="form-label col-sm-auto ps-2" htmlFor={`permission_buddies_name_${id}`}>
            {I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.buddies')}
          </label>
          <input
            id={`permission_buddies_name_${id}`}
            name="permission_buddies_name"
            className="form-control form-control-sm"
            placeholder={I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.buddiesPlaceholder')}
            value={buddies.join(';')}
            onChange={(e) => setBuddies(e.currentTarget.value.split(';'))}
          />
          <PermissionsEntry permission={permission} setPermission={setPermission} setGetter={(p) => p.buddies} />
        </div>
        <p className="form-text">{I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.buddiesDescription')}</p>
      </div>
    </>
  );
}
