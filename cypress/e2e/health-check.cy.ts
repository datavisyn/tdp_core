describe('Health check for Cypress e2e test', () => {
  it('should visit the home page', () => {
    cy.visit('/');
    // Login first using the new modal
    cy.get('[data-testid="visyn-login-modal"]').should('include.text', 'Demo App');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin');
    cy.get('button[type="submit"]').click();
    // Assert the content is now visible
<<<<<<< HEAD
    cy.get('body').should('include.text', 'Visualization Type');
=======
    cy.get('body').should('include.text', 'Visualization type');
>>>>>>> develop
    // Check the user avatar, and then log out again
    cy.get('[data-testid="visyn-user-avatar"]').should('include.text', 'A').click().parent().contains('Logout').click();
    // Assert the login modal to be shown again
    cy.get('[data-testid="visyn-login-modal"]').should('be.visible');
    // Assert the content to be invisible again
<<<<<<< HEAD
    cy.get('body').should('not.include.text', 'Visualization Type');
=======
    cy.get('body').should('not.include.text', 'Visualization type');
>>>>>>> develop
  });
});
