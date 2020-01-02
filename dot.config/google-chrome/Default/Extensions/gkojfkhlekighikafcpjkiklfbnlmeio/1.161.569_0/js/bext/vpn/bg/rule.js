// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', '/bext/pub/backbone.js', '/util/etask.js', '/bext/pub/ext.js', '/bext/pub/util.js', '/util/zerr.js', '/bext/vpn/util/util.js', '/bext/pub/lib.js', '/bext/vpn/bg/tab_unblocker.js', '/util/url.js', '/util/escape.js', '/bext/vpn/bg/bg_ajax.js', '/util/array.js', '/svc/vpn/pub/util.js', '/svc/vpn/pub/unblocker_lib.js', '/bext/vpn/bg/mode.js', '/bext/vpn/bg/tabs.js', '/util/date.js', '/util/util.js', '/bext/vpn/bg/info.js', '/bext/vpn/bg/trial.js', '/util/rate_limit.js', '/util/ajax.js', 'conf', '/bext/vpn/bg/premium.js'], function (exports, _underscore, _backbone, _etask, _ext, _util, _zerr, _util3, _lib, _tab_unblocker, _url, _escape, _bg_ajax, _array, _util5, _unblocker_lib, _mode, _tabs, _date, _util7, _info, _trial, _rate_limit, _ajax, _conf, _premium) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _ext2 = _interopRequireDefault(_ext);var _util2 = _interopRequireDefault(_util);var _zerr2 = _interopRequireDefault(_zerr);var _util4 = _interopRequireDefault(_util3);var _lib2 = _interopRequireDefault(_lib);var _tab_unblocker2 = _interopRequireDefault(_tab_unblocker);var _url2 = _interopRequireDefault(_url);var _escape2 = _interopRequireDefault(_escape);var _bg_ajax2 = _interopRequireDefault(_bg_ajax);var _array2 = _interopRequireDefault(_array);var _util6 = _interopRequireDefault(_util5);var _unblocker_lib2 = _interopRequireDefault(_unblocker_lib);var _mode2 = _interopRequireDefault(_mode);var _tabs2 = _interopRequireDefault(_tabs);var _date2 = _interopRequireDefault(_date);var _util8 = _interopRequireDefault(_util7);var _info2 = _interopRequireDefault(_info);var _trial2 = _interopRequireDefault(_trial);var _rate_limit2 = _interopRequireDefault(_rate_limit);var _ajax2 = _interopRequireDefault(_ajax);var _conf2 = _interopRequireDefault(_conf);var _premium2 = _interopRequireDefault(_premium);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

























        _util4.default.assert_bg('be_rule');
        const SEC = _date2.default.ms.SEC,chrome = window.chrome,assign = Object.assign;
        let be_bg_main,request_errors = {},tab_state = {},bext_config = {};
        const E = new (_backbone2.default.task_model.extend({
            model_name: 'rule',
            rules: undefined,
            _defaults: function () {this.on('destroy', () => E.uninit());} }))();

        let set_err_rl = {},stamp;
        const CG = (path, def) => _util8.default.get(bext_config, path, def);
        const TUNNEL_ERR = 'net::ERR_TUNNEL_CONNECTION_FAILED';
        _tab_unblocker2.default.be_rule = E;

        E.tasks = [];

        E.task_cancel_all = () => _util8.default.forEach(E.tasks, task => task.return());
        E.task_insert = task => E.tasks.push(task);
        E.task_remove = task => _array2.default.rm_elm(E.tasks, task);

        E.uninit = () => {
            if (!E.get('inited'))
            return;
            E.sp.return();
            E.off('recover', on_recover);
            E.off('fetch_rules', fetch_rules);
            E.off('set_rule', set_rule);
            E.stopListening();
            E.clear();
            E.task_cancel_all();
            E.rules = undefined;
        };

        const on_max_redirects = (from, to, urls) => (0, _etask2.default)({ cancel: true },
        function* _on_max_redirects() {
            if (CG('disable_max_redirects'))
            return;
            let urules,rules = _unblocker_lib2.default.get_rules();
            if (!rules || !(urules = rules.unblocker_rules))
            return;
            let update;
            for (let name in urules)
            {
                let r = urules[name];
                if (!r.enabled || r.name != from && r.name != to)
                continue;
                r.enabled = false;
                E.set_rule({ name: r.name, country: r.country, enabled: r.enabled });
                update = true;
            }
            if (!update)
            return;
            _lib2.default.perr_ok({ id: 'max_redirect_rule_disable', info: { from, to, urls },
                rate_limit: { count: 1 } });
            yield E.update_rules(rules);
        });

        E.init = be_vpn => {
            if (E.get('inited'))
            return;
            be_bg_main = window.be_bg_main;
            E.be_vpn = be_vpn;
            E.set('inited', true);
            E.set('tabs_stub_rules', {});
            E.sp = _util4.default.new_etask('be_rule');
            E.on('recover', on_recover);
            E.on('fetch_rules', fetch_rules);
            E.on('set_rule', set_rule);
            E.listen_to(_ext2.default, 'change:ext.active change:session_key',
            _underscore2.default.debounce(() => {E.trigger('fetch_rules');}));
            E.listenTo(_tabs2.default, 'completed error_occured', info => {
                if (!_util8.default.get(info, 'tabId'))
                return;
                var fix_task = fix_tasks[info.tabId];
                if (!fix_task)
                return;
                if (!fix_task.fix_waiting)
                return;
                fix_task.continue();
            });
            E.listenTo(_tabs2.default, 'created', o => {
                var tab = o.tab;
                var stub_rule = E.get_stub_rule(tab.openerTabId);
                if (tab.openerTabId && !_util4.default.is_new_tab(tab.url) && stub_rule)
                E.set_stub_rule(tab.id, stub_rule);
            });
            E.listenTo(_tabs2.default, 'max_redirect_sequence', on_max_redirects);
            _unblocker_lib2.default.on('local_rules_set', () => {E.trigger('fetch_rules');});
            const set_rules = () => {
                E.update_rules(bext_config.proxy_rules || null);
                stamp = bext_config.stamp;
            };
            E.listen_to(_ext2.default, 'change:bext_config', () => {
                bext_config = _ext2.default.get('bext_config') || {};
                request_errors = [TUNNEL_ERR].concat(_util8.default.get(bext_config,
                'request_errors.handle', []));
                if (bext_config.proxy_rules && (!stamp || stamp != bext_config.stamp))
                set_rules();
            });
            E.listen_to(_info2.default, 'change:country', () => {
                if (_info2.default.get('country'))
                set_rules();
            });
            E.listen_to(_ext2.default, 'change:ext.active', set_rules);
        };

        function on_recover() {E.trigger('fetch_rules');}

        E.get_rules = (url, ignore) => _util4.default.get_rules(E.rules, url, ignore);

        E.get_rule_ratings = args => _bg_ajax2.default.ccgi_ajax({ slow: 2 * SEC,
            url: _conf2.default.url_ccgi + '/rule_ratings', data: _util2.default.qs_ajax(args),
            perr: opt => _lib2.default.perr_err(opt) });

        E.get_groups_from_ratings = ratings => (0, _etask2.default)({ name: 'get_groups_from_ratings',
            cancel: true }, function* () {
            let groups = [];
            ratings.forEach(cr => {
                cr.rules.forEach(r => {
                    if (r.rating <= 0)
                    return;
                    groups.push(_underscore2.default.pick(r, 'name', 'type', 'country'));
                });
            });
            if (!groups.length)
            return;
            groups = yield _unblocker_lib2.default.get_groups(groups);
            if (!_util8.default.get(groups, 'unblocker_rules'))
            return groups;
            _util8.default.forEach(groups.unblocker_rules, r => delete r.enabled);
            return groups;
        });

        E.update_rules = rules => (0, _etask2.default)(function* update_rules() {
            if (rules)
            _unblocker_lib2.default.set_rules(rules);
            if (!_ext2.default.get('ext.active') || !rules && rules !== undefined)
            E.rules = undefined;else

            {
                E.rules = _unblocker_lib2.default.get_rules();
                E.set('rules', E.rules);
            }
            yield _tab_unblocker2.default.update_rule_urls(E.rules);
            E.set('stamp', _util8.default.get(E.rules, 'stamp', 0));
        });

        function fetch_rules() {
            if (!E.get('inited'))
            return;
            E.task_cancel_all();
            if (!E.set_busy({ desc: 'Changing country...' }))
            return E.schedule_clr(['fetch_rules']);
            var auth = _ext2.default.auth();
            if (!auth.uuid || !auth.session_key)
            return E.clr_busy();
            E.sp.spawn((0, _etask2.default)({ cancel: true }, function* fetch_rules_() {
                this.finally(() => {
                    if (E.get('status') == 'busy')
                    E.clr_busy();
                });
                try {yield E.update_rules();
                } catch (e) {
                    E.set_err();
                    _lib2.default.err('be_script_fetch_rules_err', '', e);
                }
            }));
        }

        E.set_rule_val = (rule, key, val) => {
            _unblocker_lib2.default.set_rule_val(rule, key, val);
            _tab_unblocker2.default.set_rule_val(rule, key, val);
            E.set('rules', E.rules = _unblocker_lib2.default.get_rules());
        };

        E.set_rule = (opt, update) => (0, _etask2.default)(function* _set_rule() {
            if (!opt)
            return;
            if (opt.stub)
            return void E.set_stub_rule(opt.tab_id, opt);
            if (opt.tab_id)
            E.set_stub_rule(opt.tab_id, null);
            if (opt.enabled)
            {
                opt.src_country = (_info2.default.get('country') || '').toLowerCase();
                if (_util2.default.is_force_protect_mode(opt.src_country))
                opt.full_vpn = true;
            }
            if (_trial2.default.get_trial_active(opt.name))
            opt.src = 'trial';
            _unblocker_lib2.default.set_rule(opt);
            E.trigger('rule_set', opt);
            if (update)
            yield E.update_rules();
            if (opt.del)
            yield _tab_unblocker2.default.cleanup_rule_proxies(opt.name);
        });

        E.is_trial_rule = rule => rule && rule.src == 'trial';

        function set_tab_state(tab_id, state) {
            if (!tab_id || tab_id == -1)
            return;
            var s = tab_state[tab_id] = tab_state[tab_id] || {};
            if (s.state == state)
            return;
            var prev = s.state || 'idle';
            s.state = state;
            E.trigger('set_tab_state', { tab_id, prev, curr: s.state });
        }

        const get_tab_id = tab_id => tab_id === undefined ?
        _tabs2.default.get('active.id') : tab_id;
        E.get_tab_state = tab_id => (tab_state[get_tab_id(tab_id)] || {}).state || 'idle';
        E.reset_tab_state = tab_id => set_tab_state(get_tab_id(tab_id), 'idle');

        const set_rule_tasks = {};
        function set_rule(opt) {
            _util4.default.assert(E.get('inited'),
            new Error('set_rule failed, be_rule not inited'));
            opt = assign({}, opt);
            const { tab_id } = opt;
            E.task_cancel_all();
            if (fix_tasks[tab_id])
            fix_tasks[tab_id].return();
            if (set_rule_tasks[tab_id])
            set_rule_tasks[tab_id].return();
            set_tab_state(opt.tab_id, opt.enabled ? 'enable_rule' : 'disable_rule');
            if (!E.set_busy({ desc: opt.enabled ? 'Finding peers...' :
                'Stopping peer routing...' }))
            {
                return E.schedule(['set_rule', opt]);
            }
            E.sp.spawn((0, _etask2.default)({ cancel: true }, function* _set_rule() {
                set_rule_tasks[tab_id] = this;
                this.finally(() => {
                    delete set_rule_tasks[tab_id];
                    E.clr_busy();
                    set_tab_state(tab_id, 'idle');
                });
                const hola_uid = _ext2.default.get('hola_uid');
                try {
                    if (_util8.default.is_mocha())
                    E.t.set_rule_sp = this;
                    set_tab_state(tab_id, 'update_rules');
                    E.update_progress({ desc: 'Changing country...' });
                    yield E.set_rule(opt, true);
                    if (!opt.stub)
                    {
                        let r = _util6.default.find_rule(E.rules && E.rules.unblocker_rules,
                        opt);
                        let is_enabled = r && r.enabled;
                        if (!!is_enabled != !!opt.enabled)
                        {
                            _lib2.default.perr_err({ id: 'be_set_rule_mismatch', info: { opt, r,
                                    hola_uid } });
                        }
                        if (opt.enabled)
                        {
                            yield E.verify_proxy({ desc: 'rule_set', rule: opt, tab_id,
                                root_url: opt.root_url });
                        }
                    }
                    set_tab_state(tab_id, 'rule_set');
                    _lib2.default.perr_ok({ id: 'be_set_rule_ok', info: { name: opt.name,
                            type: opt.type, country: opt.country, enabled: opt.enabled,
                            hola_uid } });
                } catch (e) {
                    set_tab_state(tab_id, 'set_rule_err');
                    E.set_err();
                    _lib2.default.perr_err({ id: 'be_script_set_rule_err', info: { hola_uid },
                        err: e });
                }
            }));
        }

        E.is_enabled = rule => {
            if (!rule) 
                return true;
            if (rule.is_mitm && E.be_vpn.is_mitm_active(rule.tab_id))
            return true;
            if (!E.rules || !E.rules.unblocker_rules)
            return false;
            var r = _util6.default.find_rule(E.rules.unblocker_rules, rule);
            return r && r.enabled;
        };

        E.verify_proxy = opt => {
            if (!E.get('inited') || !E.is_enabled(opt.rule) || opt.rule.changing_proxy)
            return;
            opt.rule.changing_proxy = true;
            set_tab_state(opt.tab_id, 'verify_proxy');
            return (0, _etask2.default)({ cancel: true }, function* verify_proxy_() {
                this.finally(() => {
                    opt.rule.changing_proxy = false;
                    E.task_remove(this);
                });
                E.task_insert(this);
                return yield _unblocker_lib2.default.get_agents(null, opt.rule);
            });
        };

        E._change_proxy = opt => {
            if (!E.get('inited') || opt.rule.changing_proxy || !E.is_enabled(opt.rule))
            return;
            opt.rule.changing_proxy = true;
            set_tab_state(opt.tab_id, 'change_proxy');
            return (0, _etask2.default)({ cancel: true }, function* change_proxy() {
                this.finally(() => {
                    opt.rule.changing_proxy = false;
                    E.task_remove(this);
                });
                E.task_insert(this);
                E.update_progress({ desc: 'Trying another peer...' });
                const exclude = opt.exclude || _unblocker_lib2.default.get_active_agents(opt.rule);
                return yield _unblocker_lib2.default.resolve_agents([opt.rule], exclude,
                assign({ src_rule: _underscore2.default.pick(opt.rule, 'name', 'country',
                    'force_peer') }, _underscore2.default.pick(opt, 'user_not_working',
                'agent_not_working')));
            });
        };

        function get_report(opt) {
            let tab_id = get_tab_id(opt.tab_id),rule = opt.rule || {};
            let req_errors,user = _premium2.default.get('user');
            if (opt.send_logs && be_bg_main)
            req_errors = be_bg_main.get_dumped_errors(tab_id);
            let page_load, trace;
            if ((trace = _tabs2.default.get_trace(tab_id)) && trace.length)
            page_load = trace[trace.length - 1].duration;
            return assign({
                src_country: opt.src_country || (_info2.default.get('country') || '').
                toLowerCase(),
                hola_uid: user && user.hola_uid,
                url: opt.url || _tabs2.default.get('active.url'),
                root_url: opt.root_url || get_root_url(tab_id),
                premium: _ext2.default.get('is_premium'),
                proxy_country: rule.country && rule.country.toLowerCase(),
                tab_id,
                callback_raw: _mode2.default.get('svc.callback_raw'),
                callback_ts: _mode2.default.get('svc.callback_ts'),
                mode_change_count: _mode2.default.get('mode_change_count'),
                multiple_mode_changes: _mode2.default.get('mode_change_count') > 2,
                real_url: _tabs2.default.get('active.url'),
                status: _tabs2.default.get('active.status'),
                agent: _unblocker_lib2.default.get_active_agents(opt.rule),
                mitm_active: E.be_vpn.is_mitm_active(tab_id),
                req_errors,
                src: opt.src,
                page_load },
            _underscore2.default.pick(rule, 'name', 'type'));
        }

        E.send_fix_it_report = opt => (0, _etask2.default)(function* send_fix_it_report_() {
            if (!E.get('inited'))
            return;
            let log,info = get_report(opt);
            if (opt.send_logs && be_bg_main)
            {
                let root_url = get_root_url(info.tab_id);
                if (CG('debug_logs.domains', []).includes(root_url) ||
                Math.random() * 100 < CG('debug_logs.all_domains_perc', 0))
                {
                    log = _util2.default.get_log();
                }
            }
            const res = yield _lib2.default.perr_err({ id: 'be_ui_vpn_click_no_fix_it', info,
                filehead: log });
            if (be_bg_main && _util8.default.get(res, 'bug_id'))
            be_bg_main.set_bug_id(res.bug_id);
        });

        E.send_vpn_work_report = function (opt) {
            var tab_id = get_tab_id(),rule = opt.rule || {};
            var user = _premium2.default.get('user');
            _lib2.default.perr_err({ id: 'be_vpn_ok', info: assign({
                    src_country: (_info2.default.get('country') || '').toLowerCase(),
                    url: _tabs2.default.get('active.url'),
                    root_url: get_root_url(tab_id),
                    proxy_country: rule.country && rule.country.toLowerCase(),
                    hola_uid: user && user.hola_uid,
                    mitm_active: rule.is_mitm,
                    src: opt.src },
                _underscore2.default.pick(rule, 'name', 'type')) });
        };

        var fix_tasks = {};
        E.fix_vpn = opt => {
            if (!E.get('inited'))
            return;
            opt = opt || {};
            let ts = Date.now(),tab_id = opt.tab_id;
            if (fix_tasks[tab_id])
            fix_tasks[tab_id].return();
            set_tab_state(opt.tab_id, 'fix_vpn');
            return fix_tasks[tab_id] = (0, _etask2.default)({ cancel: true, async: true },
            function* fix_vpn_() {
                this.finally(() => {
                    delete fix_tasks[tab_id];
                    set_tab_state(opt.tab_id, 'idle');
                });
                try {
                    let set_err, agent;
                    let tu = _tab_unblocker2.default.get_tab_unblocker(tab_id);
                    if (tu && (agent = tu.last_agent))
                    {
                        set_err = tu.fix_vpn_set_err = tu.fix_vpn_set_err || {};
                        inc_set_err(set_err, agent.host);
                        if (agent.pool)
                        {
                            yield E._set_req_err('fix_vpn', agent, { url: opt.url,
                                tab_id, status: -1 });
                        }
                    }
                    E.be_vpn.reauth(opt.rule);
                    yield E.change_proxy_wait({ rule: opt.rule, desc: 'not_working',
                        root_url: opt.root_url, user_not_working: true, tab_id });
                    _zerr2.default.notice('tab:%d reloading tab on fix_vpn', tab_id);
                    _tabs2.default.reload(tab_id, opt.url);
                    if (_util8.default.is_mocha() || Date.now() - ts >= 10 * SEC)
                    return;
                    while (true)
                    {
                        const trace = _tabs2.default.get_trace(tab_id);
                        const last_trace = trace && trace.length &&
                        trace[trace.length - 1];
                        const status = _util8.default.get(last_trace, 'status');
                        if (status)
                        {
                            let page_load = _util8.default.get(last_trace, 'duration');
                            return page_load < 20 * SEC && !['4', '5'].includes(status[0]);
                        }
                        this.fix_waiting = true;
                        yield this.wait(20 * SEC);
                        this.fix_waiting = false;
                    }
                } catch (e) {
                    set_tab_state(opt.tab_id, 'fix_vpn_err');
                    this.fix_waiting = false;
                    _lib2.default.perr_err({ id: 'be_fix_vpn_err', info: opt, err: e });
                }
            });
        };

        function inc_set_err(s, agent) {
            if (s.agent == agent)
            s.count++;else

            {
                s.count = 1;
                s.agent = agent;
            }
        }

        E.reset_set_err = tab => {
            if (tab.set_err)
            tab.set_err.count = 0;
        };

        E._set_req_err = (id, agent, opt) => (0, _etask2.default)(function* _set_req_err_() {
            let domain = _url2.default.parse(opt.url).host;
            _zerr2.default.notice('tab:%d %s set_err: %s domain=%s', opt.tab_id, id, agent.host,
            domain);
            try {
                const ret = yield _ajax2.default.json({ url: _escape2.default.uri('https://' + agent.host +
                    ':' + agent.port + '/set_err', { domain, err_code: opt.status }) });
                _util4.default.assert(_util8.default.get(ret, 'res'), new Error('empty res'));
                return ret.res;
            } catch (e) {
                _lib2.default.perr_err({ id: id + '_set_err_failed', rate_limit: { count: 1 },
                    err: e });
                return { err: e };
            }
        });

        function get_root_url(tab_id) {
            var url;
            return tab_id >= 0 && (url = _tabs2.default.get_url(tab_id)) &&
            _util6.default.get_root_url(url);
        }

        E.change_proxy = (details, reason, route_opt) => {
            if (!E.get('inited'))
            return;
            var tu = _tab_unblocker2.default.get_tab_unblocker(details.tabId);
            var exclude = _unblocker_lib2.default.get_chosen_agent(route_opt, tu.rule);
            var root_url = get_root_url(details.tabId);
            if (!exclude.length)
            {
                var route = _util6.default.gen_route_str_lc(route_opt, { no_algo: true });
                _zerr2.default.debug('tab:%d no agents for %s route, root_url: %s',
                details.tabId, route, root_url);
                _lib2.default.perr_err({ id: 'debug_null_agents', info: {
                        agents: _unblocker_lib2.default.get_active_agents(tu.rule), details } });
            }
            exclude = exclude.map(e => _util8.default.omit(e, 'rtt'));
            const bad_agents = _underscore2.default.pluck(exclude, 'host');
            _lib2.default.perr_ok({ id: 'change_proxy_on_err', info: { reason, bad_agents } });
            _zerr2.default.debug('tab:%d change agent on %s, bad agents: [%s], root_url: %s',
            details.tabId, reason, bad_agents.join(','), root_url);
            return E._change_proxy({ rule: tu.rule, exclude, root_url: root_url || '',
                agent_not_working: true });
        };

        const ext_on_err = (rule, agent, details, route_opt, retry) => (0, _etask2.default)(
        function* ext_on_err_() {
            if (rule.changing_proxy)
            return;
            const res = yield E.change_proxy(details, details.error || (
            retry ? 'retry' : 'unknown'), route_opt, retry);
            if (_util8.default.get(res, 'error'))
            return;
            if (!retry && details.tabId >= 0)
            {
                _zerr2.default.notice('tab:%d reloading tab on error %s', details.tabId,
                details.error);
                _tabs2.default.reload(details.tabId);
            }
            _ext2.default.trigger('not_working', { tab_id: details.tabId, src: 'agent', agent,
                rule: _util4.default.get_rule_min_fmt(rule) });
        });

        function check_retry(rule, agent, details, tab, route_opt) {
            var retry_conf;
            if (!agent || !(retry_conf = CG('request_errors.retry')))
            return;
            var url = details.url;
            var ret = retry_conf.sporadic_perc &&
            tab.req_err_total_n / tab.req_total_n * 100 < retry_conf.sporadic_perc &&
            'sporadic';
            var retry = reason => {
                if (!reason)
                return;
                _zerr2.default.notice('tab:%d allow retry for %s failed request, %s %s',
                details.tabId, reason, details.error || details.statusCode,
                url.slice(0, 200));
                _lib2.default.perr_err({ id: 'req_err_retry_' + reason, info: { url,
                        status: details.statusCode, error: details.error, agent,
                        type: details.type, rule: _util4.default.get_rule_min_fmt(rule) },
                    rate_limit: { count: 1 } });
                return ext_on_err(rule, agent, details, route_opt, true);
            };
            var mf;
            if (retry_conf.disable_media_failure || !(mf = bext_config.media_failure))
            return retry(ret);
            var urls = tab.retry_urls = _util8.default.get(tab, 'retry_urls', {}),
            root_url = _util8.default.get(rule, 'name');
            var verify;
            if (!(verify = _util2.default.get_site_verify_conf(root_url, url,
            _util8.default.get(rule, 'country'))))
            {
                return retry(ret);
            }
            if (verify.url && urls[url] >= (verify.max_retry || retry_conf.max || 5))
            {
                _zerr2.default.notice('tab:%d max retry %d for media request failed exceeded, ' +
                '%s, %s', details.tabId, urls[url], details.error,
                url.slice(0, 200));
                return;
            }
            var check_ext = ext => url.includes('.' + ext);
            if (mf.extensions.find(check_ext) || verify.url)
            {
                urls[url] = (urls[url] || 0) + 1;
                ret = 'media';
            }
            return retry(ret);
        }

        const is_main_frame = d => !d.frameId && d.type == 'main_frame';

        E.fix_req_err = (rule, agent, d, tab, route_opt) => {
            if (!E.get('inited') || !rule ||
            !is_main_frame(d) && check_retry(rule, agent, d, tab, route_opt))
            {
                return;
            }
            E.be_vpn.reauth(rule);
            var curr;
            if (agent && (curr = (_unblocker_lib2.default.get_chosen_agent(route_opt,
            rule) || [])[0]) && agent.host != curr.host)
            {
                _zerr2.default.notice('tab:%d ignore agent change: failed %s current %s',
                d.tabId, agent.host, curr.host);
                return;
            }
            var now = Date.now(),limit = _ext2.default.get('gen.autoreload_limit') || 3;
            var per = _ext2.default.get('gen.autoreload_ms') || _date2.default.ms.MIN;
            if (tab.req_err_n == limit)
            {
                if (is_main_frame(d) && ['ERR_DNS_FAILED', TUNNEL_ERR].
                includes(d.error))
                {
                    E.set_tab_load_err(d.tabId, d.error);
                }
                if (now - tab.req_err_ts < per)
                return;
                tab.req_err_sent = tab.req_err_n = 0;
            }
            if (!tab.req_err_n)
            tab.req_err_ts = now;
            tab.req_err_n = (tab.req_err_n || 0) + 1;
            var info = { url: d.url, type: d.type, error: d.error, agent,
                rule: _util4.default.get_rule_min_fmt(rule) };
            if (tab.req_err_n == limit)
            {
                _lib2.default.perr_err({ id: 'req_err_autoreload_max', info });
                if (is_main_frame(d) && request_errors.includes(d.error))
                {
                    _lib2.default.perr_err({ id: 'req_err_main_frame', info: info });
                }
            }
            _lib2.default.perr_err({ id: 'req_err', info: info });
            if (_ext2.default.get('gen.report_tab_load_on'))
            _tabs2.default.page_trace(d, 'autoreload');
            return ext_on_err(rule, agent, d, route_opt);
        };

        E.fix_media_req_err = (rule, agent, d, tab, route_opt, opt) => {
            opt = opt || {};
            var host;
            if (!rule || !(host = agent && agent.host))
            return;
            var verify,root_url,tab_url = d.initiator || d.url;
            if (tab_url)
            root_url = _util6.default.get_root_url(tab_url);
            var set_err = root_url && agent && (verify = _util2.default.get_site_verify_conf(
            root_url, d.url, rule.country));
            if (!opt.disable_perr)
            {
                _lib2.default.perr_ok({ id: 'media_failure_detected',
                    info: { url: d.url, code: d.statusCode, page_url: tab_url,
                        root_url, agent: host, set_err: !!set_err, rule: verify },
                    rate_limit: { count: 1 } });
            }
            if (!set_err)
            return;
            tab.set_err = tab.set_err || {};
            inc_set_err(tab.set_err, host);
            if (!agent.pool || tab.set_err.count > 3)
            {
                _zerr2.default.debug('tab:%d try agent replacement instead of set err: ' + (
                agent.pool ? 'limit exceeded' : 'non-pool agent'));
                if (check_retry(rule, agent, d, tab, route_opt) && opt.cancel_to_retry)
                return d.ret = { cancel: true };
                return;
            }
            if (opt.disable_set_err)
            return;
            var limit = assign({ ms: 5 * _date2.default.ms.MIN, count: 10 }, opt.set_err_rate_limit);
            var rl_hash = set_err_rl[root_url] = set_err_rl[root_url] || {};
            var rl = rl_hash[host] = rl_hash[host] || {};
            if (!(0, _rate_limit2.default)(rl, limit.ms, limit.count))
            return _zerr2.default.debug('tab:%d set_err limit exeeded: %s', d.tabId, host);
            return E._set_req_err('media_failure', agent, { tab_id: d.tabId, url: d.url,
                status: d.statusCode });
        };

        E.disable_premium = () => (0, _etask2.default)({ cancel: true }, function* disable_premium() {
            E.set_rule({ name: 'all_browser', country: 'us', del: true,
                enabled: false });
            let urules,rules = _unblocker_lib2.default.get_rules();
            if (!rules || !(urules = rules.unblocker_rules))
            return;
            for (let name in urules)
            {
                let site_conf,r = urules[name];
                if (!r.enabled || !_premium2.default.get_force_premium_rule(r.name) &&
                !((site_conf = _util2.default.get_site_conf(r.name)) &&
                site_conf.require_plus))
                {
                    continue;
                }
                r.enabled = false;
                E.set_rule({ name: r.name, country: r.country, enabled: r.enabled });
            }
            yield E.update_rules(rules);
        });

        E.disable_trial = domains => (0, _etask2.default)({ cancel: true }, function* disable_trial() {
            let update,rules = _unblocker_lib2.default.get_rules();
            if (!rules)
            return;
            domains.forEach(domain => {
                let rule = _util4.default.get_rules(rules, 'http://' + domain + '/', true);
                if (!(rule = rule && rule[0]) || !rule.enabled || rule.src != 'trial')
                return;
                let unblockers = _tab_unblocker2.default.tab_unblockers || {};
                for (let tabid in unblockers)
                {
                    let uri,u = unblockers[tabid];
                    if (!u.rule || u.rule.name != rule.name || !(tabid = +tabid))
                    continue;
                    if (uri = _url2.default.parse(_tabs2.default.get_url(tabid)))
                    {
                        chrome.tabs.update(tabid,
                        { url: uri.protocol + '//' + uri.hostname });
                    }
                }
                rule.enabled = false;
                E.set_rule({ name: domain, country: rule.country, enabled: rule.enabled,
                    src: 'trial' });
                update = true;
            });
            if (update)
            yield E.update_rules(rules);
        });

        E.change_proxy_wait = opt => (0, _etask2.default)({ cancel: true }, function* change_proxy_wait_() {
            this.finally(() => set_tab_state(opt.tab_id, 'idle'));
            if (E.get('status') != 'busy')
            return yield E._change_proxy(opt);
            E.once('change:status', () => this.continue(E._change_proxy(opt)));
            return yield this.wait();
        });

        E.set_stub_rule = (tab_id, rule) => {
            let tabs_stub_rules = assign({}, E.get('tabs_stub_rules'));
            if (_util8.default.get(rule, 'enabled'))
            tabs_stub_rules[tab_id] = rule;else

            delete tabs_stub_rules[tab_id];
            E.set('tabs_stub_rules', tabs_stub_rules);
        };

        E.get_stub_rule = tab_id => (E.get('tabs_stub_rules') || {})[tab_id];

        E.set_tab_load_err = (tab_id, err) => {
            let tab_load_err = assign({}, E.get('tab_load_err'));
            const is_all_browser = tab_id == 'all_browser';
            if (err && tab_load_err[tab_id] || !err && !tab_load_err[tab_id] &&
            !is_all_browser)
            {
                return;
            }
            if (err)
            tab_load_err[tab_id] = { err };else

            {
                if (is_all_browser)
                tab_load_err = {};else

                delete tab_load_err[tab_id];
            }
            E.set('tab_load_err', tab_load_err);
        };

        E.get_tab_load_err = tab_id => (E.get('tab_load_err') || {})[tab_id];

        if (_util8.default.is_mocha())
        E.t = { check_retry, on_max_redirects };exports.default =

        E;});})();
//# sourceMappingURL=rule.js.map
