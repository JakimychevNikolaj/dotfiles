"use strict";var exports={};browsers.define("musicsig",["utils","jquery"],function(a,b){var c={title:"MusicSig",debug:!1,veTabID:0,version:0,$doc:b(document),init:function(){parseInt(c.cfg("music","true"))&&(localStorage.music="true")},log:function(b,d){if(c.debug)if(d=d||c.title,a.isString(b))console.log(d+":"+b);else{var e={};e[d]=b,console.dir(e)}},cfg:function(b,c){return a.isUndefined(localStorage[b])&&!a.isUndefined(c)&&(localStorage[b]=c),localStorage[b]},getCookie:function(a){return localStorage["ms_"+a]},setCookie:function(a,b){localStorage["ms_"+a]=b},delCookie:function(a){document.cookie=a+"=; expires="+new Date(0).toGMTString()},convertInt:function(a){return a},lang:function(a){return browsers.i18n.getMessage(a)||a},setIcon:function(a){a=parseInt(a),isNaN(a)&&(a=0),browsers.browserAction.setIcon("/images/icon/"+a+"_48.png"),c.bgSetVal("icon",a)},appendScriptOrStyle:function(a,b,d,e){d=d||document.head,a=b?a:browsers.extension.getURL(a);var f;-1!==a.indexOf(".js")?f=c.$c("script",{type:"text/javascript",src:a}):-1!==a.indexOf(".css")&&(f=c.$c("link",{type:"text/css",rel:"stylesheet",href:a})),f&&(e&&(f.onload=e),d.appendChild(f))},ge:function(){for(var a=[],b=0;b<arguments.length;b++){var c=arguments[b];if("string"==typeof c&&(c=document.getElementById(c)),1===arguments.length)return c;a.push(c)}return a},geByClass:function(a,b,c){var d=[];if(b=b||document,c=c||"*",b.getElementsByClassName){if(d=b.getElementsByClassName(a),"*"!==c)for(var e=0;e<d.length;e++)d.nodeName===c&&d.splice(e,1);return d}b=b.getElementsByTagName(c),a=new RegExp("(^|\\s)"+a+"(\\s|$)");for(var f=0,g=0;g<b.length;g++)a.test(b[g].className)&&(d[f]=b[g],f++);return d},geByClassEx:function(a,b,d){return c.geByClass(a,b,d)[0]},geTN:function(a,b){return a?a.getElementsByTagName(b):null},$c:function(a,b){if("#text"===a||"#"===a)return document.createTextNode(b);if("string"==typeof a&&"#"===a.substr(0,1))return document.createTextNode(a.substr(1));var c=document.createElement(a);for(var d in b)if("kids"===d)for(var e in b[d])"object"==typeof b[d][e]&&c.appendChild(b[d][e]);else"#text"===d?c.appendChild(document.createTextNode(b[d])):"#html"===d?c.innerHTML=b[d]:c.setAttribute(d,b[d]);return c},getMainUrl:function(){return"http://"+c.cfg("vkurl","vkontakte.ru")+"/"},getUrl:function(a){return a=a||"",c.getMainUrl()+a},getiUrl:function(a){return browsers.extension.getURL(a)},domute:function(){localStorage.notify="",localStorage.music=""},prepError:function(a,b){var d=a;a.stack&&(d=a.stack),d="In function: "+b+"\n"+d,console.trace(),console.error(d),localStorage.dbg||c.log(d)},chrRequest:function(a,b){browsers.runtime.sendMessage(a,b)},lsSetVal:function(a,b){localStorage[a]=b},bgSetVal:function(a,b){browsers.runtime.sendMessage("setval",{name:a,variable:b})},lsGetVal:function(a,b){b(localStorage[a])},bgGetVal:function(a,b){browsers.runtime.sendMessage("getval",{name:a},b)},getUid:function(){return window.vk&&window.vk.id||0},designLayout:void 0,getDesignLayout:function(){return void 0===c.designLayout&&(c.designLayout=b("#wrap3 .wide_column_left, #wrap3 .wide_column_right").length?"post-2016-layout":"pre-2016-layout"),c.designLayout},is2016DesignLayout:function(){return"post-2016-layout"===c.getDesignLayout()}};return c},exports);