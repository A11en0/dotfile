// LICENSE_CODE ZON
'use strict'; 
define(['lang', 'conf'], (be_lang, conf)=>{
const chrome = window.chrome;
const perr_url = 'perr.hola.org' || 'perr.hola.org';
conf.url_perr = conf.url_perr||'https://'+perr_url+'/client_cgi';
const is_hola_va = window.hola_va;
const base_url = !chrome ? '/data' : '/js';
const E = {modules: {config: {name: 'config'}}};

const require_is_local = ()=>!location || is_local_url(location.href);

const is_local_url = url=>
    /^(moz-extension|chrome-extension|resource|file):\/\//.test(url);

const get_paths = ()=>{
    const fix_file_paths = files=>{
        for (var name in files)
            files[name] = files[name].replace(/^BASE/, base_url);
        return files;
    };
    const f = {
        local: {
            typeahead: 'typeahead',
            text: 'BASE/requirejs.text.js',
            '/bext/vpn/ui/popup.js': 'BASE/vpn/ui/popup.js',
            '/bext/vpn/bg/bg.js': 'BASE/bext/vpn/bg/bg.js',
            '/bext/vpn/bg/bg_ajax.js': 'BASE/bext/vpn/bg/bg_ajax.js',
            '/bext/vpn/bg/bg_main.js': 'BASE/bext/vpn/bg/bg_main.js',
            '/bext/vpn/ui/popup_main.js':
                'BASE/bext/vpn/ui/popup_main.js',
            '/bext/vpn/bg/vpn.js': 'BASE/bext/vpn/bg/vpn.js',
            '/bext/vpn/bg/svc.js': 'BASE/bext/vpn/bg/svc.js',
            '/bext/vpn/bg/pac.js': 'BASE/bext/vpn/bg/pac.js',
            '/bext/vpn/bg/icon.js': 'BASE/bext/vpn/bg/icon.js',
            '/bext/vpn/bg/info.js': 'BASE/bext/vpn/bg/info.js',
            '/bext/vpn/bg/iframe.js': 'BASE/bext/vpn/bg/iframe.js',
            '/bext/vpn/bg/cs_hola.js': 'BASE/bext/vpn/bg/cs_hola.js',
            '/bext/vpn/ui/app.js': 'BASE/bext/vpn/ui/app.js',
            '/bext/vpn/ui/debug_ui.js': 'BASE/bext/vpn/ui/debug_ui.js',
            '/bext/vpn/ui/privacy.js': 'BASE/bext/vpn/ui/privacy.js',
            '/bext/vpn/ui/ui_lib.js': 'BASE/bext/vpn/ui/ui_lib.js',
            '/bext/vpn/ui/watermark.js':
                'BASE/bext/vpn/ui/watermark.js',
            '/bext/vpn/ui/page_lib.js': 'BASE/bext/vpn/ui/page_lib.js',
            '/bext/vpn/ui/about.js': 'BASE/bext/vpn/ui/about.js',
            '/bext/vpn/ui/settings.js': 'BASE/bext/vpn/ui/settings.js',
            '/bext/vpn/ui/ui_react.js': 'BASE/bext/vpn/ui/ui_react.js',
            '/bext/vpn/ui/ui_api.js': 'BASE/bext/vpn/ui/ui_api.js',
            '/bext/vpn/ui/context.js': 'BASE/bext/vpn/ui/context.js',
            '/bext/vpn/bg/dev_mode.js': 'BASE/bext/vpn/bg/dev_mode.js',
            '/bext/vpn/bg/mode.js': 'BASE/bext/vpn/bg/mode.js',
            '/bext/vpn/bg/rule.js': 'BASE/bext/vpn/bg/rule.js',
            '/bext/vpn/bg/tpopup.js': 'BASE/bext/vpn/bg/tpopup.js',
            '/bext/vpn/bg/trial.js': 'BASE/bext/vpn/bg/trial.js',
            '/bext/vpn/bg/ccgi.js': 'BASE/bext/vpn/bg/ccgi.js',
            '/bext/vpn/bg/tab_perr.js': 'BASE/bext/vpn/bg/tab_perr.js',
            '/bext/vpn/bg/premium.js': 'BASE/bext/vpn/bg/premium.js',
            '/bext/vpn/bg/util.js': 'BASE/bext/vpn/bg/util.js',
            '/bext/vpn/bg/ui_api.js': 'BASE/bext/vpn/bg/ui_api.js',
            'bext/pub/pre_loader': 'BASE/bext/pub/pre_loader.js?noext',
            'bext/vpn/ui/css/popup': 'BASE/bext/vpn/ui/css/popup.css?noext',
            '/util/ws.js': 'BASE/util/ws.js',
        },
        local_common: {
            jquery: 'jquery.min',
            cookie: 'js.cookie.min',
            underscore: 'underscore.min',
            lodash: 'lodash.min',
            backbone: 'backbone.min',
            rxjs: 'rx.min',
            ua_parser: 'ua-parser.min',
            react: 'react',
            'react-input-autosize': 'react-input-autosize.min',
            zon_config: 'BASE/zon_config.js',
            '/protocol/pub/countries.js': 'BASE/protocol/pub/countries.js',
'/protocol/pub/def.js': 'BASE/protocol/pub/def.js',
'/protocol/pub/zgettunnels_util.js': 'BASE/protocol/pub/zgettunnels_util.js',
'/protocol/pub/mongodb_log_util.js': 'BASE/protocol/pub/mongodb_log_util.js',

            '/svc/account/pub/membership.js': 'BASE/svc/account/pub/membership.js',
'/svc/account/pub/admin.html': 'BASE/svc/account/pub/admin.html',
'/svc/account/pub/admin.js': 'BASE/svc/account/pub/admin.js',
'/svc/account/pub/customer_lib.js': 'BASE/svc/account/pub/customer_lib.js',
'/svc/account/pub/util.js': 'BASE/svc/account/pub/util.js',

        },
        common: {
            '/util/setdb.js.map': 'BASE/util/setdb.js.map',
'/util/indexed_db.js.map': 'BASE/util/indexed_db.js.map',
'/util/webrtc_ips.js.map': 'BASE/util/webrtc_ips.js.map',
'/util/setdb.js': 'BASE/util/setdb.js',
'/util/indexed_db.js': 'BASE/util/indexed_db.js',
'/util/webrtc_ips.js': 'BASE/util/webrtc_ips.js',
'/util/ajax.js': 'BASE/util/ajax.js',
'/util/array.js': 'BASE/util/array.js',
'/util/conv.js': 'BASE/util/conv.js',
'/util/country.js': 'BASE/util/country.js',
'/util/csrf.js': 'BASE/util/csrf.js',
'/util/csv.js': 'BASE/util/csv.js',
'/util/date.js': 'BASE/util/date.js',
'/util/es6_shim.js': 'BASE/util/es6_shim.js',
'/util/escape.js': 'BASE/util/escape.js',
'/util/etask.js': 'BASE/util/etask.js',
'/util/events.js': 'BASE/util/events.js',
'/util/lerr.js': 'BASE/util/lerr.js',
'/util/match.js': 'BASE/util/match.js',
'/util/jquery_ajax_ie.js': 'BASE/util/jquery_ajax_ie.js',
'/util/rate_limit.js': 'BASE/util/rate_limit.js',
'/util/sprintf.js': 'BASE/util/sprintf.js',
'/util/lang.js': 'BASE/util/lang.js',
'/util/string.js': 'BASE/util/string.js',
'/util/storage.js': 'BASE/util/storage.js',
'/util/url.js': 'BASE/util/url.js',
'/util/user_agent.js': 'BASE/util/user_agent.js',
'/util/util.js': 'BASE/util/util.js',
'/util/version_util.js': 'BASE/util/version_util.js',
'/util/zerr.js': 'BASE/util/zerr.js',
'/util/ccounter_client.js': 'BASE/util/ccounter_client.js',
'/util/zdot.js': 'BASE/util/zdot.js',
'/util/angular_util.js': 'BASE/util/angular_util.js',
'/util/ajax_lite.js': 'BASE/util/ajax_lite.js',
'/util/hash.js': 'BASE/util/hash.js',
'/util/browser.js': 'BASE/util/browser.js',
'/util/attrib.js': 'BASE/util/attrib.js',
'/util/angular_ui_bootstrap_patch.js': 'BASE/util/angular_ui_bootstrap_patch.js',
'/util/rand.js': 'BASE/util/rand.js',
'/util/countries_locales.js': 'BASE/util/countries_locales.js',
'/util/ws.js': 'BASE/util/ws.js',

            '/bext/pub/browser.js': 'BASE/bext/pub/browser.js',
'/bext/pub/chrome.js': 'BASE/bext/pub/chrome.js',
'/bext/pub/ext.js': 'BASE/bext/pub/ext.js',
'/bext/pub/lib.js': 'BASE/bext/pub/lib.js',
'/bext/pub/locale.js': 'BASE/bext/pub/locale.js',
'/bext/pub/msg.js': 'BASE/bext/pub/msg.js',
'/bext/pub/transport.js': 'BASE/bext/pub/transport.js',
'/bext/pub/util.js': 'BASE/bext/pub/util.js',
'/bext/pub/backbone.js': 'BASE/bext/pub/backbone.js',
'/bext/pub/config.js': 'BASE/bext/pub/config.js',
'/bext/pub/pre_loader.js': 'BASE/bext/pub/pre_loader.js',
'/bext/pub/ga.js': 'BASE/bext/pub/ga.js',
'/bext/pub/lang.js': 'BASE/bext/pub/lang.js',

            '/bext/vpn/util/util.js': 'BASE/bext/vpn/util/util.js',

            '/bext/vpn/bg/trial.js.map': 'BASE/bext/vpn/bg/trial.js.map',
'/bext/vpn/bg/dev_mode.js.map': 'BASE/bext/vpn/bg/dev_mode.js.map',
'/bext/vpn/bg/tpopup.js.map': 'BASE/bext/vpn/bg/tpopup.js.map',
'/bext/vpn/bg/premium.js.map': 'BASE/bext/vpn/bg/premium.js.map',
'/bext/vpn/bg/ccgi.js.map': 'BASE/bext/vpn/bg/ccgi.js.map',
'/bext/vpn/bg/tab_perr.js.map': 'BASE/bext/vpn/bg/tab_perr.js.map',
'/bext/vpn/bg/bg_ajax.js.map': 'BASE/bext/vpn/bg/bg_ajax.js.map',
'/bext/vpn/bg/svc.js.map': 'BASE/bext/vpn/bg/svc.js.map',
'/bext/vpn/bg/bg_main.js.map': 'BASE/bext/vpn/bg/bg_main.js.map',
'/bext/vpn/bg/icon.js.map': 'BASE/bext/vpn/bg/icon.js.map',
'/bext/vpn/bg/mode.js.map': 'BASE/bext/vpn/bg/mode.js.map',
'/bext/vpn/bg/vpn.js.map': 'BASE/bext/vpn/bg/vpn.js.map',
'/bext/vpn/bg/iframe.js.map': 'BASE/bext/vpn/bg/iframe.js.map',
'/bext/vpn/bg/rule.js.map': 'BASE/bext/vpn/bg/rule.js.map',
'/bext/vpn/bg/pac.js.map': 'BASE/bext/vpn/bg/pac.js.map',
'/bext/vpn/bg/info.js.map': 'BASE/bext/vpn/bg/info.js.map',
'/bext/vpn/bg/util.js.map': 'BASE/bext/vpn/bg/util.js.map',
'/bext/vpn/bg/ui_api.js.map': 'BASE/bext/vpn/bg/ui_api.js.map',
'/bext/vpn/bg/cs_hola.js': 'BASE/bext/vpn/bg/cs_hola.js',
'/bext/vpn/bg/bg.js': 'BASE/bext/vpn/bg/bg.js',
'/bext/vpn/bg/db.js': 'BASE/bext/vpn/bg/db.js',
'/bext/vpn/bg/mitm_lib.js': 'BASE/bext/vpn/bg/mitm_lib.js',
'/bext/vpn/bg/tabs.js': 'BASE/bext/vpn/bg/tabs.js',
'/bext/vpn/bg/sim_dns_block.html': 'BASE/bext/vpn/bg/sim_dns_block.html',
'/bext/vpn/bg/sim_dns_block.js': 'BASE/bext/vpn/bg/sim_dns_block.js',
'/bext/vpn/bg/monitor_worker.js': 'BASE/bext/vpn/bg/monitor_worker.js',
'/bext/vpn/bg/tab_unblocker.js': 'BASE/bext/vpn/bg/tab_unblocker.js',
'/bext/vpn/bg/tz_spoof.js': 'BASE/bext/vpn/bg/tz_spoof.js',
'/bext/vpn/bg/bext_config.js': 'BASE/bext/vpn/bg/bext_config.js',
'/bext/vpn/bg/pac_engine.js': 'BASE/bext/vpn/bg/pac_engine.js',
'/bext/vpn/bg/force_lib.js': 'BASE/bext/vpn/bg/force_lib.js',

            '/svc/pub/util.js': 'BASE/svc/pub/util.js',

            '/svc/hola/pub/svc_ipc.js': 'BASE/svc/hola/pub/svc_ipc.js',
'/svc/hola/pub/svc_monitor.js': 'BASE/svc/hola/pub/svc_monitor.js',
'/svc/hola/pub/stats.js': 'BASE/svc/hola/pub/stats.js',
'/svc/hola/pub/vpn_agents.js': 'BASE/svc/hola/pub/vpn_agents.js',
'/svc/hola/pub/table.js': 'BASE/svc/hola/pub/table.js',
'/svc/hola/pub/stats.html': 'BASE/svc/hola/pub/stats.html',
'/svc/hola/pub/vpn_agents.html': 'BASE/svc/hola/pub/vpn_agents.html',
'/svc/hola/pub/vpn_agents.js.map': 'BASE/svc/hola/pub/vpn_agents.js.map',
'/svc/hola/pub/table.js.map': 'BASE/svc/hola/pub/table.js.map',

            '/svc/vpn/pub/common_ui.js': 'BASE/svc/vpn/pub/common_ui.js',
'/svc/vpn/pub/eec.js': 'BASE/svc/vpn/pub/eec.js',
'/svc/vpn/pub/unblocker_lib.js': 'BASE/svc/vpn/pub/unblocker_lib.js',
'/svc/vpn/pub/util.js': 'BASE/svc/vpn/pub/util.js',
'/svc/vpn/pub/common_ui.js.map': 'BASE/svc/vpn/pub/common_ui.js.map',
'/svc/vpn/pub/eec.js.map': 'BASE/svc/vpn/pub/eec.js.map',

        },
        va: {
            '/bext/va/pub/va.js': 'BASE/bext/va/pub/va.js',
            '/bext/pub/ext.js': 'BASE/bext/pub/ext.js',
            '/protocol/pub/countries.js': 'BASE/protocol/pub/countries.js',
'/protocol/pub/def.js': 'BASE/protocol/pub/def.js',
'/protocol/pub/zgettunnels_util.js': 'BASE/protocol/pub/zgettunnels_util.js',
'/protocol/pub/mongodb_log_util.js': 'BASE/protocol/pub/mongodb_log_util.js',

        },
    };
    for (var l in be_lang.files)
        f.common[l] = 'BASE'+be_lang.files[l];
    const p = Object.assign({}, f.local, f.local_common, f.common);
    if (is_hola_va)
        Object.assign(p, f.va);
    return {paths: fix_file_paths(p), map: {events: '/util/events.js'}};
};

var init = ()=>{
    if (E.inited)
        return console.error('config already inited');
    E.inited = true;
    require.onError = require_on_error;
    require.onResourceLoad = function(context, map, depArray){
        if (E.modules[map.name] && !{config: 1}[map.name])
        {
            console.error('module %s already loaded. id: %s, url: %s',
                map.name, map.id, map.url);
        }
        E.modules[map.name] = map;
    };
    E.ver = conf.version;
    const require_config = get_paths();
    E.config = {
        enforceDefine: true,
	baseUrl: base_url,
	urlArgs: '',
	waitSeconds: 0,
        paths: require_config.paths,
	shim: {
	    jquery: {exports: '$'},
	    underscore: {exports: '_'},
	    backbone: {deps: ['jquery', 'underscore'], exports: 'Backbone'},
	    typeahead: {deps: ['jquery'], exports: 'jQuery.fn.typeahead'},
            rematrix: {exports: 'Rematrix'},
            'regenerator-runtime': {exports: 'regeneratorRuntime'},
            'react-select': {deps: ['react', 'react-dom', 'prop-types',
                'classnames', 'react-input-autosize']},
	},
        config: {
            text: {
                useXhr: ()=>true
            }
        }
    };
    if (require_config.map)
        E.config.map = {'*': require_config.map};
    if (require_config.cdn)
        E.config.cdn = require_config.cdn;
    require.config(E.config);
    require(['/util/es6_shim.js']);
};

var perr = opt=>{
    if (window.be_bg_main && window.be_bg_main.be_lib &&
        window.be_bg_main.be_lib.perr_err)
    {
	return window.be_bg_main.be_lib.perr_err(opt);
    }
    if (!window.hola || !window.hola.base)
        return;
    opt.bt = opt.err && opt.err.stack;
    delete opt.err;
    window.hola.base.perr(opt);
};

var require_on_error = err=>{
    err = err||{};
    var modules = err.requireModules;
    var id = require_is_local() ? 'be_int_require_err' : 'be_require_err';
    console.error('require_on_error %o', err);
    require_on_error.err = require_on_error.err||{};
    var perr_sent = require.perr_sent||(require.perr_sent = []);
    err.require_handled = true;
    if (window.hola)
    {
	window.hola.err = window.hola.err||{};
	window.hola.err.require=(window.hola.err.require||0)+1;
    }
    if (!modules)
    {
        id += '_fin';
	console.error('require fatal error '+err.stack);
        if (perr_sent.indexOf(id)<0)
        {
            perr({id, info: 'no_modules '+err, err});
            perr_sent.push(id);
        }
	return;
    }
};

init();

return E; });
