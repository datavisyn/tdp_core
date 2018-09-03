describe('Ordino Touring', function() {

  before(function () {
    // log in only once before any of the tests run.
    cy.login()
  })

  beforeEach(function () {
    // before each test, we can automatically preserve the 'session' cookie.
    // this means it will not be cleared before the NEXT test starts.
    Cypress.Cookies.preserveOnce("session")

    cy.loadDummyData() // load dummy data set as starting point
  })


  it('has touring button', function() {
    cy.get('button[title="Start Touring"]').should('exist')
  })
})
