const withCSS = require('@zeit/next-css');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const svgoConfig = require('./common/config/svgo');

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = withCSS({
  // NextCSS Config
  cssModules: true,
  cssLoaderOptions: {
    // No need for importLoaders: 1 as its set to 1 when postcss.config.js exists
    localIdentName: isDev ? '[name]_[local]__[hash:base64:5]' : '[local]_[hash:base64:5]',
  },

  // Bundle Analyzer Config (only used when running `yarn build:analyze`)
  analyzeServer: process.env.ANALYZE,
  analyzeBrowser: process.env.ANALYZE,
  bundleAnalyzerConfig: {
    server: {
      analyzerMode: 'server',
      analyzerPort: 8888,
    },
    browser: {
      analyzerMode: 'server',
      analyzerPort: 8889,
    },
  },

  // Webpack Config
  webpack: (config, { dev }) => {
    // Fixes npm packages that depend on `fs` module
    // eslint-disable-next-line no-param-reassign
    config.node = { fs: 'empty' };

    if (dev) {
      // eslint-disable-next-line global-require
      const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

      // Filters Mini CSS Extract Plugin bug
      // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250#issuecomment-415345126
      config.plugins.push(
        new FilterWarningsPlugin({
          exclude: /Conflicting order between/,
        }),
      );
    }

    config.module.rules.push(
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'react-svg-loader',
            options: {
              svgo: svgoConfig,
            },
          },
        ],
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              fallback: {
                loader: 'file-loader',
                options: { publicPath: '/_next/static/images', outputPath: 'static/images' },
              },
              publicPath: '/_next/',
              outputPath: 'static/images/',
              name: '[name]-[hash].[ext]',
            },
          },
        ],
      },
    );

    return config;
  },
});

module.exports = withBundleAnalyzer(nextConfig);
