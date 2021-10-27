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
    return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert`);
}
export async function getAlertsById(id) {
    return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert/${id}`);
}
export async function editAlert(id, alert) {
    return Ajax.send(AppContext.getInstance().api2absURL(`/tdp/cdc/alert/${id}`), alert, 'PUT', 'JSON', 'application/json');
}
export async function deleteAlert(id) {
    return Ajax.send(AppContext.getInstance().api2absURL(`/tdp/cdc/alert/${id}`), null, 'DELETE');
}
export async function saveAlert(alert) {
    return Ajax.send(AppContext.getInstance().api2absURL(`/tdp/cdc/alert`), alert, 'POST', 'JSON', 'application/json');
}
export async function runAlertById(id) {
    return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert/${id}/run`);
}
export async function confirmAlertById(id) {
    return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert/${id}/confirm`);
}
//# sourceMappingURL=api.js.map