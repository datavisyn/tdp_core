

export interface IRow {
   /**
   * id, e.g. ESNGxxxx
   */
  readonly id: string;
  /**
   * unique internal number id, e.g. 42
   */
  readonly _id: number;

  [key: string]: any;
}
