  describe('Ordino', function() {  
    
  it('successfully loads', function() {
    cy.visit('/') // visit base url (defined in cypress.json)
  })

  it('sets auth cookie when logging in with form', function () {
    cy.getCookie('session').should('not.exist') // our auth cookie should be present
    cy.visit('/') // visit base url (defined in cypress.json)
    const user = cy.get('#login_username').then(($inputUser) => {
      const user = $inputUser.text() // get username

      cy.get('#login_remember').check() // Remember me
      cy.getCookie('session').should('not.exist') // not logged in
      cy.get('button[type=submit]').click() // login as luscious lucius, or whatever the generated user is


      cy.url().should('include', 'clue_graph') // we should be redirected
      cy.getCookie('session').should('exist') // our auth cookie should be present
      cy.get('#user_menu').should('contain', user) // UI should reflect this user being logged in
    })
  })
})
  
  