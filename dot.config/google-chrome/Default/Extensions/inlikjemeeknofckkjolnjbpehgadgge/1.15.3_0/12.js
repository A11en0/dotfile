(window.webpackJsonp=window.webpackJsonp||[]).push([[12,25],{1:function(e,t,r){"use strict";t.a={TYPE_ERR:0,TYPE_TEXT:1,TYPE_HTML:2,TYPE_JSON:3,TYPE_XML:4,TYPE_FEED:5,TYPE_FORM:6,TYPE_PDF_HTML:7,TYPE_DOC:8,TYPE_RULE:1,TYPE_RULE_GROUP:2,OP_AND:1,OP_OR:2,CONTENT_TYPE_TEXT:1,CONTENT_TYPE_CHANGED_TEXT:2,CONTENT_TYPE_OLD_TEXT:3,RULE_NOT_EMPTY:1,RULE_HAS_TEXT:2,RULE_HAS_TEXT_NOT:3,RULE_HAS_NUMBER_LT:4,RULE_HAS_NUMBER_GT:5,RULE_HAS_NUMBER_DECR_MIN:6,RULE_HAS_NUMBER_INCR_MIN:7,RULE_MATCH_REGEX:8,RULE_HAS_NUMBER_DECR_PERCENT_MIN:9,RULE_HAS_NUMBER_INCR_PERCENT_MIN:10,STATE_DEFAULT:0,STATE_NEW:10,STATE_INIT:20,STATE_UNAUTHORIZED:30,STATE_AUTHORIZED:35,STATE_READY:40,STATE_PAUSED:45,STATE_RESTRICTED:50,STATE_DISCARD:90,STATE_DEL:100,STATE_DONE:100,STATE_PLAN_PUBLIC:0,STATE_PLAN_PRIVATE:70,STATE_ATTR_VERIFY:10,STATE_ATTR_VERIFY_INIT:20,STATE_ATTR_VERIFY_WAIT:30,STATE_ATTR_VERIFY_DONE:40,ACTION_EMAIL:1,ACTION_SMS:2,ACTION_PUSH:3,ACTION_MACRO:4,ACTION_WEBHOOK:5,ACTION_SLACK:6,ACTION_DISCORD:7,ACTION_LOCAL_AUDIO:101,ACTION_LOCAL_POPUP:102,ACTION_LOCAL_OPEN_TAB:103,RUN_STATE_INIT:1,RUN_STATE_WAIT:2,RUN_STATE_WIP:3,LOCAL_STATE_SYNCED:0,LOCAL_STATE_POST:1,LOCAL_STATE_PUT:2,LOCAL_STATE_DEL:3,CLIENT_FF:10,CLIENT_CR:11,CLIENT_OP:12,CLIENT_FFWX:13,CLIENT_MAC:20,CLIENT_WEBFF:50,CLIENT_DEDI:51,IMPORT_SOURCE_SITEMAP:1,TIME_INFINITE:2592e3}},10:function(e,t,r){"use strict";var n=r(8),o=r.n(n),a=window._;if(!a)throw new Error("ADD _");function i(e){a.extend(this,e,this.parse(e.path))}function s(e){this.routes=a.map(e.routes,(function(e){return new i(e)}),this)}function c(e){try{return decodeURIComponent(e)}catch(t){return e}}a.extend(i.prototype,{match:function(e){var t=this.keys,r=this.params={},n=this.regexp.exec(e);if(!n)return!1;for(var o=1,a=n.length;o<a;++o){var i=t[o-1],s="string"==typeof n[o]?c(n[o]):n[o];if(!i)throw new Error("Nameless param not supported, path:"+e);r[i.name]=s}return!0},parse:function(e){var t=[];return e=e.concat("").replace(/\/\(/g,"(?:/").replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g,(function(e,r,n,o,a,i,s){return t.push({name:o,optional:!!i}),r=r||"",(i?"":r)+"(?:"+(i?r:"")+(n||"")+(a||n&&"([^/.]+?)"||"([^/]+?)")+")"+(i||"")+(s?"(/*)?":"")})).replace(/([\/.])/g,"\\$1").replace(/\*/g,"(.*)"),{keys:t,regexp:new RegExp("^"+e+"$","i")}}}),a.extend(s.prototype,{find:function(e){return a.find(this.routes,(function(t){return t.match(e)}))}});var u=s,l=r(1),p=r(2);if(!window.qs)throw new Error("ADD qs");if(!window.jQuery)throw new Error("ADD jQuery");var d=window._;if(!d)throw new Error("ADD _");var f=window.async;if(!f)throw new Error("ADD async");var h,E={create:"POST",update:"PUT",patch:"PATCH",delete:"DELETE",read:"GET"},_={version:"0.0.1",api:(h=g,function(){var e=arguments,t=Array.prototype.slice.call(arguments);if("function"!=typeof t[t.length-1])return new Promise((function(t,r){h.apply(void 0,o()(e).concat([function(e,n){e?r(e):t(n)}]))}));h.apply(void 0,arguments)}),batch:function(e,t){f.mapSeries(e,(function(e,t){g(e.url,e.method,e.body,(function(r,n){r&&console.error("Error handling request:",e),t(r,n)}))}),t)},init:function(e){e()}},T=new u({routes:[{list:!0,path:"/clients",store:p.a.store.ClientStore},{path:"/clients/:id",store:p.a.store.ClientStore},{list:!0,path:"/sieves",store:p.a.store.SieveStore},{path:"/sieves/:id",store:p.a.store.SieveStore},{list:!0,path:"/sieves/:sieve_id/actions",store:p.a.store.ActionStore},{path:"/sieves/:sieve_id/actions/:id",store:p.a.store.ActionStore},{list:!0,path:"/sieves/:sieve_id/data",store:p.a.store.SieveDataProxy},{path:"/sieves/:sieve_id/data/:id",store:p.a.store.SieveDataStore},{list:!0,path:"/sieves/:key/works/local",store:p.a.store.WorkStore},{list:!0,path:"/rules",store:p.a.store.RuleStore},{path:"/rules/:id",store:p.a.store.RuleStore},{list:!0,path:"/tags",store:p.a.store.TagStore},{list:!0,path:"/tags/:id",store:p.a.store.TagStore},{list:!0,path:"/users/attrs",store:p.a.store.AttrStore},{path:"/users/attrs/:id",store:p.a.store.AttrStore}]});function g(e,t,r,n){r=r||{},t=E[t]||t||"GET";delete r._state;var o=T.find(e);return o?function(e,t,r,n){var o=e.path,a=e.store,i=a.hasField("user_id"),s=window.USER?USER.id:p.a.auth.getId(),c=function(e,r){e?console.error("API:err",o,t,e):"GET"!=t&&p.a.service.syncStore(a),r&&(r=JSON.parse(JSON.stringify(r))),n(e,r)};switch(t){case"DELETE":a.update(e.params,{state:l.a.STATE_DEL,_state:l.a.LOCAL_STATE_DEL},c);break;case"GET":var u=e.params;if(i&&(u.$and={$or:[["user_id",s],["user_id",null]]}),e.list){var f=r._opt;u=d.extend(d.omit(r,"_opt"),u),a.find(u,f,c)}else a.findOne(u,c);break;case"PATCH":case"PUT":u=e.params;var h=r;a.update(u,h,c);break;case"POST":h=d.extend(r,e.params);a.create(h,c);break;default:c({msg:"API: Unknown method:"+t})}}(o,t,r,n):p.a.api(e,t,r,n)}t.a=_},16:function(e,t,r){"use strict";var n=r(5),o=r.n(n),a=r(7),i=r.n(a),s=r(8),c=r.n(s),u=r(10),l=r(46),p=window._;if(!p)throw new Error("ADD _");var d=window.Backbone;if(!d)throw new Error("ADD Backbone");function f(e,t,r){if(u.a.api){var n=p.result(t,"url")||h(),o=r.data;null!=o||!t||"create"!==e&&"update"!==e&&"patch"!==e||(o=r.attrs||t.toJSON(r));var a=r.xhr=u.a.api(n,e,o,(function(e,t){e?r.error&&r.error(e):r.success&&r.success(t)}));return t.trigger("request",t,a,r),a}u.a.on("init",(function(){f(e,t,r)}))}var h=function(){throw new Error('A "url" property or function must be specified')},E=d.Model.prototype.fetch;d.Model.prototype.fetch=function(){var e=i()(o.a.mark((function e(t){var r=this;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t||(t={}),e.abrupt("return",new Promise((function(e,n){E.call(r,{error:function(){for(var e,r=arguments.length,o=new Array(r),a=0;a<r;a++)o[a]=arguments[a];t.error&&(e=t).error.apply(e,o),n(o)},success:function(){for(var r,n=arguments.length,o=new Array(n),a=0;a<n;a++)o[a]=arguments[a];t.success&&(r=t).success.apply(r,o),e(o)}})})));case 2:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();var _=d.Model.extend({sync:f,encodedFields:[],clone:function(){var e=this.toJSON();return new this.constructor(e,{parse:!0})},parse:function(e){return p.each(this.encodedFields,(function(t){var r=e[t];if(p.isString(r)){var n=null;try{n=JSON.parse(r)}catch(e){console.error("Invalid model json attribute:",t,r,e)}e[t]=n}})),e},prop:function(e,t){if(this.props||(this.props={}),2!=arguments.length)return p.result(this.props,e);var r=p.result(this.props,e);r!==t&&(this.props[e]=t,this.trigger("prop:"+e,t,r),this.collection&&this.collection.trigger("prop:"+e,t,r,this))},toJSON:function(){var e=d.Model.prototype.toJSON.call(this);return p.each(this.encodedFields,(function(t){var r=e[t];p.isEmpty(r)||(e[t]=JSON.stringify(r))})),e}});t.a={sync:f,syncBatch:function(e,t){var r=p.map(e.dels,(function(e){return{method:"DELETE",url:p.result(e,"url")||h()}})),n=p.map(e.posts,(function(e){return{method:"POST",url:p.result(e,"url")||h(),body:e.toJSON()}})),o=p.map(e.puts,(function(e){return{method:"PUT",url:p.result(e,"url")||h(),body:p.pick.apply(p,c()([e.toJSON()].concat(p.keys(e.changedAttributes()))))}})),a=[].concat(r,n,o);return 0!=a.length&&(DBG&&console.log("syncBatch: requests:",a),u.a.batch(a,t))},Model:_,Collection:d.Collection.extend({model:_,parse:function(e){return e.data},sync:f}),PagedCollection:l.a.requestPager.extend({model:d.Model.extend(),paginator_core:{},paginator_ui:{currentPage:0,perPage:2},server_api:{_opt:function(){return{limit:this.perPage,offset:this.currentPage*this.perPage}}},parse:function(e){return this.offset=e.offset,this.totalPages=Math.ceil(e.count/this.perPage),this.totalRecords=e.total_count,e.data}})}},25:function(e,t){function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function n(t){return"function"==typeof Symbol&&"symbol"===r(Symbol.iterator)?e.exports=n=function(e){return r(e)}:e.exports=n=function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":r(e)},n(t)}e.exports=n},40:function(e,t,r){"use strict";var n=r(16),o=(r(1),n.a.Model.extend()),a=n.a.Collection.extend({model:o}),i=n.a.Model.extend({parse:function(e){return e.entries=new a(e.entries),e}});t.a={Feed:i,FeedEntry:o,FeedEntryCollection:a}},41:function(e,t,r){"use strict";var n=r(4);if(!window.domo)throw new Error("ADD domo");if(!window.async)throw new Error("ADD async");var o=n.a.Base.extend({name:"FeedEntry",render:function(){var e,t=this.model.attributes;return this.$el.append(H3(A({href:t.link},t.title)),DIV({style:"color: #999; margin: -10px 0px;"},I(moment(t.date).format("MMMM DD, YYYY"))),e=DIV({class:"summary"})),$(e).html(t.description||t.summary||""),this}}),a=n.a.Collection.extend({name:"FeedEntryList",addOne:function(e){var t=new o({parent:this,model:e}).render();return this.$el.append(t.el),t}}),i=n.a.Base.extend({name:"Feed",render:function(){var e=this.model.attributes;return this.$el.append(H3(A({href:e.link},e.title)),DIV(e.description||e.summary||""),new a({parent:this,collection:this.model.get("entries")}).render().el),this}});t.a={Feed:i,FeedEntry:o,FeedEntryList:a}},46:function(e,t,r){"use strict";var n=r(10),o=window.Backbone;if(!o)throw new Error("ADD Backbone");var a=window._;if(!a)throw new Error("ADD _");var i=window.jQuery;if(!i)throw new Error("ADD jQuery");var s={version:"0.6.0"};s.requestPager=o.Collection.extend({sync:function(e,t,r){var o=this,i=r.data||{},s=a.result(t,"url");o.setDefaults();var c={};a.each(a.result(o,"server_api"),(function(e,t){a.isFunction(e)&&(e=e.call(o)),c[t]=e})),i._opt=a.extend(c._opt||{},i._opt),a.extend(c,i);var u=n.a.api(s,e,c,(function(e,t){e?r.error&&r.error(e):r.success&&r.success(t)}));return t&&t.trigger&&t.trigger("request",t,u,r),u},setDefaults:function(){var e=this;a.defaults(e.paginator_ui,{firstPage:0,currentPage:1,perPage:5,totalPages:10,pagesInRange:4}),a.each(e.paginator_ui,(function(t,r){a.isUndefined(e[r])&&(e[r]=e.paginator_ui[r])}))},requestNextPage:function(e){var t=this.info();if(!(t.currentPage+1>=t.totalPages)){if(void 0!==this.currentPage)return this.currentPage+=1,this.pager(e);var r=new i.Deferred;return r.reject(),r.promise()}e.error&&e.error("Cannot go past last page")},requestPreviousPage:function(e){if(!(this.currentPage<=0)){if(void 0!==this.currentPage)return this.currentPage-=1,this.pager(e);var t=new i.Deferred;return t.reject(),t.promise()}e.error&&e.error("Cannot go before first page")},goTo:function(e,t){if(void 0!==e)return this.currentPage=parseInt(e,10),this.pager(t);var r=new i.Deferred;return r.reject(),r.promise()},howManyPer:function(e){void 0!==e&&(this.currentPage=this.firstPage,this.perPage=e,this.pager())},info:function(){var e={totalRecords:this.totalRecords||0,currentPage:this.currentPage,firstPage:this.firstPage,totalPages:Math.ceil(this.totalRecords/this.perPage),lastPage:this.totalPages,perPage:this.perPage,previous:!1,next:!1};return this.currentPage>1&&(e.previous=this.currentPage-1),this.currentPage<e.totalPages&&(e.next=this.currentPage+1),e.hasNext=e.next,e.hasPrevious=e.next,e.pageSet=this.setPagination(e),this.information=e,e},setPagination:function(e){var t=[],r=0,n=0,o=2*this.pagesInRange,a=Math.ceil(e.totalRecords/e.perPage);if(a>1)if(a<=1+o)for(r=1,n=a;r<=n;r++)t.push(r);else if(e.currentPage<=this.pagesInRange+1)for(r=1,n=2+o;r<n;r++)t.push(r);else if(a-this.pagesInRange>e.currentPage&&e.currentPage>this.pagesInRange)for(r=e.currentPage-this.pagesInRange;r<=e.currentPage+this.pagesInRange;r++)t.push(r);else for(r=a-o;r<=a;r++)t.push(r);return t},pager:function(e){return this.fetch(e||{})},bootstrap:function(e){return a.extend(this,e),this.setDefaults(),this.info(),this}}),s.requestPager.prototype.nextPage=s.requestPager.prototype.requestNextPage,s.requestPager.prototype.prevPage=s.requestPager.prototype.requestPreviousPage,t.a=s},6:function(e,t){e.exports=function(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}},67:function(e,t,r){"use strict";r.r(t);var n=r(2),o=r(1),a=(r(22),r(3)),i=r(4),s=r(40),c=r(41),u=window._;if(!u)throw new Error("ADD _");var l=window.qs;if(!l)throw new Error("ADD qs");if(!window.domo)throw new Error("ADD domo");var p=window.async;if(!p)throw new Error("ADD async");t.default=function(){var e,t=l.parse(location.search.substring(1)).url,r=new(i.a.RoutedRoot.extend({name:"Root",actions:{add:{fn:"action_add"}},action_add:function(){a.a.start("save",{info:"l_saving"}),n.a.store.SieveStore.create({content_type:o.a.TYPE_FEED,name:e?e.attributes.title:"Untitled",uri:e?e.attributes.link:t,config:JSON.stringify({uri:t}),schedule:JSON.stringify({type:"INTERVAL",params:{interval:1800}}),state:o.a.STATE_READY},(function(e,t){e?a.a.stop("save",{error:"Failed to add item due to error:"+(e.message||e.msg)}):(a.a.stop("save"),p.series([function(e){n.a.store.ActionStore.create({sieve_id:t.id,type:101},e)},function(e){n.a.store.ActionStore.create({sieve_id:t.id,type:102},e)}],(function(e){location.href="/ui/inbox.html"})))}))}}))({el:document.body});function d(e,t){a.a.reset(),0==t.length?a.a.error("No feed found in page."):1==t.length?location.href="/ui/feed.html?url="+t[0].href:$("#list").empty().append(H4("Found multiple feeds in the page:")).append(u.map(t,(function(e){return H5(A({href:"/ui/feed.html?url="+e.href},e.title))}))).append(H5("Click link to view a feed. Once loaded, you can add it to your watchlist."))}function f(t,n){console.log("Feed fetch result:",t,n),a.a.reset(),t?a.a.error("Reload page to try later. Failed to fetch feed content."):(e=new s.a.Feed(n,{parse:!0}),$('[data-action="add"]').removeClass("hide"),new c.a.Feed({el:$("#feed")[0],model:e,parent:r}).render())}r.updateActions(),t?n.a.HTTP.get({url:t},(function(e,r,o){var i=o.getResponseHeader("content-type");switch(console.log("content:",i,r),i=i.split(";")[0]){case"text/html":case"application/xhtml+xml":var s=new DOMParser,c=s.parseFromString(r,i);if(console.log("html:",c),!c){var l=r.match(/<link.*\/>/gim).join("");console.log("fragment:",l),c=s.parseFromString(l,i)}console.log("html:",c),function(e,t,r){if(!t)return r({code:"NULL",msg:"HTML document is null"});var n=t.querySelectorAll('link[type="application/rss+xml"],link[type="application/atom+xml"]'),o=u.map(n,(function(t){var r=t.getAttribute("href");return"/"==r[0]&&(r=new URL(e).origin+r),{title:t.getAttribute("title"),href:r}}));console.log("Feeds found:",o),r(null,o)}(t,c,d);break;case"application/xml":case"text/xml":case"application/rss+xml":case"application/atom+xml":n.a.Feed.fromString(o.responseText,t,f);break;default:a.a.error("Unknown content type:"+i)}})):console.error("Invalid url parameter, cannot get feed for the page.")}}}]);
//# sourceMappingURL=12.js.map