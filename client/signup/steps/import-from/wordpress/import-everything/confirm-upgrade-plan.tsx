import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { sprintf } from '@wordpress/i18n';
import { check, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { SitesItem } from 'calypso/state/selectors/get-sites-items';
import type { FunctionComponent } from 'react';

interface Props {
	sourceSite: SitesItem | null;
}

export const ConfirmUpgradePlan: FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();

	const { sourceSite } = props;
	const plan = getPlan( PLAN_BUSINESS );
	const planId = plan?.getProductId();
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const promotedFeatures: string[] = plan?.getPromotedFeatures() ? plan?.getPromotedFeatures() : [];

	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const rawPrice = useSelector( ( state ) => getPlanRawPrice( state, planId as number, true ) );

	function renderFeatureList() {
		return (
			<ul className={ classnames( 'import__details-list' ) }>
				{ promotedFeatures.map( ( feature, i ) => (
					<li className={ classnames( 'import__upgrade-plan-feature' ) } key={ i }>
						<Icon size={ 20 } icon={ check } />
						<span>{ getFeatureByKey( feature ).getTitle() }</span>
					</li>
				) ) }
			</ul>
		);
	}

	return (
		<div className={ classnames( 'import__upgrade-plan' ) }>
			<QueryPlans />
			<p>
				{ sprintf(
					/* translators: the website could be any domain (eg: "yourname.com") */
					__(
						'To import your themes, plugins, users, and settings from %(website)s we need to upgrade your WordPress.com site. Select a plan below:'
					),
					{ website: sourceSite?.slug }
				) }
			</p>

			<div className={ classnames( 'import__upgrade-plan-container' ) }>
				<div className={ classnames( 'import__upgrade-plan-price' ) }>
					<h3 className={ classnames( 'plan-title' ) }>
						WordPress.com { getPlan( PLAN_BUSINESS )?.getTitle() }
					</h3>
					<PlanPrice rawPrice={ rawPrice } currency={ currencyCode } />
					<span className={ classnames( 'plan-time-frame' ) }>
						{ getPlan( PLAN_BUSINESS )?.getBillingTimeFrame() }
					</span>
				</div>
				<div className={ classnames( 'import__upgrade-plan-details' ) }>
					{ renderFeatureList() }
				</div>
			</div>
		</div>
	);
};

export default ConfirmUpgradePlan;
