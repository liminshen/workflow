/*
 ******************************************************
 *                      配置区域                      *
 ******************************************************
 */
var NodePath = require('./config.json').NodePath;
var fs = require('fs');
var path = require('path');
var http = require('http');
var vendors = []; // 配置 三方库

var AssembleOpt = {
    layouts: 'public/tpl/layouts/**/*.hbs',
    partials: 'public/tpl/partials/**/*.hbs',
    pages: 'public/tpl/pages/**/*.hbs',
    injectData: {
        commonjsName: 'commons.js',
        vendorsjsName: 'vendors.js',
        vendors: vendors.length != 0,
        useCommonChunk: true    //是否打包出commons.js
    }
};

var copyToTrunkPath = 'D:\\jiayoubao\\jyb_h5_static\\trunk\\act\\201611\\cash_back'; //配置 复制到的trunk的地址

var webpackConf = {
    externals: {
        'zepto': 'window.Zepto'  //配置cdn引入库，在window全局注入的对象
    },
    publicPath: '/assets/js/'    //当使用require.ensure时，一部请求模块的地址
};

var pcsENV = (process.argv[2] === 'production' || process.argv[2] === 'copy-to-trunk') ? {'NODE_ENV': JSON.stringify('production')} : {};

var autoprefixerOpt = {
    compatBrowser: ['Android >= 4.0', 'ios >= 7.0', '>5%'] //设置auto-prefixer的级别
};

var getSpriteDirectories = function () {
    var imagesPath = './public/assets/images';
    var arr = fs.readdirSync(imagesPath);
    var result = [];
    arr.forEach(function  (item) {
        if (item == 'slice') {
            return;
        }
        var stats = fs.statSync(path.join(imagesPath,item));
        if(stats.isDirectory()) result.push(item);
    });
    return result;
};

var spriteConf = {
    spriteTPL: 'sprite_mobile.tpl', // 配置生成的sprite的模板
    spriteArr: getSpriteDirectories()
};

var serverConf = {    //配置开发时的服务器
    openBrowser: false,
    development: {
        root: ['./public'],
        port: 8090,
        livereload: {
            hostname: '127.0.0.1'
        }
    },
    production: {
        root: ['./output'],
        port: 8090,
        livereload: {
            hostname: '127.0.0.1'
        }
    }
};

/*
 ******************************************************
 *                      引入模块                      *
 ******************************************************
 */
var resovleModulePath = function (moduleName) {
    return path.resolve(NodePath, moduleName);
};
var app = require(resovleModulePath('assemble'))();
var gulp = require(resovleModulePath('gulp'));
var gutil = require(resovleModulePath('gulp-util'));
var gulp_Changed = require(resovleModulePath('gulp-changed'));
var gulp_Sass = require(resovleModulePath('gulp-sass'));
var gulp_Postcss = require(resovleModulePath('gulp-postcss'));
var gulp_Sourcemaps = require(resovleModulePath('gulp-sourcemaps'));
var autoprefixer = require(resovleModulePath('autoprefixer'));
var gulp_Spritesmith = require(resovleModulePath('gulp.spritesmith'));
var cssSprite3x = require(resovleModulePath('gulp-css-spritesmith_3x'));
var gulp_If = require(resovleModulePath('gulp-if'));
var mergeStream = require(resovleModulePath('merge-stream'));
var webpackStream = require(resovleModulePath('webpack-stream'));
var webpack = require(resovleModulePath('webpack'));
var gulp_Tmod = require(resovleModulePath('gulp-tmod'));
var gulp_Clean = require(resovleModulePath('gulp-clean'));
var through2 = require(resovleModulePath('through2'));
var connect = require(resovleModulePath('gulp-connect'));
var runSequence = require(resovleModulePath('run-sequence'));
var open = require(resovleModulePath('open'));
var gulp_Cssnano = require(resovleModulePath('gulp-cssnano'));
var gulp_Imagemin = require(resovleModulePath('gulp-imagemin'));
var gulp_Uglify = require(resovleModulePath('gulp-uglify'));
var gulp_Plumber = require(resovleModulePath('gulp-plumber'));
var gulp_Base64 = require(resovleModulePath('gulp-base64'));
var notify = require(resovleModulePath('gulp-notify'));
var dotPreparse = require(resovleModulePath('gulp-dot-preparse'));
var gulp_InlineSource = require(resovleModulePath('gulp-kyh-inline-source'));
var helper_Prettify = require(resovleModulePath('prettify'));
var helper_Moment = require(resovleModulePath('helper-moment'));
/*
 ******************************************************
 *                      任务配置                      *
 ******************************************************
 */
const __UTIL__ = {
    debounce: (callback) => {
        var timer;
        function delay (event) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback&&callback(event);
            }, 100);
        }
    
        return delay;
    }
};

gulp.task('dev-server', function () {
    var server = http.createServer();
    server.on('listening', function () {
        if (server) {
            server.close();
            delete server;
        }
        connect.server(serverConf.development);
        if (serverConf.openBrowser) {
            open('http://localhost:'+serverConf.development.port);
        }
    });
    server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            serverConf.development.port++;
            server.listen(serverConf.development.port);
        }else{
            console.log(err);
        }
    });
    server.listen(serverConf.development.port);
});

gulp.task('compile-assemble', function () {
    app.layouts(AssembleOpt.layouts);
    app.partials(AssembleOpt.partials);
    app.pages(AssembleOpt.pages);
    app.helper('prettify', helper_Prettify);
    app.helper('moment', helper_Moment);
    return app.src(AssembleOpt.pages)
              .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
              .pipe(app.renderFile(AssembleOpt.injectData))
              .pipe(app.dest(function (file) {
                  file.extname = '.html';
                  return 'public/';
              }))
              .pipe(connect.reload());
});

gulp.task('compile-sass', function () {
    return gulp.src('public/assets/sass/**/*.{scss,sass}')
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Sourcemaps.init())
               .pipe(gulp_Sass()
               .on('error', gulp_Sass.logError))
               .pipe(gulp_Postcss([autoprefixer({browsers: autoprefixerOpt.compatBrowser})]))
               .pipe(gulp_Base64({
                    extensions: [/\.(png|jpg|jpeg)\?base64/i],
                    maxImageSize: 20 * 1024,              // bytes
                    debug: false,
                    deleteAfterEncoding: false,
                }))
               .pipe(gulp_Sourcemaps.write('.'))
               .pipe(gulp.dest('public/assets/css'))
               .pipe(connect.reload());
});

gulp.task('build-sprite', function () {
    var ALLTS = mergeStream();//新建一个空stream
        ALLTS.img = mergeStream();//新建一个img空stream
        ALLTS.css = mergeStream();//新建一个css空stream
    
    spriteConf.spriteArr.forEach(function (item) {
        var totalStream = gulp.src('public/assets/images/' + item + '/**/_*.png')
                              .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
                              .pipe(gulp_Spritesmith({
                                  imgName: item +'_combo.png',
                                  cssName: '_'+ item +'_combo.scss',
                                  imgPath: '../images/'+ item +'_combo.png',
                                  cssTemplate: 'public/assets/images/' + spriteConf.spriteTPL,
                                  padding: 20,
                                  cssOpts: {extentName: item +'_combo'}
                              }));
        var imgStream = totalStream.img
                                   .pipe(gulp.dest('public/assets/images/'));
        var cssStream = totalStream.css
                                   .pipe(gulp.dest('public/assets/sass/extends/'));
        
        ALLTS.add(mergeStream(imgStream, cssStream));
        ALLTS.img.add(imgStream);
        ALLTS.css.add(cssStream);
    });
    return ALLTS;
});

spriteConf.spriteArr.forEach(function (item) {
   gulp.task('build-sprite-'+item, function () {
       var totalStream = gulp.src('public/assets/images/' + item + '/**/_*.png')
                             .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
                             .pipe(gulp_Spritesmith({
                                 imgName: item +'_combo.png',
                                 cssName: '_'+ item +'_combo.scss',
                                 imgPath: '../images/'+ item +'_combo.png',
                                 cssTemplate: 'public/assets/images/' + spriteConf.spriteTPL,
                                 padding: 20,
                                 cssOpts: {extentName: item +'_combo'}
                             }));
       var imgStream = totalStream.img
                                  .pipe(gulp.dest('public/assets/images/'));
       var cssStream = totalStream.css
                                  .pipe(gulp.dest('public/assets/sass/extends/'));
       return mergeStream(imgStream, cssStream);
   });
});

gulp.task('build-bindle-js', function () {
    var pluginArr = [
        // new webpack.optimize.DedupePlugin(),// 去除重复模块
        // new webpack.optimize.OccurrenceOrderPlugin(true),// 合理分配ids
        new webpack.DefinePlugin({
            'process.env':pcsENV
        })
    ];
    
    if (AssembleOpt.injectData.useCommonChunk) {
        pluginArr.unshift(
            new webpack.optimize.CommonsChunkPlugin({ //多个页面共享一个模块文件
                name: 'commons',
                filename: AssembleOpt.injectData.commonjsName
            })
        );
    }
    
    if (vendors.length > 0) {
        pluginArr.unshift(
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./public/assets/js/manifest.json')
            })
        );
    }
    
    var entryPath = path.resolve(process.cwd(), 'public/assets/js/pages');
    var entryJson = (function (entryArr) {
        var json = {};
        entryArr.forEach(function (item) {
            var basename = path.basename(item,'.js');
            basename = path.basename(basename,'.jsx');
            json[basename] = './'+item;// './'是为了解决奇葩的路径问题，真是醉醉的！
        });
        return json;
    }(fs.readdirSync('public/assets/js/pages')));
    return gulp.src('public/assets/js/pages/**/*.js')
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(webpackStream({
                   context: entryPath,
                   entry: entryJson,
                   output: {
                       publicPath: webpackConf.publicPath,
                       filename: '[name].bundle.js'
                   },
                   module: {
                       loaders: [
                           {
                               test: /\.json$/,
                               loader: 'json-loader'
                           },
                           {
                               test: /\.jsx?$/,
                               loader: 'babel-loader', // 'babel-loader' is also a legal name to reference
                               query: {
                                   presets: ['latest','react','stage-2']
                               }
                           }
                       ]
                   },
                   plugins: pluginArr,
                   resolve: {
                       alias: {
                           
                       },
                       extensions: ['', '.webpack.js', '.web.js', '.js','.json','.jsx']
                   },
                   resolveLoader: {
                       root: NodePath
                   },
                   devtool: 'source-map',
                   externals: webpackConf.externals
               },webpack, function  (err, stats) {
                   if (err) { throw new gutil.PluginError('webpack:build', err); }
                   gutil.log('[webpack:build]', stats.toString('normal'));
                   //可以选择的输出模式 'none'、'errors-only'、'minimal'、'normal'、'verbose';
               }))
               .pipe(gulp.dest(path.dirname(entryPath)))
               .pipe(connect.reload());
});

gulp.task('compile-tmod-template', function () {
    return gulp.src('public/tmod/**/*.tpl')
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Changed('public/assets/js/tmod', {extension: '.js'}))
               .pipe(gulp_Tmod({
                   templateBase: 'public/tmod',
                   type: 'cmd'
               }))
               .pipe(gulp.dest('public/assets/js/tmod'));
});

gulp.task('compile-dot-template', function () {
    return gulp.src('public/dot/**/*.jst')
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(dotPreparse({
                                     root: 'public/dot'
                               }))
               .pipe(gulp.dest('public/assets/js/dot'));
});

gulp.task('clean-tmod', function () {
    return gulp.src('public/assets/js/tmod',{read: false})
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Clean());
});

gulp.task('clean-dot', function () {
    return gulp.src('public/assets/js/dot',{read: false})
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Clean());
});

gulp.task('clean-output', function () {
    return gulp.src('output',{read:false})
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Clean());
});

gulp.task('clean-js', function () {
    return gulp.src('public/assets/js/*.{js,json,map}',{read:false})
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Clean());
});

gulp.task('clean-css', function () {
    return gulp.src('public/assets/css/*.{css,map}',{read:false})
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Clean());
});

gulp.task('clean-html', function () {
    return gulp.src('public/*.{htm,html,shtml}',{read:false})
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Clean());
});

gulp.task('create-output', function () {
    return gulp.src('public/**/*.*')
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp.dest('output'));
});
gulp.task('minify-css', function () {
    return gulp.src('public/assets/css/**/*.css')
                .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
                .pipe(gulp_Sourcemaps.init())
                .pipe(gulp_Cssnano({zindex: false}))
                .pipe(gulp.dest('./output/assets/css'))
                .pipe(through2.obj(function (file, encoding, callback) {
                    file.path = path.resolve('./public/assets/css/',path.basename(file.path));
                    file.base = path.dirname(file.path);
                    return callback(null,file);
                }))
                .pipe(cssSprite3x(
                    {
                        // sprite背景图源文件夹，只有匹配此路径才会处理，默认 images/slice/
                        imagepath: path.resolve('./public/assets/images/slice'),
                        // 雪碧图输出目录，注意，会覆盖之前文件！默认 images/
                        spritedest: path.resolve('./public/assets/images'),
                        // 替换后的背景路径，默认 ../images/
                        spritepath: '../images/',
                        // 各图片间间距，如果设置为奇数，会强制+1以保证生成的2x图片为偶数宽高，默认 0
                        padding: 2,
                        // 给雪碧图追加时间戳，默认不追加
                        spritestamp: true,
                        // 在CSS文件末尾追加时间戳，默认不追加
                        cssstamp: true,
                        // 生成雪碧图的算法
                        algorithm: 'top-down'
                        // 增加rem方式的fontSize配置
                        // fontSize: config.fontSize
                    }
                ))
                .pipe(gulp_If(/\.css$/i,gulp_Cssnano({zindex: false})))
                .pipe(gulp_Sourcemaps.write('.'))
                .pipe(gulp_If(/\.css$/i,gulp.dest(function  (file) {
                    file.base = path.dirname(path.dirname(file.path));
                    return './output/assets';
                }),gulp.dest(function  (file) {
                    file.base = path.dirname(path.dirname(file.path));
                    return './public/assets';
                })));
});
gulp.task('minify-image', function () {
    return gulp.src('public/assets/images/**/!(*.tpl)')
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Imagemin({verbose: true}))
               .pipe(gulp.dest('output/assets/images'));
});
gulp.task('minify-js', function () {
    return gulp.src('public/assets/js/*.js')
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Uglify())
               .pipe(gulp.dest('output/assets/js'));
    /*
    这个是压缩整个文件夹每一个js文件，但是不支持ES6语法，文件中用了ES6语法会报错
    return gulp.src('public/assets/js/!**!/!*.js')
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_Uglify())
               .pipe(gulp.dest('output/assets/js'));
               */
});
gulp.task('inline-source-html', function () {
    return gulp.src('public/*.html')
               .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
               .pipe(gulp_InlineSource({
                                           compress: false,
                                           rootpath: path.resolve('./output'),
                                           handlers: [
                                               function (source, context, next) {
                                                   var fileType = source.type;
                                                   var fileContent = source.fileContent;
                                                   if (fileType == 'css') {
                                                       source.fileContent = fileContent.replace(/url\([\n\r\s]*(\.\.\/)([^\)]*)[\n\r\s]*\)/g,function($0,$1,$2){
                                                           return 'url(assets/'+$2+')';
                                                       });
                                                   }
                                                   next();
                                               }
                                           ]
               }))
               .pipe(gulp.dest('output'));
});
gulp.task('build-vendors', function (callback) {
    webpack({
        entry: {
            vendors: vendors
        },
        output: {
            path: './public/assets/js',
            filename: AssembleOpt.injectData.vendorsjsName,
            libraryTarget: 'umd',
            library: '[name]'
        },
        module: {
            loaders: [
                {
                    test: /\.json$/,
                    loader: 'json-loader'
                },
                {
                    test: /\.jsx?$/,
                    loader: 'babel-loader', // 'babel-loader' is also a legal name to reference
                    query: {
                        presets: ['latest','react','stage-2']
                    }
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env':pcsENV
            }),
            new webpack.optimize.DedupePlugin(),// 去除重复模块
            new webpack.DllPlugin({
                path: './public/assets/js/manifest.json',
                name: '[name]',
                context: __dirname
            })
        ],
        resolve: {
            alias: {
                
            },
            extensions: ['', '.webpack.js', '.web.js', '.js','.json','.jsx']
        },
        resolveLoader: {
            root: NodePath
        }
    }, function(err, stats) {
        if (err) { throw new gutil.PluginError('webpack:vendors', err); }
        gutil.log('[webpack:vendors]', stats.toString('normal'));
        //可以选择的输出模式 'none'、'errors-only'、'minimal'、'normal'、'verbose';
        callback();
    });
});
/*
 ******************************************************
 *                      Watch配置                     *
 ******************************************************
 */
/*gulp.task('logWaiting', function () {
    console.log('\x1b[33;1m***********************************Watch is waiting...***********************************\x1b[0m');
});*/
gulp.task('dev-watch', function () {
    gulp.watch(
        ['public/tmod/**/*.tpl'],
        {maxListeners: 100},
        __UTIL__.debounce(function () {
            runSequence('compile-tmod-template');
        })
    );
    gulp.watch(
        ['public/dot/**/*.{jst,def}'],
        {maxListeners: 100},
        __UTIL__.debounce(function () {
            runSequence('compile-dot-template');
        })
    );
    gulp.watch(
        ['public/tpl/**/*.hbs'],
        {maxListeners: 100},
        __UTIL__.debounce(function () {
            runSequence('compile-assemble');
        })
    );
    spriteConf.spriteArr.forEach(function (item) {
        gulp.watch(
            ['public/assets/images/'+item+'/**/*.png'],
            {maxListeners: 100},
            __UTIL__.debounce(function () {
                runSequence('build-sprite-'+item);
            })
        );
    });
    gulp.watch(
        ['public/assets/js/*/**/*.{js,jsx}'],
        {maxListeners: 100},
        __UTIL__.debounce(function () {
            runSequence('build-bindle-js');
        })
    );
    gulp.watch(
        ['public/assets/sass/**/*.{scss,sass}'],
        {maxListeners: 100},
        __UTIL__.debounce(function () {
            runSequence('compile-sass');
        })
    );
});
/*
 ******************************************************
 *                      环境配置                      *
 ******************************************************
 */

gulp.task('base-complie', function (callback) {
    var taskArr = ['build-vendors','compile-assemble','clean-tmod','clean-dot'];
    if (vendors.length == 0) {
        delete taskArr.shift();
    }
    runSequence(['clean-js','clean-html','clean-css'],taskArr,['build-sprite','compile-tmod-template','compile-dot-template'],['compile-sass','build-bindle-js'], callback);
});
gulp.task('development',['base-complie'], function (callback) {
    runSequence('dev-watch','dev-server',callback);
});

gulp.task('production',['base-complie'], function (callback) {
    runSequence('clean-output','create-output','minify-css',['minify-image','minify-js'],'inline-source-html',callback);
});

gulp.task('copy-to-trunk', ['production'],function () {
    gutil.log(gutil.colors.bold.red('复制生产文件到：'),gutil.colors.bold.yellow(copyToTrunkPath));
   return gulp.src(['./output/*.html','./output/assets/css/*.css','./output/assets/js/*.js','./output/assets/images/*.{jpg,jpeg,png,gif}','./output/assets/images/!(slice)/!(_)*.{jpg,jpeg,png,gif}'])
              .pipe(gulp_Plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
              .pipe(gulp.dest(function (file) {
                  // if (/\.(htm|html|shtml)$/i.test(file.path)) {
                  //     file.path = file.path.replace(/\.(htm|html|shtml)$/i,'.shtml');
                  // }
                  var relatePath = path.relative('./output',file.base);
                  return path.join(copyToTrunkPath,relatePath);
              }));
});