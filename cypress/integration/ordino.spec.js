describe('Ordino Login & Dummy Data', function() { 
    
  it('successfully loads', function() {
    cy.visit('/') // visit base url (defined in cypress.json)
  })


  it('sets auth cookie when logging in with form', function () {
    cy.getCookie('session').should('not.exist') // our auth cookie should be present
    cy.visit('/') // visit base url (defined in cypress.json)

    const user = cy.get('#login_username').then(($inputUser) => {
      const user = $inputUser.text() // get username

      //cy.get('#login_remember').check() // Remember me
      cy.getCookie('session').should('not.exist') // not logged in
      cy.get('button[type=submit]').click() // login as luscious lucius, or whatever the generated user is


      cy.url().should('include', 'clue_graph') // we should be redirected
      cy.getCookie('session').should('exist') // our auth cookie should be present
      cy.get('#user_menu').should('contain', user) // UI should reflect this user being logged in

      // wait a bit so everything is stored in the localstorage
      cy.wait(500).then(() => {        
        // test the local storage
        expect(localStorage.getItem('ordino_has_seen_welcome_page')).to.eq('1')
        expect(localStorage.getItem('ordino_provenance_graphs')).to.eq('["ordino0"]')
        expect(localStorage.getItem('graphordino0.nodes')).to.eq('[0,1]')
        expect(localStorage.getItem('graphordino0.edges')).to.eq('[0]')
      })
    })
  })


  it('loads dummy data', function () {
    cy.login()
    cy.loadDummyData()

    cy.get('li.hview.t-focus').should('text', 'Dummy A') // IDType of focused view (next to homebutton)
    
    // check lineup
    cy.get('main .inner').should('exist')
    cy.get('main .inner .lineup').should('exist')
    cy.get('main.lineup-engine').should('exist')
    cy.get('main.lineup-engine header').should('contain', 'A Cat1')
  })


  it('expands sidebar', function () {
    cy.login()
    cy.loadDummyData()

    cy.get('aside.lu-side-panel').should('exist')
    cy.get('a[title="(Un)Collapse"]').should('exist')

    cy.get('aside.lu-side-panel').then(($sidepanel) => {
      if ($sidepanel.hasClass('collapsed')) { 
        cy.get('a[title="(Un)Collapse"]').click() // uncollapse if needed
      }
    })

    cy.get('aside.lu-side-panel').should('not.have.class', 'collapsed') //verify not collapsed
    cy.get('div.lu-search').should('be.visible') // attribute selector visible
  })
})
  
  