const os = require("os");
const path = require("path");
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const threads = os.cpus().length; // cpu核数

function getStyleLoader() {
  return [ // 执行顺序是从右到左，从下到上
    MiniCssExtractPlugin.loader, // 提取css成单独文件
    "css-loader", // 将css资源编译成commonjs的模块到js中
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            'postcss-preset-env', // 能解决大多数样式兼容问题
          ],
        },
      },
    }
  ];
}

module.exports = {
  // 入口
  entry: './src/main.js', // 相对路径 相对于执行命令的地方
  // 输出
  output: {
    // 所有文件输出路径 __dirname 当前文件夹目录
    path: path.resolve(__dirname, '../dist'), // 绝对路径
    // 入口文件打包输出文件名
    filename: 'static/js/[name].[contenthash:10].js',
    // 给打包输出的其他文件命名
    chunkFilename: "static/js/[name].chunk.[contenthash:10].js",
    // 图片、字体等通过type:asset处理资源命名方式
    assetModuleFilename: 'static/media/[hash:10][ext][query]',
    // 自动清空上次打包的内容
    clean: true,
  },
  // 加载器
  module: {
    rules: [
      // loader的配置
      {
        oneOf: [
          {
            test: /\.css$/, // 只检测 .css 文件 
            use: [...getStyleLoader()],
          },
          {
            test: /\.less$/,
            use: [...getStyleLoader(),'less-loader'], // 将less编译成css文件,
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              ...getStyleLoader(),
              'sass-loader',
            ],
          },
          {
            test: /\.(png|jpe?g|gif|webp|svg)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                // 小于10kb图片转base64
                // 优点减少请求 缺点：体积会更大
                maxSize: 10 * 1024 // 10kb
              }
            },
            // generator: {
            //   // 输出图片名称
            //   // [hash:10] hash值取前10位
            //   filename: 'static/images/[hash:10][ext][query]'
            // }
          },
          {
            // 其他文件资源处理如字体图标视频文件
            test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
            type: 'asset/resource',
            // generator: {
            //   // 输出名称
            //   filename: 'static/media/[hash:10][ext][query]'
            // }
          },
          {
            test: /\.js$/,
             // exclude: /node_modules/, // 排除node_modules中的js文件（这些文件不处理）
            include: path.resolve(__dirname, '../src'), // 只处理src下的文件，其他文件不处理
            use: [
              {
                loader: 'thread-loader', // 开启多进程
                options: {
                  works: threads, // 进程数量
                }
              },
              {
                loader: 'babel-loader',
                options: {
                  // presets: ['@babel/preset-env']
                  cacheDirectory: true, // 开启babel缓存
                  cacheCompression: false, // 关闭缓存文件压缩
                  plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积
                }
              }
            ]
          }
        ]
      }
    ]
  },
  // 插件
  plugins: [
    // plugin的配置
    new ESLintPlugin({
      // 检测哪些文件
      context: path.resolve(__dirname, "../src"),
      cache: true, // 开启缓存
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/eslintcache"
      ),
      threads, // 开启多进程和进程数量
    }),
    new HtmlWebpackPlugin({
      // 模版，以public/index.html文件创建新的html文件
      // 新的html文件特点：1.结构和原来一致 2.自动引入打包输出的资源
      template: path.resolve(__dirname, "../public/index.html")
    }),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:10].css",
      chunkFilename: "static/css/[name].chunk.[contenthash:10].css",
    }),
    // new CssMinimizerPlugin(),
    // new TerserWebpackPlugin({
    //   parallel: threads, // 开启多进程和进程数量
    // }),
    new PreloadWebpackPlugin({
      // rel: 'preload',
      // as: 'script',
      rel: 'prefetch',
    }),
    new WorkboxPlugin.GenerateSW({
      // 这些选项帮助快速启用 ServiceWorkers
      // 不允许遗留任何“旧的” ServiceWorkers
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  optimization: {
    // 压缩的操作
    minimizer: [
      new CssMinimizerPlugin(), // 压缩css
      new TerserWebpackPlugin({ // 压缩js
        parallel: threads, // 开启多进程和进程数量
      }),
       // 压缩图片
       new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        xmlnsOrder: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
    // 代码分割操作
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`,
    }
  },
  // 模式
  mode: 'production',
  devtool: 'source-map', // 映射 行 和 列  开发环境由于打包为一行所以需要都映射
}