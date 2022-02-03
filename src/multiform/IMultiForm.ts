import { IVisInstance, IVisPluginDesc } from '../vis';

export interface IMultiForm extends IVisInstance {
  readonly act: IVisPluginDesc;
  readonly actLoader: Promise<IVisInstance>;
  readonly visses: IVisPluginDesc[];
  switchTo(id: string): Promise<IVisInstance | IVisInstance[]>;
  switchTo(index: number): Promise<IVisInstance | IVisInstance[]>;
  switchTo(vis: IVisPluginDesc): Promise<IVisInstance | IVisInstance[]>;

  addIconVisChooser(toolbar: Element): void;
  addSelectVisChooser(toolbar: Element): void;
}

export interface IMultiFormOptions {
  /**
   * initial visualization
   */
  initialVis?: string | number | IVisPluginDesc;
  /**
   * configuration for all visualizations
   */
  all?: any;
  /**
   * custom config for individual visualizations identified by their id
   */
  [visPluginId: string]: any;
  /**
   * optionally filter the list of visualizations
   * @param vis
   */
  filter?(vis: IVisPluginDesc): boolean;
}
