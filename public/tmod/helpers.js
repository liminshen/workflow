template.helper('parseFloat', function (value) {
    return parseFloat(value);
});

/**
 *  @timestamp  {String|Number} 毫秒为单位的时间戳
 *  @return     {String} 格式：2017-03-01 13:08:28
 */

template.helper('tsFormater', function (timestamp) {
    var date = new Date(+timestamp);
    var trans = function  (num) {
        return num > 9? num + '' : '0' + num;
    };
    var json = {
        year: trans(date.getFullYear()),
        month: trans(date.getMonth() + 1),
        day: trans(date.getDate()),
        hour: trans(date.getHours()),
        min: trans(date.getMinutes()),
        second: trans(date.getSeconds()),
        weekDay: date.getDay() + '',
        monthLastDay: (function () {
            date.setDate(32);
            date.setDate(0);
            return date.getDate() + '';
        }())
    };
    return json.year + '-' + json.month + '-' + json.day + ' ' + json.hour + ':' + json.min + ':' + json.second;
});

template.helper('tsFormaterMMDD', function (timestamp) {
    var date = new Date(+timestamp);
    var trans = function  (num) {
        return num > 9? num + '' : '0' + num;
    };
    var json = {
        year: trans(date.getFullYear()),
        month: trans(date.getMonth() + 1),
        day: trans(date.getDate()),
        hour: trans(date.getHours()),
        min: trans(date.getMinutes()),
        second: trans(date.getSeconds()),
        weekDay: date.getDay() + '',
        monthLastDay: (function () {
            date.setDate(32);
            date.setDate(0);
            return date.getDate() + '';
        }())
    };
    return json.month + '-' + json.day;
});

template.helper('textOver', function (str,length,symbol) {
    str = str + '';
    if (str.length > length) {
        return str.substr(0,length) + symbol;
    }
    return str;
});

template.helper('dateFormat', function (date,serverTimestamp) {
    var _date     = new Date(date);
    var _now      = serverTimestamp? new Date(serverTimestamp) : new Date();
    var _dateFormat = _date.format("MM-dd HH:mm");
    var _nowTime  = _now.getTime();
    var _dateTime = new Date(date).getTime();

    var _range    = _nowTime - _dateTime;

    //_range小于0表示时间比当前系统时间晚
    if(_range<0){
        return _date.format("yy-MM-dd HH:mm");;
    }

    var _dayDate =  _date.getDate();
    var _dayNow =  _now.getDate();
    
    var dayDiff   = Math.floor(_range / (24 * 3600 * 1000));
    var returnstr = "";

    //2天以前就直接返回时间字符串
    if(dayDiff >= 2||_dayNow-_dayDate==2){
        return _dateFormat;
    }

    //前天以来的处理
    var parttime = _dateFormat.substring(6);
    switch (dayDiff){
        case 1 :
            returnstr += "昨天 " + parttime;
            break;
        default :
            //对今天的操作
            var minuteleft = Math.floor(_range / (60 * 1000)); //计算相差的分钟数
            if(_now.getDate() - _date.getDate()>=1){
                returnstr += "昨天 " + parttime;
            }else if(minuteleft > 30){
                returnstr += "今天 " + parttime;
            }else if (minuteleft < 0) {
                returnstr = "刚刚";
            }else if (minuteleft == 0) {
                var _second = Math.floor(_range / 1000);
                if(_second <= 0){
                    returnstr = "刚刚";
                }else {
                    returnstr += _second + "秒前";
                }
            }else{
                returnstr += minuteleft + "分钟前";
            }
        }
        return returnstr;
});

Date.prototype.format = function(fmt) {
  fmt = fmt|| "yyyy-MM-dd HH:mm:ss";
  var o = {
      "M+" : this.getMonth()+1,     //月份
      "d+" : this.getDate(),        //日
      "h+" : this.getHours(),       //小时
      "H+" : this.getHours(),       //小时
      "m+" : this.getMinutes(),     //分
      "s+" : this.getSeconds()      //秒
  };
  if(/(y+)/.test(fmt)){
      fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
  for(var k in o){
      if(new RegExp("("+ k +")").test(fmt)){
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
      }
  }
  return fmt;
};

//简单处理数字,大于10亿以亿为单位(测试环境...),大于10万的数字以万为单位显示,保留一位小数
template.helper('numberFormat', function (num) {
    var _num = Number(num);
    if(_num > 1000000000){
        return (_num/100000000).toFixed(1)+"亿";
    }else if(_num > 100000){
        return (_num/10000).toFixed(1)+"万";
    }else{
        return _num;
    }
});