import { Gridicon } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useGetProductVariants } from '../../hooks/product-variants';
import type { ItemVariationPickerProps } from './types';

interface OptionProps {
	selected: boolean;
}

interface CurrentOptionProps {
	open: boolean;
}

const CurrentOption = styled.button< CurrentOptionProps >`
	align-items: center;
	background: white;
	border: 1px solid #a7aaad;
	border-radius: 3px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 14px 16px;
	width: 100%;

	.gridicon {
		fill: #a7aaad;
		margin-left: 14px;
	}

	${ ( props ) =>
		props.open &&
		css`
			border-radius: 3px 3px 0 0;
		` }
`;

const Option = styled.li< OptionProps >`
	align-items: center;
	background: white;
	border: 1px solid #a7aaad;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 10px 16px;

	${ ( props ) =>
		props.selected &&
		css`
			background: #055d9c;
			color: #ffff;
		` }
`;

const Dropdown = styled.div`
	position: relative;
	width: 100%;
	> ${ Option } {
		border-radius: 3px;
	}
`;

const OptionList = styled.ul`
	position: absolute;
	width: 100%;
	z-index: 1;
	margin: 0;

	${ Option } {
		margin-top: -1px;

		&:last-child {
			border-bottom-left-radius: 3px;
			border-bottom-right-radius: 3px;
		}
	}
`;

const VariantLabel = styled.span`
	flex: 1;
	display: flex;
	font-size: 14px;
	font-weight: 400;
	line-height: 20px;
`;

export const ItemVariationDropDown: FunctionComponent< ItemVariationPickerProps > = ( {
	selectedItem,
	onChangeItemVariant,
	siteId,
	productSlug,
} ) => {
	const translate = useTranslate();
	const variants = useGetProductVariants( siteId, productSlug );

	const [ open, setOpen ] = useState( false );

	const selectedVariantIndex = useMemo( () => {
		for ( let i = 0; i < variants.length; ++i ) {
			if ( variants[ i ].productId === selectedItem.product_id ) {
				return i;
			}
		}
		return null;
	}, [ selectedItem.product_id, variants ] );

	const selectNextVariant = useCallback( () => {
		if ( selectedVariantIndex !== null && selectedVariantIndex < variants.length - 1 ) {
			onChangeItemVariant(
				selectedItem.uuid,
				variants[ selectedVariantIndex + 1 ].productSlug,
				variants[ selectedVariantIndex + 1 ].productId
			);
		}
	}, [ onChangeItemVariant, selectedItem.uuid, selectedVariantIndex, variants ] );

	const selectPreviousVariant = useCallback( () => {
		if ( selectedVariantIndex !== null && selectedVariantIndex > 0 ) {
			onChangeItemVariant(
				selectedItem.uuid,
				variants[ selectedVariantIndex - 1 ].productSlug,
				variants[ selectedVariantIndex - 1 ].productId
			);
		}
	}, [ onChangeItemVariant, selectedItem.uuid, selectedVariantIndex, variants ] );

	// arrow keys require onKeyDown for some browsers
	const handleKeyDown: React.KeyboardEventHandler = useCallback(
		( event ) => {
			switch ( event.code ) {
				case 'ArrowDown':
					// prevent browser window from scrolling
					event.preventDefault();
					selectNextVariant();
					break;
				case 'ArrowUp':
					// prevent browser window from scrolling
					event.preventDefault();
					selectPreviousVariant();
					break;
			}
		},
		[ selectNextVariant, selectPreviousVariant ]
	);

	if ( variants.length < 2 ) {
		return null;
	}

	return (
		<Dropdown aria-expanded={ open } aria-haspopup="listbox" onKeyDown={ handleKeyDown }>
			<CurrentOption
				role="button"
				key="selectedItem"
				onClick={ () => setOpen( ! open ) }
				open={ open }
			>
				{ selectedVariantIndex !== null ? (
					<>
						<VariantLabel>{ variants[ selectedVariantIndex ].variantLabel }</VariantLabel>
						{ variants[ selectedVariantIndex ].variantDetails }
					</>
				) : (
					<span>{ translate( 'Pick a product term' ) }</span>
				) }
				<Gridicon icon={ open ? 'chevron-down' : 'chevron-up' } />
			</CurrentOption>
			{ open && (
				<OptionList role="listbox" tabIndex={ -1 }>
					{ variants.map( ( { variantLabel, variantPrice, productId, productSlug } ) => (
						<Option
							id={ productId.toString() }
							role="option"
							key={ productSlug + variantLabel }
							onClick={ () => onChangeItemVariant( selectedItem.uuid, productSlug, productId ) }
							selected={ productId === selectedItem.product_id }
						>
							<VariantLabel>{ variantLabel }</VariantLabel>
							<span>{ variantPrice }</span>
						</Option>
					) ) }
				</OptionList>
			) }
		</Dropdown>
	);
};
