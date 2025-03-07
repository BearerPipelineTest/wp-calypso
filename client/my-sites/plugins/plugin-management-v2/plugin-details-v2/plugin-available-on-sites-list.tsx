import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSitesWithSecondarySites } from 'calypso/my-sites/plugins/plugin-management-v2/utils/get-sites-with-secondary-sites';
import SitesList from '../sites-list';
import type { Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	sites: Array< SiteDetails | null | undefined >;
	selectedSite: SiteDetails;
	isLoading: boolean;
	plugin: Plugin;
}

export default function PluginAvailableOnSitesList( props: Props ): ReactElement | null {
	const translate = useTranslate();

	const columns = [
		{
			key: 'site-name',
			header: translate( 'Site' ),
			colSpan: 2,
		},
		{ key: 'install' },
	];

	const sitesWithSecondarySites = useSelector( ( state ) =>
		getSitesWithSecondarySites( state, props.sites )
	);

	if ( ! sitesWithSecondarySites?.length ) {
		return null;
	}

	return (
		<div>
			<div className="plugin-details-v2__title">{ translate( 'Available on' ) }</div>
			<SitesList
				{ ...props }
				items={ sitesWithSecondarySites.map( ( site ) => site.site ) }
				columns={ columns }
			/>
		</div>
	);
}
