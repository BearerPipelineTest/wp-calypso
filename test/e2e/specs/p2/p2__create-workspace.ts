/**
 * @group p2
 */

import { DataHelper } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

const createWorkspaceUrl = DataHelper.getCalypsoURL( 'start/p2/p2-site' );

const selectors = {
	// Fields
	siteTitleInput: 'input[name="site-title"]',
	suggestedSiteInput: 'input[name="suggested-site"]',
	siteInput: 'input[name="site"]',

	// Buttons
	submitButton: 'button[type="submit"]',

	// Others
	logo: '[data-testid="p2-logo"]',
};

describe( DataHelper.createSuiteTitle( 'P2: Create workspace' ), function () {
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
		await page.goto( createWorkspaceUrl );
	} );

	it( 'shows create workspace form', async () => {
		await page.waitForSelector( selectors.logo );
	} );

	it( 'shows the submit button disabled by default', async () => {
		const submitButtonHandle = await page.waitForSelector( selectors.submitButton );
		const submitButton = submitButtonHandle.asElement();

		expect( await submitButton.isDisabled() ).toBe( true );
	} );

	it( 'shows suggested domain after entering a title', async () => {
		await page.fill( selectors.siteTitleInput, 'Acme Inc' );
		await page.waitForSelector( selectors.suggestedSiteInput );
		await page.waitForFunction(
			`document.querySelector('${ selectors.suggestedSiteInput }').value.match(/https:\\/\\/.*\\.wordpress\\.com/)`
		);
	} );

	it( 'refreshes suggestions when clicking the refresh button', async () => {
		const currentSuggestionElement = await page.waitForFunction(
			`document.querySelector('${ selectors.suggestedSiteInput }').value`
		);
		const currentSuggestion = await currentSuggestionElement.jsonValue();
		await page.click( '[data-testid="refresh-suggestion"]' );
		await page.waitForFunction(
			`document.querySelector('${ selectors.suggestedSiteInput }').value !== '' && document.querySelector('${ selectors.suggestedSiteInput }').value !== '${ currentSuggestion }'`
		);
	} );

	it( 'switches to customisation view', async () => {
		await page.click( 'a:text("choose manually")' );
		await page.waitForSelector( selectors.siteInput );
	} );

	it( 'switches back to default suggestion view', async () => {
		await page.click( 'a:text("choose a suggestion")' );
		await page.waitForSelector( selectors.suggestedSiteInput );
	} );

	it( 'shows the submit button enabled', async () => {
		const submitButtonHandle = await page.waitForSelector( selectors.submitButton );
		const submitButton = submitButtonHandle.asElement();
		expect( await submitButton.isDisabled() ).toBe( false );
	} );
} );
