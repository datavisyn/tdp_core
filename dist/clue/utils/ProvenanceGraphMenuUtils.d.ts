import { ISecureItem } from 'visyn_core/security';
import { IProvenanceGraphDataDescription } from '../provenance';
export declare class ProvenanceGraphMenuUtils {
    static GLOBAL_EVENT_MANIPULATED: string;
    static isPersistent(d: IProvenanceGraphDataDescription): boolean;
    static persistProvenanceGraphMetaData(d: IProvenanceGraphDataDescription): Promise<unknown>;
    static isPublic(d: ISecureItem): boolean;
    static editProvenanceGraphMetaData(d: IProvenanceGraphDataDescription, args?: {
        button?: string;
        title?: string;
        permission?: boolean;
        name?: string;
    }): Promise<unknown>;
}
//# sourceMappingURL=ProvenanceGraphMenuUtils.d.ts.map