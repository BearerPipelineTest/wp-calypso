import { camelCase, mapKeys } from 'lodash';
import {
	getDomainRegistrationAgreementUrl,
	getDomainType,
	getGdprConsentStatus,
	getTransferStatus,
} from 'calypso/lib/domains/utils';

function assembleGoogleAppsSubscription( googleAppsSubscription ) {
	if ( ! googleAppsSubscription ) {
		return;
	}

	return mapKeys( googleAppsSubscription, ( value, key ) => camelCase( key ) );
}

function assembleCurrentUserCannotAddEmailReason( reason ) {
	if ( ! reason || ! reason.errors ) {
		return null;
	}

	const errorDetails = Object.entries( reason.errors ).map( ( entry ) => {
		const [ errorCode, errorMessages ] = entry;
		return {
			code: errorCode,
			message: errorMessages[ 0 ],
		};
	} );
	if ( ! errorDetails.length ) {
		return null;
	}
	return errorDetails[ 0 ];
}

/**
 * Creates a ResponseDomain object.
 *
 * @param {object} domain domain object
 * @returns {import('calypso/lib/domains/types').ResponseDomain} Response domain
 */
export const createSiteDomainObject = ( domain ) => {
	let transferEndDate = null;
	if ( domain.transfer_start_date ) {
		transferEndDate = new Date( domain.transfer_start_date );
		transferEndDate.setDate( transferEndDate.getDate() + 7 ); // Add 7 days.
		transferEndDate = transferEndDate.toISOString();
	}

	return {
		aRecordsRequiredForMapping: domain.a_records_required_for_mapping,
		autoRenewalDate: String( domain.auto_renewal_date ),
		adminEmail: domain.admin_email,
		aftermarketAuction: Boolean( domain.aftermarket_auction ),
		aftermarketAuctionEnd: String( domain.aftermarket_auction_end ?? '' ),
		aftermarketAuctionStart: String( domain.aftermarket_auction_start ?? '' ),
		autoRenewing: Boolean( domain.auto_renewing ),
		beginTransferUntilDate: String( domain.begin_transfer_until_date ),
		blogId: Number( domain.blog_id ),
		bundledPlanSubscriptionId: domain.bundled_plan_subscription_id,
		canSetAsPrimary: Boolean( domain.can_set_as_primary ),
		canManageDnsRecords: Boolean( domain.can_manage_dns_records ),
		canManageNameServers: Boolean( domain.can_manage_name_servers ),
		canUpdateContactInfo: Boolean( domain.can_update_contact_info ),
		cannotManageDnsRecordsReason: domain.cannot_manage_dns_records_reason
			? String( domain.cannot_manage_dns_records_reason )
			: null,
		cannotManageNameServersReason: domain.cannot_manage_name_servers_reason
			? String( domain.cannot_manage_name_servers_reason )
			: null,
		cannotUpdateContactInfoReason: domain.cannot_update_contact_info_reason
			? String( domain.cannot_update_contact_info_reason )
			: null,
		connectionMode: String( domain.connection_mode ),
		contactInfoDisclosureAvailable: Boolean( domain.contact_info_disclosure_available ),
		contactInfoDisclosed: Boolean( domain.contact_info_disclosed ),
		currentUserCanAddEmail: Boolean( domain.current_user_can_add_email ),
		currentUserCanCreateSiteFromDomainOnly: Boolean(
			domain.current_user_can_create_site_from_domain_only
		),
		currentUserCanManage: Boolean( domain.current_user_can_manage ),
		currentUserCannotAddEmailReason: assembleCurrentUserCannotAddEmailReason(
			domain.current_user_cannot_add_email_reason
		),
		currentUserIsOwner: Boolean( domain.current_user_is_owner ),
		domain: String( domain.domain ),
		domainLockingAvailable: Boolean( domain.domain_locking_available ),
		domainRegistrationAgreementUrl: getDomainRegistrationAgreementUrl( domain ),
		emailForwardsCount: Number( domain.email_forwards_count ),
		expired: Boolean( domain.expired ),
		expiry: ! domain.expiry ? null : String( domain.expiry ),
		expirySoon: Boolean( domain.expiry_soon ),
		gdprConsentStatus: getGdprConsentStatus( domain ),
		googleAppsSubscription: assembleGoogleAppsSubscription( domain.google_apps_subscription ),
		titanMailSubscription: assembleGoogleAppsSubscription( domain.titan_mail_subscription ),
		hasRegistration: Boolean( domain.has_registration ),
		hasWpcomNameservers: domain.has_wpcom_nameservers,
		hasZone: Boolean( domain.has_zone ),
		isLocked: Boolean( domain.is_locked ),
		isRenewable: Boolean( domain.is_renewable ),
		isRedeemable: Boolean( domain.is_redeemable ),
		isEligibleForInboundTransfer: Boolean( domain.is_eligible_for_inbound_transfer ),
		isAutoRenewing: Boolean( domain.auto_renewing ),
		isIcannVerificationSuspended:
			typeof domain.is_icann_verification_suspended === 'boolean'
				? Boolean( domain.is_icann_verification_suspended )
				: null,
		isPendingIcannVerification: Boolean( domain.is_pending_icann_verification ),
		isPendingRenewal: Boolean( domain.pending_renewal ),
		isPremium: Boolean( domain.is_premium ),
		isPrimary: Boolean( domain.primary_domain ),
		isPendingWhoisUpdate: Boolean( domain.pending_whois_update ),
		isSubdomain: Boolean( domain.is_subdomain ),
		isWPCOMDomain: Boolean( domain.wpcom_domain ),
		isWpcomStagingDomain: Boolean( domain.is_wpcom_staging_domain ),
		manualTransferRequired: Boolean( domain.manual_transfer_required ),
		mustRemovePrivacyBeforeContactUpdate: Boolean(
			domain.must_remove_privacy_before_contact_update
		),
		name: String( domain.domain ),
		owner: String( domain.owner ),
		partnerDomain: Boolean( domain.partner_domain ),
		pendingRegistration: Boolean( domain.pending_registration ),
		pendingRegistrationTime: String( domain.pending_registration_time ),
		pendingTransfer: domain.pending_transfer,
		pointsToWpcom: Boolean( domain.points_to_wpcom ),
		privateDomain: domain.private_domain,
		privacyAvailable: Boolean( domain.privacy_available ),
		registrar: String( domain.registrar ),
		registrationDate: String( domain.registration_date ),
		renewableUntil: String( domain.renewable_until ),
		redeemableUntil: String( domain.redeemable_until ),
		registryExpiryDate: String( domain.registry_expiry_date ?? '' ),
		sslStatus: ! domain.ssl_status ? null : String( domain.ssl_status ),
		subdomainPart: String( domain.subdomain_part ),
		subscriptionId: domain.subscription_id,
		supportsDomainConnect: Boolean( domain.supports_domain_connect ),
		supportsGdprConsentManagement: Boolean( domain.supports_gdpr_consent_management ),
		supportsTransferApproval: Boolean( domain.supports_transfer_approval ),
		tldMaintenanceEndTime: domain.tld_maintenance_end_time,
		transferAwayEligibleAt: ! domain.transfer_away_eligible_at
			? null
			: String( domain.transfer_away_eligible_at ),
		transferLockOnWhoisUpdateOptional: Boolean( domain.transfer_lock_on_whois_update_optional ),
		type: getDomainType( domain ),
		transferStatus: getTransferStatus( domain ),
		transferStartDate: ! domain.transfer_start_date ? null : String( domain.transfer_start_date ),
		transferEndDate,
		whoisUpdateUnmodifiableFields: domain.whois_update_unmodifiable_fields,
	};
};
