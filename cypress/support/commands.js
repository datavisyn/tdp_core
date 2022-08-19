// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

/**
 * This function must be used to select elements in form maps.
 * @param {string} rowId - In a form select multiple rows can be added. This input must be given as: row-[row number starting from 1] (no brackets)
 * @param {string} selectOption - either a single string or an array of strings if multiselect is possible
 */
Cypress.Commands.add('formSelect', (rowId, selectOption) => {
    return cy.get(`[data-testid=${rowId}] [data-testid=form-select]`).select(selectOption);
});

/**
 * Wait until phovea-busy and loading icon are hidden
 */
Cypress.Commands.add('waitPhoveaNotBusy', () => {
    return cy.get('.phovea-busy').should('have.attr', 'hidden');
});

/**
 * Wait until tdp-busy and loading icon are hidden
 */
Cypress.Commands.add('waitTdpNotBusy', () => {
    return cy.get('.tdp-busy').should('not.exist');
});

/**
 * Waits for the specified api calls. Try using this if you need long waits at positions where many api calls are done.
 * @param {string[]} apiCalls - contains the strings to the api calls. They are logged out in the Cypress studio as GET requests. (ex: /api/idtype/Cellline/ or /api/idtype/Tissue/)
 */
Cypress.Commands.add('waitForApiCalls', (apiCalls) => {
    const waitVariables = [];
    apiCalls.forEach((apiCall) => {
        cy.intercept(apiCall).as(`${apiCall}`);
        waitVariables.push(`@${apiCall}`);
    });
    cy.wait(waitVariables);
});

/**
 * Scroll an Element into the center of the viewport (mainly for presentation purposes)
 * @param {string} selector - the selector of the element as returned by cypress studio
 * @param  {number} waitAfterScroll - specifies how long to wait after scrolling to an element
 */
Cypress.Commands.add('scrollElementIntoCenter', (selector = '', waitAfterScroll = 1000) => {
    // calculate half of viewport height
    const offestTop = -Cypress.config().viewportHeight / 2;

    // Wee need to set the offset, because by default it is scrolled such that the element is on top
    cy.get(selector).scrollIntoView({offset: {top: offestTop, left: 0}});
    cy.wait(waitAfterScroll);
    return cy.get(selector);
});

/**
 * This function must be used to select elements from selet2 single select form elements.
 * @param {string} id - data-testid of wrapping div (can be deducted from the title by making it lowercase and replacing space by -). For select2 search filds in the form map it must be given as: row-[row number starting from 1] (no brackets)
 * @param {string} searchString - either a single string or an array of strings if multiselect is possible
 */
Cypress.Commands.add('select2SingleSelect', (id, searchString) => {
    cy.get(`[data-testid="${id}"] .select2-selection--single`).click();
    cy.get('.select2-results__option').contains(searchString).click();
});

/**
 * This function must be used to select elements from selet2 multi select form elements.
 * @param {string} id - data-testid of wrapping div (can be deducted from the title by making it lowercase and replacing space by -). For select2 search filds in the form map it must be given as: row-[row number starting from 1] (no brackets)
 * @param {string[] | string} searchString - either a single string or an array of strings if multiselect is possible
 */
Cypress.Commands.add('select2MultiSelect', (id, searchString) => {
    // if a single string is given, convert it into a list, else leave it as is
    let searchStrings = [];
    if (typeof searchString === 'string' || searchString instanceof String) {
        searchStrings = [searchString];
    } else {
        searchStrings = searchString;
    }

    cy.get(`[data-testid="${id}"] .select2-hidden-accessible`).select([], {force: true});

    // iterate over search strings and select resulting options
    searchStrings.forEach((searchTerm) => {
        cy.get(`[data-testid="${id}"] [data-testid=select2-search-field]`).type(searchTerm);

        // flake solution: wait for the search for the searchString to finish
        cy.get('.select2-results__option').should('not.have.length', 0);

        cy.contains('.select2-results__option', searchTerm).should('be.visible').click();

        // confirm Select2 widget renders the name
        cy.get(`[data-testid="${id}"] .select2-container`).should('include.text', searchTerm);
    });
});

/**
 * Clear all text in a form input element
 * @param {string} selector - the selector of the element as returned by cypress studio
 */
Cypress.Commands.add('clearInputForm', (selector) => {
    return cy.get(selector).should('be.visible').clear();
});

/**
 * Type text in a form input element and check if input is completed
 * @param {string} selector - the selector of the element as returned by cypress studio
 * @param {string} text - text that should be inserted into the form input
 */
Cypress.Commands.add('fillInForm', (selector, text) => {
    cy.get(selector).should('be.visible');
    cy.get(selector).click().type(text, {delay: 0}); // use delay to ensure that complete text is filled in
    return checkIfInputCompleted(text, selector);
});

/**
 * Check if typing text in form input element has been completed
 * @param {string} input - input string that should be inserted
 * @param {string} selector - the selector of the element as returned by cypress studio
 */
Cypress.Commands.add('checkIfInputCompleted', (input, selector) => {
    cy
        .get(selector)
        .invoke('val')
        .then((text) => {
            return text === input;
        });
});
