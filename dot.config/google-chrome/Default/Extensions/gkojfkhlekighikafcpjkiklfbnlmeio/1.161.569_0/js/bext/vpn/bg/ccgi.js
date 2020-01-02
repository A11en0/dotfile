// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', '/bext/pub/backbone.js', '/util/etask.js', '/util/zerr.js', '/bext/pub/util.js', '/bext/vpn/bg/util.js', '/bext/pub/lib.js', '/bext/vpn/bg/svc.js', '/bext/vpn/bg/mode.js', '/util/storage.js', '/bext/vpn/bg/rule.js', '/bext/vpn/bg/vpn.js', '/bext/vpn/bg/tabs.js', '/bext/vpn/bg/info.js', '/bext/vpn/bg/premium.js', '/bext/vpn/util/util.js', 'zon_config', 'conf'], function (exports, _underscore, _backbone, _etask, _zerr, _util, _util3, _lib, _svc, _mode, _storage, _rule, _vpn, _tabs, _info, _premium, _util5, _zon_config, _conf) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _zerr2 = _interopRequireDefault(_zerr);var _util2 = _interopRequireDefault(_util);var _util4 = _interopRequireDefault(_util3);var _lib2 = _interopRequireDefault(_lib);var _svc2 = _interopRequireDefault(_svc);var _mode2 = _interopRequireDefault(_mode);var _storage2 = _interopRequireDefault(_storage);var _rule2 = _interopRequireDefault(_rule);var _vpn2 = _interopRequireDefault(_vpn);var _tabs2 = _interopRequireDefault(_tabs);var _info2 = _interopRequireDefault(_info);var _premium2 = _interopRequireDefault(_premium);var _util6 = _interopRequireDefault(_util5);var _zon_config2 = _interopRequireDefault(_zon_config);var _conf2 = _interopRequireDefault(_conf);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}



















        _util6.default.assert_bg('be_ccgi');
        const E = new _backbone2.default.model(),chrome = window.chrome;

        E.init = be_ext => {
            if (E.inited)
            return;
            E.inited = true;
            E.init_ts = Date.now();
            E.sp = _util6.default.new_etask('be_ccgi');
            E.be_ext = be_ext;
            E.be_mode = _mode2.default;
            E.listening = false;
            start_listen();
            E.on('destroy', E.uninit);
        };

        E.uninit = () => {
            E.sp.return();
            stop_listen();
        };

        function start_listen() {
            if (E.listening)
            return;
            chrome.runtime.onMessage.addListener(ccgi_ipc_handler);
            E.listening = true;
        }

        function stop_listen() {
            if (!E.listening)
            return;
            chrome.runtime.onMessage.removeListener(ccgi_ipc_handler);
            E.listening = false;
        }

        function send_msg(msg, resp_cb) {
            try {return resp_cb(msg);}
            catch (e) {
                _lib2.default.perr_err({ id: 'be_ccgi_send_err', info: msg.id, err: e,
                    filehead: _zerr2.default.json(msg) });
            }
        }

        function ccgi_resp(msg, resp_cb) {
            _underscore2.default.defer(send_msg, msg, resp_cb);
            return true;
        }

        function ccgi_ipc_handler(msg, sender, resp_cb) {
            if (msg._type && msg._type != 'ccgi')
            return;
            switch (msg.id) {

                case 'callback':
                    msg.data = {
                        init_ts: E.init_ts,
                        install_ts: _storage2.default.get_int('install_ts'),
                        connected: E.be_ext.get('enabled'),
                        disable: !E.be_ext.get('enabled'),
                        uuid: E.be_ext.get('uuid'),
                        session_key: E.be_ext.get('session_key') || 0,
                        ver: _util2.default.version(),
                        mode: E.be_mode.get('mode'),
                        mode_duration: Date.now() - E.be_mode.get('ts'),
                        pending: E.be_mode.get('pending'),
                        type: _conf2.default.type,
                        browser: _util2.default.browser(),
                        release: _zon_config2.default._RELEASE,
                        svc_mode: _mode2.default.get('mode'),
                        svc_mode_pending: _mode2.default.get('pending'),
                        svc_info: E.be_mode.get('svc.info'),
                        build_info: _util2.default.build_info() };

                    return ccgi_resp(msg, resp_cb);
                case 'enable':E.be_ext.set('enabled', !!msg.data);break;
                case 'ping':
                    msg.data = {
                        uuid: E.get('uuid'),
                        session_key: E.get('session_key') || 0,
                        ver: _util2.default.version(),
                        type: _conf2.default.type,
                        browser: E.get('browser') };

                    return ccgi_resp(msg, resp_cb);
                case 'opts_set':_util2.default.zopts.set(msg.data.key, msg.data.val);break;
                case 'open_be_tab':_util4.default.open_be_tab(msg.opt);break;}

            if (!_vpn2.default.get('inited'))
            {
                _zerr2.default.notice('skip msg.id %s, be_vpn not inited', msg.id);
                return;
            }
            switch (msg.id) {

                case 'svc_callback':
                    msg.data = null;
                    E.sp.spawn((0, _etask2.default)({ name: 'svc_callback', cancel: true }, function* () {
                        try {
                            const r = yield _svc2.default.callback({ raw: 1 });
                            r.from_be = true;
                            msg.data = r;
                            ccgi_resp(msg, resp_cb);
                        } catch (e) {ccgi_resp(msg, resp_cb);}
                    }));
                    return true;
                case 'update_rules':
                    msg.data = {};
                    try {_rule2.default.trigger('fetch_rules', false);} catch (e) {}
                    return ccgi_resp(msg, resp_cb);
                case 'vpn_enable': 
                    msg.data = {};
                    E.sp.spawn((0, _etask2.default)({ name: 'vpn_enable', cancel: true }, [function () {
                    }, function catch$(err) {return msg.data.err = '' + err;
                    }, function finally$() {return ccgi_resp(msg, resp_cb);}]));
                    return true;
                case 'perr':
                    _lib2.default.perr(_zerr2.default.L.NOTICE, { id: msg.perr_id,
                        info: JSON.parse(msg.info) });
                    break;
                case 'set_rule':
                    msg.data = {};
                    E.sp.spawn((0, _etask2.default)({ name: 'set_rule', cancel: true }, function* () {
                        try {return yield _rule2.default.set_rule(msg.opt);}
                        catch (err) {return msg.data.err = '' + err;
                        } finally {
                            if (!msg.no_resp)
                            ccgi_resp(msg, resp_cb);
                        }
                    }));
                    return !msg.no_resp;
                case 'fetch_rules':
                    msg.data = {};
                    E.sp.spawn((0, _etask2.default)({ name: 'fetch_rules', cancel: true }, function* () {
                        try {
                            yield _rule2.default.update_rules();
                            return msg.data.rules = yield _rule2.default.get('rules');
                        } catch (err) {return msg.data.err = '' + err;
                        } finally {
                            if (!msg.no_resp)
                            ccgi_resp(msg, resp_cb);
                        }
                    }));
                    return !msg.no_resp;
                case 'enable_root_url':
                    msg.data = {};
                    E.sp.spawn((0, _etask2.default)({ name: 'enable_root_url', cancel: true }, function* () {
                        try {
                            return msg.data.rule = yield _vpn2.default.enable_root_url(msg.opt);
                        } catch (e) {return msg.data.err = '' + e;
                        } finally {
                            if (!msg.no_resp)
                            ccgi_resp(msg, resp_cb);
                        }
                    }));
                    return !msg.no_resp;
                case 'refresh_membership':
                    _premium2.default.schedule_refresh_user(
                    Object.assign({ force_premium: true }, msg.data));
                    break;
                case 'get_log': break;
                case 'set_dont_show_again':
                    try {E.sp.spawn(_info2.default.set_dont_show_again(msg.data));}
                    catch (e) {}
                    break;
                case 'force_suggestion':
                    E.sp.spawn((0, _etask2.default)({ name: 'force_suggestion', cancel: true }, function* () {
                        try {
                            return yield _tabs2.default.set_force_suggestion(
                            msg.tab_id || sender.tab.id, true);
                        } catch (e) {return msg.data.err = '' + e;
                        } finally {
                            if (!msg.no_resp)
                            ccgi_resp(msg, resp_cb);
                        }
                    }));
                    return !msg.no_resp;
                default:(0, _zerr2.default)('unknown ccgi message ' + _zerr2.default.json(msg));}

        }exports.default =

        E;});})();
//# sourceMappingURL=ccgi.js.map
