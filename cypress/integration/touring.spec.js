describe('Ordino', function() {  
  before(function () {
    // log in only once before any of the tests run.
    // your app will likely set some sort of session cookie.
    // you'll need to know the name of the cookie(s), which you can find
    // in your Resources -> Cookies panel in the Chrome Dev Tools.
    cy.login()
  })

  beforeEach(function () {
    // before each test, we can automatically preserve the
    // 'session_id' and 'remember_token' cookies. this means they
    // will not be cleared before the NEXT test starts.
    //git s
    // the name of your cookies will likely be different
    // this is just a simple example
    Cypress.Cookies.preserveOnce("session", "remember_token")
  })

  
  it('loads dummy data', function () {
    cy.visit('/')
    cy.getCookie('session').should('exist') // our auth cookie should be present
    cy.get('.homeButton').click() 
    cy.get('.targidDummyData').within(($dummy) => { // change scope to dummy data tab
      cy.get('#targidDummyDataToggle').click() // open dummy data tab
      cy.get('.predefined-named-sets li:first').click() //click first goto link
    })
  })
})

