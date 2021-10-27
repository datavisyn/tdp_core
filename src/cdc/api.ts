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

import {Ajax, AppContext} from 'phovea_core';
import {IAlert, IUploadAlert} from './interface';

export async function getAlerts(): Promise<IAlert[]> {
  return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert`);
}

export async function getAlertsById(id: number): Promise<IAlert | null> {
  return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert/${id}`);
}

export async function editAlert(id: number, alert: Partial<IAlert>): Promise<IAlert | null> {
  return Ajax.send(AppContext.getInstance().api2absURL(`/tdp/cdc/alert/${id}`), alert, 'PUT', 'JSON', 'application/json');
}

export async function deleteAlert(id: number): Promise<void> {
  return Ajax.send(AppContext.getInstance().api2absURL(`/tdp/cdc/alert/${id}`), null, 'DELETE');
}

export async function saveAlert(alert: IUploadAlert): Promise<IAlert | null> {
  return Ajax.send(AppContext.getInstance().api2absURL(`/tdp/cdc/alert`), alert, 'POST', 'JSON', 'application/json');
}

export async function runAlertById(id: number): Promise<IAlert | null> {
  return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert/${id}/run`);
}

export async function confirmAlertById(id: number): Promise<IAlert | null> {
  return AppContext.getInstance().getAPIJSON(`/tdp/cdc/alert/${id}/confirm`);
}
