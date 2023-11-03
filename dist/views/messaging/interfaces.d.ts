export interface ITDPSetInputSelectionMessage {
    type: 'tdpSetInputSelection';
    payload: {
        name: string;
        idType: string;
        ids: string[];
    };
}
export interface ITDPSetItemSelectionMessage {
    type: 'tdpSetItemSelection';
    payload: {
        name?: string;
        idType: string;
        ids: string[];
    };
}
export interface ITDPSetParameterMessage {
    type: 'tdpSetParameter';
    payload: {
        name: string;
        value: any;
    };
}
export declare type ITDPMessage = ITDPSetInputSelectionMessage | ITDPSetItemSelectionMessage | ITDPSetParameterMessage;
//# sourceMappingURL=interfaces.d.ts.map