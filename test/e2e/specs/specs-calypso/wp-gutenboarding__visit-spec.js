/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';
import NewPage from '../../lib/pages/gutenboarding/new-page.js';

import * as driverManager from '../../lib/driver-manager.js';

const screenSize = driverManager.currentScreenSize();

describe( `Gutenboarding - Visit Gutenboarding page as a logged in user: (${ screenSize }) @parallel @canary`, function () {
	let driver;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	it( 'Can log in as user', async function () {
		await new LoginFlow( driver ).login();
	} );

	it( 'Can visit Gutenboarding', async function () {
		await NewPage.Visit( driver );
	} );
} );
