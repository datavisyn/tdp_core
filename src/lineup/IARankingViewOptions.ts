import { ITaggleOptions, ILocalDataProviderOptions, IDataProviderOptions, IGroupItem, IGroupData, IGroupSearchItem, Column } from 'lineupjs';
import { IDTypeLike } from 'visyn_core/idtype';
import { ISearchOption, IPanelAddColumnButtonOptions } from './panel';

export interface IARankingViewOptions {
  /**
   * name of a single item in LineUp
   * @default item
   */
  itemName: string | (() => string);
  /**
   * plural version of before
   * @default items
   */
  itemNamePlural: string | (() => string);
  /**
   * the idtype of the shown items
   */
  itemIDType: IDTypeLike | null;

  /**
   * Show column in context mode
   */
  showInContextMode: (col: Column) => boolean;

  /**
   * custom argument (or callback function) to pass to scores dialogs
   */
  additionalScoreParameter: object | (() => object);
  /**
   * custom argument (or callback function) to pass to scores computations
   */
  additionalComputeScoreParameter: object | (() => object);
  /**
   * additional attributes for stored named sets
   */
  subType: { key: string; value: string };
  /**
   * enables CLUE for the ranking, leading to tracking of all ranking relevant features like sorting, filtering, and adding columns.
   * @default true
   */
  clueifyRanking: boolean;
  /**
   * enable taggle overview mode switcher
   * @default true
   */
  enableOverviewMode: boolean | 'active';

  /**
   * enable zoom button
   * @default true
   */
  enableZoom: boolean;

  /**
   * enable custom plotly vis
   * @default true
   */
  enableVisPanel: boolean;

  /**
   * enable download data button
   * @default true
   */
  enableDownload: boolean;

  /**
   * enable save list of entities button
   * @default true
   */
  enableSaveRanking: boolean;

  /**
   * enable collapsing button of side panel
   * @default true
   */
  enableSidePanelCollapsing: boolean;

  /**
   * enable side panel
   * @default 'collapsed'
   */
  enableSidePanel: boolean | 'collapsed' | 'top';

  /**
   * enable add columns button
   * @default true
   */
  enableAddingColumns: boolean;

  /**
   * enable support columns in the add column dialog
   * @default true
   */
  enableAddingSupportColumns: boolean;

  /**
   * enable combining columns in the add column dialog
   * @default true
   */
  enableAddingCombiningColumns: boolean;

  /**
   * enable score columns in the add column dialog
   * @default true
   */
  enableAddingScoreColumns: boolean;

  /**
   * enable previously created columns in the add column dialog
   * @default true
   */
  enableAddingPreviousColumns: boolean;

  /**
   * enable database columns in the add column dialog
   * @default true
   */
  enableAddingDatabaseColumns: boolean;

  /**
   * additional information regarding the group of a column
   */
  databaseColumnGroups: {
    /**
     * group label shown in the Add Column dialog.
     * column descriptions need to define the `chooserGroup` property.
     */
    [key: string]: {
      /**
       * the rank of the current group in the column selector
       */
      order?: number;
    };
  };

  /**
   * enable meta data score columns in the add column dialog
   * @default true
   */
  enableAddingMetaDataColumns: boolean;

  enableHeaderSummary: boolean;

  enableHeaderRotation: boolean;

  /**
   * enable that the regular columns are added via a chooser dialog
   * @default false
   */
  enableAddingColumnGrouping: boolean;

  /**
   * enable alternating pattern background
   * @default false
   */
  enableStripedBackground: boolean;

  itemRowHeight: number | ((item: IGroupItem | IGroupData) => number) | null;

  customOptions: Partial<ITaggleOptions>;
  customProviderOptions: Partial<
    ILocalDataProviderOptions & IDataProviderOptions & { maxNestedSortingCriteria: number; maxGroupColumns: number; filterGlobally: true }
  >;

  /**
   * Formatting function for the search box item
   * Similar to `ISearchBoxOptions.formatItem()` in lineupjs
   */
  formatSearchBoxItem(item: ISearchOption | IGroupSearchItem<ISearchOption>, node: HTMLElement): string | void;

  /**
   * Options for the add column button in the toolbar of the side panel
   */
  panelAddColumnBtnOptions: IPanelAddColumnButtonOptions;
}
