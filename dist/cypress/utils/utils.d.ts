/// <reference types="jquery" />
/// <reference types="select2" />
/// <reference types="cypress" />
/// <reference types="bootstrap" />
/**
 * Check if typing text in form input element has been completed
 * @param {string} input - input string that should be inserted
 * @param {string} selector - the selector of the element as returned by cypress studio
 */
export declare function checkIfInputCompleted(input: string, selector: string): void;
/**
 * Type text in a form input element and check if input is completed
 * @param {string} selector - the selector of the element as returned by cypress studio
 * @param {string} text - text that should be inserted into the form input
 */
export declare function fillInForm(selector: string, text: string): void;
/**
 * Clear all text in a form input element
 * @param {string} selector - the selector of the element as returned by cypress studio
 */
export declare function clearInputForm(selector: string): Cypress.Chainable<JQuery<HTMLElement>>;
/**
 * This function must be used to select elements from selet2 multi select form elements.
 * @param {string} id - data-testid of wrapping div (can be deducted from the title by making it lowercase and replacing space by -). For select2 search filds in the form map it must be given as: row-[row number starting from 1] (no brackets)
 * @param {string[] | string} searchString - either a single string or an array of strings if multiselect is possible
 */
export declare function select2MultiSelect(id: string, searchString: string | string[]): void;
/**
 * This function must be used to select elements from selet2 single select form elements.
 * @param {string} id - data-testid of wrapping div (can be deducted from the title by making it lowercase and replacing space by -). For select2 search filds in the form map it must be given as: row-[row number starting from 1] (no brackets)
 * @param {string} searchString - either a single string or an array of strings if multiselect is possible
 */
export declare function select2SingleSelect(id: string, searchString: string): void;
/**
 * This function must be used to select elements in form maps.
 * @param {string} rowId - In a form select multiple rows can be added. This input must be given as: row-[row number starting from 1] (no brackets)
 * @param {string} selectOption - either a single string or an array of strings if multiselect is possible
 */
export declare function formSelect(rowId: string, selectOption: string): Cypress.Chainable<JQuery<HTMLElement>>;
/**
 * Wait until phovea-busy and loading icon are hidden
 */
export declare function waitPhoveaNotBusy(): Cypress.Chainable<JQuery<HTMLElement>>;
/**
 * Wait until phovea-busy and loading icon are hidden
 */
export declare function waitTdpNotBusy(): Cypress.Chainable<JQuery<HTMLElement>>;
/**
 * Scroll an Element into the center of the viewport (mainly for presentation purposes)
 * @param {string} selector - the selector of the element as returned by cypress studio
 * @param  {number} waitAfterScroll - specifies how long to wait after scrolling to an element
 */
export declare function scrollElementIntoCenter(selector?: string, waitAfterScroll?: number): Cypress.Chainable<JQuery<HTMLElement>>;
/**
 * Submit Login Form of Ordino Public
 */
export declare function loginPublic(): void;
/**
 * Waits for the specified api calls. Try using this if you need long waits at positions where many api calls are done.
 * @param {string[]} apiCalls - contains the strings to the api calls. They are logged out in the Cypress studio as GET requests. (ex: /api/idtype/Cellline/ or /api/idtype/Tissue/)
 */
export declare function waitForApiCalls(apiCalls: any): void;
//# sourceMappingURL=utils.d.ts.map