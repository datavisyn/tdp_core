describe('Health check for Cypress e2e test', () => {
  it('should visit the home page', () => {
    cy.visit('/');
    cy.get('body').should('include.text', 'Visualization type');
  });
});
