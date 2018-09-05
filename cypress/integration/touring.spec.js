describe('Ordino Touring', function() {

  before(function () {
    // log in only once before any of the tests run.
    cy.login()
    cy.acceptCookies()
  })

  beforeEach(function () {
    // before each test, we can automatically preserve the 'session' cookie.
    // this means it will not be cleared before the NEXT test starts.
    Cypress.Cookies.preserveOnce("session")
    Cypress.Cookies.preserveOnce("cookiebar")

    cy.loadDummyData() // load dummy data set as starting point
  })

  function assertLineUpPanelVisible() {
    cy.get('.lu-adder').should('be.visible') // attribute selector visible
    cy.get('.lu-stats').should('be.visible') // 'Showing x of y' visible
    cy.get('main').should('be.visible') // histograms and stuff visible
  }

  function assertLineUpPanelHidden() {
    cy.get('.lu-adder').should('not.be.visible') // attribute selector hidden
    cy.get('.lu-stats').should('not.be.visible') // 'Showing x of y' hidden
    cy.get('main').should('not.be.visible') // histograms and stuff hidden
  }

  it('has touring button', function() {
    cy.get('aside.lu-side-panel').should('exist')
    cy.get('aside.lu-side-panel').within(($sidepanel) => {
      //Scope (e.g. of cy.get) is limitied to the sidepanel's dom subtree 
      // --> root() == aside.lu-side-panel

      cy.get('a[title="(Un)Collapse"]').should('exist')
      cy.get('button[title="Start Touring"]').should('exist') //assert touring button is there
    
      // open sidepanel
      cy.root().then(($sidepanel) => {
        if ($sidepanel.hasClass('collapsed')) { 
          cy.get('a[title="(Un)Collapse"]').click() // uncollapse if needed
        }
      })
    
      cy.root().should('not.have.class', 'collapsed') //verify not collapsed
      assertLineUpPanelVisible() // column summaries is visible
      cy.get('div.touring').should('not.be.visible') // touring is hidden
  
      //start touring
      cy.get('button[title="Start Touring"]').click()
      assertLineUpPanelHidden() // column summaries is not visible
      cy.get('div.touring').should('be.visible') // touring is visible

      // stop touring / click again:
      cy.get('button[title="Start Touring"]').click()
      assertLineUpPanelVisible()
      cy.get('div.touring').should('not.be.visible') // touring is hidden

      // collapse
      cy.get('a[title="(Un)Collapse"]').click()
      cy.root().should('have.class', 'collapsed')
      // .lu-adder is visible still shown as + button
      // everything else is hidden:
      cy.get('.lu-stats').should('not.be.visible') // 'Showing x of y' hidden
      cy.get('main').should('not.be.visible') // histograms and stuff hidden
      cy.get('div.touring').should('not.be.visible') // touring is hidden

      // if collapsed, click touring does restore
      cy.get('button[title="Start Touring"]').click()
      cy.root().should('not.have.class', 'collapsed')
      
      assertLineUpPanelHidden()
      cy.get('div.touring').should('be.visible') // touring is visible
    })
   
  })
})
