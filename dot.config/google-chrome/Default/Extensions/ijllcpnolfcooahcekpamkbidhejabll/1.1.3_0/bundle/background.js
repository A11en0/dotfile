webpackJsonp([7],{0:function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}function i(e){return e&&e.__esModule?e:{default:e}}function a(e){S.Push("site",!0)}function s(e,t){e.url&&e.url.includes("#")?v.browser.tabs.query({},function(r){return t(r.filter(function(t){return t.url==e.url&&t.active}))}):v.browser.tabs.query(e,function(e){t(e)})}function o(e,t){var r="";t==-1?(v.browser.pageAction.hide(e),w.Update("tempread")):(r="-enable",v.browser.pageAction.show(e),f.storage.option.menu.read===!0&&w.Create("read"),w.Update("read")),v.browser.pageAction.setIcon({tabId:e,path:v.browser.extension.getURL("assets/images/icon16"+r+".png")})}function u(e){var t=e.eventCategory,r=e.eventAction,n=e.eventLabel;ga("send",{hitType:"event",eventCategory:t,eventAction:r,eventLabel:n})}function l(){!function(e,t,r,n,i,a,s){e.GoogleAnalyticsObject=i,e[i]=e[i]||function(){(e[i].q=e[i].q||[]).push(arguments)},e[i].l=1*new Date,a=t.createElement(r),s=t.getElementsByTagName(r)[0],a.async=1,a.src=n,s.parentNode.insertBefore(a,s)}(window,document,"script","https://www.google-analytics.com/analytics.js","ga"),ga("create","UA-405976-12","auto"),ga("send","pageview")}function c(){v.browser.runtime.setUninstallURL(f.storage.option.uninstall?f.storage.service+"/uninstall":"")}var d=r(287),h=i(d),f=r(8),p=r(19),m=n(p),v=r(11),g=r(67),b=n(g),y=r(108),w=n(y),A=r(21),S=n(A),E=r(301),k=n(E),x=r(68),_=i(x),O=-1;f.storage.Read(function(){f.storage.puread=new _.default(f.storage.sites),h.default.Firstload()?(h.default.Version(b.version),v.browser.tabs.create({url:v.browser.extension.getURL("options/options.html#firstload?ver="+b.version)})):(!h.default.Count()&&f.storage.GetRemote("remote",function(e,t){t||(f.storage.pr.Addsites(e),f.storage.Writesite(f.storage.pr.sites,a))}),b.version!=f.storage.version&&f.storage.GetRemote("local",function(e,t){f.storage.pr.Addsites(e),f.storage.Writesite(f.storage.pr.sites,function(){b.version!=f.storage.version&&f.storage.Fix(f.storage.read.sites,f.storage.version,b.version,f.storage.focus.sites),b.version!=f.storage.version&&f.storage.Write(function(){h.default.Version(b.version),v.browser.tabs.create({url:v.browser.extension.getURL("options/options.html#update?ver="+b.version)})},b.Verify(f.storage.version,f.storage.simpread)),a(e)})}),b.version==f.storage.version&&b.patch!=f.storage.patch&&f.storage.Write(function(){v.browser.tabs.create({url:v.browser.extension.getURL("options/options.html#update?patch="+b.patch)})},b.FixSubver(b.patch,f.storage.simpread))),w.CreateAll(),setTimeout(function(){return c()},100)}),w.OnClicked(function(e,t){"link"==e.menuItemId?e.linkUrl&&v.browser.tabs.create({url:e.linkUrl+"?simpread_mode=read"}):"list"==e.menuItemId?v.browser.tabs.create({url:v.browser.extension.getURL("options/options.html#later")}):"whitelist"==e.menuItemId?v.browser.tabs.sendMessage(t.id,m.Add(m.MESSAGE_ACTION.menu_whitelist,{url:e.pageUrl})):"exclusion"==e.menuItemId?v.browser.tabs.sendMessage(t.id,m.Add(m.MESSAGE_ACTION.menu_exclusion,{url:e.pageUrl})):"blacklist"==e.menuItemId?v.browser.tabs.sendMessage(t.id,m.Add(m.MESSAGE_ACTION.menu_blacklist,{url:e.pageUrl})):"unrdist"==e.menuItemId?v.browser.tabs.sendMessage(t.id,m.Add(m.MESSAGE_ACTION.menu_unrdist,{url:e.pageUrl})):t.url.startsWith("chrome://")||v.browser.tabs.sendMessage(t.id,m.Add(e.menuItemId))}),v.browser.runtime.onMessage.addListener(function(e,t,r){return e.type==m.MESSAGE_ACTION.CORB&&$.ajax(e.value.settings).done(function(e){r({done:e})}).fail(function(e,t,n){r({fail:{jqXHR:e,textStatus:t,errorThrown:n}})}),!0}),v.browser.runtime.onMessage.addListener(function(e,t,r){e.type==m.MESSAGE_ACTION.jianguo&&!function(){var t=e.value,n=t.url,i=t.user,a=t.password,s=t.method,o=new k.Fs(n,i,a);"folder"==s.type?o.dir(s.root).mkdir(function(e){o.dir(s.root+"/"+s.folder).mkdir(function(e){r({done:e,status:e.status})})}):"file"==s.type?o.file(s.path).write(s.content,function(e){r({done:e,status:e.status})}):"read"==s.type&&o.file(s.path).read(function(e){r({done:e.response,status:e.status})})}()}),v.browser.runtime.onMessage.addListener(function(e,t,r){if(e.type==m.MESSAGE_ACTION.WebDAV){var n=e.value,i=n.url,a=n.user,s=n.password,o=n.method,u=new k.Fs(i,a,s);"folder"==o.type?u.dir(o.root).mkdir(function(e){r({done:e,status:e.status})}):"file"==o.type&&u.file(o.root+"/"+o.name).write(o.content,function(e){r({done:e,status:e.status})})}}),v.browser.runtime.onMessage.addListener(function(e,t,r){switch(e.type){case m.MESSAGE_ACTION.shortcuts:s({url:e.value.url},function(e){v.browser.tabs.sendMessage(e[0].id,m.Add(m.MESSAGE_ACTION.shortcuts))});break;case m.MESSAGE_ACTION.browser_action:s({url:e.value.url},function(t){t&&t.length>0&&t[0].url==e.value.url&&o(t[0].id,e.value.code)});break;case m.MESSAGE_ACTION.new_tab:v.browser.tabs.create({url:e.value.url});break;case m.MESSAGE_ACTION.close_tab:s({active:!0},function(t){t.forEach(function(t){t.active&&t.url==e.value.url&&v.browser.tabs.remove(t.id)})});break;case m.MESSAGE_ACTION.menu:var n=e.value,i=n.id,a=n.value;f.storage.option.menu[i]=a,a===!0?w.Create(i):w.Remove(i);break;case m.MESSAGE_ACTION.updated:S.Push(e.value.type,e.value.value);break;case m.MESSAGE_ACTION.save_verify:r(S.Lock(e.value.url));break;case m.MESSAGE_ACTION.auth:v.browser.tabs.create({url:v.browser.extension.getURL("options/options.html#labs?auth="+e.value.name.toLowerCase())});break;case m.MESSAGE_ACTION.update_site:s({active:!0,url:e.value.url},function(t){t.length>0&&(O=t[0].id),v.browser.tabs.create({url:v.browser.extension.getURL("options/options.html#sites?update="+encodeURI(JSON.stringify(e.value.site)))})});break;case m.MESSAGE_ACTION.save_site:v.browser.tabs.create({url:v.browser.extension.getURL("options/options.html#sites?pending="+encodeURI(JSON.stringify(e.value)))});break;case m.MESSAGE_ACTION.temp_site:v.browser.tabs.create({url:v.browser.extension.getURL("options/options.html#sites?temp="+encodeURI(JSON.stringify(e.value)))});break;case m.MESSAGE_ACTION.auth_success:s({url:e.value.url},function(t){t&&t.length>0&&(v.browser.tabs.remove(t[0].id),s({active:!0},function(t){t.forEach(function(t){return v.browser.tabs.sendMessage(t.id,m.Add(m.MESSAGE_ACTION.export,{type:e.value.name.toLowerCase()}))})}))});break;case m.MESSAGE_ACTION.track:u(e.value);break;case m.MESSAGE_ACTION.speak:v.browser.tts.speak(e.value.content);break;case m.MESSAGE_ACTION.speak_stop:v.browser.tts.stop()}}),v.browser.tabs.onActivated.addListener(function(e){s({active:!0,currentWindow:!0},function(e){e&&e.length>0&&"complete"==e[0].status&&(e&&e.length>0&&!e[0].url.startsWith("chrome://")?v.browser.tabs.sendMessage(e[0].id,m.Add(m.MESSAGE_ACTION.tab_selected,{is_update:!1})):o(e[0].id,-1))})}),v.browser.tabs.onUpdated.addListener(function(e,t,r){if(S.Pull(e),"complete"==t.status){if(r.url.startsWith("http://ksria.com/simpread/auth.html"))!function(){var t=r.url.replace("http://ksria.com/simpread/auth.html?id=",""),n=t.includes("#")||t.includes("&")?t.substr(0,t.search(/\S(#|&)/)+1):t;v.browser.tabs.query({},function(t){var i=t.find(function(e){return e.url.includes(v.browser.extension.getURL("options/options.html"))});i&&(v.browser.tabs.sendMessage(i.id,m.Add(m.MESSAGE_ACTION.redirect_uri,{uri:r.url,id:n})),v.browser.tabs.remove(e))})}();else if(r.url.startsWith("https://simpread.ksria.cn/plugins/install/")){var n=r.url.replace("https://simpread.ksria.cn/plugins/install/","");v.browser.tabs.create({url:v.browser.extension.getURL("options/options.html#plugins?install="+encodeURIComponent(n))}),v.browser.tabs.remove(e)}else if(r.url.startsWith("https://simpread.ksria.cn/sites/install/")){var i=r.url.replace("https://simpread.ksria.cn/sites/install/","");v.browser.tabs.create({url:v.browser.extension.getURL("options/options.html#sites?install="+encodeURIComponent(i))}),v.browser.tabs.remove(e)}else r.url==v.browser.runtime.getURL("options/options.html#sites?update=success")?(v.browser.tabs.remove(e),O>0&&chrome.tabs.reload(O,function(){})):r.url==v.browser.runtime.getURL("options/options.html#sites?update=failed")?v.browser.tabs.remove(e):r.url==v.browser.runtime.getURL("options/options.html#sites?update=complete")?v.browser.tabs.remove(e):r.url==v.browser.runtime.getURL("options/options.html#sites?update=pending")&&(v.browser.tabs.remove(e),O>0&&v.browser.tabs.sendMessage(O,m.Add(m.MESSAGE_ACTION.pending_site)));r.url.startsWith("chrome://")?o(r.id,-1):v.browser.tabs.sendMessage(e,m.Add(m.MESSAGE_ACTION.tab_selected,{is_update:!0}))}}),v.browser.tabs.onRemoved.addListener(function(e){return S.Pull(e)}),v.browser.pageAction.onClicked.addListener(function(e){v.browser.tabs.sendMessage(e.id,m.Add(m.MESSAGE_ACTION.browser_click))}),l()},68:function(e,t,r){var n,i,a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};!function(s,o){"object"==a(t)&&"undefined"!=typeof e?e.exports=o():(n=o,i="function"==typeof n?n.call(t,r,t,e):n,!(void 0!==i&&(e.exports=i)))}(void 0,function(){"use strict";function e(e){return $.extend(!0,{},e)}function t(e){if(document){var t=document.createElement("a");return t.href=e,t}var r=e.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);return r&&{href:e,protocol:r[1],host:r[2],hostname:r[3],port:r[4],pathname:r[5],search:r[6],hash:r[7]}}function r(e){if(""==e)return[0,e];if(i(e))return[2,e];var t=e.match(/<\S+ (class|id)=("|')?[\w-_=;:' ]+("|')?>?$|<[^\/][-_a-zA-Z0-9]+>?$/gi);return t&&t.length>0?[1,t]:[-1,void 0]}function n(e){var t=r(e),n=A(t,2),i=n[0],a=n[1];if(2==i)return e;if(1==i){var s=a[0].trim().replace(/['"<>]/g,"").replace(/ /gi,"=").split("="),o=A(s,3),u=o[0],l=o[1],c=o[2];return l?"class"===l.toLowerCase()?l=u+"."+c:"id"===l.toLowerCase()&&(l=u+"#"+c):l=u,l}return null}function i(e){return/^(\[\[)[\[{`'\/]{1}[ \S]+[}`'\/\]]\]\]{1}($)/g.test(e)}function s(e){var t=[e.replace(/(^)\[\[|\]\]$/g,"")],r=t[0],n=t[1];switch(r[0]){case"{":r=r.replace(/^{|}$/g,""),e=new Function("return "+r)(),n=0;break;case"'":e=(e=r.replace(/^'|'$/g,"")).match(/^<[a-zA-Z0-9_-]+>/g).join("").replace(/<|>/g,"")+":contains("+e.replace(/<[\/a-zA-Z0-9_-]+>/g,"")+")",n=1;break;case"/":e=r.replace(/^\/|\/$/g,"").replace(/\\{2}/g,"\\").replace(/'/g,'"'),n=2;break;case"[":r=r.replace(/^{|}$/g,""),e=new Function("return "+r)()[0],n=3;break;case"`":r=u(r=r.replace(/^`|`$/g,"")),e=$(r),n=4;break;default:n=-1}return[e,n]}function o(e){try{if(""!=e.id)return void 0==e.id?"":"//*[@id='"+e.id+"']";if(e===document.body)return"/html[1]/"+e.tagName.toLowerCase();for(var t=0,r=e.parentNode.childNodes,n=0;n<r.length;n++){var i=r[n];if(i===e)return o(e.parentNode)+"/"+e.tagName.toLowerCase()+"["+(t+1)+"]";1===i.nodeType&&i.tagName===e.tagName&&t++}}catch(e){return""}}function u(e){return document.evaluate(e,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue}function l(){var e=$("body"),t=!0,r=!1,n=void 0;try{for(var i,a=["[itemprop='articleBody']","article",".post-content",".entry-content",".post-article",".content-post",".article-entry",".article-content",".article-body",".markdown-body",".post",".content"][Symbol.iterator]();!(t=(i=a.next()).done);t=!0){var s=i.value,o=e.find(s);if(o.length>0)return o}}catch(e){r=!0,n=e}finally{try{!t&&a.return&&a.return()}finally{if(r)throw n}}return-1}function c(){var e=document.location,t=(e.href,e.host,e.protocol,e.host,e.protocol.substr(0,e.protocol.indexOf(":")),e.protocol,e.host,e.pathname.substr(0,e.pathname.lastIndexOf("/")+1),new x.Readability(document.cloneNode(!0)).parse());return t}function d(r,n,i){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[],s=function(e){var t=e.replace("www.","").match(/\.\S+\.\S+/g);return t?t[0].substr(1):e.replace("www.","")},o=t(O),u=[].concat(S(n.keys())),l=i.match(/[.a-zA-z0-9-_]+/g)[1].replace("www.",""),c=s(o.hostname),d=function(){return"/"==o.pathname||/\/(default|index|portal).[0-9a-zA-Z]+$/.test(o.pathname)},h=!0,f=!1,p=void 0;try{for(var m,v=u[Symbol.iterator]();!(h=(m=v.next()).done);h=!0){var g=m.value,b=n.get(g).name,y=s(b);d()||g.endsWith("*")||g.replace(/^http[s]?:/,"")!=i.replace(/^http[s]?:/,"")?g.match(/\*/g)&&1==g.match(/\*/g).length&&!d()&&g.endsWith("*")&&l.includes(y)&&c==y&&i.includes(b)?a.push([g,e(n.get(g)),r]):k(o.origin+o.pathname,g)&&a.push([g,e(n.get(g)),r]):a.push([g,e(n.get(g)),r])}}catch(e){f=!0,p=e}finally{try{!h&&v.return&&v.return()}finally{if(f)throw p}}}function h(e){if(!e.name||!e.url||!e.include)return-1;if(-1==r(e.title)[0]||-1==r(e.include)[0]||-1==r(e.desc)[0])return-2;if(e.paging){if(2!=e.paging.length)return-3;if(!e.paging[0].prev)return-4;if(!e.paging[1].next)return-5;if(-1==r(e.paging[0].prev)[0]||-1==r(e.paging[1].next)[0])return-6}if(e.avatar){if(2!=e.avatar.length)return-7;if(!e.avatar[0].name)return-8;if(!e.avatar[1].url)return-9;if(-1==r(e.avatar[0].name)[0]||-1==r(e.avatar[1].url)[0])return-10}return 0}function f(e){var t=e.replace('<div id="readability-page-1" class="page">',""),r=$(t)[0],n=r.outerHTML.replace(r.innerHTML,""),i=$(n)[0],a=i.tagName.toLowerCase(),s=i.className;return{id:i.id,cls:s,tag:a}}function p(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"text",r=$("html");if(i(e)){var n=s(e),a=A(n,2),o=a[0],u=a[1];0==u?e=o:3==u?e=m(r.find(o)):4==u&&(e=o.html())}else"html"==t?e=m(r.find(e)):"multi"==t||(e=r.find(e).text().trim());return e}function m(e){var t="";switch(e.length){case 0:t="<sr-rd-content-error></sr-rd-content-error>";break;case 1:t=e.html().trim();break;default:t=e.map(function(e,t){return $(t).html()}).get().join("<br>")}return t}var v=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},g=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),b=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},y=function e(t,r,n){null===t&&(t=Function.prototype);var i=Object.getOwnPropertyDescriptor(t,r);if(void 0===i){var a=Object.getPrototypeOf(t);return null===a?void 0:e(a,r,n)}if("value"in i)return i.value;var s=i.get;return void 0!==s?s.call(n):void 0},w=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=("undefined"==typeof t?"undefined":a(t))&&"function"!=typeof t?e:t},A=function(){return function(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function(e,t){var r=[],n=!0,i=!1,a=void 0;try{for(var s,o=e[Symbol.iterator]();!(n=(s=o.next()).done)&&(r.push(s.value),!t||r.length!==t);n=!0);}catch(e){i=!0,a=e}finally{try{!n&&o.return&&o.return()}finally{if(i)throw a}}return r}(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),S=function(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)},E={url:"",target:"",matching:[],name:"",title:"",desc:"",exclude:[],include:"",avatar:[],paging:[]},k=void 0,x=void 0,_=void 0,O=void 0,M=function(){function r(){var e,t,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{global:[],custom:[],local:[]};v(this,r),this.url=(t=(e="/"!=(e=window.location.pathname)&&e.endsWith("/")?e=e.replace(/\/$/,""):e).replace(/\/[%@#.~a-zA-Z0-9_-]+$|^\/$/g,""),window.location.protocol+"//"+window.location.hostname+t+"/"),this.sites=n,this.current={},this.state="none",this.origins=[],this.mathjax=void 0,O=location.href}return g(r,[{key:"SetURL",value:function(e){var r,n=t(e),i=(r="/"!=(r=n.pathname)&&r.endsWith("/")?r=r.replace(/\/$/,""):r).replace(/\/[%@#.~a-zA-Z0-9_-]+$|^\/$/g,"");this.url=n.protocol+"//"+n.hostname+i+"/",O=e}},{key:"SetMinimatch",value:function(e){k=e}},{key:"SetRdability",value:function(e){x=e}},{key:"SetMarkdown",value:function(e){_=e}},{key:"isMathJax",value:function(){var e=this;return void 0==this.mathjax&&(this.mathjax=!1,$("body").find("script").each(function(t,r){r.type.startsWith("math")&&(e.mathjax=!0)})),this.mathjax}},{key:"MathJaxMode",value:function(){var e=l();if(-1!=e)return this.Newsite("read",e[0].outerHTML),this.dom=e[0],this.state="temp",e;var t=c();if(t&&""!=t.content){var r=f(t.content),n=r.id,i=r.cls,a=r.tag;return""!=n?"<"+a+' id="'+n+'">':""!=i?"<"+a+' class="'+i+'">':void 0}}},{key:"Readability",value:function(){try{var t=c();if(!t||""==t.content)throw"Readability error";this.Newsite("read",t.content,t.excerpt);var r=f(t.wrap),n=r.id,i=r.cls,a=r.tag;this.dom=""!=n?$("body").find("#"+n)[0]:""!=i?$("body").find("."+i.replace(/ /gi,"."))[0]:$("body").find(""+a)[0],this.state="temp"}catch(t){var s=l();-1!=s?(this.Newsite("read",s[0].outerHTML),this.dom=s[0],this.state="temp"):this.current.site=e(E)}}},{key:"Getsite",value:function(e,t){return this.sites[e].find(function(e){return e[0]==t})}},{key:"Getsites",value:function(){var e=this,t=[],r=function(){if(k(location.href,"file://**/*.txt")||k(location.href,"http*://**/*.txt"))return function(){var e=location.pathname.split("/").pop(),t="file:"==location.protocol?"local":"remote",r={name:"txtread::"+t,title:"<title>",desc:"",include:"<pre>",auto:!1,exclude:[]};return"remote"==t&&(r.include="",r.html=$("body pre").html().replace(/\n/gi,"<br>")),!$("title").html()&&$("head").append("<title>"+decodeURI(e.replace(".txt",""))+"</title>"),r}();if($($("body").children()[0]).is("pre")&&(k(location.href,"file://**/*.md")||k(location.href,"http*://**/*.md")))return function(){var e=location.pathname.split("/").pop(),t={name:"txtread::"+("file:"==location.protocol?"local":"remote"),title:"<title>",desc:"",include:"",auto:!1,exclude:[]},r=(new _.default.Converter).makeHtml($("body pre").text());return t.html=r,!$("title").html()&&$("head").append("<title>"+decodeURI(e.replace(".md",""))+"</title>"),t}();var e=/<\S+ (class|id)=("|')?[\w-_=;:' ]+("|')?>?$|<[^\/][-_a-zA-Z0-9]+>?$/gi,t={name:$("meta[name='simpread:name']").attr("content"),url:$("meta[name='simpread:url']").attr("content"),title:$("meta[name='simpread:title']").attr("content"),desc:$("meta[name='simpread:desc']").attr("content"),include:$("meta[name='simpread:include']").attr("content"),exp:$("meta[name='simpread:exclude']").attr("content"),auto:$("meta[name='simpread:auto']").attr("content"),exclude:[]};if(t.name&&t.include){if(t.url&&!k(location.href,t.url))return;!t.title&&(t.title="<title>"),!t.desc&&(t.desc=""),!t.exp&&(t.exp=""),t.name="metaread::"+t.name,t.auto="true"==t.auto;var r=["title","desc","include","exp"].findIndex(function(r){return""!=t[r]&&!t[r].match(e)});return t.exclude.push(t.exp),delete t.exp,-1==r?t:void 0}}();if(this.current.url=this.url,r)this.current.auto=r.auto,this.current.url=r.url,delete r.auto,delete r.url,this.current.site=b({},r),this.current.site.name.startsWith("metaread::")&&(this.state="meta"),this.current.site.name.startsWith("txtread::")&&(this.state="txt");else if(d("local",new Map(this.sites.local),this.url,t),d("global",new Map(this.sites.global),this.url,t),d("person",new Map(this.sites.person),this.url,t),d("custom",new Map(this.sites.custom),this.url,t),t.length>0){var n=void 0;if(t.forEach(function(t){t[1].active&&(n=t,e.current.url=n[0],e.current.site=e.Safesite(b({},n[1]),n[2],n[0]),e.state="adapter")}),!n){var i=t[0];i[1].active=!0,this.current.url=i[0],this.current.site=this.Safesite(b({},i[1]),i[2],i[0]),this.state="adapter"}}else{var a=function(){if(location.pathname.includes("thread")||location.pathname.includes("forum.php")){if($(".t_f").length>0&&$(".favatar").find(".authi").length>0&&$(".avatar").find("img").length>0)return{avatar:[{name:"[[{$('.favatar').find('.authi')}]]"},{url:"[[{$('.avatar').find('img')}]]"}],include:"[[{$('.t_f')}]]"}}else if(/\/t\/[\w-]+\/\d+/.test(location.pathname)&&$("meta[name=generator]").attr("content").includes("discourse"))return{avatar:[{name:"[[{$('.topic-avatar').find('.a[data-user-card]')}]]"},{url:"[[{$('.topic-avatar').find('img')}]]"}],include:"[[{$('.cooked')}]]"};return-1}();-1!=a?(this.Newmultisite("read",a),this.state="temp"):this.Readability()}this.current.site.matching=t}},{key:"Addsites",value:function(e){var t=0;if(0==this.sites.global.length)this.sites.global=this.Formatsites(e),t=this.sites.global.length;else{var r=function(e,t){var r=new Map(t),n=[].concat(S(r.keys())),i=0;return e.map(function(e){n.includes(e[0])?n.includes(e[0]):i++}),{count:i,newsites:e}}(this.Formatsites(e),this.sites.global);t=r.count,this.sites.global=r.newsites}return t}},{key:"Addlocalsites",value:function(e){return this.sites.local=[].concat(S(e)),this.sites.local}},{key:"Addallsites",value:function(e){return this.sites={global:[].concat(S(e.global)),person:[].concat(S(e.person)),custom:[].concat(S(e.custom)),local:[].concat(S(e.local))},this.sites}},{key:"Newsite",value:function(e,t,r){var n={mode:e,url:window.location.href,site:{name:"tempread::"+window.location.host,title:"<title>",desc:"[[{$('meta[name=Description]').attr('content')||$('meta[name=description]').attr('content')}]]",include:"",exclude:[]}};t&&(n.site.html=t),this.current.mode=n.mode,this.current.url=n.url,this.current.site=this.Safesite(b({},n.site),"local",n.url),r&&(this.current.site.excerpt=r)}},{key:"Newmultisite",value:function(e,t){var r={mode:e,url:window.location.href,site:{name:"tempread::"+window.location.host,title:"<title>",desc:"",include:t.include,exclude:[],avatar:t.avatar}};this.current.mode=r.mode,this.current.url=r.url,this.current.site=this.Safesite(b({},r.site),"local",r.url)}},{key:"Updatesite",value:function(e,t,r){var n=this.sites[e].findIndex(function(e){return e[0]==t});-1==n&&(n=this.sites[e].length),this.sites[e].splice(n,1,r)}},{key:"Deletesite",value:function(e,t,r){var n=this.sites[e].findIndex(function(e){return e[0]==t});-1!=n&&this.sites[e].splice(n,1),r(n)}},{key:"Safesite",value:function(e,t,r){return e.url=r,e.target=t,""==e.name&&(e.name="tempread::"),(!e.avatar||0==e.avatar.length)&&(e.avatar=[{name:""},{url:""}]),(!e.paging||0==e.paging.length)&&(e.paging=[{prev:""},{next:""}]),e}},{key:"Cleansite",value:function(e){return delete e.url,delete e.html,delete e.target,delete e.matching,e.avatar&&e.avatar.length>0&&""==e.avatar[0].name&&delete e.avatar,e.paging&&e.paging.length>0&&""==e.paging[0].prev&&delete e.paging,e}},{key:"Formatsites",value:function(e){var t=new Map,r=!0,n=!1,i=void 0;try{for(var a,s=e.sites[Symbol.iterator]();!(r=(a=s.next()).done);r=!0){var o=a.value;if(0==h(o)){var u=o.url;delete o.url,t.set(u,o)}}}catch(e){n=!0,i=e}finally{try{!r&&s.return&&s.return()}finally{if(n)throw i}}return[].concat(S(t))}},{key:"Clearsites",value:function(e){e?this.sites[e]=[]:this.sites={global:[],custom:[],local:[]}}},{key:"Origins",value:function(e){var t=e.origins.map(function(e){return e.url});return(t=new Set(this.origins.concat(t))).forEach(function(e){""!=e.trim()&&e.trim().startsWith("http")&&e.trim().endsWith(".json")||t.delete(e)}),this.origins=[].concat(S(t)),this.origins}},{key:"Addorigins",value:function(e){return this.sites.custom=[].concat(S(e)),this.sites.custom}},{key:"Clearorigins",value:function(){var e=this.sites.custom.length;return this.sites.custom=[],e}}]),r}();return function(t){function r(e){v(this,r);var t=w(this,(r.__proto__||Object.getPrototypeOf(r)).call(this,e));return t.version="0.0.4 build 0616",t.org_url=location.href,t.html={},t.plugin={},t.pure=!1,t.cleanup=!1,t}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+("undefined"==typeof t?"undefined":a(t)));e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(r,M),g(r,[{key:"Exist",value:function(){return this.org_url==location.href}},{key:"AddPlugin",value:function(e){this.plugin={minimatch:e.minimatch,pangu:e.pangu,beautify:e.beautify,stylesheet:e.style,rdability:e.rdability,markdown:e.markdown},y(r.prototype.__proto__||Object.getPrototypeOf(r.prototype),"SetMinimatch",this).call(this,this.plugin.minimatch),y(r.prototype.__proto__||Object.getPrototypeOf(r.prototype),"SetRdability",this).call(this,this.plugin.rdability),y(r.prototype.__proto__||Object.getPrototypeOf(r.prototype),"SetMarkdown",this).call(this,this.plugin.markdown)}},{key:"ReadMode",value:function(){var t,r,i,a,s;this.html=(t=this.current.site,r=e(t),i=n(""==t.title?"<title>":t.title),a=n(t.desc),s=n(t.include),r.title=""==t.title||"<title>"==t.title?$("head title").text():p(i),r.desc=function(e){if(void 0==e)return e;var t=e.length,r=e.indexOf("。")+1;return t>100&&(e=r>0?e.substr(0,r):e.substr(0,101)+"......"),e}(t.excerpt?t.excerpt:p(a)),r.include=""==t.include&&""!=t.html?t.html:p(s,"html"),r.avatar&&r.avatar.length>0&&""==r.avatar[0].name&&delete r.avatar,r.paging&&r.paging.length>0&&""==r.paging[0].prev&&delete r.paging,r.avatar&&r.avatar.forEach(function(e){var t=Object.keys(e).join(),r=e[t];e[t]=p(n(r),"html")}),r.paging&&r.paging.forEach(function(e){var t=Object.keys(e).join(),r=e[t];e[t]=p(n(r))}),r)}},{key:"TempMode",value:function(e,t){this.state="temp",this.dom=t,this.Newsite(e,t.outerHTML)}},{key:"GetDom",value:function(e,t){return p(n(e),t)}},{key:"Include",value:function(){var e=this.current.site.include,t=[],r=n(e);try{if(i(r)){var a=s(e),o=A(a,2),u=o[0],l=o[1];0==l?(e=e.replace(/\[\[{\$\(|}\]\]|\).html\(\)/g,""),t=$(s("[[["+e+"]]]")[0])):3==l&&(t=u)}else r&&(t=$("body").find(r))}catch(e){}return t}},{key:"Exclude",value:function(e){return function(e,t){var r=[],a="",o=!0,u=!1,l=void 0;try{for(var c,d=t[Symbol.iterator]();!(o=(c=d.next()).done);o=!0){var h=c.value;if(i(h)){var f=s(h),p=A(f,2),m=p[0],v=p[1];if(1==v)a=m;else if(2==v){var g=e.html().match(new RegExp(m,"g"));if(g&&g.length>0){var b=g.join("");a="*["+b+"]"}else a=void 0}else 3==v?m.remove():4==v&&m.remove()}else a=n(h);a&&r.push(a)}}catch(e){u=!0,l=e}finally{try{!o&&d.return&&d.return()}finally{if(u)throw l}}return r.join(",")}(e,this.current.site.exclude)}},{key:"Beautify",value:function(e){0!=e.children().length&&this.plugin.beautify&&(this.cleanup&&this.plugin.beautify.cleanHTML(e,this.pure,this.isMathJax()),this.plugin.beautify.specbeautify(this.current.site.name,e),this.plugin.beautify.removeSpareTag(this.current.site.name,e),this.plugin.beautify.htmlbeautify(e),this.plugin.beautify.commbeautify(this.current.site.name,e))}},{key:"Format",value:function(e){this.plugin.pangu&&this.plugin.pangu.spacingElementByClassName(e)}},{key:"Utils",value:function(){return{dom2Xpath:o,xPath2Dom:u}}}]),r}()})},287:function(e,t){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e){return localStorage[s+"-"+e]}function i(e,t){localStorage[s+"-"+e]=t}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),s="simpread",o={VER:"version",COUNT:"count",FIRST:"firstload"},u=5,l=void 0,c=function(){function e(){r(this,e)}return a(e,[{key:"Count",value:function(){var e=[n(o.COUNT)],t=e[0],r=void 0===t?0:t;return l=r,i(o.COUNT,++l),!(l>u&&(i(o.COUNT,0),1))}},{key:"Firstload",value:function(){var e=[n(o.FIRST)],t=e[0],r=void 0===t?"true":t;return"true"==r&&(i(o.FIRST,!1),!0)}},{key:"Version",value:function(e){i(o.VER,e)}},{key:"curcount",get:function(){return l}}]),e}(),d=new c;t.default=d},301:function(e,t,r){"use strict";var n={GET:function(e,t){return this.request("GET",e,{},null,"text",t)},PROPFIND:function(e,t){return this.request("PROPFIND",e,{Depth:"1"},null,"xml",t)},MKCOL:function(e,t){return this.request("MKCOL",e,{},null,"text",t)},DELETE:function(e,t){return this.request("DELETE",e,{},null,"text",t)},PUT:function(e,t,r){return this.request("PUT",e,{},t,"text",r)},Author:function(e,t){this.user=e,this.password=t},request:function(e,t,r,n,i,a){var s=new XMLHttpRequest,o=function(){var e=s.responseText;if("xml"==i){var t=s.responseXML;t&&(e=t.firstChild.nextSibling?t.firstChild.nextSibling:t.firstChild)}return e};a&&(s.onreadystatechange=function(){if(s.readyState===XMLHttpRequest.DONE&&"PROPFIND"==e){var t=o();t&&a(t)}else s.readyState===XMLHttpRequest.DONE&&a(s)}),s.open(e,t,!!a),s.setRequestHeader("Content-Type","text/xml; charset=UTF-8"),this.user&&this.password&&s.setRequestHeader("Authorization","Basic "+btoa(this.user+":"+this.password));for(var u in r)s.setRequestHeader(u,r[u]);if(s.send(n),!a)return o()}};n.Fs=function(e,t,r){n.Author(t,r),this.rootUrl=e;var i=this;return this.file=function(e){return this.type="file",this.url=i.urlFor(e),this.name=i.nameFor(this.url),this.read=function(e){return n.GET(this.url,e)},this.write=function(e,t){return n.PUT(this.url,e,t)},this.rm=function(e){return n.DELETE(this.url,e)},this},this.dir=function(e){return this.type="dir",this.url=i.urlFor(e),this.name=i.nameFor(this.url),this.children=function(e){var t=function(e){if(null==e.childNodes)throw"No such directory: "+url;for(var t=[],r=1;r<e.childNodes.length;r++){var n=e.childNodes[r],a=decodeURI(n.getElementsByTagName("d:href")[0].firstChild.nodeValue.replace(/\/$/,"")),s=n.getElementsByTagName("d:propstat")[0],o=s.getElementsByTagName("d:prop")[0],u=o.getElementsByTagName("d:resourcetype")[0],l=u.getElementsByTagName("d:collection")[0];l?t[r-1]=new i.dir(a):t[r-1]=new i.file(a)}return t};return e?void n.PROPFIND(this.url,function(r){e(t(r))}):t(n.PROPFIND(this.url))},this.rm=function(e){return n.DELETE(this.url,e)},this.mkdir=function(e){return n.MKCOL(this.url,e)},this},this.urlFor=function(e){return/^http/.test(e)?e:this.rootUrl+e},this.nameFor=function(e){return e.replace(/.*\/(.*)/,"$1")},this},e.exports=n}});