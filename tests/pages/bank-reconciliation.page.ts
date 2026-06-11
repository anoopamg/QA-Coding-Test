import { Page, Locator, expect } from '@playwright/test';

export class BankReconciliationPage {
  readonly page: Page;
  readonly dataGrid: Locator;
  readonly rowCount: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dataGrid = page.locator('[data-testid="transactions-grid"]');
    this.rowCount = page.locator('[data-testid="row-count"]');
    this.loadingIndicator = page.locator('[data-testid="loading"]');
  }

  navigateTo = async () => {
    // TODO: Navigate to /bank-reconciliation and wait for page to load
    await this.page.goto('/bank-reconciliation');
    await expect(this.dataGrid).toBeVisible();
  }

  getRowCount = async (): Promise<number> => {
    // Scroll down to load all rows and get total count from the app data model
    const gridBody = this.dataGrid.locator('.grid-body');
    
    // Scroll to bottom to ensure all data is loaded
    await gridBody.evaluate((element) => {
      const scroller = element.querySelector('.virtual-scroller');
      if (scroller) {
        scroller.scrollTop = scroller.scrollHeight;
      }
    });

    // Get total row count from the mock app's data model
    const totalCount = await this.page.evaluate(() => {
      // @ts-ignore
      if (window.bankRecApp && Array.isArray(window.bankRecApp.filteredTransactions)) {
        // @ts-ignore
        return window.bankRecApp.filteredTransactions.length;
      }
      // @ts-ignore
      return window.bankRecApp ? window.bankRecApp.transactions.length : 0;
    });

    return totalCount;
  }

  getTransactionAtIndex = async (index: number) => {
    // TODO: Get the transaction data from the specified row
    // HINT: Use [data-rowindex="${index}"] to find the row
    const row = this.dataGrid.locator(`[data-index="${index}"]`);
    await expect(row).toBeVisible();

    const rowData = await row.locator('[data-field]').all();
    const transaction: any = {};

    for (const cell of rowData) {
      const field = await cell.getAttribute('data-field');
      const value = await cell.textContent();
      if (field) {
        transaction[field] = value?.trim();
      }
    }

    return transaction;
  }

  editTransactionAmount = async (transactionId: string, newAmount: number): Promise<void> => {
    const row = await this.getTransactionRow(transactionId);
    const amountCell = row.locator('[data-field="amount"]');

    await amountCell.dblclick();

    const editInput = amountCell.locator('input');
    await expect(editInput).toBeVisible();

    await editInput.fill(newAmount.toString());
    await editInput.press('Enter');

    await expect(editInput).toBeHidden();
  }

  getTransactionRow = async (transactionId: string): Promise<Locator> => {
    const visibleRow = this.dataGrid.locator(`[data-id="${transactionId}"]`);
    const isVisible = await visibleRow.isVisible().catch(() => false);

    if (isVisible) {
      return visibleRow;
    }

    await this.scrollToTransaction(transactionId);
    await expect(visibleRow).toBeVisible();
    return visibleRow;
  }

  scrollToTransaction = async (transactionId: string): Promise<void> => {
    const gridContainer = this.dataGrid.locator('.MuiDataGrid-virtualScroller');
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const targetRow = this.dataGrid.locator(`[data-id="${transactionId}"]`);
      const isVisible = await targetRow.isVisible().catch(() => false);

      if (isVisible) {
        return;
      }

      await gridContainer.evaluate((element) => {
        element.scrollTop += element.clientHeight / 2;
      });

      await this.page.waitForTimeout(200);
      attempts++;
    }

    throw new Error(`Transaction ${transactionId} not found after scrolling`);
  }
}
