/*********************************************************
 * Copyright (c) 2021 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this community
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 *********************************************************/
import { Ajax, AppContext } from 'phovea_core';
export async function getAlerts() {
    //    return Ajax.send(AppContext.getInstance().api2absURL('/tdp/cdc/alert'), null, 'GET', 'JSON', 'application/json');
    console.log(AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert`));
    return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert`);
}
export async function getCommunity(id) {
    return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert/${id}`);
}
export async function editCommunity(id, alert) {
    return Ajax.send(AppContext.getInstance().api2absURL(`/tdp/cdc/alert/${id}`), alert, 'PUT', 'JSON', 'application/json');
}
export async function deleteCommunity(id) {
    return Ajax.send(AppContext.getInstance().api2absURL(`/tdp/cdc/alert/${id}`), null, 'DELETE');
}
export async function saveCommunity(alert) {
    return Ajax.send(AppContext.getInstance().api2absURL(`/tdp/cdc/alert/`), alert, 'POST', 'JSON', 'application/json');
}
//# sourceMappingURL=api.js.map