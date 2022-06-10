import { IProvenanceGraphDataDescription } from '../provenance';
import { ISecureItem } from '../../security';
export declare class ProvenanceGraphMenuUtils {
    static GLOBAL_EVENT_MANIPULATED: string;
    static isPersistent(d: IProvenanceGraphDataDescription): boolean;
    static persistProvenanceGraphMetaData(d: IProvenanceGraphDataDescription): any;
    static isPublic(d: ISecureItem): any;
    static editProvenanceGraphMetaData(d: IProvenanceGraphDataDescription, args?: {
        button?: string;
        title?: string;
        permission?: boolean;
        name?: string;
    }): any;
}
//# sourceMappingURL=ProvenanceGraphMenuUtils.d.ts.map