import { isEnabled } from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { find, get, includes } from 'lodash';
import { Component } from 'react';
import * as React from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import PeopleSearch from 'calypso/my-sites/people/people-section-nav/people-search';

class PeopleNavTabs extends React.Component {
	static displayName = 'PeopleNavTabs';

	render() {
		return (
			<NavTabs selectedText={ this.props.selectedText }>
				{ this.props.filters.map( function ( filterItem ) {
					return (
						<NavItem
							key={ filterItem.id }
							path={ filterItem.path }
							selected={ filterItem.id === this.props.filter }
						>
							{ filterItem.title }
						</NavItem>
					);
				}, this ) }
			</NavTabs>
		);
	}
}

class PeopleSectionNav extends Component {
	canSearch() {
		const { filter } = this.props;
		if ( ! this.props.site ) {
			return false;
		}

		// Disable search for wpcom followers, viewers, and invites
		if ( filter ) {
			if ( 'followers' === filter || 'viewers' === filter || 'invites' === filter ) {
				return false;
			}
		}

		return true;
	}

	getFilters() {
		const siteFilter = get( this.props.site, 'slug', '' );
		const { translate } = this.props;
		const filters = [
			{
				title: translate( 'Team', { context: 'Filter label for people list' } ),
				path: '/people/team/' + siteFilter,
				id: 'team',
			},
			{
				title: translate( 'Followers', { context: 'Filter label for people list' } ),
				path: '/people/followers/' + siteFilter,
				id: 'followers',
			},
			{
				title: isEnabled( 'subscriber-importer' )
					? translate( 'Email Subscribers', { context: 'Filter label for people list' } )
					: translate( 'Email Followers', { context: 'Filter label for people list' } ),
				path: '/people/email-followers/' + siteFilter,
				id: 'email-followers',
			},
			{
				title: translate( 'Viewers', { context: 'Filter label for people list' } ),
				path: '/people/viewers/' + siteFilter,
				id: 'viewers',
			},
			{
				title: translate( 'Invites' ),
				path: '/people/invites/' + siteFilter,
				id: 'invites',
			},
		];

		return filters;
	}

	getNavigableFilters() {
		const allowedFilterIds = [ 'team', 'followers', 'email-followers', 'invites' ];

		if ( this.shouldDisplayViewers() ) {
			allowedFilterIds.push( 'viewers' );
		}

		return this.getFilters().filter(
			( filter ) => this.props.filter === filter.id || includes( allowedFilterIds, filter.id )
		);
	}

	shouldDisplayViewers() {
		if ( ! this.props.site ) {
			return false;
		}

		const isPrivateOrPublicComingSoon = this.props.isPrivate || this.props.isComingSoon;

		if (
			'viewers' === this.props.filter ||
			( ! this.props.isJetpack && isPrivateOrPublicComingSoon )
		) {
			return true;
		}
		return false;
	}

	render() {
		let hasPinnedItems = false;
		let search = null;

		if ( this.canSearch() ) {
			hasPinnedItems = true;
			search = <PeopleSearch { ...this.props } />;
		}

		const selectedText = find( this.getFilters(), { id: this.props.filter } ).title;
		return (
			<SectionNav selectedText={ selectedText } hasPinnedItems={ hasPinnedItems }>
				<PeopleNavTabs
					{ ...this.props }
					selectedText={ selectedText }
					filters={ this.getNavigableFilters() }
				/>
				{ search }
			</SectionNav>
		);
	}
}

export default localize( PeopleSectionNav );
