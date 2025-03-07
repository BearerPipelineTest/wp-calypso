import { Button, FormInputValidation, Popover } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { ColorPicker } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import React, { FormEvent, useEffect } from 'react';
import greenCheckmarkImg from 'calypso/assets/images/onboarding/green-checkmark.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import { SiteIconWithPicker } from 'calypso/components/site-icon-with-picker';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import type { Step } from '../../types';

import './style.scss';

/**
 * Generates an inline SVG for the color picker swatch
 *
 * @param color the color in HEX
 * @returns a value for background-image
 */
function generateSwatchSVG( color: string | undefined ) {
	return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%23ccc' stroke-width='1' fill='${ encodeURIComponent(
		color || '#fff'
	) }'%3E%3C/circle%3E${
		// render a line when a color isn't selected
		! color
			? `%3Cline x1='18' y1='4' x2='7' y2='20' stroke='%23ccc' stroke-width='1'%3E%3C/line%3E`
			: ''
	}%3C/svg%3E")`;
}

const NewsletterSetup: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const accentColorRef = React.useRef< HTMLInputElement >( null );

	const site = useSite();
	const usesSite = !! useSiteSlugParam();

	const { setSiteTitle, setSiteAccentColor, setSiteDescription, setSiteLogo } =
		useDispatch( ONBOARD_STORE );

	const [ formTouched, setFormTouched ] = React.useState( false );
	const [ colorPickerOpen, setColorPickerOpen ] = React.useState( false );
	const [ siteTitle, setComponentSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const [ accentColor, setAccentColor ] = React.useState< { color: string; default?: boolean } >( {
		color: '#0675C4',
		default: true,
	} );
	const [ base64Image, setBase64Image ] = React.useState< string | null >();
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const siteTitleError =
		formTouched && ! siteTitle.trim()
			? __( `Oops. Looks like your Newsletter doesn't have a name yet.` )
			: '';

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		if ( formTouched ) {
			return;
		}

		setComponentSiteTitle( site.name || '' );
		setTagline( site.description );
	}, [ site, formTouched ] );

	const imageFileToBase64 = ( file: Blob ) => {
		const reader = new FileReader();
		reader.readAsDataURL( file );
		reader.onload = () => setBase64Image( reader.result as string );
		reader.onerror = () => setBase64Image( null );
	};

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		setFormTouched( true );

		setSiteDescription( tagline );
		setSiteTitle( siteTitle );
		setSiteAccentColor( accentColor.color );

		if ( selectedFile && base64Image ) {
			try {
				setSiteLogo( base64Image );
			} catch ( _error ) {
				// communicate the error to the user
			}
		}

		if ( siteTitle.trim().length ) {
			submit?.( { siteTitle, tagline, siteAccentColor: accentColor.color } );
		}
	};

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		setFormTouched( true );
		switch ( event.currentTarget.name ) {
			case 'siteTitle':
				return setComponentSiteTitle( event.currentTarget.value );
			case 'tagline':
				return setTagline( event.currentTarget.value );
			case 'accentColor':
				return setAccentColor( { color: event.currentTarget.value } );
		}
	};

	const getBackgroundImage = ( fieldValue: string | undefined ) => {
		return fieldValue && fieldValue.trim() ? `url( ${ greenCheckmarkImg } )` : '';
	};

	const stepContent = (
		<>
			<form className="newsletter-setup__form" onSubmit={ onSubmit }>
				<SiteIconWithPicker
					site={ site }
					disabled={ usesSite ? ! site : false }
					onSelect={ ( file ) => {
						setSelectedFile( file );
						imageFileToBase64( file );
					} }
					selectedFile={ selectedFile }
				/>
				<Popover
					isVisible={ colorPickerOpen }
					context={ accentColorRef.current }
					position="top left"
					onClose={ () => setColorPickerOpen( false ) }
				>
					<ColorPicker
						disableAlpha
						color={ accentColor.color }
						onChangeComplete={ ( { hex } ) => setAccentColor( { color: hex } ) }
					/>
				</Popover>
				<FormFieldset>
					<FormLabel htmlFor="siteTitle">{ __( 'Site name' ) }</FormLabel>
					<FormInput
						value={ siteTitle }
						placeholder={ __( 'My newsletter' ) }
						name="siteTitle"
						id="siteTitle"
						style={ {
							backgroundImage: getBackgroundImage( siteTitle ),
						} }
						isError={ !! siteTitleError }
						onChange={ onChange }
					/>
					{ siteTitleError && <FormInputValidation isError text={ siteTitleError } /> }
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="tagline">{ __( 'Brief description' ) }</FormLabel>
					<FormInput
						value={ tagline }
						placeholder={ __( 'Describe your Newsletter in a line or two' ) }
						name="tagline"
						id="tagline"
						style={ {
							backgroundImage: getBackgroundImage( tagline ),
						} }
						onChange={ onChange }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="accentColor">{ __( 'Accent Color' ) }</FormLabel>
					<FormInput
						inputRef={ accentColorRef }
						className="newsletter-setup__accent-color"
						style={ {
							backgroundImage: [
								generateSwatchSVG( accentColor.color ),
								...( ! accentColor.default ? [ getBackgroundImage( accentColor.color ) ] : [] ),
							].join( ', ' ),
							...( accentColor.default && { color: 'var( --studio-gray-30 )' } ),
						} }
						name="accentColor"
						id="accentColor"
						onFocus={ () => setColorPickerOpen( ! colorPickerOpen ) }
						readOnly
						value={ accentColor.color }
					/>
				</FormFieldset>
				<Button className="newsletter-setup__submit-button" type="submit" primary>
					{ __( 'Continue' ) }
				</Button>
			</form>
		</>
	);

	return (
		<StepContainer
			stepName={ 'newsletter-setup' }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ 'newsletter' }
			formattedHeader={
				<FormattedHeader
					id={ 'newsletter-setup-header' }
					headerText={ createInterpolateElement( __( 'Personalize your<br />Newsletter' ), {
						br: <br />,
					} ) }
					align={ 'center' }
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default NewsletterSetup;
