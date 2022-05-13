// Gets into the phovea.ts
import * as React from 'react';
import { useMemo } from 'react';
import { I18nextManager } from '../../../i18n/I18nextManager';
/**
 * This simple proxy view is intended to be used inside of a visyn view component which does the required mapping between
 * types. See {link} for an example.
 */
export function ProxyViewComponent({ site, argument, currentId }) {
    const editedSite = useMemo(() => {
        return site.replace(`\${${argument}}`, currentId);
    }, [argument, site, currentId]);
    return currentId ? (React.createElement("iframe", { className: "w-100 h-100", src: editedSite })) : (React.createElement("div", { className: "d-flex justify-content-center align-items-center  w-100 h-100" },
        React.createElement("div", { className: "flex-grow-1 text-center emptyViewText" }, I18nextManager.getInstance().i18n.t('tdp:core.views.emptyProxyView'))));
}
//# sourceMappingURL=ProxyViewComponent.js.map