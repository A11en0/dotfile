// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', '/bext/pub/backbone.js', '/util/etask.js', '/bext/vpn/bg/tabs.js', '/bext/vpn/util/util.js', '/bext/pub/ext.js', '/bext/pub/browser.js', '/bext/pub/lib.js', '/svc/vpn/pub/unblocker_lib.js', '/util/zerr.js', '/util/url.js', '/util/util.js'], function (exports, _underscore, _backbone, _etask, _tabs, _util, _ext, _browser, _lib, _unblocker_lib, _zerr, _url2, _util3) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _tabs2 = _interopRequireDefault(_tabs);var _util2 = _interopRequireDefault(_util);var _ext2 = _interopRequireDefault(_ext);var _browser2 = _interopRequireDefault(_browser);var _lib2 = _interopRequireDefault(_lib);var _unblocker_lib2 = _interopRequireDefault(_unblocker_lib);var _zerr2 = _interopRequireDefault(_zerr);var _url3 = _interopRequireDefault(_url2);var _util4 = _interopRequireDefault(_util3);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}












        const chrome = window.chrome;
        _util2.default.assert_bg('be_tab_perr');
        const E = new (_backbone2.default.model.extend({
            _defaults: function () {this.on('destroy', () => E.uninit());} }))();

        const cb_wrapper = _zerr2.default.catch_unhandled_exception;

        const google_host = hostname => {
            var host_split = hostname.split('.').reverse();
            return host_split[1] == 'google' || host_split[2] == 'google';
        };

        const enabled_google_rule = () => {
            return _unblocker_lib2.default.has_rule(r => google_host(r.name));};

        const google_captcha_send_perr = _url => {
            if (!E.inited)
            return;
            let url = _url3.default.parse(_url),id;
            if (!google_host(url.hostname))
            return;
            if (/\/sorry\//.test(url.pathname))
            id = 'google_cap_sorry';else
            if (/\/websearch\/answer\/86640$/.test(url.pathname))
            id = 'google_cap_support';else
            if (/\/recaptcha$/.test(url.pathname))
            id = 'google_cap_support2';else

            return;
            if (enabled_google_rule())
            id += '_enabled_google_rule';
            if (be_vpn.be_mode.get('svc.detected'))
            id += '_svc';
            _lib2.default.perr_err({ id, info: { url: _url },
                rate_limit: { count: 1, disable_drop_count: true } });
        };

        const on_tab_created = cb_wrapper(o => {
            const tab = o.tab;
            if (!tab.url)
            return;
            google_captcha_send_perr(tab.url);
        });

        const on_tab_updated = cb_wrapper(o => {
            const info = o.info;
            if (!_util4.default.get(info, 'url'))
            return;
            google_captcha_send_perr(info.url);
        });

        const on_tab_replaced = cb_wrapper(o => {
            const added = o.added;
            chrome.tabs.get(added, tab => {
                if (!_util4.default.get(tab, 'url'))
                return;
                google_captcha_send_perr(tab.url);
            });
        });

        const update_state = () => {
            const is_active = _ext2.default.get('ext.active');
            if (is_active == E.is_active)
            return;
            E.is_active = is_active;
            E.stopListening(_tabs2.default);
            if (!E.is_active)
            return;
            E.listenTo(_tabs2.default, 'created', on_tab_created);
            E.listenTo(_tabs2.default, 'updated', on_tab_updated);
            E.listenTo(_tabs2.default, 'replaced', on_tab_replaced);
        };

        E.uninit = () => {
            if (!E.inited)
            return;
            E.inited = 0;
            E.stopListening();
            be_vpn = null;
        };

        let be_vpn;
        E.init = _be_vpn => {
            if (E.inited)
            return;
            be_vpn = _be_vpn;
            E.inited = 1;
            E.listen_to(_ext2.default, 'change:ext.active', update_state);
        };exports.default =

        E;});})();
//# sourceMappingURL=tab_perr.js.map
