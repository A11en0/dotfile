// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', '/bext/pub/backbone.js', '/util/etask.js', '/bext/pub/ext.js', '/bext/pub/util.js', '/util/util.js', '/util/zerr.js', '/bext/pub/lib.js', '/util/date.js', '/bext/vpn/bg/bg_ajax.js', '/util/storage.js', '/bext/vpn/bg/svc.js', '/bext/vpn/util/util.js', '/svc/hola/pub/svc_ipc.js', '/util/url.js', '/util/version_util.js', 'conf'], function (exports, _underscore, _backbone, _etask, _ext, _util, _util3, _zerr, _lib, _date, _bg_ajax, _storage, _svc, _util5, _svc_ipc, _url, _version_util, _conf) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _ext2 = _interopRequireDefault(_ext);var _util2 = _interopRequireDefault(_util);var _util4 = _interopRequireDefault(_util3);var _zerr2 = _interopRequireDefault(_zerr);var _lib2 = _interopRequireDefault(_lib);var _date2 = _interopRequireDefault(_date);var _bg_ajax2 = _interopRequireDefault(_bg_ajax);var _storage2 = _interopRequireDefault(_storage);var _svc2 = _interopRequireDefault(_svc);var _util6 = _interopRequireDefault(_util5);var _svc_ipc2 = _interopRequireDefault(_svc_ipc);var _url2 = _interopRequireDefault(_url);var _version_util2 = _interopRequireDefault(_version_util);var _conf2 = _interopRequireDefault(_conf);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

















        _util6.default.assert_bg('be_info');
        const chrome = window.chrome;
        const E = new (_backbone2.default.task_model.extend({
            model_name: 'info',
            _defaults: function () {this.on('destroy', () => E.uninit());} }))();


        const on_location = _underscore2.default.debounce(() => {
            const location = E.get('location');
            E.set('country', location ? location.country : null);
            _storage2.default.set('src_country', E.get('country'));
        });

        E.init = () => {
            if (E.get('inited'))
            return;
            E.set('inited', true);
            E.set('vpn_work_yes', _storage2.default.get_int('vpn_work_yes'));
            E.set('vpn_last_rating', _storage2.default.get_int('vpn_last_rating'));
            E.set('rate_on_store', _storage2.default.get_int('rate_on_store'));
            E.set('location', _storage2.default.get_json('location'));
            E.sp = _util6.default.new_etask('be_info');
            E.on('recover', E.fetch_info);
            E.on_init('change:location', on_location);
            E.listen_to(_ext2.default, 'change:ext.active change:uuid', E.fetch_info);
            E.listen_to(_ext2.default, 'change:user_id', E.set_user_id);
            E.set('settings', _storage2.default.get_json('settings') || {});
            E.trigger('inited');
        };

        E.uninit = () => {
            if (!E.get('inited'))
            return;
            E.sp.return();
            E.off('change:location', on_location);
            E.off('recover', E.fetch_info);
            E.stopListening();
            E.clear();
        };

        function set_settings(settings) {
            settings = settings || {};
            _storage2.default.set_json('settings', settings);
            E.set('settings', settings);
        }

        E.get_unblocking_rate_url = (limit, src_country) => {
            src_country = (src_country || '').toLowerCase();
            const url = _conf2.default.url_ccgi + '/unblocking_rate';
            return _url2.default.qs_add(url, { src_country, limit });
        };

        E.get_unblocking_rate = (limit, src_country) => {
            src_country = (src_country || E.get('country') || '').toLowerCase();
            if (!src_country)
            return;
            return (0, _etask2.default)({ name: 'get_unblocker_rate', cancel: true },
            function* get_unblocking_rate_() {
                let err;
                for (let i = 0; i <= 1; i++)
                {
                    try {
                        return yield _bg_ajax2.default.ccgi_ajax({ url: _conf2.default.url_ccgi +
                            '/unblocking_rate', data: _util2.default.qs_ajax(
                            { src_country, limit }) });
                    } catch (error) {err = error;}
                }
                _lib2.default.perr_err({ id: 'be_unblocking_rate_err', err });
            });
        };

        E.efetch_info = () => {
            const local_settings = !!_storage2.default.get_json('settings') ||
            _version_util2.default.cmp(_ext2.default.get('install_version'), '1.128.350') > 0;
            return (0, _etask2.default)({ name: 'efetch_info', cancel: true }, function* efetch_info_() {
                try {
                    _zerr2.default.notice('be_info: fetch_info');
                    const info = yield _bg_ajax2.default.ccgi_ajax(
                    { url: _conf2.default.url_ccgi + '/fetch_info', qs: _ext2.default.auth(), retry: 1,
                        data: { settings: !local_settings } });
                    E.set('location', info.req);
                    _storage2.default.set_json('location', info.req);
                    if (!local_settings)
                    set_settings(info.settings);
                } catch (err) {
                    _lib2.default.perr_err({ id: 'be_info_fetch_info_err', err });
                    throw err;
                }
            });
        };
        E.fetch_info = () => E.trigger('fetch_info');
        E.on('fetch_info', () => {
            if (!E.set_busy({ desc: 'Configuring...' }))
            return E.schedule_clr(['fetch_info']);
            return E.sp.spawn((0, _etask2.default)({ name: 'fetch_info', cancel: true }, function* () {
                try {
                    yield E.efetch_info();
                    E.clr_busy();
                } catch (err) {
                    E.set_err();
                    _lib2.default.err('be_info_on_fetch_info_err', '', err);
                }
            }));
        });

        E.set_user_id = () => {E.trigger('set_user_id');};
        E.on('set_user_id', () => {
            var user_id = _ext2.default.get('user_id'),is_premium = _ext2.default.get('is_premium');
            if (user_id === undefined)
            return;
            return (0, _etask2.default)('set_user_id', function* set_user_id_() {
                try {
                    yield _svc2.default.update_info();
                    const sync_data = !_svc2.default.get('info') ? { missing_svc: true } :
                    yield _etask2.default.all({ token: get_user_sync_token() });
                    const sync_token = sync_data.token;
                    const missing_svc = sync_data.missing_svc;
                    yield _etask2.default.all({ allow_fail: true }, {
                        client: user_id && _bg_ajax2.default.ccgi_ajax({ qs: _ext2.default.auth(),
                            method: 'POST', url: _conf2.default.url_ccgi + '/set_user_client.json',
                            data: { user_id } }),
                        svc: !missing_svc &&
                        _svc_ipc2.default.ajax({ cmd: 'user_token_update.json?token=' + user_id + (
                            is_premium ? '&premium' : '') + (
                            sync_token ? '&sync=' + sync_token : '') }) });

                    if (user_id)
                    E.trigger('user_id_set');
                } catch (err) {_lib2.default.err('be_info_set_user_id_err', '', err);}
            });
        });

        function fix_dont_show(data, root_url) {
            var val = data[root_url];
            if (val && val.period)
            {
                data[root_url] = {};
                data[root_url][val.type || 'default'] = val;
                delete val.type;
            }
        }

        E.set_dont_show_again = opt => {
            opt = _util4.default.clone(opt);
            const root_url = opt.root_url;
            if (!root_url)
            return;
            const type = opt.type || 'default';
            if (opt.period == 'session')
            {
                const tabs = E.get('dont_show_tabs') || {};
                const tab = tabs['' + opt.tab_id] = tabs['' + opt.tab_id] || {};
                tab[type] = tab[type] || {};
                tab[type].n = (tab[type].n || 0) + 1;
                E.set('dont_show_tabs', tabs);
                return;
            }
            if (opt.period == 'default')
            opt.period = _util2.default.get_dont_show_def_period();
            var settings = E.get('settings') || {};
            var data = settings.dont_show = settings.dont_show || {};
            fix_dont_show(data, root_url);
            if (opt.unset)
            {
                if (data[root_url])
                delete data[root_url][type];
            } else

            {
                data[root_url] = data[root_url] || {};
                data[root_url][type] = { ts_user: _date2.default.to_sql(new Date()),
                    period: opt.period, src: opt.src };
            }
            set_settings(settings);
            E.trigger('change:settings');
            _lib2.default.perr_ok({ id: 'be_set_dont_show_again', info: opt });
        };

        function _is_dont_show(val, type) {
            if (val && !val.period)
            val = val[type];
            if (!val)
            return false;
            if (val.period == 'never')
            return true;
            const dur = val.period == 'default' ? _date2.default.ms.WEEK :
            _date2.default.str_to_dur(val.period);
            if (dur)
            return new Date() - _date2.default.from_sql(val.ts_user) < dur;
            return false;
        }

        E.is_dont_show = (tab_id, root_url, type) => {
            type = type || 'default';
            const dont_show_tabs = E.get('dont_show_tabs') || {};
            const tab_data = dont_show_tabs[tab_id] || {};
            if (tab_data[type] && tab_data[type].n > 2)
            return true;
            const settings = E.get('settings');
            const data = settings && settings.dont_show;
            return !!data && (_is_dont_show(data.all, type) ||
            _is_dont_show(data[root_url], type));
        };

        E.get_dont_show_rules = type => {
            const res = [];
            type = type || 'default';
            const settings = E.get('settings');
            const data = settings && settings.dont_show || {};
            Object.keys(data).forEach(url => {
                if (_is_dont_show(data[url], type))
                res.push(url);
            });
            return res;
        };

        E.set_force_tpopup = (root_url, type) => {
            var force = E.get('force_tpopup') || _storage2.default.get_json('force_tpopup') || {};
            force[root_url] = { ts: _date2.default.to_sql(new Date()), type };
            E.set('force_tpopup', force);
            _storage2.default.set_json('force_tpopup', force);
        };

        E.unset_force_tpopup = root_url => {
            const force = E.get('force_tpopup') || _storage2.default.get_json('force_tpopup') || {};
            delete force[root_url];
            E.set('force_tpopup', force);
            _storage2.default.set_json('force_tpopup', force);
        };

        E.is_force_tpopup = root_url => {
            const force = E.get('force_tpopup') || _storage2.default.get_json('force_tpopup') || {};
            if (!force || !force[root_url])
            return false;
            const _ts = force[root_url].ts;
            const type = force[root_url].type;
            if (!_ts)
            return false;
            const ts = _date2.default.from_sql(_ts);
            if (Date.now() - ts > 30 * _date2.default.ms.MIN)
            return false;
            return type || true;
        };

        E.increment_vpn_work_yes = () => {
            const counter = E.get('vpn_work_yes') + 1;
            _storage2.default.set('vpn_work_yes', counter);
            E.set('vpn_work_yes', counter);
        };

        E.set_vpn_last_rating = rating => {
            _storage2.default.set('vpn_last_rating', rating);
            E.set('vpn_last_rating', rating);
        };

        E.set_rate_on_store = ts => {
            _storage2.default.set('rate_on_store', ts);
            E.set('rate_on_store', ts);
        };

        E.get_unblock_url = (domain, country, opt) => {
            opt = opt || {};
            country = country.toLowerCase();
            return 'https://hola.org/unblock/' + domain + '/using/vpn-' + country + (
            !opt.no_go ? '?go=2' : '');
        };

        var join_sessions_etask;
        function join_sessions(user) {
            if (user.disable_account_changes)
            return;
            return (0, _etask2.default)('join_sessions', function* join_sessions_() {
                this.finally(() => join_sessions_etask = undefined);
                join_sessions_etask = this;
                yield _svc2.default.update_info();
                let sync_token;
                try {
                    if (!(sync_token = _svc2.default.get('sync_token')))
                    return;
                    return yield _bg_ajax2.default.hola_api_call(
                    'users/auth/token/join?token=' + sync_token);
                } catch (err) {}
            });
        }

        function get_user_sync_token() {
            return (0, _etask2.default)('get_user_sync_token', function* get_user_sync_token_() {
                yield join_sessions_etask;
                try {
                    const data = yield _bg_ajax2.default.hola_api_call(
                    'users/auth/token/generate');
                    return data.token;
                } catch (err) {return '';}
            });
        }

        E.get_user_data = query => {
            var last_res;
            return (0, _etask2.default)('get_user_data', function* get_user_data_() {
                const res = yield _bg_ajax2.default.hola_api_call('users/get_user', query);
                last_res = res || {};
                if (last_res.user)
                {
                    join_sessions(last_res.user);
                    return last_res;
                }
                yield _svc2.default.update_info();
                let sync_token;
                try {
                    if (!(sync_token = _svc2.default.get('sync_token')))
                    return last_res;
                    yield _bg_ajax2.default.hola_api_call('users/auth/token/login?token=' +
                    sync_token, { method: 'POST' });
                } catch (err) {return last_res;}
                const data = yield _bg_ajax2.default.hola_api_call('users/get_user', query);
                return data || last_res;
            });
        };

        E.autologin_capable = () => (0, _etask2.default)('autologin_capable', function* () {
            yield _svc2.default.update_info();
            return !!_svc2.default.get('sync_token');
        });

        E.resend_verification_email = () =>
        _bg_ajax2.default.hola_api_call('users/send_email_verification', { method: 'POST' });

        E.set_login_redirect = value => chrome.cookies.set({
            value,
            url: 'https://hola.org',
            name: 'bext_login_origin',
            expirationDate: (Date.now() + 5 * _date2.default.ms.MIN) / 1000 });


        E.set_email_verify_url = value => chrome.cookies.set({
            value,
            url: 'https://hola.org',
            name: 'email_verify_next_url',
            expirationDate: (Date.now() + _date2.default.ms.HOUR) / 1000 });exports.default =


        E;});})();
//# sourceMappingURL=info.js.map
