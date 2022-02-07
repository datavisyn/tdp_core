// send only
export interface ITDPSetInputSelectionMessage {
  type: 'tdpSetInputSelection';
  payload: {
    name: string;
    idType: string;
    ids: string[];
  };
}

// send + receive
export interface ITDPSetItemSelectionMessage {
  type: 'tdpSetItemSelection';
  payload: {
    name?: string;
    idType: string;
    ids: string[];
  };
}

// send + receive
export interface ITDPSetParameterMessage {
  type: 'tdpSetParameter';
  payload: {
    name: string;
    value: any;
  };
}

export declare type ITDPMessage = ITDPSetInputSelectionMessage | ITDPSetItemSelectionMessage | ITDPSetParameterMessage;
