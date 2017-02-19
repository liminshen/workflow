module.exports.NodePath = ''; // 配置node_modules路径

var vendors = module.exports.vendors = [];  // 配置 三方库

module.exports.AssembleOpt = {  // 配置 assemble
    layouts: 'public/tpl/layouts/**/*.hbs',
    partials: 'public/tpl/partials/**/*.hbs',
    pages: 'public/tpl/pages/**/*.hbs',
    injectData: {
        cdnHost: 'http://localhost',
        commonjsName: 'commons.js',
        vendorsjsName: 'vendors.js',
        vendors: vendors.length > 0,
        useCommonChunk: true    // 是否打包出commons.js
    }
};

module.exports.copyToTrunkPath = '';    // 最终把生产文件输出的路径

module.exports.autoprefixerOpt = {  //配置 autoprefixer
    browsers: ['Android >= 4.0', 'ios >= 7.0', '>5%']
};

module.exports.spriteTPL = 'sprite_mobile.tpl';     // 配置sprite图的scss文件的生成模板

module.exports.serverConf = {   // 配置开发时的本地服务器
    openBrowser: false,
    development: {
        root: ['./public'],
        port: 8090,
        livereload: {
            hostname: '127.0.0.1'
        }
    }
};