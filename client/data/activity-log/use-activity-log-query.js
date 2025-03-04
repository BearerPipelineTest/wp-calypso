import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import { filterStateToApiQuery } from 'calypso/state/activity-log/utils';
import fromActivityLogApi from 'calypso/state/data-layer/wpcom/sites/activity/from-api';
import { getFilterKey } from './utils';

export default function useActivityLogQuery( siteId, filter, options ) {
	return useQuery(
		[ 'activity-log', siteId, getFilterKey( filter ) ],
		() =>
			wpcom.req
				.get(
					{ path: `/sites/${ siteId }/activity`, apiNamespace: 'wpcom/v2' },
					filterStateToApiQuery( filter )
				)
				.then( fromActivityLogApi ),
		{
			refetchInterval: 5 * 60 * 1000,
			...options,
		}
	);
}
