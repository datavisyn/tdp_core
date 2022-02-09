import * as React from 'react';
import { Permission } from '../security';
export declare function PermissionChooser({ permission, buddies, group, setPermission, setBuddies, setGroup, extra, }: {
    permission: Permission;
    buddies: string[];
    group: string;
    setPermission: (permission: Permission) => void;
    setBuddies: (buddies: string[]) => void;
    setGroup: (group: string) => void;
    extra?: React.ReactNode;
}): JSX.Element;
//# sourceMappingURL=PermissionChooser.d.ts.map