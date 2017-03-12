# 工作流使用说明

## 模块下载
到仓库 [https://github.com/kuangyeheng/workflow-modules](https://github.com/kuangyeheng/workflow-modules) 下载依赖模块

## 环境配置
1. 请安装4.7.x的nodejs环境
2. 全局安装`gulp-cli`,执行命令`npm install -g gulp-cli`

## 配置文件`personal.config.js`
创建文件`personal.config.js`，然后将`personal.config.example.js `文件里代码复制到文件`personal.config.js`
此时`personal.config.js`文件内容如下：
```javascript
module.exports = {
    NodePath: 'D:\\project\\node_modules',                          //配置node_modules的路径
    copyToTrunkPath: 'D:\\project\\static',                         //配置生产文件的存放路径
    cdnHost: 'http://www.domain.com',                               //配置全局请求地址
    devServerPort: 8888                                             //配置开发服务器的端口
};
```

## 文件作用说明
```
│  .gitignore
│  build.js
│  cmd.cmd
│  git-bash.cmd
│  gulpfile.js
│  LICENSE
│  personal.config.example.js       //personal.config.js 的 example
│  powershell.cmd
│  README.md
│  total.config.js                  //整个项目的配置文件
│
└─public
    ├─assets
    │  ├─images
    │  │  │  sprite_mobile.tpl      //生成sprite相关scss文件的模板
    │  │  │  sprite_pc.tpl          //生成sprite相关scss文件的模板
    │  │  │
    │  │  └─index
    │  │          logo.jpg
    │  │
    │  ├─js
    │  │  └─pages                   //pages文件夹用来放js入口文件
    │  │          index.js
    │  │
    │  └─sass                       //sass文件夹放scss样式入口文件，以'_'开头的文件不会被编译
    │      │  index.scss
    │      │
    │      └─components
    │              _main.scss
    │
    ├─dot                           //dot文件夹放dot模板文件，.jst是入口文件，.def是碎片，可插入到.jst文件
    │      example.def
    │      example.jst
    │
    ├─tmod                          //tmod文件夹放arttemplate模板文件,.tpl是入口文件，helpers.js放置供模板使用的函数
    │      example.tpl
    │      helpers.js
    │
    └─tpl                           //放置生成的.html的源码,生成引擎为assemble
        ├─layouts                   //layouts文件夹就是放着页面的layout
        │      mobile.hbs
        │      pc.hbs
        │
        ├─pages                     //pages文件夹放置入口文件
        │      index.hbs
        │
        └─partials                  //partials文件夹放置页面通用组件
                fixFontSize.hbs
```