// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', '/bext/pub/backbone.js', '/util/etask.js', '/bext/pub/ext.js', '/util/util.js', '/util/array.js', '/bext/pub/util.js', '/util/zerr.js', '/bext/vpn/bg/rule.js', '/bext/vpn/bg/info.js', '/bext/vpn/bg/tabs.js', '/bext/pub/lib.js', '/svc/vpn/pub/util.js', '/util/version_util.js', '/bext/vpn/bg/tpopup.js', '/util/url.js', '/bext/vpn/bg/tab_unblocker.js', '/bext/vpn/bg/bg_ajax.js', '/util/storage.js', '/bext/vpn/util/util.js', '/util/date.js', '/bext/vpn/bg/svc.js', '/bext/vpn/bg/pac.js', '/bext/vpn/bg/mode.js', '/bext/vpn/bg/tab_perr.js', '/bext/vpn/bg/iframe.js', '/bext/vpn/bg/premium.js', '/svc/vpn/pub/unblocker_lib.js', '/bext/vpn/bg/force_lib.js', '/protocol/pub/countries.js', '/bext/vpn/bg/trial.js', '/bext/vpn/bg/mitm_lib.js', '/bext/vpn/bg/util.js', 'conf'], function (exports, _underscore, _backbone, _etask, _ext, _util, _array, _util3, _zerr, _rule, _info, _tabs, _lib, _util5, _version_util, _tpopup, _url, _tab_unblocker, _bg_ajax, _storage, _util7, _date, _svc, _pac, _mode, _tab_perr, _iframe, _premium, _unblocker_lib, _force_lib, _countries, _trial, _mitm_lib, _util9, _conf2) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _ext2 = _interopRequireDefault(_ext);var _util2 = _interopRequireDefault(_util);var _array2 = _interopRequireDefault(_array);var _util4 = _interopRequireDefault(_util3);var _zerr2 = _interopRequireDefault(_zerr);var _rule2 = _interopRequireDefault(_rule);var _info2 = _interopRequireDefault(_info);var _tabs2 = _interopRequireDefault(_tabs);var _lib2 = _interopRequireDefault(_lib);var _util6 = _interopRequireDefault(_util5);var _version_util2 = _interopRequireDefault(_version_util);var _tpopup2 = _interopRequireDefault(_tpopup);var _url2 = _interopRequireDefault(_url);var _tab_unblocker2 = _interopRequireDefault(_tab_unblocker);var _bg_ajax2 = _interopRequireDefault(_bg_ajax);var _storage2 = _interopRequireDefault(_storage);var _util8 = _interopRequireDefault(_util7);var _date2 = _interopRequireDefault(_date);var _svc2 = _interopRequireDefault(_svc);var _pac2 = _interopRequireDefault(_pac);var _mode2 = _interopRequireDefault(_mode);var _tab_perr2 = _interopRequireDefault(_tab_perr);var _iframe2 = _interopRequireDefault(_iframe);var _premium2 = _interopRequireDefault(_premium);var _unblocker_lib2 = _interopRequireDefault(_unblocker_lib);var _force_lib2 = _interopRequireDefault(_force_lib);var _countries2 = _interopRequireDefault(_countries);var _trial2 = _interopRequireDefault(_trial);var _mitm_lib2 = _interopRequireDefault(_mitm_lib);var _util10 = _interopRequireDefault(_util9);var _conf3 = _interopRequireDefault(_conf2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}


































        _util8.default.assert_bg('be_vpn');
        function get_bg_main() {return window.be_bg_main;}
        const chrome = window.chrome,assign = Object.assign;
        const E = new (_backbone2.default.model.extend({
            tabs: {}, active_tab_id: 0, unblocked_urls: {}, history: {},
            _defaults: function () {this.on('destroy', () => E.uninit());} }))();

        const force_agent = _storage2.default.get_json('be_force_agent');

        var active_tab_timer_ms = _date2.default.ms.HOUR;
        E.be_tab_unblocker = _tab_unblocker2.default;

        function is_stub_unblock(domain) {
            return domain && (!_premium2.default.is_active() && _util4.default.is_google(domain) ||
            _util8.default.is_skip_url(_util8.default.root2url(domain)));
        }

        function on_lib_event(o) {
            switch (o.id) {

                case 'set_agent_key':_ext2.default.set('agent_key', o.data);break;
                case 'before_rule_set':
                    if (!is_stub_unblock(o.data) && o.data != 'all_browser')
                    clean_cookies(o.data);
                    _tabs2.default.on_before_rule_set();
                    break;}

        }

        function get_root_urls(root_url) {
            var site,root_urls = [root_url];
            if (!(site = _util4.default.get_site_conf(root_url)) || !site.root_url)
            return root_urls;
            for (var i = 0; i < site.root_url.length; i++)
            {
                if (root_url != site.root_url[i])
                root_urls.push(site.root_url[i]);
            }
            return root_urls;
        }

        function clean_cookies(domain) {
            if (_util2.default.is_mocha() || !_util2.default.get(chrome, 'cookies.getAll') ||
            !_util2.default.get(chrome, 'cookies.remove'))
            {
                return;
            }
            var site;
            if ((site = _util4.default.get_site_conf(domain)) && site.keep_cookies)
            return;
            E.sp.spawn((0, _etask2.default)(function* clean_cookies_domain_() {
                const domains = get_root_urls(domain);
                let cookies = yield _etask2.default.all(domains.map(v =>
                _etask2.default.cb_apply(chrome.cookies.getAll, [{ domain: v }])));
                cookies = _array2.default.flatten_shallow(cookies || []);
                cookies.forEach(cookie => {
                    if (!cookie)
                    return;
                    chrome.cookies.remove({ name: cookie.name,
                        url: (cookie.secure ? 'https' : 'http') +
                        '://' + cookie.domain + cookie.path });
                });
            }));
            E.sp.spawn((0, _etask2.default)(function* clean_cookies_all_() {
                let cookies = yield _etask2.default.all([
                _etask2.default.cb_apply(chrome.cookies.getAll, [{ name: 'DS' }]),
                _etask2.default.cb_apply(chrome.cookies.getAll, [{ name: 'DE2' }])]);

                cookies = _array2.default.flatten_shallow(cookies);
                const filtered = _underscore2.default.filter(cookies, cookie =>
                cookie && /^\.g[a-z]{1}\.com$/.test(cookie.domain));
                filtered.forEach(cookie => {
                    chrome.cookies.remove({ url: 'http://yep' + cookie.domain,
                        name: cookie.name });
                });
                if (filtered.length)
                {
                    _lib2.default.perr_ok({ id: 'be_clean_cookies2',
                        rate_limit: { count: 1 },
                        info: { rule: domain, cookies: filtered.map(c =>
                            _underscore2.default.pick(c, 'domain', 'name', 'path')) } });
                }
            }));
        }

        function CG(id, def) {return _util2.default.get(_ext2.default.get('bext_config'), id, def);}
        function uninit_unblocker_lib() {
            _unblocker_lib2.default.uninit();
            _unblocker_lib2.default.off('lib_event', on_lib_event);
            init_unblocker_lib.inited = false;
        }

        var storage_converted;
        const convert_rules_storage = () => (0, _etask2.default)(function* _convert_rules_storage() {
            if (storage_converted == 2)
            return;
            var rules = { ver: _util4.default.version() };
            rules.globals = _storage2.default.get_json('be_rules_globals');
            rules.exceptions = _storage2.default.get_json('be_rules_exceptions');
            rules.blacklist = _storage2.default.get_json('be_rules_blacklist');
            rules.stamp = _storage2.default.get_int('be_rules_stamp');
            rules.enable = !!_storage2.default.get_int('be_rules_enable');
            let set = yield _util10.default.storage_local_get('unblocker_rules');
            rules.set = set && set.unblocker_rules;
            _util10.default.storage_local_set({ rules });
            _storage2.default.set('storage_converted', 2);
            storage_converted = 2;
            if (rules.stamp)
            _lib2.default.perr_ok({ id: 'be_storage_converted' });
        });

        const init_unblocker_lib = () => (0, _etask2.default)(function* _init_unblocker_lib() {
            if (init_unblocker_lib.inited)
            return;
            init_unblocker_lib.inited = true;
            storage_converted = _storage2.default.get('storage_converted');
            yield convert_rules_storage();
            yield _unblocker_lib2.default.init({
                perr: (info, err) => err ? _lib2.default.perr_err(typeof err == 'boolean' ? info :
                assign({ err }, info)) : _lib2.default.perr_ok(info),
                ajax: _bg_ajax2.default.ajax,
                ajax_via_proxy: _tab_unblocker2.default.ajax_via_proxy,
                storage: {
                    get: id => (0, _etask2.default)(function* get() {
                        let ret = yield _util10.default.storage_local_get(id);
                        return ret && ret[id];
                    }),
                    set: (id, val) => _util10.default.storage_local_set({ [id]: val }) },

                conf_get: (id, def) => {
                    var v = _ext2.default.get(id);
                    return (/^gen\./.test(id) ? v !== undefined ? v : def : CG(id, def));
                },
                get_auth: () =>
                _ext2.default.auth({ is_premium: +!!_ext2.default.get('is_premium') }),
                get_prod_info: () => _util4.default.qs_ajax({ uuid: _ext2.default.get('uuid') }),
                get_user_info: () => ({
                    hola_uid: _ext2.default.get('hola_uid'),
                    country: (_util2.default.get(_info2.default.get('location'), 'country') ||
                    '').toLowerCase() }),

                get_verify_url: agent => (_bg_ajax2.default.is_hola_via_proxy() ? 'http://' +
                agent.ip : 'https://' + agent.host) + ':' + agent.port +
                '/verify_proxy',
                force_agent: () => force_agent,
                get_rule_routes: rule => {
                    let routes = [],s = _util2.default.pick(rule, 'country');
                    routes.push(s);
                    let route = _tab_unblocker2.default.get_rule_route(rule);
                    if (route.peer)
                    routes.push(assign({ peer: true }, s));
                    if (route.pool)
                    routes.push(assign({ pool: route.pool }, s));
                    return routes;
                } });

            E.listenTo(_ext2.default, 'change:is_premium', () => {
                const tasks = _unblocker_lib2.default.set_user_plus(_ext2.default.get('is_premium'));
                if (_util2.default.get(tasks, 'length') && E.active_tab_id)
                _tabs2.default.reload(E.active_tab_id);
            });
            _unblocker_lib2.default.on('lib_event', on_lib_event);
        });

        E.uninit = function () {
            if (!E.get('inited'))
            return;
            E.sp.return();
            status_cb.timer = _util8.default.clear_timeout(status_cb.timer);
            E.off('recover', on_recover);
            _ext2.default.off('change:is_premium', set_gen_conf_cb);
            E.stopListening();
            proxy_settings_monitor.uninit();
            monitor_active_uninit();
            uninit_unblocker_lib();
            if (_util2.default.is_mocha())
            {
                E.be_tpopup.uninit();
                _rule2.default.uninit();
                _tab_unblocker2.default.uninit();
                _tab_perr2.default.uninit();
                _pac2.default.uninit();
                E.be_svc.uninit();
                E.be_mode.uninit();
                E.be_info.uninit();
            } else

            {
                E.be_tpopup._destroy();
                _rule2.default._destroy();
                _tab_unblocker2.default._destroy();
                _tab_perr2.default._destroy();
                _pac2.default._destroy();
                E.be_svc._destroy();
                E.be_mode._destroy();
                E.be_info._destroy();
            }
            E.stopListening();
            E.clear();
        };

        var proxy_settings_monitor = {};
        proxy_settings_monitor.init = function () {
            if (this.inited || !chrome || _conf3.default.firefox_web_ext || _util2.default.is_mocha())
            return;
            this.inited = true;
            chrome.proxy.settings.get({}, this.changed_cb);
            chrome.proxy.settings.onChange.addListener(this.changed_cb);
        };
        proxy_settings_monitor.uninit = function () {
            if (this.inited)
            chrome.proxy.settings.onChange.removeListener(this.changed_cb);
        };
        proxy_settings_monitor.changed_cb = function (details) {
            if (!details)
            return (0, _zerr2.default)('proxy_changed no details');
            var conflict = details.levelOfControl == 'controlled_by_other_extensions';
            _zerr2.default[conflict ? 'err' : 'debug'](
            'proxy changed: %s control: %s',
            !details.value.pacScript || details.value.pacScript.url ?
            _zerr2.default.json(details.value) : 'pacScript-data', details.levelOfControl);
            let prev = _ext2.default.get('ext.conflict');
            _ext2.default.set({ 'proxy.effective.control_level': details.levelOfControl,
                'proxy.effective.value': details.value, 'ext.conflict': conflict });
            if (!!prev == !!conflict)
            return;
            _lib2.default.perr_ok({ id: conflict ? 'ext_conflict' :
                'ext_conflict_resolved', info: {
                    proxy_level: E.get('proxy.effective.control_level'),
                    proxy_value: E.get('proxy.effective.value') },
                rate_limit: { count: 1, ms: _date2.default.ms.DAY } });
        };

        function on_recover() {
            if (E.get('need_recover'))
            return;
            E.set('need_recover', true);
            status_cb();
        }

        E.init = function () {return (0, _etask2.default)(function* init() {
                if (E.get('inited'))
                return;
                E.sp = _util8.default.new_etask('be_vpn');
                E.set('inited', true);
                E.on('recover', on_recover);
                E.be_rule = _rule2.default;
                E.be_tpopup = _tpopup2.default;
                E.be_info = _info2.default;
                E.be_svc = _svc2.default;
                E.be_mode = _mode2.default;
                _info2.default.init();
                _svc2.default.init(E);
                _mode2.default.init();
                _pac2.default.init();
                yield init_unblocker_lib();
                _tab_unblocker2.default.init();
                _tab_perr2.default.init(E);
                _rule2.default.init(E);
                _tpopup2.default.init();
                proxy_settings_monitor.init();
                E.listenTo(_rule2.default, 'change:status', status_cb);
                E.listenTo(E.be_info, 'change:status', status_cb);
                E.listenTo(_tabs2.default, 'change:active.id', tab_vpn_on_change_active);
                E.listenTo(_tabs2.default, 'change:active.url', update_mitm_state);
                E.listenTo(_tabs2.default, 'change:active.url', update_protect_state);
                E.listenTo(_tabs2.default, 'created', tab_vpn_on_created);
                E.listenTo(_tabs2.default, 'updated', tab_vpn_on_updated);
                E.listenTo(_tabs2.default, 'committed', tab_vpn_on_comitted);
                E.listenTo(_tabs2.default, 'removed', tab_vpn_on_removed);
                E.listenTo(_tabs2.default, 'replaced', tab_vpn_on_replaced);
                E.listenTo(_tabs2.default, 'error_occured', tab_vpn_on_error_occured);
                E.listen_to(_tab_unblocker2.default, 'change:mitm_inited', on_mitm_inited);
                E.listenTo(_tab_unblocker2.default, 'mitm_block', update_mitm_state);
                E.listenTo(_ext2.default, 'trial_end', trial_end_cb);
                E.listenTo(_premium2.default, 'user_updated', E.force_bext_config_update);
                chrome.tabs.query({}, tabs => {
                    for (var i = 0; i < tabs.length; i++)
                    tab_vpn_on_created({ tab: tabs[i] });
                });
                E.sp.spawn(update_vpn_countries());
                E.sp.spawn(bext_config_init());
                monitor_active_init();
                E.set('protected_ui_state',
                _storage2.default.get_json('protected_ui_state') || {});
                let bump_ts;
                if (!(bump_ts = _storage2.default.get_int('bump_ts')))
                return;
                _storage2.default.clr('bump_ts');
                _lib2.default.perr_ok({ id: 'be_bump_done',
                    info: { bump: _storage2.default.get_int('bump'), ms: Date.now() - bump_ts } });
            });};

        function update_tests(conf) {
            const is_enabled = (c, key, name) => c[key][name] > 0 && c[key][name] < 1;
            if (!_premium2.default.get('is_test_user'))
            return;
            let key;
            for (key in conf)
            {
                if (is_enabled(conf, key, 'on'))
                conf[key].on = 1;
            }
            if (!conf.ws)
            return;
            for (key in conf.ws)
            {
                if (is_enabled(conf.ws, key, 'enabled_on'))
                conf.ws[key].enabled_on = 1;
            }
        }

        function ts_in_range(begin_ts, ts_ar, end_ts) {
            return ts_ar.some(ts => ts && begin_ts < ts && ts <= end_ts);
        }

        function update(info, data, ts, pref, expire_ts) {
            if (!info || !info.last_req_ts)
            return;
            ts[pref + 'req_ts'] = Math.max(ts[pref + 'req_ts'], info.last_req_ts);
            const to_remove = [];
            for (let host in info.agents)
            {
                if (info.agents[host] > expire_ts)
                data[pref + 'agents'][host] = info.agents[host];else

                to_remove.push(host);
            }
            for (let i = 0; i < to_remove.length; i++)
            delete data[pref + 'agents'][to_remove[i]];
            if (!info.req_stats)
            return;
            const p = pref + (pref ? '_' : '') + 'req_';
            for (let n in info.req_stats)
            {
                if (info.req_stats[n])
                data[p + n] = (data[p + n] || 0) + info.req_stats[n];
            }
            info.req_stats = {};
        }

        function get_active_agents(agents, begin_ts, end_ts) {
            const res = [];
            for (let host in agents)
            {
                if (ts_in_range(begin_ts, [agents[host]], end_ts))
                res.push(host);
            }
            return res;
        }

        var monitor_active = {};
        function monitor_active_init() {
            const period = _date2.default.ms.HOUR;
            const get_data = () => {
                let data = _storage2.default.get_json('monitor_active');
                if (!data || typeof data != 'object')
                data = {};
                return data;
            };
            E.sp.spawn(monitor_active.sp = (0, _etask2.default)({ name: 'monitor_active',
                cancel: true }, function* monitor_active_init_loop_()
            {
                this.finally(() => delete monitor_active.sp);
                for (let n = 1;; n++)
                {
                    if (n >= 60)
                    {
                        n = 0;
                        let data = get_data();
                        let ts = Date.now(),end_ts = ts,begin_ts = end_ts - period;
                        let active_ts_ar = [data.unblocker_tab_ts, data.ui_close_ts,
                        data.ui_open_ts, data.req_ts, data.mitm_tab_ts,
                        data.mitm_req_ts];
                        if (ts_in_range(begin_ts, active_ts_ar, end_ts))
                        {
                            let agents = get_active_agents(data.agents, begin_ts,
                            end_ts);
                            let mitm_agents = get_active_agents(data.mitm_agents,
                            begin_ts, end_ts);
                            _lib2.default.perr_ok({ id: 'be_active', info: assign({ agents,
                                    mitm_agents, begin: begin_ts, end: end_ts },
                                _util2.default.pick(data, 'req_ts', 'unblocker_tab_ts',
                                'ui_close_ts', 'ui_open_ts', 'mitm_tab_ts',
                                'mitm_req_ts', 'req_total_n', 'req_succ_n',
                                'req_err_n', 'mitm_req_total_n', 'mitm_req_succ_n',
                                'mitm_req_err_n')) });
                        }
                        data.agents = {};
                        data.mitm_agents = {};
                        ['total_n', 'succ_n', 'err_n'].forEach(n => {
                            delete data['req_' + n];
                            delete data['mitm_req_' + n];
                        });
                        _storage2.default.set_json('monitor_active', data);
                    }
                    yield _etask2.default.sleep(_date2.default.ms.MIN);
                    const tabs = Object.keys(_tabs2.default.get_nav_tabs());
                    if (!tabs.length)
                    continue;
                    let now = Date.now(),tu = _tab_unblocker2.default.tab_unblockers || {};
                    let data = get_data();
                    let expire_ts = now - period,ts = { req_ts: 0, mitm_req_ts: 0 };
                    data.agents = data.agents || {};
                    data.mitm_agents = data.mitm_agents || {};
                    tabs.forEach(id => {
                        let u;
                        if ((u = tu[id]) && data.unblocker_tab_ts != now)
                        data.unblocker_tab_ts = now;
                        update(u, data, ts, '', expire_ts);
                        if (_mitm_lib2.default._is_mitm_active(id) && data.mitm_tab_ts != now)
                        data.mitm_tab_ts = now;
                        update(_mitm_lib2.default.tab_get_req_info(id), data, ts, 'mitm_',
                        expire_ts);
                    });
                    data.req_ts = ts.req_ts || undefined;
                    data.mitm_req_ts = ts.mitm_req_ts || undefined;
                    _storage2.default.set_json('monitor_active', data);
                }
            }));
        }

        function monitor_active_uninit() {
            if (monitor_active.sp)
            monitor_active.sp.return();
            monitor_active = {};
        }

        function check_bump(bext_config) {
            if (E.bump_active || !bext_config.bump)
            return;
            var bump;
            if (!(bump = _storage2.default.get_int('bump')) || config_stats.n == 1)
            return void _storage2.default.set('bump', bext_config.bump);
            if (bext_config.bump <= bump)
            return;
            E.bump_active = true;
            _storage2.default.set('bump', bext_config.bump);
            if (_storage2.default.get_int('bump') != bext_config.bump)
            return;
            E.listen_to(_tab_unblocker2.default, 'change:activity', _underscore2.default.debounce(function () {
                if (_storage2.default.get('bump_ts'))
                return;
                ['agent_key', 'agent_key_ts', 'popup_rating_cache'].
                concat(bext_config.bump_clear || []).
                forEach(function (k) {_storage2.default.clr(k);});
                _storage2.default.set('bump_ts', Date.now());
                _lib2.default.perr_ok({ id: 'be_reload_ext_bump' });
                if (!bext_config.bump_enabled)
                return _zerr2.default.notice('bump reload extension not allowed');
                _lib2.default.reload_ext();
            }, bext_config.bump_idle || 5 * _date2.default.ms.MIN));
        }

        const set_gen_conf = (_conf, key) => {
            const get_conf = (c, k, keys) => {
                const res = {};
                keys.forEach(n => res[n] = _util2.default.get(c, k + '.' + n, _util2.default.get(c, n)));
                return res;
            };
            const gen = get_conf(_util2.default.get(_conf, 'gen', {}), key, ['hide_ip_on',
            'autoreload_limit', 'autoreload_ms', 'is_zgettunnels_post',
            'name', 'dbg_log_rate', 'is_etask_perf_on']);
            if (gen.hide_ip_on && !['opera', 'chrome'].includes(_util4.default.browser()))
            gen.hide_ip_on = 0;
            const features = {};
            for (let e in gen)
            {
                if (gen[e] && e.endsWith('_on'))
                gen[e] = _util10.default.is_conf_allowed(gen[e]);
                _ext2.default.set('gen.' + e, gen[e]);
                if (gen[e])
                features['test_' + e] = e != 'name' ? 1 : gen[e];
            }
            _ext2.default.unset('features', features);
            if (Object.keys(features).length)
            _ext2.default.set('features', features);
        };

        E.set_bext_config = function (bext_config) {
            if (!bext_config)
            {
                if (!(bext_config = _storage2.default.get_json('bext_config_last')))
                return;
            } else

            _storage2.default.set_json('bext_config_last', bext_config);
            var hola_conf = _storage2.default.get_json('hola_conf') || {};
            if (hola_conf)
            bext_config = _util2.default.extend_deep(bext_config, hola_conf);
            update_tests(bext_config);
            var protect_ui = bext_config.protect_ui2;
            if (protect_ui && (!protect_ui.min_version ||
            _version_util2.default.cmp(_util4.default.version(), protect_ui.min_version) >= 0))
            {
                var protect_pc_min_ver = protect_ui.protect_pc_min_ver;
                E.set('protect_pc', _util4.default.os_win() && (
                protect_ui.protect_pc || protect_pc_min_ver &&
                _version_util2.default.cmp(_util4.default.version(), protect_pc_min_ver) >= 0));
                E.set('protect_browser', protect_ui.protect_browser);
                E.set('protect_tooltips', protect_ui.tooltips);
                update_protect_state();
            }
            _force_lib2.default.convert_blob2check(bext_config, 'force_premium');
            _force_lib2.default.convert_blob2check(bext_config, 'get_privacy');
            _ext2.default.set('bext_config', bext_config);
            _ext2.default.set('debug.zerr', _util2.default.get(hola_conf, 'debug.zerr', {}));
            set_gen_conf_cb();
        };

        var config_update_sleep;
        var config_update_no_cache = false;
        var config_stats = { n: 0, err: false, attempt: 0 };
        const set_gen_conf_cb = () => set_gen_conf(_ext2.default.get('bext_config'),
        _ext2.default.get('is_premium') ? 'prem' : 'free');

        function bext_config_init() {
            _ext2.default.on_init('change:is_premium', set_gen_conf_cb);
            var pause;
            return (0, _etask2.default)({ cancel: true, name: 'bext_config_init' },
            [function try_catch$loop() {
                config_update_sleep = null;
                var url = _conf3.default.url_ccgi + '/bext_config.json?browser=' + _util4.default.browser() +
                '&ver=' + _util4.default.version();
                if (config_update_no_cache)
                {
                    url += '&ts=' + Date.now();
                    config_update_no_cache = false;
                }
                return _bg_ajax2.default.ccgi_ajax({ timeout: 20000, method: 'GET', url });
            }, function (e) {
                config_stats.n++;
                config_stats.attempt++;
                pause = 2 * _date2.default.ms.HOUR;
                var err = this.error || e && e.err,err_info;
                if (err || !e)
                {
                    if (config_stats.attempt == 1)
                    E.set_bext_config();
                    err_info = (err ? err.hola_info : undefined) || {};
                    _lib2.default.perr_err({ id: 'be_bext_config_err', err: err,
                        info: { n: config_stats.n, after_err: config_stats.err,
                            status: err_info.status, exists: !!_ext2.default.get('bext_config'),
                            attempt: config_stats.attempt, stamp: CG('stamp') } });
                    pause = 5 * _date2.default.ms.MIN;
                } else
                if (e && e.stamp && CG('stamp', 0) > e.stamp)
                {
                    _lib2.default.perr_ok({ id: 'be_bext_config_old',
                        info: { n: config_stats.n, after_err: config_stats.err,
                            attempt: config_stats.attempt } });
                } else

                {
                    _lib2.default.perr_ok({ id: 'be_bext_config_success',
                        info: { n: config_stats.n, after_err: config_stats.err,
                            attempt: config_stats.attempt } });
                    E.set_bext_config(e);
                    check_bump(e);
                    config_stats.attempt = 0;
                }
                config_stats.err = !!err;
                return convert_rules_storage();
            }, function () {
                if (!config_stats.attempt)
                _unblocker_lib2.default.trigger('conf_change');
                this.set_state('loop');
                return config_update_sleep = _etask2.default.sleep(pause);
            }]);
        }

        const update_vpn_countries = () => (0, _etask2.default)(function* _update_vpn_countries() {
            let retries = 0;
            const retry = e => (0, _etask2.default)(function* _retry() {
                _lib2.default.perr_err({ id: 'be_vpn_countries_err', info: { retries }, err: e });
                let res = yield _util10.default.storage_local_get('vpn_countries');
                _ext2.default.set('vpn_countries', (res || {}).vpn_countries || []);
                if (retries)
                return;
                retries++;
                yield _etask2.default.sleep(_date2.default.ms.MIN);
                return yield load();
            });
            const load = () => (0, _etask2.default)(function* _load() {
                let res = yield _bg_ajax2.default.ccgi_ajax({ timeout: 20000, method: 'GET',
                    url: _conf3.default.url_ccgi + '/vpn_countries.json?browser=' +
                    _util4.default.browser() + '&ver=' + _util4.default.version(), no_throw: 1 });
                if (!res || res.err || !Array.isArray(res))
                return yield retry((res || {}).err || 'empty_list');
                if (res.includes('uk'))
                res.push('gb');
                _ext2.default.set('vpn_countries', res);
                yield _util10.default.storage_local_set({ vpn_countries: res });
                return res;
            });
            return yield load();
        });

        E.force_bext_config_update = function (no_cache) {
            if (!config_update_sleep)
            return;
            config_update_no_cache = !!no_cache;
            config_update_sleep.return();
        };

        E.reauth = rule => {
            if (rule && rule.enabled && !CG('reauth.disable'))
            _unblocker_lib2.default.reauth(rule, CG('reauth.period'));
        };

        function status_cb() {
            var script = _rule2.default.get('status');
            var info = E.be_info.get('status');
            var status = [script, info];
            if (status.includes('error'))
            E.set('status', 'error');else
            if (status.includes('busy'))
            E.set('status', 'busy');else

            {
                E.set('status', 'ready');
                tabs_update();
            }
            if (status.includes('busy') || !E.get('need_recover'))
            return;
            if (E.get('status') == 'ready')
            return E.set('need_recover', false);
            _util8.default.clear_timeout(status_cb.timer);
            status_cb.timer = _util8.default.set_timeout(() => {
                _zerr2.default.notice('be_vpn try recover');
                E.set('need_recover', false);
                if (_rule2.default.get('status') == 'error')
                _rule2.default.recover();
                if (E.be_info.get('status') == 'error')
                E.be_info.recover();
            }, 0, { sp: E.sp });
        }

        function active_stop_measure(tab) {
            if (!tab.active_ts)
            return;
            tab.active_time += Date.now() - tab.active_ts;
            tab.active_ts = 0;
            active_timer_clr(tab);
        }

        function active_reset(tab) {
            active_stop_measure(tab);
            tab.active_time = 0;
        }

        function active_start_measure(tab) {
            if (tab.active_ts)
            return;
            tab.active_ts = Date.now();
            active_timer_add(tab, active_tab_timer_ms);
        }

        function active_timer_clr(tab) {
            if (!tab.active_timer)
            return;
            tab.active_timer = _util8.default.clear_timeout(tab.active_timer);
        }

        function active_timer_add(tab, ms) {
            active_timer_clr(tab);
            tab.active_timer = _util8.default.set_timeout(() => {
                tab.active_timer = null;
                total_active_report(tab);
            }, ms, { sp: E.sp });
        }

        function total_active_report(tab) {
            active_stop_measure(tab);
            if (tab.active_reported)
            return;
            tab.active_reported = true;
            var rule;
            var loc_country = (_util2.default.get(_info2.default.get('location'), 'country') || '').
            toLowerCase();
            if (rule = tab.rule)
            {
                var first_per_time =
                Date.now() - (E.unblocked_urls[tab.root_url] || 0) > 24 * 3600000;
                var stats = assign(_underscore2.default.pick(rule, 'name', 'type'),
                { proxy_country: (rule.country || '').toLowerCase() });
                _lib2.default.stats('be_vpn_total_active_time', JSON.stringify(
                assign(stats, { root_url: tab.root_url, src_country: loc_country,
                    total_active_time: tab.active_time / 1000,
                    first_per_time: first_per_time })));
                if (first_per_time)
                E.unblocked_urls[tab.root_url] = Date.now();
                return;
            }
            if (!tab.root_url || tab.had_rule || Math.random() * 50 >= 1)
            return;
            _lib2.default.stats('be_total_active_time', JSON.stringify(
            { root_url: tab.root_url, src_country: loc_country,
                total_active_time: tab.active_time / 1000 }));
        }

        function tab_vpn_add(tab, rule) {
            tab.had_rule = true;
            tab.rule = _util2.default.clone(rule);
            active_reset(tab);
            if (E.active_tab_id == tab.id)
            active_start_measure(tab);
            set_privacy_conf(true);
        }

        function tab_add(tabid, url) {
            var tab = E.tabs[tabid];
            var rule = E.rule_get(url);
            if (tab)
            return;
            _zerr2.default.debug('tab:%d add url %s root %s', tabid, url.slice(0, 200),
            _util6.default.get_root_url(url));
            tab = { url, root_url: _util6.default.get_root_url(url), active: 0,
                active_time: 0, rule, id: tabid };
            E.tabs[tabid] = tab;
            if (E.active_tab_id == tabid)
            active_start_measure(tab);
            if (rule)
            tab_vpn_add(tab, rule);
        }

        function tab_vpn_del(tab) {
            if (!tab.rule)
            return;
            total_active_report(tab);
            tab.rule = null;
            set_privacy_conf();
        }

        function tab_del(tabid) {
            var tab = E.tabs[tabid];
            if (!tab)
            return;
            total_active_report(tab);
            tab_vpn_del(tab);
            delete E.tabs[tabid];
        }

        function tab_update(tab) {
            var rule = E.rule_get(tab.url);
            _zerr2.default.debug('tab:%d update url %s is_vpn %O', tab.id, tab.root_url, !!rule);
            if (rule && !tab.rule)
            tab_vpn_add(tab, rule);else
            if (!rule && tab.rule)
            tab_vpn_del(tab);
        }

        function tabs_update() {
            for (var tab in E.tabs)
            tab_update(E.tabs[tab]);
        }

        E.rule_get = function (url) {
            var rule;
            if (!_ext2.default.get('ext.active'))
            return null;
            if ((rule = _rule2.default.get_rules(url)[0]) && rule.enabled)
            return rule;
            return null;
        };

        var MAX_HISTORY = 5;
        function tab_history_update(id, url, del) {
            var tab = E.history[id];
            if (!tab)
            {
                if (del)
                return;
                tab = E.history[id] = { history: [] };
            } else
            if (del)
            return void delete E.history[id];
            var host = _url2.default.get_host(url);
            if (!host)
            return;
            if (tab.history.length && host == tab.history[0])
            return;
            tab.history.unshift(host);
            if (tab.history.length > MAX_HISTORY)
            tab.history.pop();
        }

        E.tab_history_get = function (id) {
            if (!(id = id || _tabs2.default.get('active.id')))
            return;
            var t = E.history[id];
            if (!t)
            return;
            return t.history;
        };

        function tab_vpn_on_created(o) {
            var tab = o.tab;
            if (!tab.url)
            return;
            tab_history_update(tab.id, tab.url);
            tab_add(tab.id, tab.url);
        }

        function execute_with_params(tab_id, fn, params) {
            const code = '(' + fn.toString() + ')(' + params + ')';
            const tabapi = _util10.default.tabid2api(tab_id);
            _etask2.default.cb_apply(chrome.tabs, '.executeScript', [tabapi, { code }]);
        }

        function tz_spoof_inject(o) {
            var tab = E.tabs[o.id];
            if (!tab || tab.tz_spoof_inited || !tab.rule || !chrome || !chrome.runtime ||
            !chrome.runtime.getURL)
            {
                return;
            }
            var site,url = _util2.default.get(o, 'info.url');
            if (!(site = E.get_site_conf(url)) || !site.tz_spoof)
            return;
            var fn = function (offset) {
                var script = document.createElement('script');
                script.src = chrome.runtime.getURL('js/bext/vpn/bg/tz_spoof.js?' +
                'offset=' + offset);
                document.head.appendChild(script);
            };
            execute_with_params(o.id, fn, site.tz_spoof);
            tab.tz_spoof_inited = true;
        }

        function update_site_storage(o) {
            const tab = E.tabs[o.id];
            if (!tab || !tab.rule || tab.storage_updated || !chrome || !chrome.runtime)
            return;
            const url = _util2.default.get(o, 'info.url'),site = E.get_site_conf(url);
            if (!site || !site.site_storage)
            return;
            const fn = ls => Object.keys(ls).forEach(key => {
                localStorage.setItem(key, ls[key]);
                sessionStorage.setItem(key, ls[key]);
            });
            execute_with_params(o.id, fn, JSON.stringify(site.site_storage));
            tab.storage_updated = true;
        }

        function tab_vpn_on_comitted(o) {
            tz_spoof_inject(o);
            update_site_storage(o);
        }

        function set_privacy_conf(enabled) {
            set_privacy_conf.n = (set_privacy_conf.n || 0) + (enabled ? 1 : -1);
            if (set_privacy_conf.n < 0)
            set_privacy_conf.n = 0;
            if (!chrome || !_ext2.default.get('gen.hide_ip_on') ||
            !_util2.default.get(chrome, 'privacy.network.webRTCIPHandlingPolicy'))
            {
                return;
            }
            var value = set_privacy_conf.n ? 'disable_non_proxied_udp' : 'default';
            if (set_privacy_conf.value != value)
            {
                set_privacy_conf.value = value;
                chrome.privacy.network.webRTCIPHandlingPolicy.set({ value,
                    scope: chrome.extension.inIncognitoContext ?
                    'incognito_session_only' : 'regular' }, () => {});
            }
        }

        function tab_vpn_on_updated(o) {
            var id = o.id,info = o.info;
            var tab = E.tabs[id];
            if (tab)
            delete tab.tz_spoof_inited;
            if (!info || !info.url)
            return;
            tab_history_update(id, info.url);
            var root_url = _util6.default.get_root_url(info.url);
            if (tab && tab.root_url == root_url)
            {
                tab.url = info.url;
                tz_spoof_inject(o);
                return;
            }
            if (tab)
            tab_del(id);
            tab_add(id, info.url);
            tz_spoof_inject(o);
        }

        function tab_vpn_on_removed(tab) {
            tab_history_update(tab.id, null, true);
            tab_del(tab.id);
        }

        function tab_vpn_on_replaced(o) {
            var added = o.added,removed = o.removed;
            tab_history_update(removed, null, true);
            tab_vpn_del(removed);
            chrome.tabs.get(added, function (tab) {
                if (!tab || !tab.url)
                return;
                tab_history_update(added, tab.url);
                var root_url = _util6.default.get_root_url(tab.url);
                if (!root_url)
                return;
                tab_add(added, tab.url);
            });
        }

        function tab_vpn_on_change_active() {
            var id = _tabs2.default.get('active.id');
            update_mitm_state();
            if (!id)
            return;
            var tab = E.active_tab_id ? E.tabs[E.active_tab_id] : null;
            if (tab)
            active_stop_measure(tab);
            E.active_tab_id = id;
            if (tab = E.tabs[id])
            active_start_measure(tab);
        }

        function tab_vpn_on_error_occured(o) {
            var info = o.info || {};
            if (info.http_status_code != 0)
            return;
            var last = tab_vpn_on_error_occured.info || {};
            if (last.error == info.error && last.url == info.url && last.tabId == info.tabId)
            return;
            tab_vpn_on_error_occured.info = info;
            var domain = _url2.default.get_host('' + info.url);
            if (!_url2.default.is_valid_domain(domain))
            return;
            var rule,perr_info = { domain: domain, err: info.error || '' };
            if (!(rule = E.rule_get(info.url)) || info.error == 'net::ERR_ABORTED')
            return;
            _zerr2.default.debug('tab:%d tab_vpn_on_error_occured rule %s error %s url %s',
            info.tabId, rule.name || 'undefined', info.error, info.url);
            perr_info.proxy_country = rule.country;
            _lib2.default.perr(_zerr2.default.L.INFO, { id: 'be_dns_mistake', info: perr_info,
                rate_limit: { count: 5 } });
        }

        E.set_enabled = function (on) {
            try {
                on = !!on;
                get_bg_main().set_enabled(on);
                if (!!_ext2.default.get('ext.active') != on && !_ext2.default.get('ext.conflict'))
                {
                    var attributes = _util2.default.clone(_ext2.default.attributes);
                    delete attributes['status.unblocker.effective_pac_url'];
                    _lib2.default.perr_err({ id: 'be_set_enabled_mismatch',
                        info: { on: on, attributes: attributes },
                        rate_limit: { count: 1 } });
                }
            } catch (e) {
                _lib2.default.perr_err({ id: 'be_set_enabled_err', err: e });
                throw e;
            }
        };

        E.script_set = (rule, val) => {
            _zerr2.default.debug('set rule %s %d %s', rule.name, +val.enabled, val.root_url);
            return (0, _etask2.default)({ name: 'script_set', cancel: true }, function* script_set_() {
                yield E.set_enabled(true);
                if (val.enabled && _trial2.default.need_trial(val.root_url))
                {
                    _util4.default.set_site_storage(val.root_url, 'force_trial',
                    { country: val.src == 'ui' ? null : val.country || rule.country });
                    return this.return();
                }
                if (rule && +val.enabled && rule.enabled && val.src == 'trial' &&
                rule.src == val.src && (!val.country || rule.country == val.country))
                {
                    return this.return();
                }
                const new_rule = { name: val.host || val.name || rule.name,
                    enabled: +val.enabled, root_url: val.host || val.root_url,
                    country: (val.country || rule.country || '').toLowerCase(),
                    type: rule.type, mode: val.mode, tab_id: val.tab_id,
                    stub: val.stub };
                if (val.src)
                new_rule.src = val.src;
                _rule2.default.trigger('set_rule', new_rule);
                if (E.get('status') == 'ready')
                return;
                E.once('change:status', () => this.continue());
                return yield this.wait(15 * _date2.default.ms.SEC);
            });
        };

        E.enable_root_url = opt => (0, _etask2.default)({ cancel: true }, function* enable_root_url() {
            let rule_ratings,rule,root_url = opt.root_url,enabled = true;
            if (!_ext2.default.get('is_premium') &&
            _premium2.default.get_force_premium_rule(root_url))
            {
                return void _info2.default.set_force_tpopup(root_url);
            }
            if (opt.rule && opt.rule.name)
            {
                rule = opt.rule;
                if (rule.enabled !== undefined)
                enabled = rule.enabled;
            } else

            {
                if (opt.rule)
                {
                    _lib2.default.perr_err({ id: 'be_enable_root_url_invalid_rule',
                        info: assign(opt, { hola_uid: _ext2.default.get('hola_uid') }) });
                }
                const _rule_ratings = yield _rule2.default.get_rule_ratings({ root_url,
                    src_country: _info2.default.get('country'), limit: 20,
                    proxy_country: opt.country, vpn_only: true });
                let groups;
                if (_rule_ratings)
                {
                    rule_ratings = _rule_ratings.filter(r => {
                        const country = r.proxy_country.toUpperCase();
                        return _countries2.default.proxy_countries.bext.includes(country);
                    });
                    groups = yield _rule2.default.get_groups_from_ratings(rule_ratings);
                }
                let url = 'http://' + root_url + '/',host = _url2.default.get_host(url);
                let popular = _util8.default.get_popular_country({ host, rule_ratings });
                let proxy_country = (opt.country || popular[0].proxy_country || '').
                toLowerCase();
                let all_rules = _util10.default.get_all_rules({ proxy_country,
                    rules: _rule2.default.get('rules'), url, root_url, rule_ratings, groups });
                rule = all_rules[0];
            }
            if (E.is_enabled_for_pc())
            yield E.set_enabled_for_pc(enabled, { country: rule.country });else
            if (E.is_enabled_for_browser())
            yield E.set_enabled_for_browser(enabled, { country: rule.country });else

            yield E.script_set(rule, { enabled, root_url, src: opt.src });
            _lib2.default.perr_ok({ id: 'be_enable_root_url', info:
                { name: rule.name, root_url, country: rule.country,
                    src_country: (_info2.default.get('country') || '').toLowerCase(),
                    hola_uid: _ext2.default.get('hola_uid') } });
            return rule;
        });

        E.tpopup_is_connected = (id, tpopup_type) =>
        E.be_tpopup && E.be_tpopup.is_connected(id, tpopup_type);

        E.check_permission = name => {
            if (!chrome || !chrome.permissions)
            return;
            return (0, _etask2.default)({ name: 'check_permission', cancel: true },
            function* check_permission() {
                try {
                    chrome.permissions.contains({ permissions: [name],
                        origins: ['<all_urls>'] }, res => this.continue(res));
                    return yield this.wait();
                } catch (e) {
                    _lib2.default.perr_err({ id: 'check_permission_failed', info: e });
                }
            });
        };

        E.grant_permission = function (name) {
            if (!chrome || !chrome.permissions)
            return;
            return (0, _etask2.default)({ name: 'grant_permission', cancel: true },
            function* grant_permission() {
                try {
                    chrome.permissions.request({ permissions: [name],
                        origins: ['<all_urls>'] }, res => this.continue(res));
                    return yield this.wait();
                } catch (e) {
                    _lib2.default.perr_err({ id: 'grant_permission_failed', info: e });
                }
            });
        };

        function on_mitm_inited() {
            var mitm = _tab_unblocker2.default.mitm;
            E.set('mitm_ext_ui_enabled', mitm && mitm.is_ext_ui_enabled());
        }

        function update_mitm_state() {
            E.set('mitm_site', E.is_mitm_site());
            E.set('mitm_active_manual', E.is_mitm_active_manual(_tabs2.default.get(
            'active.id')));
        }

        E.is_mitm_site = function (url) {
            url = url || _tabs2.default.get('active.url');
            var mitm = _tab_unblocker2.default.mitm;
            return url && mitm && mitm.should_unblock(url);
        };

        E.is_mitm_active = function (tab_id) {
            var mitm = _tab_unblocker2.default.mitm;
            return mitm && !!mitm._is_mitm_active(tab_id);
        };

        E.is_mitm_active_manual = function (tab_id) {
            var mitm = _tab_unblocker2.default.mitm;
            var type = mitm && mitm._is_mitm_active(tab_id);
            return type == 'manual' || type == 'user_choice';
        };

        E.mitm_set_unblock = function (url, until) {
            if (!_ext2.default.get('is_premium') && _premium2.default.get_force_premium_rule(url))
            return;
            _zerr2.default.notice('mitm set unblock ' + url);
            _tab_unblocker2.default.mitm.user_set_unblock(url, until);
            update_mitm_state();
        };

        E.mitm_set_ignore = function (url, tab_id, until) {
            _zerr2.default.notice('mitm set ignore ' + url);
            _tab_unblocker2.default.mitm.set_ignore(url, until);
            if (tab_id)
            chrome.tabs.reload(tab_id);
            update_mitm_state();
        };

        E.stop_vpn = function (url, tab_id) {
            _zerr2.default.notice('stop vpn ' + url);
            if (E.is_mitm_active(tab_id))
            return void E.mitm_set_ignore(url, tab_id);
            var rule = E.rule_get(url);
            if (!rule)
            return;
            _rule2.default.trigger('set_rule', {
                name: rule.name,
                root_url: _util6.default.get_root_url(url),
                enabled: 0,
                country: rule.country,
                type: rule.type,
                tab_id: tab_id });

        };

        E.mitm_manual_unblock = function (url, tab_id, until, no_reload) {
            if (!_ext2.default.get('is_premium') && _premium2.default.get_force_premium_rule(url))
            return;
            _zerr2.default.notice('mitm set rule ' + url);
            var need_reload = !no_reload && !E.is_mitm_active(tab_id);
            _tab_unblocker2.default.mitm.set_manual_tab(tab_id, url, until);
            if (need_reload)
            _tabs2.default.reload(tab_id);
            update_mitm_state();
            E.trigger('mitm_manual_unblock');
        };

        E.mitm_manual_stop = (urls, tab_id, no_reload) => {
            _array2.default.to_array(urls).forEach(url => {
                _zerr2.default.notice('mitm manual stop ' + url);
                _tab_unblocker2.default.mitm.set_ignore(url, null, 'manual');
            });
            if (!no_reload)
            chrome.tabs.reload(tab_id);
            update_mitm_state();
        };

        E.get_mitm_unblock_rules = () => {
            const mitm = E.be_tab_unblocker.mitm;
            return mitm ? mitm.get_unblock_rules() : [];
        };

        E.mitm_need_popup = url => _tpopup2.default.need_mitm_popup(url);

        E.get_site_conf = url => {
            const root_url = _util6.default.get_root_url(url);
            return _util4.default.get_site_conf(root_url);
        };

        E.do_tpopup = tab_id => {_tpopup2.default.do_tpopup(E.tabs[tab_id]);};

        E.get_url_protected = root_url => (E.get('protected_ui_state') || {})[root_url];

        E.set_url_protected = (root_url, active) => {
            const state = E.get('protected_ui_state') || {};
            state[root_url] = active;
            E.set('protected_ui_state', state);
            _storage2.default.set_json('protected_ui_state', state);
            if (!active)
            E.set_default_protect(root_url, false);
        };

        E.get_default_protect = root_url => {
            const state = E.get('protected_ui_state') || {};
            return (state.default || {})[root_url];
        };

        E.set_default_protect = (root_url, val) => {
            const state = E.get('protected_ui_state') || {};
            state.default = state.default || {};
            state.default[root_url] = val;
            E.set('protected_ui_state', state);
            _storage2.default.set_json('protected_ui_state', state);
            update_protect_state();
        };

        function update_protect_state() {
            if (!_ext2.default.get('is_premium'))
            return E.set('default_protect_ui', false);
            var state = E.get('protected_ui_state') || {};
            var defs = state.default || {};
            var res = false;
            if (E.is_enabled_for_pc())
            res = defs.protect_pc;else
            if (E.is_enabled_for_browser())
            res = defs.protect_browser;else

            {
                var root_url = _util6.default.get_root_url(_tabs2.default.get('active.url'));
                res = defs[root_url];
            }
            E.set('default_protect_ui', res);
        }

        E.is_enabled_for_pc = () =>
        !!(E.get('protect_pc') && E.be_svc.get('vpn_country'));

        E.set_enabled_for_pc = (enable, opt) => {
            E.set_default_protect('protect_pc', enable && opt && opt.default_protect);
            if (!E.get('protect_pc'))
            return;
            _lib2.default.perr_ok({ id: 'be_ui_vpn_protect_pc', info: { enable } });
            return enable ? E.be_svc.vpn_connect(opt) : E.be_svc.vpn_disconnect(opt);
        };

        function get_all_browser_rule() {
            const rules = _util8.default.get_rules(_rule2.default.get('rules'));
            if (!_ext2.default.get('ext.active'))
            return false;
            return _util8.default.is_all_browser(rules[0]) && rules[0];
        }

        E.is_enabled_for_browser = () => {
            if (!E.get('protect_browser'))
            return false;
            if (E.is_enabled_for_pc())
            return true;
            return !!get_all_browser_rule();
        };

        E.set_enabled_for_browser = function (enable, opt) {
            E.set_default_protect('protect_browser', enable && opt &&
            opt.default_protect);
            if (!E.get('protect_browser'))
            return;
            _lib2.default.perr_ok({ id: 'be_ui_vpn_protect_browser', info: { enable } });
            let rule;
            if (!enable)
            {
                if (E.is_enabled_for_pc())
                E.set_enabled_for_pc(false);
                if (rule = get_all_browser_rule())
                return E.script_set(rule, { enabled: false });
                return;
            }
            return E.script_set({ country: opt.country, type: 'url' },
            { enabled: true, host: 'all_browser', mode: 'protect' });
        };

        E.get_enabled_rule = opt => {
            if (!E.get('inited'))
            return;
            let { url, tab_id } = opt;
            let default_protect = E.get_default_protect(_util6.default.get_root_url(url));
            let is_premium = _ext2.default.get('is_premium');
            if (is_premium && E.is_enabled_for_pc())
            {
                return { country: E.be_svc.get('vpn_country'), protect: 'pc',
                    default_protect };
            }
            if (is_premium && E.is_enabled_for_browser())
            {
                return assign({ protect: 'browser', default_protect },
                get_all_browser_rule());
            }
            if (E.is_mitm_active_manual(tab_id))
            return { country: 'us', mitm: true, tab_id };
            let stub_rule = (_rule2.default.get('tabs_stub_rules') || {})[tab_id];
            if (_util4.default.is_stub_rule_enabled(stub_rule, url, is_premium))
            return assign({ default_protect }, stub_rule);
            let rules = _util8.default.get_rules(_rule2.default.get('rules'), url);
            let rule = rules && rules[0] || {};
            return rule.enabled && _ext2.default.get('ext.active') ? assign({ default_protect,
                protect: is_premium && rule.mode == 'protect' ? 'site' : undefined },
            rule) : null;
        };

        E.unblock_disable = ({ url, tab_id }) => (0, _etask2.default)(function* unblock_disable() {
            let rule = E.get_enabled_rule({ url, tab_id });
            let root_url = _util6.default.get_root_url(url);
            if (_trial2.default.get_trial_active(root_url))
            _util4.default.set_site_storage(root_url, 'trial.dont_show_ended', true);
            if (!rule)
            return;
            if (E.get_url_protected(root_url))
            E.set_url_protected(root_url, false);
            if (rule.mitm)
            return void E.mitm_manual_stop([url], tab_id);
            if (rule.protect == 'browser' || rule.protect == 'pc')
            E.set_enabled_for_browser(false);
            _rule2.default.trigger('set_rule', {
                name: root_url,
                root_url,
                enabled: 0,
                country: rule.country,
                type: rule.type,
                tab_id: tab_id,
                stub: rule.stub });

            yield _pac2.default.cleanup_rule_proxies(rule.name);
        });

        E.unblock_enable = opt => (0, _etask2.default)(function* unblock_enable() {
            let { url, tab_id, mitm, protect, default_protect, country } = opt;
            let root_url = _util6.default.get_root_url(url);
            let rule = E.get_enabled_rule({ url, tab_id }) || {};
            let is_premium = _ext2.default.get('is_premium');
            const set_site_rule = changes => E.script_set(rule, assign({
                name: root_url,
                root_url,
                enabled: 1,
                country: country || rule.country,
                mode: rule.mode,
                tab_id: tab_id,
                stub: _util8.default.is_skip_url(url) || !is_premium &&
                _util4.default.is_google(root_url) },
            changes));
            if (!is_premium && (protect ||
            _premium2.default.get_force_premium_rule(root_url)))
            {
                return (0, _zerr2.default)('user not premium');
            }
            if (mitm)
            return E.mitm_manual_unblock(url, tab_id);
            if (rule.mitm)
            E.mitm_manual_stop([url], tab_id, true);
            if (default_protect)
            {
                E.set_default_protect(root_url, true);
                if (!rule.protect)
                protect = protect || 'site';
            } else
            if (protect === undefined && E.get_default_protect(root_url))
            E.set_default_protect(root_url, false);
            if (country && protect && !(_ext2.default.get('vpn_countries') || []).
            includes(country.toLowerCase()))
            {
                country = 'us';
            }
            if (protect == 'browser' || protect === undefined && rule.protect == 'browser')
            {
                if (rule.protect == 'pc')
                E.set_enabled_for_pc(false);
                if (rule.protect == 'site')
                E.set_url_protected(root_url, false);
                return yield E.set_enabled_for_browser(true, {
                    default_protect: default_protect || E.get_default_protect(root_url),
                    country: country || rule.country });

            }
            if (protect == 'pc' || protect === undefined && rule.protect == 'pc')
            {
                return yield E.set_enabled_for_pc(true, {
                    default_protect: default_protect || E.get_default_protect(root_url),
                    country: country || rule.country });

            }
            if (protect == 'site' || protect === undefined && rule.protect == 'site')
            {
                if (rule.protect == 'pc' || rule.protect == 'browser')
                E.set_enabled_for_browser(false);
                if (!_util8.default.is_skip_url(url))
                {
                    E.set_url_protected(root_url, true);
                    yield set_site_rule({ mode: 'protect', country });
                }
                return;
            }
            if (protect === false)
            {
                if (rule.protect == 'pc' || rule.protect == 'browser')
                E.set_enabled_for_browser(false);
                E.set_url_protected(root_url, false);
                if (!_util8.default.is_skip_url(url))
                yield set_site_rule({ mode: 'unblock', country });
                return;
            }
            yield set_site_rule({ country });
        });

        E.unblock_action = opt => (0, _etask2.default)(function* unblock_action() {
            let { url, tab_id } = opt;
            let redirects,root_url = _util6.default.get_root_url(url);
            let rules_set = new _util10.default.Rules_set(null, opt.disable);
            if (opt.disable)
            {
                redirects = new _util10.default.Rules_set(root_url).to_array().
                map(r => _util8.default.root2url(r));
                for (let u of [url, ...redirects])
                {
                    rules_set.add(_util6.default.get_root_url(u));
                    yield E.unblock_disable({ url: u, tab_id });
                }
                if (redirects && redirects.length)
                rules_set.save();
                return;
            }
            redirects = opt.redirects && opt.redirects.filter(u => u != url) || [];
            for (let u of [url, ...redirects])
            {
                rules_set.add(_util6.default.get_root_url(u));
                yield E.unblock_enable(assign({}, opt, { url: u }));
            }
            if (redirects && redirects.length)
            rules_set.save();
        });

        E.reset_busy = () => {
            if (CG('disable_reset_busy'))
            return;
            let res = {},m = { rule: _rule2.default, info: _info2.default, svc: _svc2.default };
            let allowed = CG('reset_busy_allowed', { rule: 1 });
            for (let e in m)
            {
                if (m[e].get('status') != 'busy' || !allowed[e])
                continue;
                m[e].clr_busy();
                res[e] = 1;
            }
            _rule2.default.reset_tab_state();
            if (Object.keys(res).length)
            _lib2.default.perr_ok({ id: 'reset_busy', info: res, rate_limit: { count: 3 } });
        };

        E.get_events = () => _util6.default.events;
        E.events_to_str = () => _util6.default.events_to_str();
        E.get_event_n = e => _util6.default.get_event_n(e);
        E.reset_events = () => _util6.default.reset_events();
        E.push_event = (name, opt) => _util6.default.push_event(name, opt);

        function trial_end_cb(root_url) {
            const tabs = _tabs2.default.get_nav_tabs();
            Object.keys(tabs).forEach(tab_id => {
                const url = tabs[tab_id];
                if (_util6.default.get_root_url(url) == root_url &&
                !E.tpopup_is_connected(tab_id))
                {
                    E.do_tpopup(+tab_id);
                }
            });
        }

        if (_util2.default.is_mocha())
        {
            E.t = { update_vpn_countries, init_unblocker_lib, uninit_unblocker_lib,
                update_site_storage, execute_with_params };
        }exports.default =

        E;});})();
//# sourceMappingURL=vpn.js.map
