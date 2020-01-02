// LICENSE_CODE ZON
;(function () {
    'use strict';  define(['exports', 'underscore', '/bext/pub/backbone.js', '/util/etask.js', '/bext/pub/util.js', '/bext/vpn/bg/tabs.js', '/bext/pub/ext.js', '/bext/pub/browser.js', '/svc/vpn/pub/util.js', '/bext/pub/lib.js', '/bext/vpn/bg/tab_unblocker.js', '/bext/vpn/bg/info.js', '/bext/vpn/bg/rule.js', '/util/zerr.js', '/util/storage.js', '/bext/vpn/bg/iframe.js', '/bext/vpn/bg/premium.js', '/util/util.js', '/bext/vpn/util/util.js', '/util/version_util.js', '/bext/vpn/bg/svc.js', '/bext/vpn/bg/trial.js', '/bext/vpn/bg/util.js', 'zon_config', 'conf'], function (exports, _underscore, _backbone, _etask, _util, _tabs, _ext, _browser, _util3, _lib, _tab_unblocker, _info, _rule, _zerr, _storage, _iframe, _premium, _util5, _util7, _version_util, _svc, _trial, _util9, _zon_config, _conf) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _util2 = _interopRequireDefault(_util);var _tabs2 = _interopRequireDefault(_tabs);var _ext2 = _interopRequireDefault(_ext);var _browser2 = _interopRequireDefault(_browser);var _util4 = _interopRequireDefault(_util3);var _lib2 = _interopRequireDefault(_lib);var _tab_unblocker2 = _interopRequireDefault(_tab_unblocker);var _info2 = _interopRequireDefault(_info);var _rule2 = _interopRequireDefault(_rule);var _zerr2 = _interopRequireDefault(_zerr);var _storage2 = _interopRequireDefault(_storage);var _iframe2 = _interopRequireDefault(_iframe);var _premium2 = _interopRequireDefault(_premium);var _util6 = _interopRequireDefault(_util5);var _util8 = _interopRequireDefault(_util7);var _version_util2 = _interopRequireDefault(_version_util);var _svc2 = _interopRequireDefault(_svc);var _trial2 = _interopRequireDefault(_trial);var _util10 = _interopRequireDefault(_util9);var _zon_config2 = _interopRequireDefault(_zon_config);var _conf2 = _interopRequireDefault(_conf);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

























        _util8.default.assert_bg('be_tpopup');
        const chrome = window.chrome;
        const zopts = _util2.default.zopts;
        const E = new (_backbone2.default.model.extend({
            model_name: 'tpopup',
            _defaults: function () {this.on('destroy', () => this.uninit());} }))();


        function script_data(iframe_int, opt) {
            var b = window.chrome || typeof browser != 'undefined' && browser;
            var frame, port;
            var inited = false;
            function script_exec(func) {
                var script = document.createElement('script');
                script.textContent = '(' + func.toString() + ')();';
                (document.head || document.documentElement).appendChild(script);
                script.remove();
            }
            function get_iframe_parent() {
                const el = document.fullscreenElement;
                return (opt.type == 'mitm_popup' || opt.type == 'watermark') && el &&
                !['VIDEO', 'IMG', 'IFRAME'].includes(el.tagName) ? el :
                document.body;
            }
            function get_itv_flash() {
                return opt.root_url == 'itv.com' &&
                document.querySelector('#video object');
            }
            function must_exit_fullscreen() {
                var fs_el = document.fullscreenElement;
                return fs_el && fs_el.tagName == 'IFRAME' || opt.root_url == 'itv.com' &&
                document.body.classList.contains('is-fullscreen') &&
                !!get_itv_flash();
            }
            function exit_fullscreen() {
                var itv = get_itv_flash();
                if (!itv)
                return void document.exitFullscreen();
                try {
                    script_exec(() => {
                        document.querySelector('#video object').
                        callBackPlayer('toggleFullscreen');
                    });
                } catch (e) {perr('tpopup_exit_fullscreen_err', { err: e.message });}
            }
            function is_playing(video) {
                if (video.tagName == 'VIDEO')
                return !video.paused && !video.ended;
                if (opt.root_url == 'itv.com' && video.tagName == 'OBJECT')
                {
                    var el = document.querySelector('#video');
                    return el && el.getAttribute('state') == 'playing';
                }
            }
            function is_paused(video) {
                if (video.tagName == 'VIDEO')
                return video.paused && !video.ended;
                if (opt.root_url == 'itv.com' && video.tagName == 'OBJECT')
                {
                    var el = document.querySelector('#video');
                    return el && el.getAttribute('state') == 'paused';
                }
            }
            function play_video(video) {
                if (video.tagName == 'VIDEO')
                return void video.play();
                if (opt.root_url == 'itv.com' && video.tagName == 'OBJECT')
                {
                    script_exec(() => {
                        document.querySelector('#video object').
                        callBackPlayer('play');
                    });
                }
            }
            function pause_video(video) {
                if (video.tagName == 'VIDEO')
                return void video.pause();
                if (opt.root_url == 'itv.com' && video.tagName == 'OBJECT')
                {
                    script_exec(() => {
                        document.querySelector('#video object').
                        callBackPlayer('pause');
                    });
                }
            }
            function get_icon() {
                let res = `https://${opt.root_url}/favicon.ico`;
                const q = 'link[rel="apple-touch-icon"], link[rel="shortcut icon"], ' +
                'link[rel="icon"]';
                try {
                    const arr = Array.from(document.querySelectorAll(q)).map(el => {
                        const { rel, href, sizes } = el;
                        let size = +(sizes && sizes[0] && sizes[0].split('x')[0]) || (
                        rel == 'apple-touch-icon' ? 57 : rel == 'icon' ? 32 : 48);
                        return { href, size };
                    }).sort((i, j) => i.size - j.size);
                    let icon = arr.find(item => item.size >= 48) || arr[arr.length - 1];
                    res = icon && icon.href || res;
                } catch (e) {
                    console.error('get_icon error: ' + e);
                }
                return res;
            }
            function add_iframe() {
                if (document.getElementById('_hola_popup_iframe__'))
                return void console.error('frame already exists');
                if (!document.body) 
                    return void console.error('document not ready');
                let styles = { position: 'fixed', top: '5px', right: '20px',
                    width: '274px', height: '377px',
                    'max-width': '100%', 'max-height': '100%',
                    'background-color': 'transparent', 'z-index': 2147483647,
                    overflow: 'hidden', visibility: 'hidden', border: 'none',
                    display: 'block' };
                if (opt.type)
                {
                    Object.assign(styles, { top: '0', right: '0', width: '0',
                        height: '0' });
                }
                let url = opt.ext_url + '/popup.html?tab_id=' + opt.tab_id +
                '&connection_id=' + opt.connection_id;
                let f = iframe_int.add({ url, parent: get_iframe_parent() }, styles);
                f.setAttribute('id', '_hola_popup_iframe__');
                document.body.addEventListener('mousedown', mousedown_cb);
                return f;
            }
            function rm_iframe() {
                try {
                    if (!frame)
                    return;
                    if (document.body)
                    document.body.removeEventListener('mousedown', mousedown_cb);
                    frame = null;
                    iframe_int.remove();
                } catch (e) {
                    console.error('rm_iframe error: ' + e);
                }
            }
            function mousedown_cb() {trigger('body_click');}
            function trigger(name, data) {
                data = Object.assign({ tab_id: opt.tab_id,
                    connection_id: opt.connection_id }, data);
                b.runtime.sendMessage({ type: 'be_msg_req', _type: 'tpopup',
                    _tab_id: opt.tab_id, context: { rmt: true },
                    msg: { msg: 'call_api', obj: 'tpopup', func: 'trigger',
                        args: [name, data] } });
            }
            function ext_send_msg(msg) {
                msg = Object.assign({ _type: 'tpopup',
                    _connection_id: opt.connection_id }, msg);
                b.runtime.sendMessage({ type: 'be_msg_req', _type: 'tpopup',
                    _tab_id: opt.tab_id, context: { rmt: true },
                    msg: { msg: 'call_api', obj: 'tpopup', func: 'send_tpopup_msg',
                        args: [opt.tab_id, msg] } });
            }
            function perr(id, info) {
                info = Object.assign({ root_url: opt.root_url, url: opt.url }, info);
                b.runtime.sendMessage({ type: 'be_msg_req', _type: 'tpopup',
                    _tab_id: opt.tab_id, context: { rmt: true },
                    msg: { msg: 'call_api', obj: 'tpopup', func: 'perr',
                        args: [opt.tab_id, { id: id, info: info }] } });
            }
            function on_ext_msg(msg) {
                if (msg._connection_id != opt.connection_id)
                return;
                switch (msg.id) {

                    case 'tpopup.init':
                        ext_send_msg({ id: 'cs_tpopup.init', tab_id: opt.tab_id,
                            connection_id: opt.connection_id, conf: opt.conf,
                            zon_config: opt.zon_config, ver: opt.ver,
                            root_url: opt.root_url, url: opt.url, country: opt.country,
                            type: opt.type, zopts: opt.zopts, icon: get_icon() });
                        break;
                    case 'tpopup.show':
                        iframe_int.css(frame, { 'visibility': 'visible' });break;
                    case 'tpopup.hide':
                        iframe_int.css(frame, { 'visibility': 'hidden' });break;
                    case 'tpopup.resize':
                        if (parseInt(msg.width, 10) > 200 && parseInt(msg.height, 10) > 200 &&
                        must_exit_fullscreen())
                        {
                            exit_fullscreen();
                        }
                        iframe_int.resize({ width: msg.width, height: msg.height,
                            top: msg.top, left: msg.left, right: msg.right,
                            bottom: msg.bottom, fade: msg.fade, animate: msg.animate,
                            animation_time: msg.animation_time, margin: msg.margin });
                        trigger('resize_end');
                        break;
                    case 'tpopup.show_arrow_anim':
                        var url = opt.ext_url + '/animation_arrow.html?direction=' +
                        msg.direction + '&width=' + msg.size.width + '&height=' +
                        msg.size.height;
                        iframe_int.show_arrow_anim({ url: url, css: msg.css });
                        break;
                    case 'tpopup.hide_arrow_anim':iframe_int.hide_arrow_anim();break;
                    case 'tpopup.pause_videos':pause_videos();break;
                    case 'tpopup.resume_videos':resume_videos();break;
                    case 'tpopup.close':uninit();break;}

            }
            var paused_videos = [];
            function pause_videos() {
                paused_videos = [];
                const videos = Array.from(document.querySelectorAll('video'));
                const itv = get_itv_flash();
                if (itv)
                videos.push(itv);
                videos.forEach(v => {
                    try {
                        if (!is_playing(v))
                        return;
                        pause_video(v);
                        paused_videos.push(v);
                    } catch (e) {
                        perr('geo_trial_ended_pause_video_err', { err: e.message });
                        console.error('pause video error: ' + e);
                    }
                });
                if (paused_videos.length)
                perr('geo_trial_ended_pause_video', { count: paused_videos.length });
            }
            function resume_videos() {
                const resumed = [];
                paused_videos.forEach(v => {
                    try {
                        if (!is_paused(v))
                        return;
                        play_video(v);
                        resumed.push(v);
                    } catch (e) {
                        perr('geo_trial_ended_resume_video_err', { err: e.message });
                        console.error('play video error: ' + e);
                    }
                });
                if (resumed.length)
                perr('geo_trial_ended_resume_video', { count: resumed.length });
                paused_videos = [];
            }
            function on_fullscreen(e) {
                const parent = get_iframe_parent();
                if (!frame || frame.parentElement === parent)
                return;
                parent.appendChild(frame);
                iframe_int.css(frame, { 'visibility': 'hidden' });
            }
            function on_mouseleave() {trigger('mouseleave');}
            function init() {
                if (inited)
                return;
                if (opt.url != location.href)
                {
                    console.error('expected url: ' + opt.url + ' actual: ' + location.href);
                    return;
                }
                inited = true;
                if (!(frame = add_iframe()))
                return;
                frame.addEventListener('mouseleave', on_mouseleave);
                document.addEventListener('fullscreenchange', on_fullscreen);
                document.addEventListener('webkitfullscreenchange', on_fullscreen);
                document.addEventListener('mozfullscreenchange', on_fullscreen);
                port = b.runtime.connect({ name: opt.connection_id });
                b.runtime.onMessage.addListener(on_ext_msg);
                port.onDisconnect.addListener(uninit);
                window.addEventListener('unload', uninit);
            }
            function uninit() {
                if (!inited)
                return;
                paused_videos = [];
                if (frame)
                frame.removeEventListener('mouseleave', on_mouseleave);
                rm_iframe();
                document.removeEventListener('fullscreenchange', on_fullscreen);
                document.removeEventListener('webkitfullscreenchange', on_fullscreen);
                document.removeEventListener('mozfullscreenchange', on_fullscreen);
                b.runtime.onMessage.removeListener(on_ext_msg);
                port.onDisconnect.removeListener(uninit);
                port.disconnect();
                port = null;
                inited = false;
            }
            init();
        }

        function popup_showing() {
            var views = chrome.extension.getViews({ type: 'popup' });
            return views && views.length > 0;
        }

        function is_disabled() {return !_ext2.default.get('ext.active');}

        var min_suggest_rate = 0.3;

        var forced_urls = {},connected_tpopups = {},loading_tpopups = {};
        function is_connected(tab_id, tpopup_type) {
            var tab_connected = _browser2.default.tabs.is_connected(tab_id);
            return tab_connected && tpopup_type ?
            connected_tpopups[tab_id] == tpopup_type :
            tab_connected && connected_tpopups[tab_id];
        }
        E.is_connected = is_connected;

        function is_never_show_popup(root_url) {
            return _util2.default.is_google(root_url) || _util2.default.is_youtube(root_url);}

        function get_rule(url) {
            const rules = _util8.default.get_rules(_rule2.default.get('rules'), url);
            return _underscore2.default.first(rules);
        }

        function is_protect(url) {
            if (_svc2.default.get('vpn_country'))
            return true;
            var rule = get_rule(url) || {};
            return rule.enabled && _util8.default.is_all_browser(rule) ||
            rule.mode == 'protect';
        }

        E.do_tpopup = (tab, tpopup_opt) => {
            if (!_util6.default.get(tab, 'url') || is_disabled())
            return;
            var popup_conf = (_ext2.default.get('bext_config') || {}).popup || {};
            if (popup_conf.disable || _version_util2.default.cmp(_util2.default.version(),
            popup_conf.disable_max_ver) < 0)
            {
                return;
            }
            var rule,root_url,url = tab.url,id = tab.id;
            tpopup_opt = tpopup_opt || {};
            var tpopup_type, tpopup_country;
            function mitm_trace(s) {
                var mitm = _tab_unblocker2.default.mitm;
                if (mitm)
                mitm.trace(id, url, s);
            }
            mitm_trace('do_tpopup start');
            return loading_tpopups[id] = loading_tpopups[id] || (0, _etask2.default)({ async: true,
                name: 'do_tpopup', cancel: true }, [function () {
                root_url = _util4.default.get_root_url(url);
                if (is_connected(id, tpopup_type))
                return this.return(_zerr2.default.notice('tab:%d tab already attached', id));
            }, function () {
                rule = _premium2.default.get_force_premium_rule(root_url);
                if (_util6.default.get(rule, 'blacklist') || !root_url)
                {
                    if (root_url)
                    _zerr2.default.notice('tab:%d no tpopup - blacklist %s', id, root_url);
                    return this.return();
                }
                if (is_protect(url))
                {
                    _zerr2.default.notice('tab:%d hide tpopup when protect browser/pc is ' +
                    'enabled', id);
                    return this.return();
                }
                if (E.need_mitm_popup(url, id))
                {
                    mitm_trace('do_tpopup mitm popup should be shown');
                    _zerr2.default.notice('tab:%d mitm popup should be shown', id);
                    tpopup_type = 'mitm_popup';
                    return this.goto('render');
                }
                if (is_never_show_popup(root_url))
                {
                    _zerr2.default.notice('tab:%d tpopup not allowed on %s', id, root_url);
                    return this.return();
                }
                if (!_premium2.default.is_active() &&
                !_info2.default.is_dont_show(id, root_url, 'site_premium') &&
                !_info2.default.is_dont_show(id, root_url) && rule)
                {
                    _zerr2.default.notice('tab:%d force premium - tpopup should be shown', id);
                    return this.goto('render');
                }
                if (E.need_watermark_popup(id, url))
                {
                    _zerr2.default.notice('tab:%d need watermark popup', id);
                    tpopup_type = 'watermark';
                    return this.goto('render');
                }
                if (need_force_suggestion(id, url))
                {
                    _zerr2.default.notice('tab:%d need forced suggestion popup', id);
                    tpopup_type = 'suggestion';
                    _tabs2.default.set_force_suggestion(id, null);
                    _rule2.default.set_stub_rule(id, null);
                    return this.goto('render');
                }
                if (need_stub_rule_popup(id, url))
                {
                    _zerr2.default.notice('tab:%d need last rule popup', id);
                    tpopup_type = 'suggestion';
                    tpopup_country = _rule2.default.get_stub_rule(id).country.toUpperCase();
                    _tabs2.default.set_force_suggestion(id, null);
                    _rule2.default.set_stub_rule(id, null);
                    return this.goto('render');
                }
                var forced;
                if (forced = _info2.default.is_force_tpopup(root_url))
                {
                    _info2.default.unset_force_tpopup(root_url);
                    _zerr2.default.notice('tab:%d popup was forced', id);
                    if (typeof forced == 'string')
                    tpopup_type = forced;else

                    forced_urls[root_url] = forced;
                    return this.goto('render');
                }
                if (_info2.default.is_dont_show(id, root_url))
                {
                    _zerr2.default.notice('tab:%d tab is don\'t show', id);
                    return this.return();
                }
                var smode = get_suggestion_mode(root_url);
                if (_trial2.default.get_trial_active(root_url) ||
                ['always', 'never'].includes(smode) || smode == 'by_popular' &&
                _info2.default.is_dont_show(id, root_url, 'suggestion'))
                {
                    _zerr2.default.notice('tab:%d skip tpopup, site has suggestion conf', id);
                    return this.return();
                }
                if (forced = forced_urls[root_url])
                {
                    _zerr2.default.notice('tab:%d popup was forced2', id);
                    if (typeof forced == 'string')
                    tpopup_type = forced;
                    return this.goto('render');
                }
                _zerr2.default.notice('tab:%d checking if site has high unblocking rate', id);
                return _info2.default.get_unblocking_rate(200);
            }, function (unblocking_rate) {
                if (!unblocking_rate)
                return false;
                if (_premium2.default.get_force_premium_rule(root_url))
                return false;
                let rate;
                for (let i = 0, r; !rate && (r = unblocking_rate[i]); i++)
                {
                    if (r.root_url == root_url && r.unblocking_rate > min_suggest_rate)
                    rate = r;
                    else if (root_url == 'bbc.com' && r.root_url == 'bbc.co.uk' &&
                        r.unblocking_rate > min_suggest_rate)
                        {
                            rate = r;
                        }
                }
                return !!rate;
            }, function (need_unblock) {
                if (!need_unblock)
                {
                    _zerr2.default.notice('tab:%d skip tpopup, no unblock by redirect/error',
                    id);
                    return this.return();
                }
                if (get_suggestion_mode(root_url) == 'by_popular' &&
                !_info2.default.is_dont_show(id, root_url, 'suggestion'))
                {
                    _zerr2.default.notice('tab:%d need watermark popup (by_popular)', id);
                    tpopup_type = 'watermark';
                    return this.goto('render');
                }
                var mode;
                if ((mode = get_geo_popup_mode()) != 'by_popular')
                {
                    _zerr2.default.notice('tab:%d skip tpopup, geo_popup.mode is %s', id, mode);
                    return this.return();
                }
            }, function render(e) {
                connected_tpopups[id] = tpopup_type || true;
                if (e && e.load_ver)
                {
                    return this.return((0, _zerr2.default)('tab:%d skip tpopup, load new ver%s', id,
                    e.load_ver));
                }
                return popup_showing();
            }, function (showing) {
                if (showing && !tpopup_type)
                {
                    return this.return(_zerr2.default.notice('tab:%d extension popup is opened',
                    id));
                }
                return _tabs2.default.get_tab(id);
            }, function (tab_) {
                if (!tab_)
                return this.return((0, _zerr2.default)('tab:%d tpopup tab disappeared', id));
                if (tab_.url != url)
                {
                    (0, _zerr2.default)('tab:%d tpopup tab changed url %s -> %s', id, url, tab_.url);
                    return this.return();
                }
                if (is_connected(id, tpopup_type))
                return this.return(_zerr2.default.notice('tab:%d tab already attached', id));
                _zerr2.default.notice('tab:%d applying tpopup to tab', id);
                var opt = { conf: _conf2.default, zon_config: _zon_config2.default,
                    tab_id: id, connection_id: id + ':tpopup:' +
                    _underscore2.default.random(Number.MAX_SAFE_INTEGER),
                    root_url: root_url, url: url, ver: _conf2.default.version,
                    opt: _storage2.default.get('locale'),
                    ext_url: chrome.runtime.getURL('') + 'js',
                    persistent: false, zopts: zopts.table };
                if (tpopup_type)
                opt.type = tpopup_type;
                if (tpopup_opt.reason)
                {
                    _lib2.default.perr_ok({ id: 'be_tpopup_inject', info: { url: tab_.url,
                            reason: tpopup_opt.reason } });
                }
                if (tpopup_country)
                opt.country = tpopup_country;
                (0, _etask2.default)(function* do_tpopup_log_() {
                    _zerr2.default.notice('tab:%d inject tpopup iframe', id);
                    yield _iframe2.default.inject(id, script_data, opt,
                    chrome ? {} : { tpopup: 1, connection_id: opt.connection_id });
                    _zerr2.default.notice('tab:%d tpopup iframe injected', id);
                });
                return opt;
            }, function finally$() {
                delete loading_tpopups[id];
                if (false)
                debug_stats({ url: url, root_url: root_url });
            }, function cancel$() {
                delete connected_tpopups[id];
                return this.return();
            }, function catch$(err) {
                var ok = err.message == 'OK';
                _lib2.default.perr_err({ id: 'be_tpopup2_err', err: err,
                    filehead: ok ? _zerr2.default.log_tail() : '', rate_limit: true });
                delete connected_tpopups[id];
            }]);
        };

        function is_trial_expired(root_url) {
            return _trial2.default.is_trial_expired(root_url) &&
            !!_util2.default.get_site_storage(root_url, 'trial.country');
        }

        function need_trial_ended(root_url) {
            return !_premium2.default.is_active() && is_trial_expired(root_url) &&
            !_util2.default.get_site_storage(root_url, 'trial.dont_show_ended');
        }

        function get_geo_popup_mode() {
            const bext_conf = _ext2.default.get('bext_config');
            return _util6.default.get(bext_conf, 'geo_popup.mode', 'by_popular');
        }

        function get_suggestion_mode(root_url) {
            const site_conf = _util2.default.get_site_conf(root_url);
            const c = _util2.default.get_suggestion_conf(site_conf, _info2.default.get('country'));
            return c && (c.mode || 'by_popular');
        }

        function need_geo_suggestion(tab_id, root_url) {
            if (!_premium2.default.is_active() && _util2.default.get_site_storage(root_url,
            'force_trial'))
            {
                return true;
            }
            return get_suggestion_mode(root_url) == 'always' &&
            !_trial2.default.get_trial_active(root_url) && !is_trial_expired(root_url) &&
            !_info2.default.is_dont_show(tab_id, root_url, 'suggestion');
        }

        function need_geo_watermark(tab_id, url, root_url) {
            const allow_hide = _premium2.default.is_active() ||
            _util6.default.get(_ext2.default.get('bext_config'), 'geo_popup.watermark.allow_hide');
            return (get_rule(url) || {}).enabled && (
            !allow_hide || !_info2.default.is_dont_show(tab_id, root_url, 'watermark'));
        }

        function need_force_suggestion(tab_id, url) {
            const root_url = _util4.default.get_root_url(url);
            return _util10.default.is_vpn_allowed(url, true) &&
            !_util2.default.is_google(root_url) &&
            _tabs2.default.is_force_suggestion(tab_id) &&
            !_info2.default.is_dont_show(tab_id, root_url, 'suggestion');
        }

        const need_proxy_error_dialog = tab_id => {
            return _util2.default.proxy_error_ui_enabled('dialog') &&
            !!_rule2.default.get_tab_load_err(tab_id);
        };

        E.need_watermark_popup = (tab_id, url) => {
            if (!_ext2.default.get('ext.active'))
            return false;
            var root_url = _util4.default.get_root_url(url);
            return !!(need_geo_watermark(tab_id, url, root_url) ||
            need_trial_ended(root_url) || need_geo_suggestion(tab_id, root_url)) ||
            need_proxy_error_dialog(tab_id);
        };

        E.need_mitm_popup = (url, tab_id) => {
            const mitm = _tab_unblocker2.default.mitm;
            const root_url = _util4.default.get_root_url(url);
            return mitm && mitm.is_popup_needed(url, tab_id) && (
            !_premium2.default.is_active() && !is_never_show_popup(root_url) ||
            mitm._is_mitm_active(tab_id) == 'auto');
        };

        function need_stub_rule_popup(tab_id, url) {
            if (!_util10.default.is_vpn_allowed(url, true) || _util8.default.is_skip_url(url))
            return false;
            const rule = _rule2.default.get_stub_rule(tab_id);
            const root_url = _util4.default.get_root_url(url);
            return rule && !_info2.default.is_dont_show(tab_id, root_url, 'suggestion');
        }

        function tpopup_on_updated(o) {E.do_tpopup(o.tab);}

        function tpopup_on_replaced(o) {
            chrome.tabs.get(o.added, tab => {E.do_tpopup(tab);});}

        var sent = {};
        function send_trial_perr(opt, page, re) {
            if (sent[page])
            return;
            if (!opt.skip_check && !re.test(opt.url))
            return;
            sent[page] = true;
            _lib2.default.perr_ok({ id: 'be_trial_page', info: { url: opt.url,
                    root_url: opt.root_url, page } });
        }

        function debug_stats(opt) {
            try {
                const root_url = opt.root_url;
                if (root_url != 'netflix.com')
                return;
                if (!_trial2.default.get_trial_active(root_url))
                {
                    send_trial_perr({ skip_check: true }, 'visit_no_trial', /.*/);
                    return;
                }
                send_trial_perr({ skip_check: true }, 'visit_trial', /.*/);
                send_trial_perr(opt, 'browse', /\/browse/i);
                send_trial_perr(opt, 'watch', /\/watch/i);
                send_trial_perr(opt, 'search', /\/search/i);
                send_trial_perr(opt, 'login', /\/login/i);
            } catch (e) {(0, _zerr2.default)('debug_stats error %o', e);}
        }

        function tpopup_msg(c_id, name, opt) {
            var tab_id = +c_id.split(':')[0];
            chrome.tabs.sendMessage(tab_id, Object.assign({ id: 'tpopup.' + name,
                _type: 'tpopup', _connection_id: c_id }, opt));
        }

        E.show = c_id => {tpopup_msg(c_id, 'show');};
        E.hide = c_id => {tpopup_msg(c_id, 'hide');};
        E.close = c_id => {tpopup_msg(c_id, 'close');};
        E.pause_videos = c_id => {tpopup_msg(c_id, 'pause_videos');};
        E.resume_videos = c_id => {tpopup_msg(c_id, 'resume_videos');};
        E.hide_arrow_anim = c_id => {tpopup_msg(c_id, 'hide_arrow_anim');};
        E.show_arrow_anim = (c_id, opt) => {tpopup_msg(c_id, 'show_arrow_anim', opt);};

        var resize_et = {};
        E.resize = (c_id, opt) => {
            if (resize_et[c_id])
            resize_et[c_id].return();
            return (0, _etask2.default)(function* resize_() {
                this.finally(() => delete resize_et[c_id]);
                resize_et[c_id] = this;
                tpopup_msg(c_id, 'resize', opt);
                return yield this.wait();
            });
        };

        E.close_tab_tpopup = tab_id => {
            let connections = _browser2.default.tabs.get_tab_connections(tab_id);
            if (connections)
            connections.forEach(c_id => E.close(c_id));
        };

        function on_resize_end(e) {
            if (resize_et[e.connection_id])
            resize_et[e.connection_id].continue();
        }

        function enabled_cb() {
            if (!is_disabled())
            return;
            Object.keys(connected_tpopups).forEach(tab_id =>
            E.close_tab_tpopup(tab_id));
        }

        const on_trial_end = root_url => {
            Object.keys(connected_tpopups).forEach(tab_id => {
                if (root_url != _util4.default.get_root_url(_tabs2.default.get_url(tab_id)))
                return;
                const connections = _browser2.default.tabs.get_tab_connections(tab_id);
                if (connections)
                connections.forEach(c_id => E.pause_videos(c_id));
            });
        };

        E.uninit = () => {
            if (!E.inited)
            return;
            E.inited = 0;
            E.off('resize_end', on_resize_end);
            E.stopListening();
        };

        E.init = () => {
            if (E.inited)
            return;
            E.inited = 1;
            E.listenTo(_tabs2.default, 'updated', tpopup_on_updated);
            E.listenTo(_tabs2.default, 'replaced', tpopup_on_replaced);
            E.listenTo(_ext2.default, 'change:ext.active', enabled_cb);
            E.listenTo(_ext2.default, 'trial_end', on_trial_end);
            E.on('resize_end', on_resize_end);
        };exports.default =

        E;});})();
//# sourceMappingURL=tpopup.js.map
