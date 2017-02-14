/*执行工作流任务*/
/********************************************************/
const NodePath = require('./total.config').NodePath;
if (NodePath.trim() == '') {
    throw new RangeError('NodePath 不能为空');
}
var path = require('path');
var fs = require('fs');
const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 30; //防止爆盏
/*解决node_module位置问题*/
function createModulesSymlink () {
    try{
        fs.rmdirSync(path.resolve('./node_modules'));
    } catch (err){}
    try{
        fs.symlinkSync(path.resolve(NodePath),path.resolve('./node_modules'),'dir');
    }catch(err){}
}

createModulesSymlink();

var resovleModulePath = function (moduleName) {
    return path.resolve(NodePath, moduleName);
}
/*require(resovleModulePath('app-module-path')).addPath(NodePath);*/
var inquirer = require(resovleModulePath('inquirer'));
var log = (chunk, color) => {
    var colors = {
        red: 31,
        green: 32,
        yellow: 33,
        blue: 34,
        pink: 35,
        cyan: 36,
        gray: 90
    };
    console.log('\033[' + (colors[color] || '00') + 'm' + chunk + '\033[0m');
}

var cleanUpStr = (str) => str.replace(/([\r\n]*)$/g, '');

process.argv = process.argv.slice(0, 2);// 强行抹除额外参数
process.stdout.setEncoding('utf8');// 预先设置chunk以utf8来输出

var devEnvSelect = () => inquirer.prompt(
    [
        {
            type: 'list',
            name: 'type',
            message: '请选择合适的开发环境！',
            choices: [
                {
                    name: '(1) development',
                    value: 'development'
                },
                {
                    name: '(2) production',
                    value: 'production'
                },
                {
                    name: '(3) copy-to-trunk',
                    value: 'copy-to-trunk'
                }
            ]
        }
    ]
);

devEnvSelect().then(function (answers) {
    var argvArr = [answers.type];
    process.argv = process.argv.concat(argvArr);
    process.env.NODE_ENV = (answers.type === 'production' || answers.type === 'copy-to-trunk')? 'production' : 'development';
    var cli = require(resovleModulePath('gulp-cli'));
    cli();
});
/********************************************************/
