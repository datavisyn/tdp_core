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