"use strict";var exports={};browsers.define("downloads",["utils","jquery","config","musicsig","observers"],function(a,b,c,d,e){var f={init:function(){},sanitizeFilename:function(a){return a.replace(/["'\|]/g,"").replace(/[^\w\d\s\[\]\(\)\-,\.А-Яа-я]+/g," ").replace(/\s+/g," ").replace(/\.+(\.[\w\d]+)$/,function(a,b){return b}).replace(/^(\.\s*)+/g,"")},download:function(b,c,d){c=a.trim(f.sanitizeFilename(c)),browsers.runtime.sendMessage("download",{url:b||d.data("url"),filename:c})},downloadQueue:function(a){browsers.runtime.sendMessage("downloadQueue",{items:a})},base64encode:function(a){for(var b,c,d,e,f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",g="",h=0;h<a.length;)b=a.charCodeAt(h++),c=a.charCodeAt(h++),d=a.charCodeAt(h++),e=b>>2,b=(3&b)<<4|c>>4,c=isNaN(c)?64:(15&c)<<2|d>>6,d=isNaN(d)?64:63&d,g+=f.charAt(e)+f.charAt(b)+f.charAt(c)+f.charAt(d);return g},utf8_encode:function(a,b){b&&(a=a.replace(/\r\n/g,"\n"));for(var c="",d=0;d<a.length;d++){var e=a.charCodeAt(d);128>e?c+=String.fromCharCode(e):(e>127&&2048>e?c+=String.fromCharCode(e>>6|192):(c+=String.fromCharCode(e>>12|224),c+=String.fromCharCode(e>>6&63|128)),c+=String.fromCharCode(63&e|128))}return c},downloadData:function(a,b,c){b=f.utf8_encode(b),f.download("data:application/force-download;base64,"+f.base64encode(b),a)},bitrateRanges:{high:{max:1024,min:320,label:d.lang("audioFilterQualityHigh")},good:{max:319,min:255,label:d.lang("audioFilterQualityGood")},average:{max:255,min:128,label:d.lang("audioFilterQualityAverage")},low:{max:127,min:0,label:d.lang("audioFilterQualityLow")}},bitrateFilterState:JSON.parse(localStorage.musicsig_bitrate_filter||"null")||{enabled:!0,filters:{high:!0,good:!0,average:!0,low:!0}},saveBitrateFilterState:function(){localStorage.musicsig_bitrate_filter=JSON.stringify(f.bitrateFilterState)},applyBitrateFilter:function(){b(document).trigger("MusicSig.audioFilterChanged"),b("#audio_wrap").find("#main_panel .audio.download").add("#pad_playlist_panel .audio.download").add("#results.audio_results .audio.download").add(".audio_layout .audio_rows .audio_row.download").add("#results.search_audio_results .audio_row.download").each(function(){f.applyFilterOnAudioItem(b(this),!0)})},detectBitrateRange:function(a){for(var b in f.bitrateRanges)if(f.bitrateRanges.hasOwnProperty(b)){var c=f.bitrateRanges[b];if(c.max>=a&&a>=c.min)return b}return"high"},addBitrateFilterControl:function(){var a="layout-pre-2016",c="prepend",e=b("#audio_wrap").find("#side_filters:not(.with_quality_filter)");b("#search_table").find("td.audio_results").length&&(e=e.add("#search_filters:not(.with_quality_filter)")),b("#pad_wrap").length&&(e=e.add("#pad_side_filters:not(.with_quality_filter)")),b(".audio_search_input").length&&(e=e.add(".audio_search_input:not(.with_quality_filter)"),a="layout-post-2016",c="append"),b("#results.search_audio_results").length&&(e=e.add("#results.search_audio_results:not(.with_quality_filter)"),a="layout-post-2016"),e.each(function(){var e=b(this),g=b("<div>").addClass("audio_filter quality_filter").addClass(a).addClass(c),h=b("<div>").addClass("label");g.append(h);var i=b("<div>").addClass("checkboxes");g.append(i);var j=function(){var a=b(this),c=a.data("quality");f.bitrateFilterState.filters[c]=a.is(":checked"),f.saveBitrateFilterState(),f.applyBitrateFilter()},k=function(){var a=f.bitrateFilterState;h.text(d.lang(a.enabled?"audioFilterTurnOff":"audioFilterTurnOn")),i.toggle(a.enabled);for(var c in a.filters)if(a.filters.hasOwnProperty(c)){var e=i.find(".filter-"+c),g=e.find('input[type="checkbox"]');e.length||(e=b("<div>").addClass("filter filter-"+c),g=b("<input/>").attr("type","checkbox").data("quality",c).change(j),b("<label>").text(" "+f.bitrateRanges[c].label).prepend(g).appendTo(e),i.append(e)),g[0].checked=!!a.filters[c]}b("#audio_wrap").find("#main_panel").add("#pad_wrap #pad_playlist_panel").add("#search_table .audio_results").add(".audio_layout .audio_rows").add("#results.search_audio_results").toggleClass("audio-extended",a.enabled)};h.click(function(){f.bitrateFilterState.enabled=!f.bitrateFilterState.enabled,k(),f.saveBitrateFilterState(),f.applyBitrateFilter()}),b(document).on("MusicSig.audioFilterChanged",k),k(),e.addClass("with_quality_filter"),e.find(".audio_filter.quality_filter").length||("append"===c?e.append(g):e.prepend(g)),f.applyBitrateFilter()})},listsToWatch:{"table.audio_table":0,"table#search_table":0,"#pad_content_wrap":0,".audio_layer_columns":0,".wide_column_left":0},listsRecalculateTimeout:0,recalculateWatchedListsLength:function(){for(var a in f.listsToWatch)if(f.listsToWatch.hasOwnProperty(a)){var c=b(a),d=c.find(f.bitrateFilterState.enabled?".audio.download.filter_ok, .audio_row.download.filter_ok":".audio.download, .audio_row.download").length,e=d!==f.listsToWatch[a];f.listsToWatch[a]=d,e&&c.trigger("MusicSig.listLengthUpdated",f.listsToWatch[a])}f.listsRecalculateTimeout=0},uid:function(){function a(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return a()+a()+"-"+a()+"-"+a()+"-"+a()+"-"+a()+a()+a()},addSideDownloadControls:function(){var a=b("#audio_wrap").find("#side_filters:not(.with_download_controls)"),c="layout-pre-2016",e=b("#search_table").find("td.audio_results");e.length&&(a=a.add("#search_filters:not(.with_download_controls)")),a=a.add("#pad_side_filters:not(.with_download_controls)"),b(".audio_layer_menu_cont").length&&(a=a.add(".audio_layer_menu_cont:not(.with_download_controls)"),c="layout-post-2016"),b("#narrow_column").length&&(a=a.add("#narrow_column:not(.with_download_controls)"),c="layout-post-2016 page_block"),a.each(function(){var a=b(this);a.addClass("with_download_controls");var e="",g=null;for(var h in f.listsToWatch)if(f.listsToWatch.hasOwnProperty(h)&&(g=a.parents(h),g.length)){e=h;break}if(e){var i=a.find("#filter_form, #album_filters, #audio_friends, #pad_album_filters, #pad_audio_friends, ._audio_additional_blocks_wrap").first(),j=b("<div>").addClass("download_controls audio_filter").addClass(c).insertBefore(i),k=function(){var a=[];return g.find(f.bitrateFilterState.enabled?".audio.download.filter_ok, .audio_row.download.filter_ok":".audio.download, .audio_row.download").each(function(){var c=b(this);a.push({id:c.data("id"),uid:f.uid(),url:c.data("url"),filename:c.data("filename"),artist:c.data("performer"),title:c.data("title"),duration:c.data("duration"),size:c.data("fileSize"),bitrate:c.data("bitrate")})}),a},l=b("<div>").addClass("label download_playlist m3u").appendTo(j).click(function(){var a=k(),b="#EXTM3U\r\n\r\n";a.forEach(function(a){b+="#EXTINF:"+a.duration+","+a.artist+" - "+a.title+"\r\n"+a.url+"\r\n\r\n"}),f.downloadData(document.title+".m3u",b)}),m=b("<div>").addClass("label download_playlist txt").appendTo(j).click(function(){var a=k(),b="";a.forEach(function(a){b+=a.url+"?/"+encodeURI(a.artist+" - "+a.title+".mp3")+"\r\n"}),f.downloadData(document.title+".txt",b)}),n=b("<div>").addClass("label download_all").appendTo(j).click(function(){f.downloadQueue(k())}),o=function(a){a=a||f.listsToWatch[e]||0,a?(l.text(d.lang("dwplaylistM3U")+" ("+a+")").show(),m.text(d.lang("dwplaylistTXT")+" ("+a+")").show(),n.text(d.lang("downloadall")+" ("+a+")").show(),j.show()):(l.text(d.lang("dwplaylist")).hide(),m.text(d.lang("dwplaylist")).hide(),n.text(d.lang("downloadall")).hide(),j.hide())};o(),g.on("MusicSig.listLengthUpdated",function(a,b){o(b)})}})},observeAudio:function(){f.addAudioDownLink(),e.watchSelector("#wrap3, #pad_playlist, #pad_search_list, div#audios_list div#initial_list, div#audios_list div#search_list, #wk_layer_wrap, #feed_rows, .audio_playlist_wrap",{subtree:!0,childList:!0,attributes:!0},function(a){f.addAudioDownLink(a),f.listsRecalculateTimeout||(f.listsRecalculateTimeout=window.setTimeout(f.recalculateWatchedListsLength,300))},"audio-observed")},getExtendedInfoOnAudioItem:function(a){if(!a.data("fileSize")||"..."===a.data("fileSize")){var c=a.data("url"),d=parseInt(a.data("duration")),e=a.find(".title_wrap, .audio_title_wrap");a.data("fileSize","..."),f.getRemoteFileLength(c,function(c){var g=a.find(".info, .audio_info"),h=f.bytesToStr(c),i=f.calculateBitRate(c,d),j=b("<div>").addClass("download_info").insertAfter(e);b("<b></b>").text(i+" kbps ").appendTo(j),b("<span></span>").text(h).appendTo(j),g.addClass("filesize"),a.data("fileSize",c),a.data("bitrate",i),a.data("quality",f.detectBitrateRange(i)),f.applyFilterOnAudioItem(a)})}},applyFilterOnAudioItem:function(a,b){if(b||a.is("#audio_wrap #main_panel .audio, #pad_playlist_panel .audio, #results.audio_results .audio, .audio_layout .audio_rows .audio_row"))if(f.bitrateFilterState.enabled){var c=a.data("quality"),d=f.bitrateFilterState;c?(a.toggleClass("filter_ok",d.filters[c]),a.toggleClass("filter_fail",!d.filters[c])):f.getExtendedInfoOnAudioItem(a)}else a.removeClass("filter_ok filter_fail")},addAudioDownLink:function(d){var e=b("div.audio:not(.download), div.audio_row:not(.download)",d),g=[];e.length&&(e.each(function(){var d=b(this),e=d.find(".actions, .audio_acts"),h=d.find("input[type=hidden][id^=audio_info]").val(),i=d.find(".title_wrap, .audio_title_wrap"),j=d.data("performer")||a.trim(f.sanitizeFilename(i.find("a")[0].innerText)),k=d.data("title")||a.trim(f.sanitizeFilename(i.find(".title, .audio_title_inner")[0].innerText)),l=d.data("url"),m=parseInt(d.data("duration")),n=j+" - "+k+".mp3";g.push({id:d.attr("data-full-id"),item:d});var o=function(a){a.stopPropagation(),a.preventDefault(),f.download(l,n,d)},p=b("<img />").addClass("btn_download").attr("src",browsers.extension.getURL("images/download.png")).click(o);if(h)h=h.split(","),l=h[0],m=parseInt(h[1]),d.data("performer",j),d.data("title",k),d.data("url",l),d.data("duration",m);else{var q=d.find(".audio_duration")[0].innerText.split(":").map(function(a){return parseInt(a)});q=3===q.length?60*q[0]*60+60*q[1]+q[3]:60*q[0]+q[1],d.data("duration",q),d.data("performer",a.trim(f.sanitizeFilename(i.find("a")[0].innerText))),d.data("title",a.trim(f.sanitizeFilename(i.find(".title, .audio_title_inner")[0].innerText)))}d.data("filename",n),d.mouseover(function(){f.getExtendedInfoOnAudioItem(d)}),c.bitrateAlways&&f.getExtendedInfoOnAudioItem(d),f.applyFilterOnAudioItem(d),e.append(p),d.on("click",".actions .audio_add_wrap",function(){setTimeout(function(){d.find(".actions img").off("click").click(o)},500)})}),f.delayAudioLoading(g),e.addClass("download"))},audioRequestsQueue:{delay:"",timestamp:0,elements:[]},delayAudioLoading:function(a,b){(new Date).getTime()-f.audioRequestsQueue.timestamp<1800?(f.audioRequestsQueue.elements[f.audioRequestsQueue.elements.length-1]!==a&&f.audioRequestsQueue.elements.push(a),""!==f.audioRequestsQueue.delay&&clearTimeout(f.audioRequestsQueue.delay),f.audioRequestsQueue.delay=setTimeout(function(){for(var a=f.audioRequestsQueue.elements.length,b=0;a>b;b++)f.delayAudioLoading(f.audioRequestsQueue.elements.pop())},b||2e3)):f.getAllAudioLinks(a),f.audioRequestsQueue.timestamp=(new Date).getTime()},calculateBitRate:function(a,b){return 32*Math.round(a/b/125/32)},remoteFileLengths:{},getRemoteFileLength:function(a,b){return a?void(f.remoteFileLengths[a]?b(f.remoteFileLengths[a]):browsers.ajax(a,{method:"head",success:function(c,d){if(200===d.status){var e=parseInt(d.headers["content-length"]||d.headers["Content-Length"]);f.remoteFileLengths[a]=e,b(e)}},timeout:1e4})):0},getAllAudioLinks:function(a){function b(b){var c=new XMLHttpRequest;c.withCredentials=!0,c.addEventListener("readystatechange",function(){if(4===this.readyState)if(null===new RegExp("<!json>(.*)<!><!bool>").exec(this.responseText))console.log("Fail"),f.delayAudioLoading(a,1e4);else{var b=JSON.parse(new RegExp("<!json>(.*)<!><!bool>").exec(this.responseText)[1]);b=b.map(function(a){return{audioId:a[1]+"_"+a[0],link:a[2]}}),b.forEach(function(a){g[a.audioId].data("url",a.link),f.getExtendedInfoOnAudioItem(g[a.audioId])})}}),c.open("POST","https://new.vk.com/al_audio.php"),c.setRequestHeader("content-type","application/x-www-form-urlencoded"),c.send(b)}for(var c=[],d=10,e=0;e<a.length;e+=d)c.push("act=reload_audio&al=1&ids="+a.slice(e,e+d).map(function(a){return a.id}).join("%2C"));var g={};a.forEach(function(a){g[a.id]=a.item}),c.forEach(function(a){console.log("Http request send"),b(a)})},bytesToStr:function(a){var b={0:"PB",1:"TB",2:"GB",3:"MB",4:"KB",5:"B"};for(var c in b){var d=a/Math.pow(2,10*(5-c));if(d>=.5)return d.toFixed(2)+" "+b[c]}return"0 B"},getDownloadQueue:function(a){var b=5,c="restore",d=[],e=0,f="timeout";browsers.runtime.sendMessage("MusicSig.downloadQueue.getState",{},function(g){d=g.queue,e=g.timeout,b=g.interval,c=g.reloadMode,f=g.queueMode||"timeout",a&&a()});var g=function(a,b,c){b=b||[],browsers.runtime.sendMessage("MusicSig.downloadQueue."+a,{arguments:b},c)},h={renderBadge:function(){g("renderBadge")},storeQueue:function(){g("storeQueue")},push:function(a){g("push",[a])},start:function(){g("start",[],function(){e=!0})},stop:function(){g("stop",[],function(){e=!1})},clear:function(){g("clear")},isOn:function(){return!!e},getInterval:function(){return b},setInterval:function(a){g("setInterval",[parseInt(a)||5],function(a){b=a})},getReloadMode:function(){return c},setReloadMode:function(a){g("setReloadMode",[a||"restore"],function(a){c=a})},getQueueMode:function(){return f},getItems:function(){return d},getTotal:function(){return d.length},on:function(a,b){browsers.runtime.onMessage(a,b)},off:function(){}};return h.on("MusicSig.downloadQueue.pushedItems",function(a){d=d.concat(a)}),h.on("MusicSig.downloadQueue.pushedItem",function(a){d.push(a)}),h.on("MusicSig.downloadQueue.downloadStarted",function(){e=!0,d.shift()}),h.on("MusicSig.downloadQueue.downloadStopped",function(){e=!1}),h.on("MusicSig.downloadQueue.queueCleared",function(){d=[]}),h}};return f},exports);