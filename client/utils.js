// Adapts route paths to also include wildcard
// subroutes under the root level section.
export function pathToRegExp( path ) {
	// Prevents root level double dash urls from being validated.
	if ( path === '/' ) {
		return path;
	}
	return new RegExp( '^' + path + '(/.*)?$' );
}

export function redirectToLaunchpad( siteSlug, launchpadFlow ) {
	window.location.replace( `/setup/launchpad?flow=${ launchpadFlow }&siteSlug=${ siteSlug }` );
}
