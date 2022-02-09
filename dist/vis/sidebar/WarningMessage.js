import * as React from 'react';
import { EBarDirection } from '../interfaces';
export function WarningMessage() {
    const options = [EBarDirection.VERTICAL, EBarDirection.HORIZONTAL];
    return (React.createElement("div", { className: "alert alert-warning", role: "alert" },
        React.createElement("strong", null, "Please note:"),
        " This feature is still under development. Please report any problems you might observe."));
}
//# sourceMappingURL=WarningMessage.js.map