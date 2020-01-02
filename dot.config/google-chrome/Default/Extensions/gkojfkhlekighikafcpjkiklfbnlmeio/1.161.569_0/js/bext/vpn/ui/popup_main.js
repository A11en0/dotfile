// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', '/bext/pub/backbone.js', '/util/etask.js', '/bext/pub/browser.js', '/util/zerr.js', '/bext/pub/util.js', '/bext/vpn/util/util.js', '/bext/vpn/ui/ui_api.js', '/bext/vpn/ui/app.js'], function (exports, _backbone, _etask, _browser, _zerr, _util, _util3, _ui_api, _app) {Object.defineProperty(exports, "__esModule", { value: true });var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _browser2 = _interopRequireDefault(_browser);var _zerr2 = _interopRequireDefault(_zerr);var _util2 = _interopRequireDefault(_util);var _util4 = _interopRequireDefault(_util3);var _ui_api2 = _interopRequireDefault(_ui_api);var _app2 = _interopRequireDefault(_app);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}








        _util4.default.assert_ui('be_popup_main');
        const chrome = window.chrome;
        const E = new _backbone2.default.model();
        E.on('destroy', () => E.uninit());
        E.zerr = window.hola.zerr = _zerr2.default;

        E.init = () => (0, _etask2.default)(function* () {
            try {
                if (E.inited)
                return;
                window.addEventListener('unload', () => E._destroy());
                _app2.default.pre_init(E);
                yield _ui_api2.default.init();
                _zerr2.default.notice('popup got bg');
                _ui_api2.default.bg_main_recover();
                E.listen_to(_ui_api2.default, 'bg_main_inited', inited_cb);
                E.listen_to(_util2.default, 'change:storage.err', storage_err_cb);
                E.inited = true;
            } catch (e) {
                (0, _zerr2.default)('popup_main init error %s', _zerr2.default.e2s(e));
                _ui_api2.default.perr_err('be_popup_main_init_err', {}, { err: e });
                _app2.default.render_init_err(e);
            }
        });

        E.uninit = () => {
            if (!E.inited)
            return;
            _app2.default.uninit();
            _zerr2.default.notice('popup uninit');
            _ui_api2.default.uninit();
            _browser2.default._destroy();
            E.stopListening();
            E.inited = false;
            E.set('inited', false);
            delete window.hola;
            delete window.conf;
            delete window.onerror;
        };

        const inited_cb = () => {
            try {
                if (!_ui_api2.default.get_bg_main_inited())
                return _zerr2.default.notice('popup_main bg_main not inited');
                _ui_api2.default.bg_main_recover();
                _zerr2.default.notice('popup inited');
                active_tab_fixup();
                close_vpn_tpopup();
                _ui_api2.default.rule_task_cancel_all();
                E.listen_to(_ui_api2.default, 'vpn_status_changed', vpn_status_cb);
            } catch (e) {
                (0, _zerr2.default)('popup_main inited_cb error %s', _zerr2.default.e2s(e));
                _ui_api2.default.perr_err('be_popup_main_init_err', {}, { err: e });
                _app2.default.render_init_err(e);
            }
        };

        const vpn_status_cb = () => {
            try {
                if (_ui_api2.default.get_vpn_status() == 'error')
                {
                    if (E.get('tried_recover'))
                    return;
                    (0, _zerr2.default)('trying auto-recover');
                    E.set('tried_recover', true);
                    _ui_api2.default.bg_vpn_recover();
                    return;
                }
                E.set('inited', true);
                _zerr2.default.notice('be_vpn ready');
                E.stopListening(_ui_api2.default, 'vpn_status_changed');
                _app2.default.init();
            } catch (e) {
                (0, _zerr2.default)('popup_main vpn_status_cb error %s', _zerr2.default.e2s(e));
                _ui_api2.default.perr_err('be_popup_main_init_err', {}, { err: e });
                _app2.default.render_init_err(e);
            }
        };

        const storage_err_cb = () => {
            if (!_util2.default.get('storage.err'))
            return;
            E.stopListening(_util2.default, 'change:storage.err');
            let last = _util2.default.get('storage.last_error');
            _ui_api2.default.perr_err('storage_err', last ? last.api + ' ' + last.key : '',
            { err: last && last.err });
        };

        const close_vpn_tpopup = () => {
            if (_util4.default.is_tpopup())
            return;
            (0, _etask2.default)(function* close_vpn_tpopup_() {
                const tab_id = _ui_api2.default.get_tab_id();
                const tpopup_type = yield _ui_api2.default.tpopup_is_connected(tab_id);
                if (tpopup_type && typeof tpopup_type != 'string')
                _ui_api2.default.close_tab_tpopup(tab_id);
            });
        };

        const active_tab_fixup = () => {
            if (_util4.default.is_tpopup())
            return;
            E.listenToOnce(_ui_api2.default, 'tab_id_changed', () => window.close());
            if (!chrome || !chrome.tabs)
            return;
            chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
                if (tabs && tabs.length && tabs[0].id != _ui_api2.default.get_tab_id())
                window.close();
            });
        };exports.default =

        E;});})();
//# sourceMappingURL=popup_main.js.map
