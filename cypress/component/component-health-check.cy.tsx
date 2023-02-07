import * as React from 'react';
import { mount } from 'cypress/react';
import { MainApp } from '../../src/demo/MainApp';

describe('Health check for Cypress component test', () => {
  it('should mount MainApp', () => {
    mount(<MainApp />);
    cy.get('body').should('include.text', 'Visualization type');
  });
});
