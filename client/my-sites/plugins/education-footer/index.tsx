import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import FooterSection from 'calypso/components/footer-section';
import LinkCard from 'calypso/components/link-card'; // should we host this one inside footer-section?

interface Article {
	title: string;
	category: string;
	url: string;
	background: string;
}

const deslugify = ( string: string ) => string.replaceAll( '-', ' ' );
const slugify = ( string: string ) =>
	string
		.replace( /[&/\\#,+()$~%.'":*?<>{}’]/g, '' )
		.toLowerCase()
		.replaceAll( ' ', '-' );

const FeatureItemContainer = styled.div`
	margin-top: calc( 64px - 25px ); // adds the margin needed for 64px
`;

const FeatureItemHeader = styled.div`
	margin-bottom: 16px;
	font-size: var( --scss-font-body );
	font-weight: 500;
	line-height: 24px;
	color: var( --color-text-inverted );
`;

const FeatureItemContent = styled.p`
	font-size: var( --scss-font-body-small );
	font-weight: 400;
	line-height: 22px;
	color: var( --color-neutral-20 );
`;

const FeatureItem = ( props ) => {
	const { header, children } = props;

	return (
		<FeatureItemContainer>
			<FeatureItemHeader>{ header }</FeatureItemHeader>
			<FeatureItemContent>{ children }</FeatureItemContent>
		</FeatureItemContainer>
	);
};

const ThreeColumnContainer = styled.div`
	@media ( max-width: 960px ) {
		grid-template-columns: repeat( 1, 1fr );
	}

	@media ( max-width: 660px ) {
		padding: 0 16px;
	}

	display: grid;
	grid-template-columns: repeat( 3, 1fr );
	column-gap: 29px;
	row-gap: 10px;
`;

const EducationFooter = () => {
	const translate = useTranslate();

	const articles: Article[] = [
		{
			category: translate( 'website-building', {
				comment:
					'Wordpress.com Go article (https://wordpress.com/go/) category on kebab case, example: Website Building = website-bulding',
				textOnly: true,
			} ),
			title: translate( 'What Are WordPress Plugins and Themes? (A Beginner’s Guide)', {
				comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
				textOnly: true,
			} ),
			url:
				'https://wordpress.com/go/website-building/what-are-wordpress-plugins-and-themes-a-beginners-guide/',
			background: 'studio-celadon-60',
		},
		{
			category: translate( 'customization', {
				comment:
					'Wordpress.com Go article (https://wordpress.com/go/) category on kebab case, example: Website Building = website-bulding',
				textOnly: true,
			} ),
			title: translate( 'How to Choose WordPress Plugins for Your Website (7 Tips)', {
				comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
				textOnly: true,
			} ),
			url:
				'https://wordpress.com/go/customization/how-to-choose-wordpress-plugins-for-your-website-7-tips/',
			background: 'studio-purple-80',
		},
		{
			category: translate( 'seo', {
				comment:
					'Wordpress.com Go article (https://wordpress.com/go/) category on kebab case, example: Website Building = website-bulding',
				textOnly: true,
			} ),
			title: translate( 'Do You Need to Use SEO Plugins on Your WordPress.com Site?', {
				comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
				textOnly: true,
			} ),
			url:
				'https://wordpress.com/go/tips/do-you-need-to-use-seo-plugins-on-your-wordpress-com-site/',
			background: 'studio-wordpress-blue-80',
		},
	];

	return (
		<>
			<FooterSection header={ translate( 'Learn More' ) }>
				<ThreeColumnContainer>
					{ articles.map( ( article ) => (
						<LinkCard
							key={ slugify( article.title ) } //TODO: find a proper util or add this one
							label={ deslugify( article.category ) } //TODO: find a proper util or add this one
							title={ article.title }
							url={ article.url }
							background={ article.background }
							cta={ translate( 'Read More' ) }
						/>
					) ) }
				</ThreeColumnContainer>
			</FooterSection>
			<FooterSection
				header={ translate( 'WordPress.com is the best place to get your plugins.' ) }
				dark
			>
				<ThreeColumnContainer>
					<FeatureItem header="Fully Managed">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nisl urna, lobortis eu
						fermentum sed, ultricies ac dui.
					</FeatureItem>
					<FeatureItem header="One Click Checkout">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nisl urna, lobortis eu
						fermentum sed, ultricies ac dui.
					</FeatureItem>
					<FeatureItem header="Quality Approved">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nisl urna, lobortis eu
						fermentum sed, ultricies ac dui.
					</FeatureItem>
				</ThreeColumnContainer>
			</FooterSection>
		</>
	);
};

export default EducationFooter;
