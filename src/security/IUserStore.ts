export interface IUserStore<T extends Record<string, any> = Record<string, any>> {
  id: string;
  configuration: T;
}
