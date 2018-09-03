describe('Ordino Touring', function() {

  function loadDummyData() {
    cy.visit('/')
    cy.getCookie('session').should('exist') // our auth cookie should be present
    cy.get('.homeButton').click() 
    cy.get('.targidDummyData').within(($dummy) => { // change scope to dummy data tab
      cy.get('#targidDummyDataToggle').click() // open dummy data tab

      // load dummy data
      cy.get('.predefined-named-sets li:first').click() //click first goto link to open dummy data
    })

    // url changes to something like http://localhost:8080/#clue_graph=ordino2&clue_state=3 when the data has loaded
    cy.url().should('contain', 'clue_graph').should('contain', 'clue_state')
    cy.wait(5000) // workaround for: https://github.com/Caleydo/tdp_dummy/issues/15
    cy.reload()
  }


  before(function () {
    // log in only once before any of the tests run.
    // your app will likely set some sort of session cookie.
    // you'll need to know the name of the cookie(s), which you can find
    // in your Resources -> Cookies panel in the Chrome Dev Tools.
    cy.login()
  })

  beforeEach(function () {
    // before each test, we can automatically preserve the
    // 'session' cookie.
    // this means it will not be cleared before the NEXT test starts.
    Cypress.Cookies.preserveOnce("session")

    loadDummyData()
  })




  it('loads dummy data', function () {
    cy.get('li.hview.t-focus').should('text', 'Dummy A') // IDType of focused view (next to homebutton)
    
    // check lineup
    cy.get('main .inner').should('exist')
    cy.get('main .inner .lineup').should('exist')
    cy.get('main.lineup-engine').should('exist')
    cy.get('main.lineup-engine header').should('contain', 'A Cat1')
  })




  it('expands sidebar', function () {
    cy.get('aside.lu-side-panel').should('exist')
    cy.get('a[title="(Un)Collapse"]').should('exist')

    //uncollapse if needed
    cy.get('aside.lu-side-panel').then(($sidepanel) => {
      if ($sidepanel.hasClass('collapsed')) {
        cy.get('a[title="(Un)Collapse"]').click()
      }
    })

    //verify not collapsed
    cy.get('aside.lu-side-panel').should('not.have.class', 'collapsed')
  })
})
