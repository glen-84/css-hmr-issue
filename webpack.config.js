const {AureliaPlugin} = require("aurelia-webpack-plugin");
const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer");
const autoprefixer = require("autoprefixer");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const config = require("./config/config");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const imageminGifsicle = require("imagemin-gifsicle");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminOptipng = require("imagemin-optipng");
const imageminSvgo = require("imagemin-svgo");
const ImageminWebpackPlugin = require("imagemin-webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const path = require("path");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const paths = {
    src: path.resolve(__dirname, "src"),
    nodeModules: path.resolve(__dirname, "node_modules"),
    public: path.resolve(__dirname, "public")
};

module.exports = ((env, argv) => {
    const isDev = (argv.mode === "development");
    const isHot = Boolean(argv.hot);
    const analyse = Boolean(env && env.analyse);

    return {
        mode: (isDev ? "development" : "production"),
        context: paths.src,
        entry: {
            app: ["aurelia-bootstrapper"]
        },
        // TODO: Cannot specify chunkFilename because of https://github.com/webpack/webpack/issues/6598.
        output: {
            path: paths.public,
            filename: "assets/scripts/" + (isHot ? "[name].js" : "[name]-[contenthash:8].js"),
            publicPath: (isHot ? "http://127.0.0.1:3200/" : "/")
        },
        module: {
            rules: [
                // TypeScript.
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {transpileOnly: true}
                        }
                    ],
                    include: paths.src
                },
                // Sass (in JavaScript/TypeScript).
                {
                    test: /\.scss$/,
                    issuer: /\.[jt]s$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: isHot,
                                // Force "reload all", otherwise it...
                                reloadAll: true
                            }
                        },
                        {
                            loader: "css-loader",
                            options: {sourceMap: true}
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: [autoprefixer],
                                sourceMap: true
                            }
                        },
                        {
                            loader: "resolve-url-loader",
                            options: {sourceMap: true}
                        },
                        {
                            loader: "sass-loader",
                            options: {sourceMap: true}
                        }
                    ].filter(Boolean)
                },
                // Sass (in HTML).
                {
                    test: /\.scss$/,
                    issuer: /\.html$/,
                    use: [
                        {
                            loader: "css-loader",
                            options: {sourceMap: true}
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: [autoprefixer],
                                sourceMap: true
                            }
                        },
                        {
                            loader: "resolve-url-loader",
                            options: {sourceMap: true}
                        },
                        {
                            loader: "sass-loader",
                            options: {sourceMap: true}
                        }
                    ]
                },
                // CSS.
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: isHot,
                                // Force "reload all", otherwise it...
                                reloadAll: true
                            }
                        },
                        {
                            loader: "css-loader",
                            options: {sourceMap: true}
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: [autoprefixer],
                                sourceMap: true
                            }
                        }
                    ].filter(Boolean)
                },
                // HTML.
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader",
                            options: {
                                attrs: ["img:src", "link:href"]
                            }
                        },
                        {
                            loader: "preprocess-loader",
                            options: {
                                GG_APP_ENV: config.appEnv,
                                GG_PUBLIC_PATH: (isHot ? "http://127.0.0.1:3200/" : "/")
                            }
                        }
                    ]
                },
                // Fonts.
                {
                    test: /\.(eot|ttf|woff2?)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "assets/fonts/[path][name]-[hash:8].[ext]"
                            }
                        }
                    ]
                },
                // Images.
                {
                    test: /\.(gif|ico|jpg|png|svg)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "assets/images/[path][name]-[hash:8].[ext]"
                            }
                        }
                    ]
                }
            ]
        },
        resolve: {
            alias: {
                // See: https://github.com/HubSpot/pace/issues/328#issuecomment-304499584
                pace: "pace-progress"
            },
            extensions: [".js", ".ts"],
            modules: [paths.src, paths.nodeModules]
        },
        plugins: [
            new AureliaPlugin({
                features: {
                    ie: false,
                    svg: false
                }
            }),
            new ForkTsCheckerWebpackPlugin({
                // See: https://github.com/Realytics/fork-ts-checker-webpack-plugin/issues/101
                silent: Boolean(argv.json),
                tsconfig: path.resolve(__dirname, "tsconfig.json")
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(paths.src, "index.html"),
                inject: "head",
                alwaysWriteToDisk: true
            }),
            new HtmlWebpackHarddiskPlugin(),
            new ScriptExtHtmlWebpackPlugin({
                defaultAttribute: "defer"
            }),
            new webpack.DefinePlugin({
                GG_APP_ENV: JSON.stringify(config.appEnv),
                GG_API_BASE_URL: JSON.stringify(config.apiBaseUrl),
                GG_API_VERSION: config.apiVersion,
                GG_WEBSITE_URL: JSON.stringify(config.websiteUrl),
                GG_TIME_ZONE: JSON.stringify(config.timeZone)
            }),
            // Ignore all locale files of moment.js. See https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new MiniCssExtractPlugin({
                filename: "assets/styles/" + (isHot ? "[name].css" : "[name]-[contenthash:8].css"),
                chunkFilename: "assets/styles/" + (isHot ? "[name].chunk.css" : "[name]-[contenthash:8].chunk.css")
            }),
            !isDev && new ImageminWebpackPlugin({
                cache: true,
                imageminOptions: {
                    plugins: [
                        imageminGifsicle(),
                        imageminJpegtran(),
                        imageminOptipng(),
                        imageminSvgo()
                    ]
                }
            }),
            analyse && new BundleAnalyzerPlugin(),
            isDev && new BrowserSyncPlugin(
                {
                    host: "127.0.0.1",
                    port: 3200,
                    socket: {domain: "127.0.0.1:3200"},
                    cors: true,
                    server: (isHot ? false : "public"),
                    // Proxy the Webpack Dev Server endpoint through BrowserSync.
                    proxy: (isHot ? "http://127.0.0.1:3250/" : undefined),
                    open: false
                },
                {
                    // Prevent BrowserSync from reloading the page and let Webpack Dev Server take care of this.
                    reload: !isHot,
                    // TODO: Not working, possibly related to:
                    // * https://github.com/Va1/browser-sync-webpack-plugin/issues/69
                    // * https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151
                    // * https://github.com/webpack/webpack/issues/7300
                    injectCss: !isHot
                }
            )
        ].filter(Boolean),
        optimization: {
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true,
                    terserOptions: {
                        keep_fnames: true
                    }
                }),
                new OptimizeCssAssetsPlugin({
                    cssProcessorOptions: {
                        // See: https://github.com/postcss/postcss/blob/master/docs/source-maps.md
                        map: {inline: false}
                    },
                    // Exclude CKEditor files.
                    assetNameRegExp: /^(?:(?!\/ckeditor\/).)*\.css$/
                })
            ],
            runtimeChunk: {
                name: "runtime"
            },
            splitChunks: {
                chunks: "all",
                // See: https://github.com/webpack/webpack/issues/8426#issuecomment-442375207
                name: false,
                maxInitialRequests: 20,
                maxAsyncRequests: 20,
                maxSize: 100000,
                cacheGroups: {
                    vendorSplit: {
                        test: /[\\/]node_modules[\\/]/,
                        name: (module) => {
                            // Extract the name of the package from the path segment after node_modules.
                            const packageNameRegExp = new RegExp("/node_modules/((?:@[^/]+/)?[^/\\n]+)(?:/|$)");
                            const packageName = packageNameRegExp.exec(module.context.replace(/\\/g, "/"))[1];

                            return `vendor.${packageName.replace("@", "").replace("/", ".")}`;
                        },
                        priority: 20
                    },
                    // Picks up everything else being used from node_modules that is less than minSize.
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendors",
                        priority: 10,
                        enforce: true // Create regardless of the size of the chunk.
                    }
                }
            }
        },
        devtool: (isDev ? "eval-source-map" : "source-map"),
        devServer: {
            host: "127.0.0.1",
            port: 3250,
            compress: true,
            overlay: true
        }
    };
});
