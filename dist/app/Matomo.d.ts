import { ActionNode, ProvenanceGraph } from '../clue/provenance';
import { IUser } from '../security';
/**
 * Trackable Matomo event
 */
export interface IMatomoEvent {
    category: string;
    action: string;
    name?: (node: ActionNode) => string | string;
    value?: (node: ActionNode) => number | number;
}
/**
 * Trackable action
 */
export interface ITrackableAction {
    /**
     * phovea extension id
     */
    id: string;
    /**
     * matomo event
     */
    event: IMatomoEvent;
}
interface IPhoveaMatomoConfig {
    /**
     * URL to Matomo backend with with a trailing slash
     * Use `null` to disables the tracking
     */
    url?: string;
    /**
     * ID of the Matomo site (generated when creating a page)
     */
    site: string;
    /**
     * Flag whether the user name should be encrypted using MD5 or not
     */
    encryptUserName?: boolean;
}
export declare class Matomo {
    private userId;
    init(config: IPhoveaMatomoConfig): boolean;
    trackEvent(category: string, action: string, name?: string, value?: number): void;
    login(userId: string): void;
    logout(): void;
    /**
     * Login extension point
     */
    static trackLogin(user: IUser): void;
    /**
     * Logout extension point
     */
    static trackLogout(): void;
    /**
     * Provenance graph extension point
     * @param graph ProvenanceGraph
     */
    static trackProvenance(graph: ProvenanceGraph): Promise<void>;
    private static instance;
    static getInstance(): Matomo;
}
export {};
//# sourceMappingURL=Matomo.d.ts.map