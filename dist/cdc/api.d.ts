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
import { IAlert, IUploadAlert } from './interface';
export declare function getAlerts(): Promise<IAlert[]>;
export declare function getAlertsById(id: number): Promise<IAlert | null>;
export declare function editAlert(id: number, alert: Partial<IAlert>): Promise<IAlert | null>;
export declare function deleteAlert(id: number): Promise<void>;
export declare function saveAlert(alert: IUploadAlert): Promise<IAlert | null>;
export declare function runAlertById(id: number): Promise<IAlert | null>;
