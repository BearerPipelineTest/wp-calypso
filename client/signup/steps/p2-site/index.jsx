import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { Path, SVG } from '@wordpress/components';
import { createRef } from '@wordpress/element';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { includes, isEmpty, map, deburr, get, debounce } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import formState from 'calypso/lib/form-state';
import { getLanguage, getLocaleSlug } from 'calypso/lib/i18n-utils';
import { logToLogstash } from 'calypso/lib/logstash';
import { login } from 'calypso/lib/paths';
import wpcom from 'calypso/lib/wp';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { getValueFromProgressStore } from 'calypso/signup/utils';
import ValidationFieldset from 'calypso/signup/validation-fieldset';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import './style.scss';

const debug = debugFactory( 'calypso:steps:p2-site' );

/**
 * Constants
 */
const VALIDATION_DELAY_AFTER_FIELD_CHANGES = 1500;
const ERROR_CODE_MISSING_SITE_TITLE = 123; // Random number, we don't need it.
const ERROR_CODE_MISSING_SITE = 321; // Random number, we don't need it.
const ERROR_CODE_TAKEN_SITE = 1337; // Random number, we don't need it.
const ERROR_CODE_FROM_LOCAL_STORAGE = 7331; // Random number, we don't need it.

const SITE_TAKEN_ERROR_CODES = [
	'blog_name_exists',
	'blog_name_reserved',
	'blog_name_reserved_but_may_be_available',
	'dotblog_subdomain_not_available',
];

const WPCOM_SUBDOMAIN_SUFFIX_SUGGESTIONS = [ 'p2', 'team', 'work' ];

const EMAIL_TRUCE_CAMPAIGN_REF = 'p2-email-truce';
const EMAIL_TRUCE_CAMPAIGN_ID = 'p2-email-truce';

/**
 * Module variables
 */
let siteUrlsSearched = [];
let timesValidationFailed = 0;

class P2Site extends Component {
	static displayName = 'P2Site';

	constructor( props ) {
		super( props );

		let initialState;

		if ( props?.step?.form ) {
			initialState = props.step.form;

			if ( ! isEmpty( props.step.errors ) ) {
				const errorMessage = props.step.errors[ 0 ].message;

				this.logValidationErrorToLogstash( ERROR_CODE_FROM_LOCAL_STORAGE, errorMessage );

				initialState = formState.setFieldErrors(
					formState.setFieldsValidating( initialState ),
					{
						site: {
							[ ERROR_CODE_FROM_LOCAL_STORAGE ]: errorMessage,
						},
					},
					true
				);
			}
		}

		this.formStateController = new formState.Controller( {
			fieldNames: [ 'site', 'siteTitle' ],
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
			debounceWait: VALIDATION_DELAY_AFTER_FIELD_CHANGES,
			hideFieldErrorsOnChange: true,
			initialState: initialState,
			skipSanitizeAndValidateOnFieldChange: true,
		} );

		this.state = {
			form: this.formStateController.getInitialState(),
			submitting: false,
			suggestedSubdomains: [],
			lastSuggestionSuffixIndex: 0,
			lastInvalidSite: '',
			isFetchingDefaultSuggestion: false,
			showSiteCustomiser: false,
		};
	}

	componentWillUnmount() {
		this.save();
	}

	customiseSiteInput = createRef();

	sanitizeSubdomain = ( domain ) => {
		if ( ! domain ) {
			return domain;
		}
		return deburr( domain )
			.replace( /[^a-zA-Z0-9]/g, '' )
			.toLowerCase();
	};

	sanitize = ( fields, onComplete ) => {
		const sanitizedSubdomain = this.sanitizeSubdomain( fields.site );
		if ( fields.site !== sanitizedSubdomain ) {
			onComplete( { site: sanitizedSubdomain, siteTitle: fields.siteTitle } );
		}
	};

	logValidationErrorToLogstash = ( error, errorMessage ) => {
		logToLogstash( {
			feature: 'calypso_wp_for_teams',
			message: 'P2 signup validation failed',
			extra: {
				'site-address': formState.getFieldValue( this.state.form, 'site' ),
				error,
				'error-message': errorMessage,
			},
		} );
	};

	fetchSuggestion = async () => {
		const nextSuggestionSuffixIndex =
			( this.state.lastSuggestionSuffixIndex + 1 ) % WPCOM_SUBDOMAIN_SUFFIX_SUGGESTIONS.length;

		this.setState( { lastSuggestionSuffixIndex: nextSuggestionSuffixIndex } );
		const suggestionSuffix = WPCOM_SUBDOMAIN_SUFFIX_SUGGESTIONS[ nextSuggestionSuffixIndex ];
		const currentTitle = formState.getFieldValue( this.state.form, 'siteTitle' );
		const suggestionQuery = `${ currentTitle }${ suggestionSuffix }`;

		const suggestionObjects = await wpcom.domains().suggestions( {
			quantity: 1,
			query: suggestionQuery,
			only_wordpressdotcom: true,
		} );

		const suggestion = get( suggestionObjects, '0.domain_name', null );

		if ( suggestion ) {
			const [ subdomain ] = suggestion.split( '.' );
			this.formStateController.handleFieldChange( {
				name: 'site',
				value: subdomain,
			} );
		}
	};

	suggestDefaultSubdomain = async () => {
		if ( this.state.isFetchingDefaultSuggestion ) {
			return;
		}
		try {
			this.setState( { isFetchingDefaultSuggestion: true } );
			await this.fetchSuggestion();
		} finally {
			this.setState( { isFetchingDefaultSuggestion: false } );
		}
	};

	debouncedSuggestDefaultSubdomain = debounce( this.suggestDefaultSubdomain, 600 );

	validate = ( fields, onComplete ) => {
		const messages = {};

		if ( isEmpty( fields.siteTitle ) ) {
			messages.siteTitle = {
				[ ERROR_CODE_MISSING_SITE_TITLE ]: this.props.translate(
					'Please enter your team or project name.'
				),
			};
		}

		if ( isEmpty( fields.site ) ) {
			messages.site = {
				[ ERROR_CODE_MISSING_SITE ]: this.props.translate( 'Please enter your site address.' ),
			};
		}

		if ( ! isEmpty( fields.site ) ) {
			const locale = getLocaleSlug();
			wpcom.req.post(
				'/sites/new',
				{
					blog_name: fields.site,
					blog_title: fields.siteTitle,
					validate: true,
					locale,
					lang_id: getLanguage( locale ).value,
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
				},
				( error, response ) => {
					debug( error, response );

					if ( this.state.lastInvalidSite !== fields.site ) {
						this.setState( { suggestedSubdomains: [] } );
					}

					this.setState( { lastInvalidSite: fields.site } );

					if ( error && error.message ) {
						if ( fields.site && ! includes( siteUrlsSearched, fields.site ) ) {
							siteUrlsSearched.push( fields.site );

							recordTracksEvent( 'calypso_signup_wp_for_teams_site_url_validation_failed', {
								error: error.error,
								site_url: fields.site,
							} );
						}

						timesValidationFailed++;

						if ( error.error === 'blog_title_invalid' ) {
							const errorMessage = this.props.translate(
								'Please enter a valid team or project name.'
							);

							messages.siteTitle = {
								[ error.error ]: errorMessage,
							};

							this.logValidationErrorToLogstash( error.error, errorMessage );
						} else {
							if ( SITE_TAKEN_ERROR_CODES.includes( error.error ) ) {
								messages.site = {
									[ ERROR_CODE_TAKEN_SITE ]: this.props.translate(
										'Sorry, that site already exists! Here are some available alternatives:'
									),
								};
							} else {
								messages.site = {
									[ error.error ]: error.message,
								};
							}

							// We want to log the real error code and message. The above is formatted for the end user
							// only.
							this.logValidationErrorToLogstash( error.error, error.message );
						}

						if ( error.error && SITE_TAKEN_ERROR_CODES.includes( error.error ) ) {
							WPCOM_SUBDOMAIN_SUFFIX_SUGGESTIONS.forEach( ( suffix ) => {
								const suggestedSubdomain = `${ fields.site }${ suffix }`;

								wpcom
									.domains()
									.suggestions( {
										quantity: 1,
										query: suggestedSubdomain,
										only_wordpressdotcom: true,
									} )
									.then( ( suggestionObjects ) => {
										this.setState( {
											suggestedSubdomains: [
												...this.state.suggestedSubdomains,
												get( suggestionObjects, '0.domain_name', null ),
											],
										} );
									} )
									.catch( () => {} );
							} );
						}
					}

					onComplete( null, messages );
				}
			);
		} else if ( ! isEmpty( messages ) ) {
			if ( messages.siteTitle ) {
				this.logValidationErrorToLogstash(
					ERROR_CODE_MISSING_SITE_TITLE,
					messages.siteTitle[ ERROR_CODE_MISSING_SITE_TITLE ]
				);
			}

			if ( messages.site ) {
				this.logValidationErrorToLogstash(
					ERROR_CODE_MISSING_SITE,
					messages.site[ ERROR_CODE_MISSING_SITE ]
				);
			}

			onComplete( null, messages );
		}
	};

	setFormState = ( state ) => {
		this.setState( { form: state } );
	};

	resetAnalyticsData = () => {
		siteUrlsSearched = [];
		timesValidationFailed = 0;
	};

	handleSubmit = ( event ) => {
		event.preventDefault();

		this.setState( { submitting: true } );

		this.formStateController.handleSubmit( ( hasErrors ) => {
			const site = formState.getFieldValue( this.state.form, 'site' );
			const siteTitle = formState.getFieldValue( this.state.form, 'siteTitle' );

			this.setState( { submitting: false } );

			if ( hasErrors ) {
				return;
			}

			recordTracksEvent( 'calypso_signup_wp_for_teams_site_step_submit', {
				unique_site_urls_searched: siteUrlsSearched.length,
				times_validation_failed: timesValidationFailed,
			} );

			this.resetAnalyticsData();

			const stepData = {
				stepName: this.props.stepName,
				form: this.state.form,
				site,
				siteTitle,
			};

			const refParameter =
				this.props.refParameter ||
				getValueFromProgressStore( {
					signupProgress: this.props.progress,
					stepName: 'p2-confirm-email',
					fieldName: 'storedRefParameter',
				} );
			if ( refParameter === EMAIL_TRUCE_CAMPAIGN_REF ) {
				stepData.campaign = EMAIL_TRUCE_CAMPAIGN_ID;
			}

			this.props.submitSignupStep( stepData );

			this.props.goToNextStep();
		} );
	};

	handleBlur = () => {
		this.formStateController.sanitize();
		this.save();
	};

	save = () => {
		this.props.saveSignupStep( {
			stepName: 'p2-site',
			form: this.state.form,
		} );
	};

	handleChangeEvent = ( event ) => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );

		if ( event.target.name === 'site-title' && ! this.state.showSiteCustomiser ) {
			this.debouncedSuggestDefaultSubdomain();
		}

		if ( event.target.name === 'site' ) {
			this.setState( { suggestedSubdomains: [] } );
		}
	};

	handleFormControllerError = ( error ) => {
		if ( error ) {
			throw error;
		}
	};

	getErrorMessagesWithLogin = ( fieldName ) => {
		const link = login( { redirectTo: window.location.href } );
		const messages = formState.getFieldErrorMessages( this.state.form, fieldName );

		if ( ! messages ) {
			return;
		}

		return map( messages, ( message, error_code ) => {
			if ( error_code === 'blog_name_reserved' ) {
				return (
					<span>
						<p>
							{ message }
							&nbsp;
							{ this.props.translate(
								'Is this your username? {{a}}Log in now to claim this site address{{/a}}.',
								{
									components: {
										a: <a href={ link } />,
									},
								}
							) }
						</p>
					</span>
				);
			}
			return message;
		} );
	};

	handleSubdomainSuggestionClick = ( suggestedSubdomain ) => {
		const site = suggestedSubdomain.substring( 0, suggestedSubdomain.indexOf( '.' ) );

		this.formStateController.handleFieldChange( {
			name: 'site',
			value: site,
		} );

		this.setState( {
			suggestedSubdomains: [],
		} );
	};

	renderDefaultSite = () => {
		const site = formState.getFieldValue( this.state.form, 'site' );
		if ( ! site ) {
			return '';
		}
		return (
			<>
				{ 'https://' }
				<span className="p2-site__site-wordpress-domain">{ site }</span>
				{ '.wordpress.com' }
			</>
		);
	};

	showSiteCustomiser = () => {
		this.setState( { showSiteCustomiser: true } );
		setTimeout( () => {
			this.customiseSiteInput?.current?.focus();
		}, 0 );
	};

	hideSiteCustomiser = () => {
		this.setState( { showSiteCustomiser: false } );
	};

	formFields = () => {
		const { submitting, form, showSiteCustomiser, isFetchingDefaultSuggestion } = this.state;

		const siteTitle = formState.getFieldValue( form, 'siteTitle' );
		const site = formState.getFieldValue( form, 'site' );
		const showSubdomainInput = !! siteTitle || !! site;

		return (
			<>
				<ValidationFieldset
					errorMessages={ this.getErrorMessagesWithLogin( 'siteTitle' ) }
					className="p2-site__validation-site-title"
				>
					<FormLabel htmlFor="site-title-input">
						{ this.props.translate( 'Workspace name' ) }
					</FormLabel>
					<FormTextInput
						id="site-title-input"
						autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
						autoCapitalize={ 'off' }
						className="p2-site__site-title"
						disabled={ submitting }
						name="site-title"
						value={ siteTitle }
						isError={ formState.isFieldInvalid( form, 'siteTitle' ) }
						isValid={ formState.isFieldValid( form, 'siteTitle' ) }
						onBlur={ this.handleBlur }
						onChange={ this.handleChangeEvent }
					/>
					<FormSettingExplanation className="p2-site__workspace-form-input-explanation">
						{ this.props.translate( 'This is usually the name of your company or organization' ) }
					</FormSettingExplanation>
				</ValidationFieldset>
				{ showSubdomainInput && (
					<ValidationFieldset
						errorMessages={ this.getErrorMessagesWithLogin( 'site' ) }
						className="p2-site__validation-site"
					>
						<FormLabel htmlFor="site-address-input">
							{ this.props.translate( 'Workspace address' ) }
						</FormLabel>
						<div className="p2-site__site-url-container">
							{ ! showSiteCustomiser && (
								<>
									<FormTextInput
										title={ site ? `https://${ site }.wordpress.com` : '' }
										id="site-address-input"
										autoCapitalize={ 'off' }
										className="p2-site__site-suggested-url"
										disabled={ true }
										name="suggested-site"
										value={ site ? `https://${ site }.wordpress.com` : '' }
									/>
									<FormSettingExplanation className="p2-site__workspace-form-input-explanation">
										{ this.props.translate(
											'We suggest this URL, but you can {{a}}choose manually{{/a}} too',
											{
												components: {
													a: <a href="#" onClick={ this.showSiteCustomiser } />, // eslint-disable-line jsx-a11y/anchor-is-valid
												},
											}
										) }
									</FormSettingExplanation>
									<span className="p2-site__wordpress-domain-default">
										{ this.renderDefaultSite() }
									</span>
									{ ! isFetchingDefaultSuggestion && (
										<Gridicon
											data-testid="refresh-suggestion"
											onClick={ this.suggestDefaultSubdomain }
											className="p2-site__site-wordpress-domain-refresh"
											size={ 24 }
											icon="sync"
										/>
									) }
								</>
							) }
							{ showSiteCustomiser && (
								<>
									<FormTextInput
										id="site-address-input"
										ref={ this.customiseSiteInput }
										autoCapitalize={ 'off' }
										className="p2-site__site-url"
										disabled={ submitting }
										name="site"
										value={ site }
										isError={ formState.isFieldInvalid( form, 'site' ) }
										isValid={ formState.isFieldValid( form, 'site' ) }
										onBlur={ this.handleBlur }
										onChange={ this.handleChangeEvent }
									/>
									<FormSettingExplanation className="p2-site__workspace-form-input-explanation">
										{ this.props.translate( 'Enter an address, or {{a}}choose a suggestion{{/a}}', {
											components: {
												a: <a href="#" onClick={ this.hideSiteCustomiser } />, // eslint-disable-line jsx-a11y/anchor-is-valid
											},
										} ) }
									</FormSettingExplanation>
									<span className="p2-site__wordpress-domain-suffix">.wordpress.com</span>
								</>
							) }
						</div>
					</ValidationFieldset>
				) }
				{ this.renderFormNotice() }
			</>
		);
	};

	buttonText = () => {
		if ( this.props.step && 'completed' === this.props.step.status ) {
			return this.props.translate( 'Site created - Go to next step' );
		}

		return this.props.translate( 'Create workspace' );
	};

	renderFormNotice = () => {
		return (
			<div className="p2-site__workspace-form-notice-wrapper">
				<hr />
				<div className="p2-site__workspace-form-notice">
					<div className="p2-site__workspace-form-notice-icon">
						<Gridicon size={ 18 } icon="info-outline" />
					</div>
					<p>
						{ this.props.translate(
							"The first P2 in your workspace will be created automatically for you, so you can focus on getting started. You'll be able to customize it at any time!"
						) }
					</p>
				</div>
				<hr />
			</div>
		);
	};

	renderSubdomainSuggestions() {
		const { suggestedSubdomains } = this.state;

		if ( isEmpty( suggestedSubdomains ) ) {
			return null;
		}

		return (
			<div className="p2-site__subdomain-suggestions">
				{ map( suggestedSubdomains, ( suggestion, index ) => {
					return (
						<button
							key={ index }
							className="p2-site__subdomain-suggestions-item"
							onClick={ () => this.handleSubdomainSuggestionClick( suggestion ) }
						>
							{ suggestion }
						</button>
					);
				} ) }
			</div>
		);
	}

	render() {
		const { submitting, form } = this.state;
		const siteTitle = formState.getFieldValue( form, 'siteTitle' );
		const site = formState.getFieldValue( form, 'site' );
		const submitDisabled = submitting || ! site || ! siteTitle;
		return (
			<>
				<div className="p2-site__header-logo" data-testid="p2-logo">
					<SVG xmlns="http://www.w3.org/2000/svg" width="67" height="32" viewBox="0 0 67 32">
						<Path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M1.99451 0C0.892972 0 0 0.895431 0 2V30C0 31.1046 0.892973 32 1.99451 32H30.0055C31.107 32 32 31.1046 32 30V2C32 0.895431 31.107 0 30.0055 0H1.99451ZM22.1177 7.52942H9.41177V16H22.1177V7.52942ZM9.41177 18.8235H17.8824V24.4706H9.41177V18.8235Z"
							fill="none"
						/>
						<Path
							d="M54.7535 24.4461H66.8161V21.5213H59.7107V21.4057L62.1811 18.9849C65.6594 15.8123 66.593 14.226 66.593 12.3009C66.593 9.3679 64.197 7.29413 60.57 7.29413C57.0173 7.29413 54.58 9.41747 54.5883 12.7388H57.984C57.9757 11.1194 59.0002 10.128 60.5452 10.128C62.0324 10.128 63.1395 11.0534 63.1395 12.5405C63.1395 13.8872 62.3133 14.8126 60.7765 16.2915L54.7535 21.8684V24.4461Z"
							fill="none"
						/>
						<Path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M39.5294 24.4706H43.0973V18.9779H46.0966C49.9776 18.9779 52.2353 16.6535 52.2353 13.2702C52.2353 9.9035 50.0188 7.52942 46.1872 7.52942H39.5294V24.4706ZM43.0973 16.1075V10.4577H45.5033C47.5633 10.4577 48.5603 11.5827 48.5603 13.2702C48.5603 14.9495 47.5633 16.1075 45.5198 16.1075H43.0973Z"
							fill="none"
						/>
					</SVG>
				</div>
				<P2StepWrapper
					className="p2-site__create"
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.props.translate( 'Create a workspace' ) }
					subHeaderText={ this.props.translate(
						"Your {{b}}workspace{{/b}} is where you'll create all the different P2s for teams, projects, topics, etc.",
						{
							components: {
								b: <b />,
							},
						}
					) }
				>
					<form className="p2-site__form" onSubmit={ this.handleSubmit } noValidate>
						{ this.formFields() }
						{ this.renderSubdomainSuggestions() }
						<div className="p2-site__form-footer">
							<FormButton disabled={ submitDisabled } className="p2-site__form-submit-btn">
								{ this.buttonText() }
							</FormButton>
						</div>
					</form>

					<div className="p2-site__learn-more">
						<a href="https://wordpress.com/p2" className="p2-site__learn-more-link">
							{ this.props.translate( 'Learn more about P2' ) }
						</a>
					</div>
				</P2StepWrapper>
			</>
		);
	}
}

export default connect( null, { saveSignupStep, submitSignupStep } )( localize( P2Site ) );
