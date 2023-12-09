describe('Spreadsheet e2e', () => {

    Cypress.on('fail', (error) => {
      throw error
    })

    beforeEach(() => {
        cy.visit('localhost:5173');
    });

    it('should have a title', () => {
      cy.get('.pb-2').should('have.text', 'Spreadsheet')
    });

    it('first column name should be A', () => {
      cy.get('thead > tr > :nth-child(2)').should('have.text', 'A')
    });

    it('last column name should be Z', () => {
      cy.get('thead > tr > :nth-child(27)').should('have.text', 'Z')
    });

    it('first row name should be 1', () => {
      cy.get('tbody > :nth-child(1) > th').should('have.text', '1')
    });

    it('last row name should be 100', () => {
      cy.get(':nth-child(100) > th').should('have.text', '100')
    });

    it('add input to a cell', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('test')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(2) > .cell').should('have.text', 'test')      
    });

    it('selects a cell', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').click()
      cy.get(':nth-child(1) > :nth-child(2) > .cell').should('have.class', 'selected')
    });

    it('adds a new column to empty spreadsheet', () => {
      cy.get('.insert-column-btn').click()
      cy.get('.form-control').click().type('Z')
      cy.get('.modal-footer > .btn-primary').click()
      cy.get('thead > tr > :nth-child(28)').should('have.text', 'AA')
    });

    it('adds a new row to empty spreadsheet', () => {
      cy.get('.insert-row-btn').click()
      cy.get('.form-control').click().type('100')
      cy.get('.modal-footer > .btn-primary').click()
      cy.get(':nth-child(101) > th').should('have.text', '101')
    });

    it('adds a new column to non-empty spreadsheet', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('test')
      cy.get('input').type('{enter}')
      cy.get('.insert-column-btn').click()
      cy.get('.form-control').click().type('A')
      cy.get('.modal-footer > .btn-primary').click()
      cy.get(':nth-child(1) > :nth-child(2) > .cell').should('have.text', '')
      cy.get(':nth-child(1) > :nth-child(3) > .cell').should('have.text', 'test')
    });

    it('adds a new row to non-empty spreadsheet', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('test')
      cy.get('input').type('{enter}')
      cy.get('.insert-row-btn').click()
      cy.get('.form-control').click().type('1')
      cy.get('.modal-footer > .btn-primary').click()
      cy.get(':nth-child(1) > :nth-child(2) > .cell').should('have.text', '')
      cy.get(':nth-child(2) > :nth-child(2) > .cell').should('have.text', 'test')
    });

    it('deletes a column', () => {
      cy.get('.delete-column-btn').click()
      cy.get('.form-control').click().type('Z')
      cy.get('.modal-footer > .btn-primary').click()
      cy.get('thead > tr > :nth-child(27)').should('not.exist')
      cy.get('thead > tr > :nth-child(26)').should('have.text', 'Y')
    });

    it('deletes a row', () => {
      cy.get('.delete-row-btn').click()
      cy.get('.form-control').click().type('100')
      cy.get('.modal-footer > .btn-primary').click()
      cy.get(':nth-child(100) > th').should('not.exist')
      cy.get(':nth-child(99) > th').should('have.text', '99')
    });

    it('completes an addition operation in a cell', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('= 1 + 1')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(3) > .cell').dblclick().click();
      cy.get(':nth-child(1) > :nth-child(2) > .cell').should('have.text', '2')
    });

    it('completes a subtraction operation in a cell', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('= 1 - 1')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(3) > .cell').dblclick().click();
      cy.get(':nth-child(1) > :nth-child(2) > .cell').should('have.text', '0')
    });

    it('completes a multiplication operation in a cell', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('= 2 * 2')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(3) > .cell').dblclick().click();
      cy.get(':nth-child(1) > :nth-child(2) > .cell').should('have.text', '4')
    });

    it('completes a division operation in a cell', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('= 2 / 2')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(3) > .cell').dblclick().click();
      cy.get(':nth-child(1) > :nth-child(2) > .cell').should('have.text', '1')
    });

    it('completes a complex formula in a cell', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('= 2 * 3 + 1')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(3) > .cell').dblclick().click();
      cy.get(':nth-child(1) > :nth-child(2) > .cell').should('have.text', '7')
    });

    it('handles divison by zero in a cell', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('= 2 / 0')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(3) > .cell').dblclick().click();
      cy.get(':nth-child(1) > :nth-child(2) > .cell').should('have.text', 'Infinity')
    });

    it('cells are able to reference another cell', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('7')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(3) > .cell').dblclick().click();
      cy.get('input').click().type('REF(A1)')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(4) > .cell').dblclick().click();
      cy.get(':nth-child(1) > :nth-child(3) > .cell').should('have.text', '7')
    });

    it.only('cells are able to calculate a formula with references', () => {
      cy.get(':nth-child(1) > :nth-child(2) > .cell').dblclick().click();
      cy.get('input').click().type('7')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(3) > .cell').dblclick().click();
      cy.get('input').click().type('= REF(A1) + 1')
      cy.get('input').type('{enter}')
      cy.get(':nth-child(1) > :nth-child(4) > .cell').dblclick().click();
      cy.get(':nth-child(1) > :nth-child(3) > .cell').should('have.text', '8')
    });

});
