// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', '/bext/pub/backbone.js', '/util/etask.js', '/bext/pub/util.js', '/bext/vpn/bg/util.js', '/util/zerr.js', '/bext/pub/browser.js', '/bext/pub/lib.js', '/util/escape.js', '/util/version_util.js', '/util/storage.js', '/util/ajax.js', '/util/util.js', '/util/date.js', '/bext/pub/ga.js', '/bext/vpn/bg/tabs.js', '/bext/vpn/bg/bg_ajax.js', '/bext/vpn/bg/icon.js', '/bext/pub/ext.js', '/bext/vpn/bg/rule.js', '/bext/vpn/bg/premium.js', '/bext/vpn/bg/dev_mode.js', '/bext/vpn/bg/trial.js', '/bext/vpn/bg/ccgi.js', '/bext/vpn/bg/vpn.js', '/svc/vpn/pub/unblocker_lib.js', '/bext/vpn/bg/info.js', '/bext/vpn/util/util.js', '/bext/vpn/bg/mode.js', '/bext/vpn/bg/tpopup.js', 'conf', '/bext/vpn/bg/bext_config.js', '/bext/vpn/bg/tab_unblocker.js', '/svc/vpn/pub/util.js', 'cookie', '/bext/vpn/bg/ui_api.js', '/bext/vpn/bg/pac_engine.js'], function (exports, _underscore, _backbone, _etask, _util, _util3, _zerr, _browser, _lib, _escape, _version_util, _storage, _ajax, _util5, _date, _ga, _tabs, _bg_ajax, _icon, _ext, _rule, _premium, _dev_mode, _trial, _ccgi, _vpn, _unblocker_lib, _info, _util7, _mode, _tpopup, _conf, _bext_config, _tab_unblocker, _util9, _cookie, _ui_api, _pac_engine) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _util2 = _interopRequireDefault(_util);var _util4 = _interopRequireDefault(_util3);var _zerr2 = _interopRequireDefault(_zerr);var _browser2 = _interopRequireDefault(_browser);var _lib2 = _interopRequireDefault(_lib);var _escape2 = _interopRequireDefault(_escape);var _version_util2 = _interopRequireDefault(_version_util);var _storage2 = _interopRequireDefault(_storage);var _ajax2 = _interopRequireDefault(_ajax);var _util6 = _interopRequireDefault(_util5);var _date2 = _interopRequireDefault(_date);var _ga2 = _interopRequireDefault(_ga);var _tabs2 = _interopRequireDefault(_tabs);var _bg_ajax2 = _interopRequireDefault(_bg_ajax);var _icon2 = _interopRequireDefault(_icon);var _ext2 = _interopRequireDefault(_ext);var _rule2 = _interopRequireDefault(_rule);var _premium2 = _interopRequireDefault(_premium);var _dev_mode2 = _interopRequireDefault(_dev_mode);var _trial2 = _interopRequireDefault(_trial);var _ccgi2 = _interopRequireDefault(_ccgi);var _vpn2 = _interopRequireDefault(_vpn);var _unblocker_lib2 = _interopRequireDefault(_unblocker_lib);var _info2 = _interopRequireDefault(_info);var _util8 = _interopRequireDefault(_util7);var _mode2 = _interopRequireDefault(_mode);var _tpopup2 = _interopRequireDefault(_tpopup);var _conf2 = _interopRequireDefault(_conf);var _bext_config2 = _interopRequireDefault(_bext_config);var _tab_unblocker2 = _interopRequireDefault(_tab_unblocker);var _util10 = _interopRequireDefault(_util9);var _cookie2 = _interopRequireDefault(_cookie);var _ui_api2 = _interopRequireDefault(_ui_api);var _pac_engine2 = _interopRequireDefault(_pac_engine);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}






































        _util8.default.assert_bg('be_bg_main');
        if (!_util6.default.is_mocha())
        _etask2.default.set_zerr(_zerr2.default);
        _zerr2.default.set_exception_handler('be', _lib2.default.err);
        _zerr2.default.on_unhandled_exception = function (err) {
            (0, _zerr2.default)('unhandled_exception %s', err && err.stack);
            _lib2.default.perr_err({ id: 'unhandled_exception', err: err,
                rate_limit: { count: 2 } });
        };

        const chrome = window.chrome;
        const assign = Object.assign;
        const browser = _util2.default.browser();
        let last_use;
        let new_uuid, reused_uuid;

        const E = new (_backbone2.default.model.extend({
            model_name: 'bg_main',
            _defaults: function () {
                this.on('install', on_install);
                this.on('update', on_update);
                this.on('up', on_up);
                this.on('destroy', () => E.uninit());
                this.set('ver', _conf2.default.version);
                window.addEventListener('unload', () => E._destroy());
            } }))();


        E.be_util = _util2.default;
        E.zerr = window.hola.zerr = _zerr2.default;
        E.be_browser = _browser2.default;
        E.be_lib = _lib2.default;
        E.be_tabs = _tabs2.default;
        E.tabs = _tabs2.default; 
        E.be_ext = _ext2.default;
        E.be_vpn = _vpn2.default;
        E.etask = _etask2.default;
        E.unblocker_lib = _unblocker_lib2.default;
        E.be_dev_mode = _dev_mode2.default;
        E.be_info = _info2.default;
        E.pac_engine = _pac_engine2.default;
        E.be_rule = _rule2.default;
        E.be_premium = _premium2.default;
        E.be_mode = _mode2.default;
        E.be_trial = _trial2.default;
        E.be_tpopup = _tpopup2.default;
        E.be_util.rmt = E; 

        function get_post_install_url() {
            return _escape2.default.uri('https://hola.org/unblock/install',
            { ext_ver: _util2.default.version(), uuid: E.get('uuid') });
        }

        const send_install_perr = () => (0, _etask2.default)(function* _send_install_perr() {
            if (!E.install_ts || !E.get('agree_ts') || E.install_perr_ts)
            return;
            let info = {},now = Date.now(),url = get_post_install_url();
            E.install_perr_ts = now;
            _zerr2.default.notice('open post insall page %s', url);
            _util4.default.open_hola_tab({ url, force_active: true });
            if (_util6.default.get(chrome, 'runtime.getManifest'))
            info = _util6.default.pick(chrome.runtime.getManifest(), 'permissions');
            _util6.default.if_set(new_uuid, info, 'new_uuid');
            _util6.default.if_set(reused_uuid, info, 'reused_uuid');
            let cookies = (yield _etask2.default.cb_apply(chrome.cookies.getAll,
            [{ domain: '.hola.org' }])) || [];
            let be_usage = (cookies.find(c => c.name == 'be_usage') || {}).value;
            if (be_usage)
            {
                try {
                    info.be_usage = JSON.parse(decodeURIComponent(be_usage));
                } catch (err) {_lib2.default.err('be_usage_parse_err', '', err);}
            }
            _lib2.default.ok('install', info);
            _storage2.default.set('install_perr_ts', now);
        });

        E.t = { get_post_install_url, send_install_perr };

        E.ga_send = (type, opt) => {
            let cb = () => {
                switch (type) {

                    case 'event':_ga2.default.event(opt.cat, opt.act, opt.lab, opt.val);break;
                    case 'checkout':_ga2.default.ec_checkout(opt.step, opt.option);break;
                    case 'impression_view':
                        _ga2.default.ec_impression_view(opt.list, opt.products);
                        break;
                    default:return;}

            };
            if (E.get('ga_inited'))
            cb();else

            E.once('change:ga_inited', cb);
        };

        function on_install() {
            E.install_ts = Date.now();
            _storage2.default.set('install_ts', window.hola.t.l_start);
            _storage2.default.set('install_version', _util2.default.version());
            _ext2.default.set('install_version', _util2.default.version());
            E.ga_send('checkout', { step: 3, option: _util2.default.version() });
            send_install_perr();
        }
        function on_update(prev) {
            _lib2.default.ok('update', prev + ' > ' + _util2.default.version());
            _storage2.default.set('update_ts', window.hola.t.l_start);
        }
        function on_up() {_lib2.default.ok('up');}

        function ccgi_init() {
            _ccgi2.default.init(_ext2.default);
            chrome.tabs.query({ url: _conf2.default.hola_match }, tabs => _underscore2.default.each(tabs, tab => {
                chrome.tabs.executeScript(tab.id, { file: '/js/bext/vpn/bg/cs_hola.js',
                    runAt: 'document_start' });
            }));
        }

        function get_uuid() {
            return (0, _etask2.default)({ name: 'get_uuid', cancel: true }, function* () {
                try {
                    const ret = yield _etask2.default.all({ allow_fail: true }, {
                        local: _util4.default.storage_local_get('uuid'),
                        localStorage: (0, _etask2.default)(function* get_uuid_local_storage_() {
                            return yield localStorage.getItem('uuid');}),
                        cookie: (0, _etask2.default)(function* () {
                            return yield _cookie2.default.get('uuid');}),
                        ccgi: _etask2.default.cb_apply(!_util6.default.is_mocha() && chrome.cookies,
                        '.get', [{ url: _conf2.default.url_ccgi, name: 'uuid' }]) });

                    get_uuid.last_error = collect_errors(ret);
                    const uuid = _util6.default.get(ret, 'local.uuid') || ret.localStorage ||
                    ret.cookie || _util6.default.get(ret, 'ccgi.value');
                    if (!uuid)
                    return;
                    _util8.default.assert(typeof uuid == 'string' && uuid.length >= 8,
                    new Error('invalid_uuid'));
                    if (uuid != _util6.default.get(ret, 'local.uuid') || uuid != ret.localStorage ||
                    uuid != ret.cookie || uuid != _util6.default.get(ret, 'ccgi.value'))
                    {
                        reused_uuid = true;
                        _lib2.default.ok('uuid_storage_mismatch', { uuid, ret });
                    }
                    return uuid;
                } catch (err) {
                    _lib2.default.perr_err({ id: 'unreachable', info: 'get_uuid', err });
                }
            });
        }

        function persist_uuid(uuid) {
            return (0, _etask2.default)({ name: 'persist_uuid' }, function* () {
                try {
                    const ret = yield _etask2.default.all({ allow_fail: true }, {
                        local: _util4.default.storage_local_set({ uuid }),
                        localStorage: (0, _etask2.default)(function* persist_uuid_ls_() {
                            yield localStorage.setItem('uuid', uuid);}),
                        cookie: (0, _etask2.default)(function* persist_uuid_cookie_() {
                            yield _cookie2.default.set('uuid', uuid,
                            { expires: 36500, path: '/' });
                        }) });

                    persist_uuid.last_error = collect_errors(ret);
                    return _underscore2.default.isEmpty(ret);
                } catch (err) {
                    _lib2.default.perr_err({ id: 'unreachable', info: 'persist_uuid', err });
                }
            });
        }

        function collect_errors(ret) {
            var arr = [];
            _underscore2.default.each(ret, (v, k) => {
                if (!_etask2.default.is_err(v))
                return;
                var e = {};
                e[k] = '' + v.error;
                arr.push(e);
            });
            return arr;
        }

        E.gen_uuid = () => {
            var buf = new Uint8Array(16),uuid = '';
            window.crypto.getRandomValues(buf);
            for (var i = 0; i < buf.length; i++)
            uuid += (buf[i] <= 0xf ? '0' : '') + buf[i].toString(16);
            return uuid;
        };

        function ensure_uuid() {
            let uuid;
            return (0, _etask2.default)({ name: 'ensure_uuid', cancel: true }, function* ensure_uuid_() {
                let _uuid = yield get_uuid();
                if (_uuid)
                {
                    E.sp.spawn(persist_uuid(_uuid));
                    return this.return(_uuid);
                }
                new_uuid = true;
                _uuid = yield E.gen_uuid();
                _zerr2.default.assert(_uuid, 'gen_uuid() returned: ' + _uuid);
                const ret = yield persist_uuid(uuid = _uuid);
                if (ret) 
                    {
                        uuid = 't.' + uuid.substr(2);
                        _lib2.default.perr_err({ id: 'init_tmp_uuid', info: { uuid: uuid } });
                        return this.return(uuid);
                    }
                _uuid = yield get_uuid();
                if (uuid != _uuid)
                _lib2.default.perr_err({ id: 'uuid_storage_set_err', info: { uuid, _uuid } });
                return uuid;
            });
        }

        const handle_install = () => (0, _etask2.default)(function* handle_install_() {
            try {
                if (!E.get('install_reason'))
                yield _etask2.default.sleep(1000);
                const reason = E.get('install_reason');
                _zerr2.default.notice('bg_main startup ' + reason);
                if (new_uuid && reason != 'install')
                _lib2.default.perr_err({ id: 'switch_uuid_err', info: { reason } });
                if (!['install', 'update'].includes(reason))
                return;
                E.trigger(reason, _storage2.default.get('ver')); 
                _storage2.default.set('ver', _util2.default.version());
            } catch (err) {
                _lib2.default.perr_err({ id: 'handle_install_err', err });
            }
        });

        E.set_rule_use = (rule, is_mitm) => {
            var name = rule.name || rule.host,now = Date.now();
            var d = now - E.uninstall_url_cb.ts;
            var update = !last_use || last_use && last_use.name != name ||
            d > 15 * _date2.default.ms.MIN;
            last_use = { name: name, ts: now, is_mitm: is_mitm };
            if (update || d > _date2.default.ms.HOUR)
            E.uninstall_url_cb();
        };

        E.uninstall_url_cb = function uninstall_url_cb() {
            var now = Date.now();
            E.uninstall_url_cb.ts = now;
            var qs = { perr: 1, uuid: E.get('uuid'), browser,
                version: _util2.default.version() };
            if (last_use && now - last_use.ts < 15 * _date2.default.ms.MIN)
            {
                qs.last = btoa(last_use.name);
                if (last_use.is_mitm)
                qs.mitm = 1;
            }
            var ms;
            if (ms = _util2.default.get_install_ms())
            qs.inst_ms = ms;
            var url = _conf2.default.url_ccgi + '/uninstall?' + _escape2.default.qs(qs);
            url = url.substr(0, 255); 
            if (_util6.default.get(chrome, 'runtime.setUninstallURL'))
            chrome.runtime.setUninstallURL(url);
        };

        E.get_agree_ts = () => {
            if (!_conf2.default.check_agree_ts)
            return 1;
            var ver_install = _ext2.default.get('install_version');
            if (ver_install && _version_util2.default.cmp(ver_install, '1.131.737') < 0)
            return 1;
            return _storage2.default.get('agree_ts');
        };

        E.set_agree_ts = val => {
            E.set('agree_ts', val);
            _storage2.default.set('agree_ts', val);
        };

        function set_upgrade_ext_interval() {
            _util8.default.clear_interval(set_upgrade_ext_interval.interval);
            _util4.default.upgrade_ext();
            set_upgrade_ext_interval.interval = _util8.default.set_interval(
            _util4.default.upgrade_ext, 24 * _date2.default.ms.HOUR, { sp: E.sp });
        }
        function ajax_do_op(o) {
            var op = _util6.default.get(o, 'op');
            if (!op)
            return;
            switch (op) {

                case 'reload_ext':
                    _zerr2.default.notice('do_op_reload_ext ' + _zerr2.default.json(o));
                    _lib2.default.perr_ok({ id: 'be_reload_ext_ajax_op' });
                    _util8.default.set_timeout(() => _util2.default.reload_ext_native(),
                    500); 
                    break;
                case 'upgrade_ext':
                    _zerr2.default.notice('do_op_upgrade_ext ' + _zerr2.default.json(o));
                    _util4.default.upgrade_ext();
                    break;
                default:(0, _zerr2.default)('unknown op ' + _zerr2.default.json(o));break;}

        }

        function storage_err_cb() {
            if (!_util2.default.get('storage.err'))
            return;
            E.stopListening(_util2.default, 'change:storage.err', storage_err_cb);
            var last = _util2.default.get('storage.last_error');
            _lib2.default.perr_err({ id: 'be_storage_err',
                info: last && last.api + ' ' + last.key, err: last && last.err });
        }

        function dev_mode_cb() {
            const level = _ext2.default.get('dev_mode') ? 'NOTICE' : 'WARN';
            _util8.default.set_dbg_conf('debug.zerr', { level });
            _zerr2.default.set_level(level);
        }

        function debug_cb() {
            _zerr2.default.set_level(_util6.default.get(_ext2.default.get('debug.zerr'), 'level'));
        }

        E.init = function (opt) {
            if (E.inited)
            return;
            opt = opt || {};
            assert_no_listeners();
            E.inited = (E.inited || 0) + 1;
            _util2.default.set_bext_config_cb(() => _ext2.default.get('bext_config'));
            _ext2.default.set('install_version', _storage2.default.get('install_version'));
            E.set_perr(opt => {_lib2.default.perr_err(opt);});
            E.set('agree_ts', E.get_agree_ts());
            E.sp = _util8.default.new_etask('be_bg_main');
            _ajax2.default.do_op = ajax_do_op;
            _browser2.default.init();
            E.listen_to(_util2.default, 'change:storage.err', storage_err_cb);
            _tabs2.default.init();
            _ext2.default.init();
            ccgi_init();
            _premium2.default.init(_rule2.default);
            _trial2.default.init(_rule2.default);
            _dev_mode2.default.init();
            _ui_api2.default.init(E);
            _storage2.default.clr('ajax_timeout');
            _storage2.default.clr('be_ajax_simulator');
            E.on('change:inited', inited_cb);
            E.on_init('change:agree_ts', send_install_perr);
            if (_util6.default.get(chrome, 'runtime.setUninstallURL'))
            E.on_init('change:uuid change:cid', E.uninstall_url_cb);
            E.on('change:agree_ts', active_cb);
            E.listen_to(_ext2.default, 'change:session_key change:enabled ' +
            'change:ext.conflict change:uuid', active_cb);
            E.listen_to(_ext2.default, 'change:debug.zerr', debug_cb);
            E.listen_to(_ext2.default, 'change:dev_mode', dev_mode_cb);
            start_monitor_worker();
            _vpn2.default.set_bext_config(_storage2.default.get_json('bext_config_last') || _bext_config2.default);
            const install_reason = _util6.default.get(opt, 'install_details.reason', '');
            if (install_reason)
            E.set('install_reason', install_reason);
            E.sp.spawn((0, _etask2.default)(function* init_() {
                try {
                    const uuid = yield ensure_uuid();
                    _zerr2.default.notice('uuid: ' + uuid);
                    E.set('uuid', uuid); 
                    _ext2.default.set('uuid', uuid);
                    E.sp.spawn(handle_install());
                    E.trigger('up');
                    E.set('inited', true);
                } catch (err) {_lib2.default.err('init_err', null, err);} finally
                {
                    const get = get_uuid.last_error || [];
                    const set = persist_uuid.last_error || [];
                    if (!get.length && !set.length)
                    return;
                    _lib2.default.perr_err({ id: 'uuid_storage_err',
                        info: _zerr2.default.json({ get, set }) });
                }
            }));
            set_upgrade_ext_interval();
        };

        E.uninit = function () {
            if (!E.inited)
            return;
            _lib2.default.ok('bg_main_uninit', { stack: new Error('bg_uninit').stack,
                reload_ext: _storage2.default.get_json('reload_ext') });
            _lib2.default.perr_ok({ id: 'bg_main_uninit_log', with_log: true,
                info: { stack: new Error('bg_uninit').stack,
                    reload_ext: _storage2.default.get_json('reload_ext') } });
            E.sp.return();
            E.off(); 
            E.stopListening();
            set_upgrade_ext_interval.interval = _util8.default.clear_interval(
            set_upgrade_ext_interval.interval);
            if (_util6.default.is_mocha())
            {
                _vpn2.default.uninit();
                _premium2.default.uninit();
                _trial2.default.uninit();
                _icon2.default.uninit();
                _bg_ajax2.default.uninit();
                _ccgi2.default.uninit();
                _ext2.default.uninit();
                _tabs2.default.uninit();
                _dev_mode2.default.uninit();
                _ui_api2.default.uninit();
                _browser2.default.uninit();
            } else

            {
                _vpn2.default._destroy();
                _premium2.default._destroy();
                _trial2.default._destroy();
                _icon2.default._destroy();
                _bg_ajax2.default._destroy();
                _ccgi2.default._destroy();
                _ext2.default._destroy();
                _tabs2.default._destroy();
                _dev_mode2.default._destroy();
                _ui_api2.default._destroy();
                _browser2.default._destroy();
            }
            E.inited = false;
            E.clear();
            assert_no_listeners();
        };

        function assert_no_listeners() {
            _vpn2.default.assert_no_listeners();
            _premium2.default.assert_no_listeners();
            _trial2.default.assert_no_listeners();
            _icon2.default.assert_no_listeners();
            _bg_ajax2.default.assert_no_listeners();
            _ccgi2.default.assert_no_listeners();
            _ext2.default.assert_no_listeners();
            _tabs2.default.assert_no_listeners();
            _dev_mode2.default.assert_no_listeners();
            _rule2.default.assert_no_listeners();
        }

        function inited_cb() {
            if (!E.get('inited'))
            return;
            E.off('change:inited', inited_cb);
            (0, _etask2.default)(function* inited_cb_() {
                try {
                    const state = yield _storage2.default.get('ext_state');
                    E.set('enabled', state != 'disabled'); 
                    _ext2.default.set('enabled', state != 'disabled');
                    _icon2.default.init();
                    _bg_ajax2.default.init(_tab_unblocker2.default);
                    E.listen_to(_ext2.default, 'change:uuid change:session_key',
                    background_init);
                    E.on('recover', background_init);
                } catch (err) {_lib2.default.err('be_bg_main_init_err', '', err);}
            });
        }

        function active_cb() {
            let active = _ext2.default.get('enabled') && !_ext2.default.get('ext.conflict') &&
            !(_conf2.default.check_agree_ts && !E.get('agree_ts')) &&
            _ext2.default.get('uuid') && _ext2.default.get('session_key');
            _ext2.default.safe_set({ 'ext.active': !!active });
        }

        E.ok = (id, info) => _lib2.default.ok(id, info);
        E.err = (id, info, err) => _lib2.default.err(id, info, err);

        E.set_enabled = on => {
            if (!!E.get('enabled') == !!on)
            return;
            return (0, _etask2.default)(function* set_enabled_() {
                try {
                    E.set('enabled', !!on);
                    _ext2.default.set('enabled', !!on); 
                    return yield _storage2.default.set('ext_state', on ? 'enabled' : 'disabled');
                } catch (err) {
                    _lib2.default.err('be_bg_main_set_enable_err', null, err);
                }
            });
        };

        const background_init_ajax = () => (0, _etask2.default)(function* _background_init_ajax() {
            let req = { retry: 1, method: 'POST', data: { login: 1,
                    ver: _util2.default.version() },
                qs: _util2.default.qs_ajax({ uuid: _ext2.default.get('uuid') }),
                url: _conf2.default.url_ccgi + '/background_init', with_credentials: true };
            try {return yield _bg_ajax2.default.ccgi_ajax(req);}
            catch (e) {_lib2.default.err('be_background_init_ccgi_failed', { req }, e);}
            req.url = 'https://client.svd-cdn.com/client_cgi/background_init';
            try {return yield _bg_ajax2.default.ccgi_ajax(req);}
            catch (e) {_lib2.default.err('be_background_init_svd_cdn_failed', { req }, e);}
            req.url = 'https://perr.hola.org/background_init';
            try {return yield _bg_ajax2.default.ccgi_ajax(req);}
            catch (e) {_lib2.default.err('be_background_init_perr_init_failed', { req }, e);}
            req.method = 'GET';
            try {return yield _bg_ajax2.default.ccgi_ajax(req);}
            catch (e) {_lib2.default.err('be_background_init_get_ccgi_failed', { req }, e);}
            req.url = 'https://client.svd-cdn.com/client_cgi/background_init';
            try {return yield _bg_ajax2.default.ccgi_ajax(req);}
            catch (e) {_lib2.default.err('be_background_init_get_svd_cdn_failed', { req }, e);}
            req.url = 'https://perr.hola.org/background_init';
            try {return yield _bg_ajax2.default.ccgi_ajax(req);}
            catch (e) {
                _lib2.default.err('be_background_init_get_perr_init_failed', { req }, e);
            }
            throw new Error('background_init_ajax failed');
        });

        const background_init = () => (0, _etask2.default)(function* _background_init() {
            let req;
            try {
                _zerr2.default.notice('background_init called %s', E.get('status'));
                if (E.get('status') == 'busy' || E.get('status') == 'ready')
                return this.return();
                if (!_ext2.default.get('uuid'))
                return this.return(void _zerr2.default.notice('background_init no uuid'));
                E.set('status', 'busy');
                let req = { retry: 1, method: 'POST', data: { login: 1,
                        ver: _util2.default.version() },
                    qs: _util2.default.qs_ajax({ uuid: _ext2.default.get('uuid') }),
                    url: _conf2.default.url_ccgi + '/background_init', with_credentials: true };
                let info = yield background_init_ajax(),t = window.hola.t;
                E.stopListening(_ext2.default, 'change:uuid change:session_key',
                background_init);
                _ext2.default.set('session_key', info.key);
                _vpn2.default.init();
                E.set('status', 'ready');
                t.r_init = Date.now();
                let start = t.new_ver || t.l_start,diff = t.r_init - start;
                _zerr2.default[diff > 2000 ? 'err' : 'notice'](diff > 20000 ? 'rmt_init_slow' :
                'background_init %sms', diff);
                _lib2.default.ok('be_background_init_ok', { diff, req });
                if (_storage2.default.get('reload_ext_ts'))
                {
                    _lib2.default.ok('be_recover_ok', { ts: _storage2.default.get('reload_ext_ts') });
                    _storage2.default.clr('reload_ext_ts');
                }
            } catch (e) {
                _lib2.default.err('be_background_init_err', { req }, e);
                E.set('status', 'error');
                if (_storage2.default.get('reload_ext_ts'))
                {
                    _lib2.default.err('be_recover_failed',
                    { ts: _storage2.default.get('reload_ext_ts') });
                    _storage2.default.clr('reload_ext_ts');
                }
            }
        });

        let dumped_errors = {};
        E.dump_errors = (tab_id, errors) => dumped_errors[tab_id] = errors;
        E.get_dumped_errors = tab_id => dumped_errors[tab_id];

        E.set_bug_id = bug_id => {
            _zerr2.default.warn('VPN BUG REPORT: http://web.hola.org/vpn_debug?id=' + bug_id);};

        function start_monitor_worker() {
            var worker = typeof ___webpack == 'undefined' ?
            new Worker('bext/vpn/bg/monitor_worker.js') :
            new Worker('/bext/vpn/bg/monitor_worker_webpack.js', { type: 'module' });
            worker.onmessage = e => {
                let data = e.data || {};
                switch (data.type) {

                    case 'ping':
                        var opt = { val: data.val, url: _conf2.default.url_perr,
                            perr: _lib2.default.perr_opt(_zerr2.default.L.ERR, { id: 'main_thread_stuck',
                                rate_limit: { count: 1 } }) };
                        var config = _ext2.default.get('bext_config');
                        if (config && config.monitor_worker)
                        assign(opt, config.monitor_worker);
                        worker.postMessage({ type: 'pong', opt });
                        break;
                    case 'push_event':
                        _util10.default.push_event(data.name, { duration: data.duration,
                            ts: data.ts });
                        break;
                    default:break;}

            };
        }

        E.reset_bg_ajax = () => {_bg_ajax2.default.trigger('reset');};exports.default =

        E;});})();
//# sourceMappingURL=bg_main.js.map
