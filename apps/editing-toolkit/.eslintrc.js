const { nodeConfig } = require( '@automattic/calypso-eslint-overrides' );

module.exports = {
	extends: [ 'plugin:@wordpress/eslint-plugin/i18n' ],
	rules: {
		'react/react-in-jsx-scope': 0,
		'@wordpress/i18n-text-domain': [
			'error',
			{
				allowedTextDomain: 'full-site-editing',
			},
		],

		// FSE components render in a Gutenberg environment and should
		// conform to those naming conventions instead of Calypso's.
		'wpcalypso/jsx-classname-namespace': 'off',
	},
	ignorePatterns: [ '**/dist/*', '**/synced-newspack-blocks/*' ],
	overrides: [
		{
			files: [ './bin/**/*', './webpack.config.js' ],
			...nodeConfig,
		},
	],
};
