"use strict";var exports={};browsers.define("hiddenprofile",["jquery","musicsig","config"],function(a,b,c){var d={init:function(){},reg_cache:null,addUserYears:function(){var a;if(!window.userage&&window.profile_short){for(var d,e=/c\[bday\]\=(\d{1,2})\&c\[bmonth\]\=(\d{1,2})/,f=b.geByClass("labeled",window.profile_short),g=null,h=0;h<f.length;h++)if(f[h]&&(a=f[h].firstElementChild,a&&a.href&&(d=a.href.match(e)))){g=f[h];break}if(g){a=g.innerHTML.match(/\[byear]=(\d{4})/),(d[1]>31||d[2]>12)&&(e=new Date(new Date(a[1],d[2],d[1])-1),d[2]=e.getMonth(),d[1]=e.getDate()),e="",f=0;var i="";if(h=!1,i=new Date,a&&c.userYears&&(f=i.getFullYear()-a[1],d&&d[2]>i.getMonth()+1?f--:d&&d[2]===i.getMonth()+1&&d[1]>i.getDate()&&f--,0>f&&(h=!0,f=-f),b.lang("yearsold")?(a=f.toString().substr(1),i=b.lang("yearsold").split("|"),1===a&&(e=i[0]),a>1&&5>a&&(e=i[1]),(a>4||0===a)&&(e=i[2]),f>4&&21>f&&(e=i[2])):e="years old"),d&&c.showZodiac?(a=b.lang("signs").split("|"),i=d[2]-1,d[1]>[20,19,20,20,20,21,22,23,23,23,22,21][i]&&(i=(i+1)%12),i=a[i]):i="",i&&e&&(e+=", "),e=(f?(h?b.lang("notborned")+" ":"")+f+" "+e:"")+i){var j=g.querySelector("#userage")||document.createElement("span");j.setAttribute("id","userage"),j.textContent=" ("+e+")",g.appendChild(j)}}}}};return d},exports);