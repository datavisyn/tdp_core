export interface IIntersectionParam {
  readonly name: string;
  readonly params: any[];
}

export class IntersectionParamUtils {
  static createIntersectionParam(name: string, params: any[]): IIntersectionParam {
    return { name, params };
  }
}
