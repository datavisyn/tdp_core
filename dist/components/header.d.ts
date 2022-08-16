/**
 * Defines a header link
 */
export interface IHeaderLink {
    /**
     * Text of the link
     */
    name: string;
    /**
     * Action that should be performed on click (instead of href)
     */
    action: (event: MouseEvent) => any;
    /**
     * The href of the link
     */
    href: string;
}
/**
 * Header link extends the header link with a  flag for disabling the logo
 */
export declare class AppHeaderLink implements IHeaderLink {
    name: string;
    readonly action: (event: MouseEvent) => boolean;
    readonly href: string;
    addLogo: boolean;
    constructor(name?: string, action?: (event: MouseEvent) => boolean, href?: string, addLogo?: boolean);
}
export interface IAppHeaderOptions {
    /**
     * insert as first-child or append as child node to the given parent node
     * default: true
     */
    prepend?: boolean;
    /**
     * color scheme: bright (= false) or dark (= true)
     * default: false
     */
    inverse?: boolean;
    /**
     * position of the header: static (= false) or fixed at the top (= true)
     * default: false
     */
    positionFixed?: boolean;
    /**
     * the app link with the app name
     */
    appLink?: AppHeaderLink;
    /**
     * a list of links that should be shown in the main menu
     */
    mainMenu?: IHeaderLink[];
    /**
     * a list of links that should be shown in the right menu
     */
    rightMenu?: IHeaderLink[];
    showAboutLink?: boolean | ((title: HTMLElement, content: HTMLElement) => void);
    /**
     * show/hide the options link
     * default: false
     */
    showOptionsLink?: boolean | ((title: HTMLElement, content: HTMLElement) => void);
    /**
     * show/hide the bug report link
     * default: true
     */
    showReportBugLink?: boolean | ((title: HTMLElement, content: HTMLElement) => void);
    /**
     * show/hide the EU cookie disclaimer bar from `cookie-bar.eu`
     */
    showCookieDisclaimer?: boolean;
    /**
     * show help link true or the url to link
     * default: false
     */
    showHelpLink?: boolean | string;
}
/**
 * The Caleydo App Header provides an app name and customizable menus
 */
export declare class AppHeader {
    private parent;
    /**
     * Default options that can be overridden in the constructor
     * @private
     */
    private options;
    /**
     * Main menu is positioned next to the app name
     */
    mainMenu: HTMLElement;
    /**
     * Right menu is positioned to the right of the document
     */
    rightMenu: HTMLElement;
    /**
     * About dialog
     */
    aboutDialog: HTMLElement;
    /**
     * Options dialog
     */
    optionsDialog: HTMLElement;
    /**
     * Constructor overrides the default options with the given options
     * @param parent
     * @param options
     */
    constructor(parent: HTMLElement, options?: IAppHeaderOptions);
    private addEUCookieDisclaimer;
    private build;
    addMainMenu(name: string, action: (event: MouseEvent) => any, href?: string): HTMLElement;
    addRightMenu(name: string, action: (event: MouseEvent) => any, href?: string): HTMLElement;
    insertCustomMenu(element: Element): void;
    insertCustomRightMenu(element: Element): void;
    toggleDarkTheme(force?: boolean): void;
    togglePositionFixed(force?: boolean): void;
    wait(): void;
    ready(): void;
    private static setVisibility;
    toggleOptionsLink(isVisible: boolean, contentGenerator?: (title: HTMLElement, content: HTMLElement) => void): void;
    toggleHelpLink(isVisible: boolean, helpUrl?: string): void;
    toggleReportBugLink(isVisible: boolean, contentGenerator?: (title: HTMLElement, content: HTMLElement) => void): void;
    private toggleAboutLink;
    hideDialog(selector: string): void;
    showAndFocusOn(selector: string, focusSelector: string): void;
    static create(parent: HTMLElement, options?: IAppHeaderOptions): AppHeader;
}
//# sourceMappingURL=header.d.ts.map