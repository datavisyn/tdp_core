Cypress.Commands.add('login', () => {
  // skip the login form and log in programmatically

  cy.request({
    method: 'POST',
    url: '/login', // baseUrl is prepended to url
    form: true, // indicates the body should be form urlencoded and sets Content-Type: application/x-www-form-urlencoded headers
    body: {
      username: 'luscious.lucius',
      password: 'malfoy666',
      remember: 'True'
    }
  })
  cy.getCookie('session').should('exist') // our auth cookie should be present
})

Cypress.Commands.add('acceptCookies', () => {
  cy.setCookie('cookiebar', 'CookieAllowed') // Set the 'auth_key' cookie to '123key'
})


Cypress.Commands.add('loadDummyData', () => {
    // REQUIRES LOGIN, see above
    cy.getCookie('session').should('exist') // our auth cookie should be present
  
    cy.visit('/')
    cy.get('.homeButton').click() 
    cy.get('.targidDummyData').within(($dummy) => { // change scope to dummy data tab
      cy.get('#targidDummyDataToggle').click() // open dummy data tab
      // load dummy data
      cy.get('.predefined-named-sets li:first').click() //click first goto link to open dummy data
    })

    // url changes to something like http://localhost:8080/#clue_graph=ordino2&clue_state=3 when the data has loaded
    cy.url().should('contain', 'clue_graph').should('contain', 'clue_state')
    
    // workaround for: https://github.com/Caleydo/tdp_dummy/issues/15
    cy.get('a[title="Show Provenance Graph"]').click()
    cy.get('aside.provenance-layout-vis').within( ($provenance) => {
        cy.get('div[data-id="0"]').click()
        cy.get('div[data-id="3"]').click()
        cy.get('a[title="Hide Provenance Graph"]').click()
    })
})