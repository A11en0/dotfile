// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', '/bext/pub/backbone.js', '/util/etask.js', '/bext/pub/ext.js', '/bext/pub/util.js', '/util/zerr.js', '/bext/vpn/bg/rule.js', '/bext/vpn/bg/tabs.js', '/bext/pub/browser.js', '/bext/vpn/util/util.js', '/bext/pub/lib.js', '/bext/vpn/bg/vpn.js', '/bext/vpn/bg/svc.js', '/bext/vpn/bg/util.js'], function (exports, _underscore, _backbone, _etask, _ext, _util, _zerr, _rule, _tabs, _browser, _util3, _lib, _vpn, _svc, _util5) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _ext2 = _interopRequireDefault(_ext);var _util2 = _interopRequireDefault(_util);var _zerr2 = _interopRequireDefault(_zerr);var _rule2 = _interopRequireDefault(_rule);var _tabs2 = _interopRequireDefault(_tabs);var _browser2 = _interopRequireDefault(_browser);var _util4 = _interopRequireDefault(_util3);var _lib2 = _interopRequireDefault(_lib);var _vpn2 = _interopRequireDefault(_vpn);var _svc2 = _interopRequireDefault(_svc);var _util6 = _interopRequireDefault(_util5);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}














        _util4.default.assert_bg('be_icon');
        const E = new (_backbone2.default.task_model.extend({ model_name: 'icon' }))();
        const chrome = window.chrome,assign = Object.assign;
        let icons = {},cache_icons = {};

        E.uninit = () => {
            if (!E.get('inited'))
            return;
            cache_icons = {};
            E.off('destroy', E.uninit);
            E.off('refresh', on_refresh);
            E.stopListening();
            E.sp.return();
            E.clear();
        };

        E.init = () => {
            if (E.get('inited'))
            return;
            cache_icons = {};
            E.set('inited', true);
            E.sp = _util4.default.new_etask('be_icon');
            E.on('destroy', E.uninit);
            E.on('refresh', on_refresh);
            E.listenTo(_ext2.default, 'change:enabled', refresh_all);
            E.listenTo(_ext2.default, 'change:ext.conflict', refresh_all);
            E.listenTo(_rule2.default, 'change:stamp', refresh_active);
            E.listenTo(_rule2.default, 'change:rules', refresh_active);
            E.listenTo(_rule2.default, 'change:tabs_stub_rules', refresh_active);
            E.listenTo(_rule2.default, 'change:tab_load_err', refresh_active);
            E.listenTo(_vpn2.default, 'change:mitm_ext_ui_enabled', refresh_active);
            E.listenTo(_vpn2.default, 'change:mitm_active_manual', refresh_active);
            E.listenTo(_svc2.default, 'change:vpn_country', refresh_active);
            E.listenTo(_tabs2.default, 'change:active.url change:active.id', refresh_active);
            E.listenTo(_tabs2.default, 'updated', o => {
                if (!o.info.url && !o.info.status)
                return;
                E.refresh({ tab: o.tab });
            });
            E.listenTo(_tabs2.default, 'completed', o => {
                if (!o.frameId && o.tabId >= 0)
                E.refresh({ tabId: o.tabId });
            });
            refresh_all();
        };

        function refresh_active() {E.refresh({ retry: 1 });}

        function refresh_all() {
            icons = {};
            refresh(null); 
            chrome.tabs.query({}, tabs => tabs.forEach(tab => {
                var url = tab && tab.url || '',rule = get_rule(url, tab && tab.id);
                if (_ext2.default.get('enabled') && (!rule || !rule.enabled || !rule.country))
                return;
                refresh(tab);
            }));
        }

        function tab_opt(tab, opt) {return assign(opt, tab ? { tabId: tab.id } : {});}

        function set_icon_cb(retry) {
            return function () {
                if (!_browser2.default.runtime.last_error)
                return;
                var err = _browser2.default.runtime.last_error.message || _browser2.default.runtime.last_error;
                (0, _zerr2.default)('set_icon_err: ', err);
                if (!_underscore2.default.isNumber(retry))
                return;
                if (retry > 0)
                return E.refresh({ retry: retry - 1 });
                _lib2.default.perr_err({ id: 'set_icon_err', info: { retry },
                    rate_limit: { count: 1 }, err });
            };
        }

        function is_path_eq(a, b) {
            if (!a || !b)
            return;
            if (typeof a == 'string' || typeof b == 'string')
            return a == b;
            var keys = Object.keys(a);
            if (keys.length != Object.keys(b).length)
            return;
            for (var i = 0; i < keys.length; i++)
            {
                if (a[keys[i]] != b[keys[i]])
                return;
            }
            return true;
        }

        function set_icon(opt, cb) {
            var id = opt.tabId !== undefined ? opt.tabId : 'global';
            if (is_path_eq(icons[id], opt.path) && is_path_eq(icons.global, opt.path))
            return cb && cb();
            icons[id] = opt.path;
            if (opt.imageData)
            opt = _underscore2.default.omit(opt, ['path']);
            chrome.browserAction.setIcon(opt, cb);
        }

        function get_rule(url, tab_id) {
            var vpn_country;
            if (vpn_country = _svc2.default.get('vpn_country'))
            {
                return _util6.default.is_vpn_allowed(url, true) && { country: vpn_country,
                    enabled: true, type: 'protect_pc' };
            }
            var stub_rule = tab_id && _rule2.default.get_stub_rule(tab_id);
            if (_util2.default.is_stub_rule_enabled(stub_rule, url, _ext2.default.get('is_premium')))
            return stub_rule;
            var rule = _rule2.default.get_rules(url)[0];
            if (_util4.default.is_all_browser(rule) &&
            !_util6.default.is_vpn_allowed(url, true, undefined, rule))
            {
                return;
            }
            return rule;
        }

        const load_image = url => (0, _etask2.default)(function* _load_image_() {
            const img = new Image();
            img.onload = () => this.return(img);
            img.src = url;
            yield this.wait();
        });

        function smooth_image(image, max_size) {
            var steps = Math.max(image.width, image.height) / max_size >> 1;
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.filter = 'blur(' + steps + 'px)';
            ctx.drawImage(image, 0, 0);
            return canvas;
        }

        function refresh(tab, retry) {
            const cb = set_icon_cb(retry);
            const images = {
                gray: { 19: 'bext/vpn/ui/img/icon19_gray.png',
                    38: 'bext/vpn/ui/img/icon38_gray.png' },
                ok: { 19: 'bext/vpn/ui/img/icon19.png',
                    38: 'bext/vpn/ui/img/icon38.png' },
                mitm_icon: { 19: 'bext/vpn/ui/img/ic_unblock19.png',
                    38: 'bext/vpn/ui/img/ic_unblock38.png' },
                protect_icon: { 19: 'bext/vpn/ui/img/ic_protect19.png',
                    38: 'bext/vpn/ui/img/ic_protect38.png' },
                error_icon: { 19: 'bext/vpn/ui/img/ic_error_19.png',
                    38: 'bext/vpn/ui/img/ic_error_38.png' } };

            if (!_ext2.default.get('enabled') || _ext2.default.get('ext.conflict'))
            {
                set_icon(tab_opt(tab, { path: images.gray }), cb);
                chrome.browserAction.setBadgeText(tab_opt(tab, { text: 'off' }));
                chrome.browserAction.setBadgeBackgroundColor(tab_opt(tab,
                { color: '#FF8800' }));
                return;
            }
            const url = tab && tab.url || '',tab_id = tab && tab.id;
            chrome.browserAction.setBadgeText(tab_opt(tab, { text: '' }));
            if (_vpn2.default.get('default_protect_ui'))
            return void set_icon(tab_opt(tab, { path: images.protect_icon }), cb);
            if (_vpn2.default.get('mitm_ext_ui_enabled') && _vpn2.default.get('mitm_active_manual'))
            return void set_icon(tab_opt(tab, { path: images.mitm_icon }), cb);
            if (_util2.default.proxy_error_ui_enabled('icon') && tab_id &&
            _rule2.default.get_tab_load_err(tab_id))
            {
                set_icon(tab_opt(tab, { path: images.error_icon }), cb);
                return;
            }
            const rule = get_rule(url, tab_id);
            if (!_ext2.default.get('enabled') || !rule || !rule.enabled || !rule.country)
            {
                set_icon(tab_opt(tab, { path: images.ok }), cb);
                if (rule && !rule.country)
                {
                    _lib2.default.perr_err({ id: 'icon_no_country_err', info: { url: url,
                            rule: rule }, rate_limit: { count: 1 } });
                }
                return;
            }
            const img = rule.country.toLowerCase() + '.svg';
            const path = chrome.runtime.getURL('js/svc/vpn/pub/img/flag/svg_4x3/' + img);
            return (0, _etask2.default)({ name: '_refresh', cancel: true }, function* refresh_() {
                if (!cache_icons[path])
                {
                    let image = yield load_image(path);
                    const size = (window.devicePixelRatio || 1) * 32;
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (typeof ctx.filter != 'undefined')
                    image = smooth_image(image, size);
                    canvas.width = canvas.height = size;
                    let dwidth = size,dheight = size;
                    if (image.width >= image.height)
                    dheight *= image.height / image.width;else

                    dwidth *= image.width / image.height;
                    ctx.drawImage(image, (size - dwidth) / 2, (size - dheight) / 2,
                    dwidth, dheight);
                    cache_icons[path] = { path,
                        imageData: ctx.getImageData(0, 0, size, size) };
                }
                set_icon(tab_opt(tab, cache_icons[path]), cb);
            });
        }

        E.refresh = o => E.trigger('refresh', o);

        function on_refresh(o) {
            if (!E.get('inited'))
            return;
            E.sp.spawn({ name: 'refresh', cancel: true }, (0, _etask2.default)(function* on_r_() {
                try {
                    const tab = o && o.tab ? o.tab : o && o.tabId ?
                    yield _tabs2.default.get_tab(o.tabId) : yield _tabs2.default.active();
                    if (!tab)
                    return;
                    return yield refresh(tab, o && o.retry);
                } catch (e) {_lib2.default.err('be_icon_refresh_err', '', e);}
            }));
        }exports.default =
        E;});})();
//# sourceMappingURL=icon.js.map
