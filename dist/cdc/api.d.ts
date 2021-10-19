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
import { IAlert } from './interface';
export declare function getAlerts(): Promise<IAlert[]>;
export declare function getCommunity(id: string): Promise<IAlert | null>;
export declare function editCommunity(id: string, alert: Partial<IAlert>): Promise<IAlert | null>;
export declare function deleteCommunity(id: string): Promise<void>;
export declare function saveCommunity(alert: IAlert): Promise<IAlert | null>;
