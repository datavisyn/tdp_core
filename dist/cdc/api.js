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
    return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert`);
}
export async function getCommunity(id) {
    return AppContext.getInstance().getAPIJSON(`/marketplace360/community/${id}`);
}
export async function editCommunity(id, community) {
    return Ajax.send(AppContext.getInstance().api2absURL(`/marketplace360/community/${id}`), community, 'PUT', 'JSON', 'application/json');
}
export async function deleteCommunity(id) {
    return Ajax.send(AppContext.getInstance().api2absURL(`/marketplace360/community/${id}`), null, 'DELETE');
}
//  export async function saveCommunity(community: IUploadCommunity): Promise<IAlert | null> {
//    return Ajax.send(AppContext.getInstance().api2absURL(`/marketplace360/community`), community, 'POST', 'JSON', 'application/json');
//  }
//# sourceMappingURL=api.js.map