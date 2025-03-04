import PropTypes from 'prop-types';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import AutoDirection from 'calypso/components/auto-direction';
import cssSafeUrl from 'calypso/lib/css-safe-url';
import { isFeaturedImageInContent } from 'calypso/lib/post-normalizer/utils';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { imageIsBigEnoughForGallery } from 'calypso/state/reader/posts/normalization-rules';
import { READER_CONTENT_WIDTH } from 'calypso/state/reader/posts/sizes';

function getGalleryWorthyImages( post ) {
	const numberOfImagesToDisplay = 4;
	const images = ( post.images && [ ...post.images ] ) || [];
	const indexToRemove = isFeaturedImageInContent( post );
	if ( indexToRemove ) {
		images.splice( indexToRemove, 1 );
	}

	return images.filter( imageIsBigEnoughForGallery ).slice( 0, numberOfImagesToDisplay );
}

const PostGallery = ( { post, children, isDiscover } ) => {
	const imagesToDisplay = getGalleryWorthyImages( post );
	const listItems = imagesToDisplay.map( ( image, index ) => {
		const imageUrl = resizeImageUrl( image.src, {
			w: READER_CONTENT_WIDTH / imagesToDisplay.length,
		} );
		const safeCssUrl = cssSafeUrl( imageUrl );
		let imageStyle = { background: 'none' };
		if ( safeCssUrl ) {
			imageStyle = {
				backgroundImage: 'url(' + safeCssUrl + ')',
				backgroundSize: 'cover',
				backgroundPosition: '50% 50%',
				backgroundRepeat: 'no-repeat',
			};
		}
		return (
			<li key={ `post-${ post.ID }-image-${ index }` } className="reader-post-card__gallery-item">
				<div className="reader-post-card__gallery-image" style={ imageStyle } />
			</li>
		);
	} );
	return (
		<div className="reader-post-card__post">
			<ul className="reader-post-card__gallery">{ listItems }</ul>
			<div className="reader-post-card__post-details">
				<AutoDirection>
					<h2 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL }>
							{ post.title }
						</a>
					</h2>
				</AutoDirection>
				<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
				{ children }
			</div>
		</div>
	);
};

PostGallery.propTypes = {
	post: PropTypes.object.isRequired,
	isDiscover: PropTypes.bool,
};

export default PostGallery;
