import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPartnerPortalStoredCards from 'calypso/components/data/query-jetpack-partner-portal-stored-cards';
import Main from 'calypso/components/main';
import Pagination from 'calypso/components/pagination';
import AddStoredCreditCard from 'calypso/jetpack-cloud/sections/partner-portal/add-stored-credit-card';
import { useCursorPagination } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import StoredCreditCard from 'calypso/jetpack-cloud/sections/partner-portal/stored-credit-card';
import StoredCreditCardLoading from 'calypso/jetpack-cloud/sections/partner-portal/stored-credit-card/stored-credit-card-loading';
import {
	getAllStoredCards,
	getStoredCardsPerPage,
	isFetchingStoredCards,
	hasMoreStoredCards,
} from 'calypso/state/partner-portal/stored-cards/selectors';
import type { ReactElement } from 'react';

import './style.scss';

const preparePagingCursor = (
	direction: 'next' | 'prev',
	items: PaymentMethod[],
	isFirstPage: boolean
) => {
	if ( ! items.length || isFirstPage ) {
		return {
			startingAfter: '',
			endingBefore: '',
		};
	}

	return {
		startingAfter: direction === 'next' ? items[ items.length - 1 ].id : '',
		endingBefore: direction === 'prev' ? items[ 0 ].id : '',
	};
};

export default function PaymentMethodList(): ReactElement {
	const translate = useTranslate();
	const storedCards = useSelector( getAllStoredCards );
	const isFetching = useSelector( isFetchingStoredCards );
	const perPage = useSelector( getStoredCardsPerPage );
	const hasMore = useSelector( hasMoreStoredCards );
	const [ paging, setPaging ] = useState( { startingAfter: '', endingBefore: '' } );
	const onPageClickCallback = useCallback(
		( page, direction ) => {
			// Set a cursor for use in pagination.
			setPaging( preparePagingCursor( direction, storedCards, page === 1 ) );
		},
		[ storedCards, preparePagingCursor, setPaging ]
	);
	const [ page, showPagination, onPageClick ] = useCursorPagination(
		! isFetching,
		hasMore,
		onPageClickCallback
	);

	return (
		<Main wideLayout className="payment-method-list">
			<QueryJetpackPartnerPortalStoredCards paging={ paging } />
			<DocumentHead title={ translate( 'Payment Methods' ) } />
			<SidebarNavigation />

			<div className="payment-method-list__header">
				<CardHeading size={ 36 }>{ translate( 'Payment Methods' ) }</CardHeading>
			</div>

			<div className="payment-method-list__body">
				<AddStoredCreditCard />

				{ isFetching && <StoredCreditCardLoading /> }

				{ ! isFetching &&
					storedCards.map( ( card: PaymentMethod ) => (
						<StoredCreditCard key={ card.id } card={ card } />
					) ) }
			</div>

			{ showPagination && (
				<Pagination
					className={ classnames( 'payment-method-list__pagination', {
						'payment-method-list__pagination--has-prev': page > 1,
						'payment-method-list__pagination--has-next': isFetching || hasMore,
					} ) }
					pageClick={ onPageClick }
					page={ page }
					perPage={ perPage }
				/>
			) }
		</Main>
	);
}
