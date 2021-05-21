export interface IBaseAuthorizationConfiguration {
    id: string;
    name: string;
}

export interface IOpenTokenWindowProps extends IBaseAuthorizationConfiguration {
  url: string;
  tokenParameter: string;
}

export type IAuthorizationType = {
    type: 'simplePopup'
} & IOpenTokenWindowProps;
