import { addQueryArgs } from 'calypso/lib/url';
import { SITE_LAUNCH } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/launch';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSiteSlug, isCurrentPlanPaid, getSiteOption } from 'calypso/state/sites/selectors';

export const launchSite = ( siteId ) => ( {
	type: SITE_LAUNCH,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ SITE_LAUNCH }-${ siteId }`,
		},
	},
} );

/**
 * @param {number} siteId
 * @param {string?} source
 */
export const launchSiteOrRedirectToLaunchSignupFlow =
	( siteId, source = null ) =>
	( dispatch, getState ) => {
		if ( ! isUnlaunchedSite( getState(), siteId ) ) {
			return;
		}

		const isAnchorPodcast = getSiteOption( getState(), siteId, 'anchor_podcast' );
		const isPaidWithDomain =
			isCurrentPlanPaid( getState(), siteId ) &&
			getDomainsBySiteId( getState(), siteId ).length > 1;

		if ( isPaidWithDomain || isAnchorPodcast ) {
			dispatch( launchSite( siteId ) );
			return;
		}

		const siteSlug = getSiteSlug( getState(), siteId );

		// Adding domain queries auto-populate the domain suggestions in the domain step.
		const domainQuery = {
			new: siteSlug,
			search: 'yes',
			hide_initial_query: 'yes',
		};

		// TODO: consider using the `page` library instead of calling using `location.href` here
		window.location.href = addQueryArgs(
			{ siteSlug, source, ...domainQuery },
			'/start/launch-site'
		);
	};
