describe('Health check for Cypress e2e test', () => {
  it('should visit the home page', () => {
    cy.visit('/');
    // Login first using the new modal
    cy.get('[data-testid="visyn-login-modal"]').should('include.text', 'Demo App');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin');
    cy.get('button[type="submit"]').click();
    // Assert the content is now visible
    cy.get('body').should('include.text', 'Visualization type');
    // Check the user avatar, and then log out again
    cy.get('[data-testid="visyn-user-avatar"]').should('include.text', 'A').click();
    cy.get('[data-testid="user-menu-item"]').parent().contains('Logout').click();
    // Assert the login modal to be shown again
    cy.get('[data-testid="visyn-login-modal"]').should('include.text', 'Demo App');
    // Assert the content to be invisible again
    cy.get('body').should('not.include.text', 'Visualization type');
  });
});
