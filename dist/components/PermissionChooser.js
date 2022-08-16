import * as React from 'react';
import { uniqueId } from 'lodash';
import { EPermission, UserUtils } from '../security';
import { I18nextManager } from '../i18n';
import { UserSession } from '../app';
function PermissionsEntry({ permission, setPermission, setGetter, }) {
    const id = React.useMemo(() => uniqueId('PermissionsEntry'), []);
    return (React.createElement("div", { className: "btn-group col-sm-auto", role: "group" },
        React.createElement("input", { type: "radio", className: "btn-check", name: `permission_${id}`, id: `btnradio_permissions_${id}_none`, autoComplete: "off", checked: !setGetter(permission).has(EPermission.READ), onChange: () => {
                const p = permission.clone();
                setGetter(p).clear();
                setPermission(p);
            } }),
        React.createElement("label", { htmlFor: `btnradio_permissions_${id}_none`, className: "form-label btn btn-outline-secondary btn-sm" },
            React.createElement("i", { className: "fas fa-ban" }),
            " ",
            I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.noPermission')),
        React.createElement("input", { type: "radio", className: "btn-check", name: `permission_${id}`, id: `btnradio_permissions_${id}_read`, autoComplete: "off", checked: setGetter(permission).has(EPermission.READ) && !setGetter(permission).has(EPermission.WRITE), onChange: () => {
                const p = permission.clone();
                setGetter(p).clear();
                setGetter(p).add(EPermission.READ);
                setPermission(p);
            } }),
        React.createElement("label", { htmlFor: `btnradio_permissions_${id}_read`, className: "form-label btn btn-outline-secondary btn-sm" },
            React.createElement("i", { className: "fas fa-eye" }),
            " ",
            I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.read')),
        React.createElement("input", { type: "radio", className: "btn-check", name: `permission_${id}`, id: `btnradio_permissions_${id}_write`, autoComplete: "off", checked: setGetter(permission).has(EPermission.WRITE), onChange: () => {
                const p = permission.clone();
                setGetter(p).clear();
                setGetter(p).add(EPermission.READ);
                setGetter(p).add(EPermission.WRITE);
                setPermission(p);
            } }),
        React.createElement("label", { htmlFor: `btnradio_permissions_${id}_write`, className: "form-label btn btn-outline-secondary btn-sm" },
            React.createElement("i", { className: "fas fa-edit" }),
            " ",
            I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.write'))));
}
export function PermissionChooser({ permission, buddies, group, setPermission, setBuddies, setGroup, extra = null, }) {
    const id = React.useMemo(() => uniqueId('PermissionChooser'), []);
    const user = UserSession.getInstance().currentUser();
    const roles = user ? user.roles : UserUtils.ANONYMOUS_USER.roles;
    const [advancedOpen, setAdvancedOpen] = React.useState(false);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "form-check form-check-inline" },
            React.createElement("input", { className: "form-check-input", type: "radio", name: "permission_public", id: `global_permission_private_${id}`, checked: !permission.others.has(EPermission.READ), onChange: () => {
                    const p = permission.clone();
                    p.others.clear();
                    setPermission(p);
                } }),
            React.createElement("label", { className: "form-label form-check-label", htmlFor: `global_permission_private_${id}` },
                ' ',
                React.createElement("i", { className: "fas fa-user" }),
                " ",
                I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.private'))),
        React.createElement("div", { className: "form-check form-check-inline" },
            React.createElement("input", { className: "form-check-input", type: "radio", name: "permission_public", id: `global_permission_public_${id}`, checked: permission.others.has(EPermission.READ), onChange: () => {
                    const p = permission.clone();
                    p.others.clear();
                    p.others.add(EPermission.READ);
                    setPermission(p);
                } }),
            React.createElement("label", { className: "form-label form-check-label", htmlFor: `global_permission_public_${id}` },
                React.createElement("i", { className: "fas fa-users" }),
                " ",
                I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.publicMsg'))),
        React.createElement("button", { type: "button", name: "permission_advanced", className: "btn btn-outline-secondary btn-sm float-end", onClick: () => setAdvancedOpen((o) => !o) }, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.advanced')),
        extra,
        React.createElement("div", { className: advancedOpen ? 'd-block' : 'd-none' },
            React.createElement("div", { className: "tdp-permissions-entry row d-flex align-items-center mt-1" },
                React.createElement("label", { className: "form-label col-sm-auto ps-2" }, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.public')),
                React.createElement("span", null),
                React.createElement(PermissionsEntry, { permission: permission, setPermission: setPermission, setGetter: (p) => p.others })),
            React.createElement("p", { className: "form-text" }, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.definePermissions')),
            React.createElement("div", { className: "tdp-permissions-entry row d-flex align-items-center mt-1" },
                React.createElement("label", { className: "form-label col-sm-auto ps-2", htmlFor: `permission_group_name_${id}` }, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.group')),
                React.createElement("select", { id: `permission_group_name_${id}`, name: "permission_group_name", className: "form-select form-select-sm", value: group, onChange: (e) => setGroup(e.currentTarget.value) },
                    React.createElement("option", { value: "" }, "None"),
                    roles.map((d) => (React.createElement("option", { key: d, value: d }, d)))),
                React.createElement(PermissionsEntry, { permission: permission, setPermission: setPermission, setGetter: (p) => p.group })),
            React.createElement("p", { className: "form-text" }, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.specifyRole')),
            React.createElement("div", { className: "tdp-permissions-entry row d-flex align-items-center mt-1" },
                React.createElement("label", { className: "form-label col-sm-auto ps-2", htmlFor: `permission_buddies_name_${id}` }, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.buddies')),
                React.createElement("input", { id: `permission_buddies_name_${id}`, name: "permission_buddies_name", className: "form-control form-control-sm", placeholder: I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.buddiesPlaceholder'), value: buddies.join(';'), onChange: (e) => setBuddies(e.currentTarget.value.split(';')) }),
                React.createElement(PermissionsEntry, { permission: permission, setPermission: setPermission, setGetter: (p) => p.buddies })),
            React.createElement("p", { className: "form-text" }, I18nextManager.getInstance().i18n.t('tdp:core.utilsInternal.buddiesDescription')))));
}
//# sourceMappingURL=PermissionChooser.js.map