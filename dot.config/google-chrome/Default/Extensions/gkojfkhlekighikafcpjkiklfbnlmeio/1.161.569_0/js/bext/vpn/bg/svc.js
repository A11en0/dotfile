// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', '/bext/pub/backbone.js', '/util/etask.js', '/bext/pub/lib.js', '/bext/pub/ext.js', '/util/util.js', 'underscore', '/util/date.js', '/util/zerr.js', '/svc/hola/pub/svc_ipc.js', '/svc/hola/pub/svc_monitor.js', '/util/escape.js', '/bext/vpn/bg/bg_ajax.js', 'conf'], function (exports, _backbone, _etask, _lib, _ext, _util, _underscore, _date, _zerr, _svc_ipc, _svc_monitor, _escape, _bg_ajax, _conf) {Object.defineProperty(exports, "__esModule", { value: true });var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _lib2 = _interopRequireDefault(_lib);var _ext2 = _interopRequireDefault(_ext);var _util2 = _interopRequireDefault(_util);var _underscore2 = _interopRequireDefault(_underscore);var _date2 = _interopRequireDefault(_date);var _zerr2 = _interopRequireDefault(_zerr);var _svc_ipc2 = _interopRequireDefault(_svc_ipc);var _svc_monitor2 = _interopRequireDefault(_svc_monitor);var _escape2 = _interopRequireDefault(_escape);var _bg_ajax2 = _interopRequireDefault(_bg_ajax);var _conf2 = _interopRequireDefault(_conf);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}













        const chrome = window.chrome;
        const E = new (_backbone2.default.task_model.extend({
            model_name: 'svc',
            _defaults: function () {this.on('destroy', () => E.uninit());} }))();


        function firefox_origin_fix(details) {
            if (details.requestHeaders.find(h => h.name.toLowerCase() == 'origin'))
            return;
            var fix = { name: 'Origin', value: 'resource://ff_ext-at-hola-dot-org' };
            return { requestHeaders: [fix].concat(details.requestHeaders) };
        }

        E.init = be_vpn => {
            if (_conf2.default.firefox_web_ext)
            {
                chrome.webRequest.onBeforeSendHeaders.addListener(
                firefox_origin_fix, { urls: ['*://127.0.0.1/*',
                    '*://localhost.h-local.org/*'] }, ['blocking', 'requestHeaders']);
            }
            E.svc_mon.init();
            E.listenTo(_ext2.default, 'change:bext_config', () => {
                let bext_config = _ext2.default.get('bext_config');
                let use_new_monitor = _util2.default.get(bext_config, 'svc.use_new_monitor');
                if (use_new_monitor && E.svc_mon != E.svc_mon_new ||
                !use_new_monitor && E.svc_mon != E.svc_mon_old)
                {
                    E.svc_mon.uninit();
                    E.svc_mon = use_new_monitor ? E.svc_mon_new : E.svc_mon_old;
                    E.svc_mon.init();
                }
            });
            if (!(E.be_vpn = be_vpn))
            return;
            E.listenTo(E.be_vpn, 'change:protect_pc', () => {
                if (!E.be_vpn.get('protect_pc'))
                return E.svc_mon.stop_watch_vpn_status();
                E.svc_mon.reset();
            });
        };

        E.uninit = () => {
            if (_conf2.default.firefox_web_ext)
            {
                chrome.webRequest.onBeforeSendHeaders.removeListener(
                firefox_origin_fix);
            }
            E.stopListening();
            E.svc_mon.uninit();
            E.clear();
        };

        E.svc_mon = E.svc_mon_old = (EE => {
            EE.init = () => {
                if (EE.inited)
                return;
                EE.monitor = (0, _etask2.default)('svc_init', function* svc_init_() {
                    while (true)
                    {
                        yield E.update_info();
                        yield _etask2.default.sleep(10 * _date2.default.ms.MIN);
                    }
                });
                EE.inited = true;
            };
            EE.reset = () => {
                EE.uninit();
                EE.init();
            };
            EE.watch_vpn_status = () => {
                if (EE.vs_sp)
                return;
                return EE.vs_sp = (0, _etask2.default)({ name: 'watch_vpn_status', cancel: true },
                function* watch_vpn_status_loop_()
                {
                    this.finally(() => {
                        set_status('ready', undefined);
                        EE.stop_watch_vpn_status();
                    });
                    while (true)
                    {
                        let status = yield EE.query_api('vpn_status', undefined,
                        { timeout: 30 * _date2.default.ms.SEC });
                        status = _util2.default.get(status, 'ret') || {};
                        yield parse_vpn_status(status);
                        yield _etask2.default.sleep(_ext2.default.get('is_premium') ? 1 * _date2.default.ms.SEC :
                        10 * _date2.default.ms.SEC);
                    }
                });
            };
            EE.stop_watch_vpn_status = () => {
                if (!EE.vs_sp)
                return;
                EE.vs_sp = void EE.vs_sp.return();
            };
            EE.query_api = (cmd, params, opt) => {
                params = params ? `?${_escape2.default.qs(params)}` : '';
                cmd = `${cmd}.json${params}`;
                return _svc_ipc2.default.ajax(Object.assign({ cmd }, opt));
            };
            EE.uninit = () => {
                if (!EE.inited)
                return;
                if (EE.monitor)
                {
                    EE.monitor.return();
                    EE.monitor = null;
                }
                EE.stop_watch_vpn_status();
                EE.inited = false;
            };

            return EE;})({});

        E.svc_mon_new = (EE => {
            EE.init = () => {
                if (EE.inited)
                return;
                _svc_monitor2.default.init({
                    components: ['vpn', 'client'],
                    detecting_start_interval: 1,
                    detecting_start_retries: 10,
                    detecting_interval: 600,
                    monitoring_interval: 60,
                    log: str => _zerr2.default.notice('svc_monitor: ' + str),
                    perr: (id, info) => _lib2.default.perr_ok({ id, info }),
                    watch: data => E.update_info(() => transform_callback_data(data)) });

                EE.inited = true;
            };
            EE.reset = () => _svc_monitor2.default.refresh_info();
            EE.watch_vpn_status = () => {
                if (EE.vs_watching)
                return;
                let monitoring_interval = _ext2.default.get('is_premium') ? 1 : 10;
                _svc_monitor2.default.reconf({ monitoring_interval });
                EE.vs_watching = true;
            };
            EE.stop_watch_vpn_status = () => {
                if (!EE.vs_watching)
                return;
                _svc_monitor2.default.reconf({ monitoring_interval: 60 });
                EE.vs_watching = false;
            };
            EE.query_api = (cmd, params) => _svc_monitor2.default.exec(cmd, params);
            EE.uninit = () => {
                if (!EE.inited)
                return;
                _svc_monitor2.default.uninit();
                EE.inited = false;
            };
            return EE;})({});

        const transform_callback_data = data => {
            if (!data)
            throw 'no data';
            let ret = { status: {} };
            ret.raw = data;
            if (data.connected_js)
            ret.proxyjs_connected = true;
            if (data.full_vpn)
            ret.status.full_vpn = data.full_vpn;
            return Object.assign(ret, {
                cid_js: data.cid_js || '',
                version: data.ver || '0.0.0',
                os_ver: data.os_ver,
                session_key_js: data.session_key_js,
                user_token: data.user_token,
                sync_token: data.sync_token || '',
                svc: 1 });

        };

        E.update_info = provider => (0, _etask2.default)('update_info', function* update_info_() {
            try {
                const info = provider ? provider() : yield E.callback();
                if (info && E.be_vpn && E.be_vpn.get('protect_pc'))
                {
                    if (info.svc)
                    {
                        if (info.status.full_vpn)
                        parse_vpn_status(info.status.full_vpn);
                        E.svc_mon.watch_vpn_status();
                    } else

                    E.svc_mon.stop_watch_vpn_status();
                }
                if (_underscore2.default.isEqual(info, E.get('info')))
                return info;
                let change = {};
                change.info = info;
                change.cid_js = info.cid_js;
                change.proxyjs_connected = info.proxyjs_connected;
                change.version = info.version;
                change.session_key_cid_js = info.session_key_js;
                change.user_token = info.user_token;
                change.sync_token = info.sync_token || '';
                change.callback_raw = info.raw;
                change.callback_ts = (0, _date2.default)();
                E.safe_set(change);
                return info;
            } catch (e) {
                E.safe_set({
                    info: null,
                    cid_js: '',
                    session_key_cid_js: 0,
                    sync_token: '',
                    callback_raw: null,
                    callback_ts: null,
                    version: null });

            }
        });

        E.callback = function (opt) {
            opt = opt || {};
            window.disable_svc_polling = window.disable_svc_polling || 0;
            return (0, _etask2.default)('callback', [function try_catch$() {
                if (window.disable_svc_polling || !_ext2.default.get('ext.active'))
                return this.return(_etask2.default.err('not running'));
                return E.svc_mon.query_api('callback', opt.full_vpn && { vpn: 1 });
            }, function (ret) {
                let data = ret && ret.ret;
                if (this.error || !data)
                {
                    console.log('Use window.disable_svc_polling = 1 to stop polling');
                    return this.return(_etask2.default.err('not running'));
                }
                if (opt.raw)
                return this.return(data);
                data = transform_callback_data(data);
                return this.return(data);
            }]);
        };

        const ensure_vpn_info = () => {
            return (0, _etask2.default)({ name: 'ensure_vpn_info' }, [function try_catch$() {
                return _bg_ajax2.default.hola_api_call('users/ensure_vpn_info');
            }, function (info) {
                if (this.error || !info)
                {
                    return void _lib2.default.perr(_zerr2.default.L.ERR, { id: 'ensure_vpn_info_fail',
                        info: _zerr2.default.e2s(this.error) });
                }
                var vpn_info = _util2.default.pick(info, 'login', 'password');
                E.set('vpn_info', vpn_info);
                return vpn_info;
            }]);
        };

        const parse_vpn_status = status => (0, _etask2.default)(function* _parse_vpn_status() {
            let connecting = !!status.connecting_to;
            let connected = !!status.connected_to;
            let country = status.connecting_to || status.connected_to || '';
            let active = (connecting || status.disconnecting) && !connected;
            if (E.get('status') != 'ready' && connected)
            yield update_location();
            set_status(active ? 'busy' : 'ready', country.toLowerCase());
        });

        const set_status = (status, country) => {
            if (country !== undefined)
            {
                if (country == 'uk')
                country = 'gb';
                E.set('vpn_country', country);
            }
            E.set('status', status || 'ready');
            E.trigger('update_vpn_status');
        };

        E.vpn_connect = opt => (0, _etask2.default)(function* vpn_connect_() {
            try {
                opt = opt || {};
                const country = (opt.country || '').toLowerCase();
                const vpn_info = E.get('vpn_info') || (yield ensure_vpn_info());
                if (!vpn_info)
                return void set_status('ready', '');
                set_status('busy', country, 'vpn_connect');
                return yield E.svc_mon.query_api('vpn_connect',
                { host: country + '.vpn.hola.org', username: vpn_info.login,
                    password: vpn_info.password, country });
            } catch (e) {
                set_status('ready', '');
                _lib2.default.perr(_zerr2.default.L.ERR, { id: 'vpn_connect', info: _zerr2.default.e2s(e) });
            }
        });

        E.vpn_disconnect = () => (0, _etask2.default)(function* vpn_disconnect_() {
            this.finally(() => set_status());
            try {
                set_status('busy', '');
                return yield E.svc_mon.query_api('vpn_disconnect');
            } catch (e) {
                _lib2.default.perr(_zerr2.default.L.ERR, { id: 'vpn_disconnect', info: _zerr2.default.e2s(e) });
            }
        });

        E.vpn_change_agent = () => (0, _etask2.default)(function* vpn_change_agent_() {
            this.finally(() => set_status());
            try {
                set_status('busy');
                return yield E.svc_mon.query_api('vpn_change_agent');
            } catch (e) {
                _lib2.default.perr(_zerr2.default.L.ERR, { id: 'vpn_change_agent', info: _zerr2.default.e2s(e) });
            }
        });

        let ul_sp;
        function update_location() {
            if (ul_sp)
            return ul_sp;
            return ul_sp = (0, _etask2.default)({ name: 'update_location' }, function* call_myip_() {
                let res;
                for (let i = 0; i < 5; i++)
                {
                    try {
                        res = yield _bg_ajax2.default.hola_api_call('myip.json',
                        { timeout: 5 * _date2.default.ms.SEC });
                        break;
                    } catch (e) {
                        yield _etask2.default.sleep(_date2.default.ms.SEC);
                    }
                }
                ul_sp = undefined;
                return res;
            });
        }exports.default =


        E;});})();
//# sourceMappingURL=svc.js.map
