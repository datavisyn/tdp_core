import { IRow, IServerColumnDesc } from '../base/rest';
export declare class PhoveaDataAdapter {
    private readonly datasetId;
    private readonly data;
    constructor(datasetId: string);
    getDesc(): Promise<IServerColumnDesc>;
    getRows(): Promise<IRow[]>;
}
