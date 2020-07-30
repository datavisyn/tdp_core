
/**
 * Interface for the options parameter of PanelTab
 */
export interface IPanelTabDesc {

  /**
   * Width of the SidePanel
   */
  width: string;

  /**
   * CSS class for PanelNavButton of the PanelTab
   */
  cssClass: string;

  /**
   * Title and Text content for the PanelNavButton of the PanelTab.
   */
  title: string;

  /**
   * Define the sort order of the PanelNavButtons
   */
  order: number;

  /**
   * Show PanelNavButton in collapsed mode
   * @default false
   */
  shortcut?: boolean;
}
