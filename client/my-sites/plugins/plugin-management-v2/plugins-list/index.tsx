import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PluginCommonList from '../plugin-common/plugin-common-list';
import PluginManageConnection from '../plugin-manage-connection';
import PluginRowFormatter from '../plugin-row-formatter';
import RemovePlugin from '../remove-plugin';
import type { Columns, PluginRowFormatterArgs, Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

import '../style.scss';

interface Props {
	selectedSite: SiteDetails;
	items: Array< Plugin >;
	isLoading: boolean;
	columns: Columns;
	className?: string;
	removePluginNotice: ( plugin: Plugin ) => void;
}

export default function PluginsList( {
	selectedSite,
	removePluginNotice,
	...rest
}: Props ): ReactElement {
	const translate = useTranslate();

	const rowFormatter = ( props: PluginRowFormatterArgs ) => {
		return <PluginRowFormatter { ...props } selectedSite={ selectedSite } />;
	};

	const renderActions = ( plugin: Plugin ) => {
		return (
			<>
				<PopoverMenuItem
					className="plugin-management-v2__actions"
					icon="chevron-right"
					href={ `/plugins/${ plugin.slug }${ selectedSite ? `/${ selectedSite.domain }` : '' }` }
				>
					{ translate( 'Manage Plugin' ) }
				</PopoverMenuItem>
				{ selectedSite ? (
					<RemovePlugin site={ selectedSite } plugin={ plugin } />
				) : (
					<PopoverMenuItem
						onClick={ () => removePluginNotice( plugin ) }
						icon="trash"
						className="plugin-management-v2__actions"
					>
						{ translate( 'Remove' ) }
					</PopoverMenuItem>
				) }
				{ selectedSite && <PluginManageConnection site={ selectedSite } plugin={ plugin } /> }
			</>
		);
	};

	return (
		<PluginCommonList
			{ ...rest }
			selectedSite={ selectedSite }
			rowFormatter={ rowFormatter }
			primaryKey="id"
			renderActions={ renderActions }
		/>
	);
}
