// Gets into the phovea.ts
import * as React from 'react';
import { useMemo } from 'react';
/**
 * This simple proxy view is intended to be used inside of a visyn view component which does the required mapping between
 * types. See {link} for an example.
 */
export function ProxyViewComponent({ site, argument, currentId }) {
    const editedSite = useMemo(() => {
        return site.replace(`\${${argument}}`, currentId);
    }, [argument, site, currentId]);
    return currentId ? React.createElement("iframe", { className: "w-100 h-100", src: editedSite }) : React.createElement("div", null, "Make a Selection");
}
//# sourceMappingURL=ProxyViewComponent.js.map