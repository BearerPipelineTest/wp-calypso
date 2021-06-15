/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import NavBarComponent from '../../lib/components/nav-bar-component.js';
import SidebarComponent from '../../lib/components/sidebar-component.js';

import StatsPage from '../../lib/pages/stats-page.js';

import * as driverManager from '../../lib/driver-manager.js';

const screenSize = driverManager.currentScreenSize();

describe( 'Stats: (' + screenSize + ') @parallel', function () {
	let statsPage;
	let driver;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	it( 'Can log in as user', async function () {
		this.loginFlow = new LoginFlow( driver );
		return await this.loginFlow.login();
	} );

	it( 'Can open the sidebar', async function () {
		const navBarComponent = await NavBarComponent.Expect( driver );
		await navBarComponent.clickMySites();
	} );

	it( 'Can open the stats page', async function () {
		const sidebarComponent = await SidebarComponent.Expect( driver );
		await sidebarComponent.selectStats();
		statsPage = await StatsPage.Expect( driver );
	} );

	it( 'Can open the stats insights page', async function () {
		await statsPage.openInsights();
	} );
} );
