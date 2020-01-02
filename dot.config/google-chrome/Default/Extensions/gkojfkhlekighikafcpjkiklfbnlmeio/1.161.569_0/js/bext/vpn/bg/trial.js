// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'conf', '/bext/pub/backbone.js', '/util/etask.js', '/util/zerr.js', '/util/date.js', '/bext/pub/ext.js', '/bext/pub/lib.js', '/bext/vpn/bg/bg_ajax.js', '/bext/vpn/bg/tabs.js', '/bext/pub/util.js', '/bext/vpn/bg/premium.js', '/util/util.js', '/bext/vpn/util/util.js', '/svc/vpn/pub/unblocker_lib.js'], function (exports, _conf, _backbone, _etask, _zerr, _date, _ext, _lib, _bg_ajax, _tabs, _util, _premium, _util3, _util5, _unblocker_lib) {Object.defineProperty(exports, "__esModule", { value: true });var _conf2 = _interopRequireDefault(_conf);var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _zerr2 = _interopRequireDefault(_zerr);var _date2 = _interopRequireDefault(_date);var _ext2 = _interopRequireDefault(_ext);var _lib2 = _interopRequireDefault(_lib);var _bg_ajax2 = _interopRequireDefault(_bg_ajax);var _tabs2 = _interopRequireDefault(_tabs);var _util2 = _interopRequireDefault(_util);var _premium2 = _interopRequireDefault(_premium);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _unblocker_lib2 = _interopRequireDefault(_unblocker_lib);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}















        _util6.default.assert_bg('be_trial');
        const assign = Object.assign;
        let handler, is_user_updated;
        const E = new (_backbone2.default.task_model.extend({
            model_name: 'trial',
            _defaults: function () {this.on('destroy', () => E.uninit());} }))();


        function Trial() {
            this.trials = [];
            this.name = 'remote';
            this.get_trials = get_trials.bind(this, '/trial_get2');
            E.listenTo(E.be_rule, 'rule_set', this.on_rule = function (rule) {
                if (_unblocker_lib2.default.is_trial_rule(rule) && rule.enabled)
                _unblocker_lib2.default.resolve_agents([rule], null, { new_only: true });
            });
        }

        Trial.prototype.get_trial_active = function (root_url, ignore_ts) {
            if (is_user_updated && !_ext2.default.get('user_id') || _ext2.default.get('is_premium'))
            return;
            return this.trials.find(t => {
                if (root_url && !t.domain.includes(root_url))
                return false;
                return ignore_ts || t.expire_ts > Date.now();
            });
        };

        Trial.prototype.is_trial_available = function (root_url) {
            return this.set_trial(root_url, 'start', { dry_run: 1 });};

        Trial.prototype.is_trial_expired = function (root_url) {
            return ['expired', 'grace'].includes(this.trial_state(root_url));};

        Trial.prototype.is_trial_grace_period = function (root_url) {
            return this.trial_state(root_url) == 'grace';};

        Trial.prototype.set_trial = function (root_url, cmd, opt) {
            var site;
            if (!(site = _util2.default.get_site_conf(root_url)))
            return;
            opt = opt || {};
            cmd = cmd || 'start';
            var _this = this;
            return (0, _etask2.default)('trial_start', function* trial_start_() {
                try {
                    const qs = assign({ url: root_url, opt: cmd }, _ext2.default.auth());
                    if (opt.dry_run)
                    qs.dry_run = 1;
                    const be_bg_main = window.be_bg_main;
                    if (be_bg_main)
                    {
                        be_bg_main.ga_send('event', { cat: 'ppc', act: 'trial_start',
                            lab: root_url });
                    }
                    _lib2.default.perr_ok({ id: 'be_trial_start', info: { root_url, cmd } });
                    let res = yield _bg_ajax2.default.ccgi_ajax(
                    { url: _conf2.default.url_ccgi + '/trial_set2', qs });
                    if (!_util4.default.get(res, 'time_left'))
                    {
                        _lib2.default.perr_ok({ id: 'be_trial_start_no_trial',
                            info: { root_url, cmd } });
                        return;
                    }
                    _lib2.default.perr_ok({ id: 'be_trial_start_got_trial', info: { cmd,
                            root_url, time_left: res.time_left, grace_ms: res.grace_ms } });
                    let domain = site.root_url;
                    if (!Array.isArray(domain))
                    domain = [domain];
                    res = { domain, time_left: res.time_left, use: res.use,
                        grace_ms: res.grace_ms, expire_ts: Date.now() + res.time_left };
                    if (!opt.dry_run)
                    {
                        let t;
                        if (t = _this.get_trial(root_url))
                        _this.trials.splice(_this.trials.indexOf(t), 1);
                        _this.trials.push(res);
                        _this.monitor_active_trial();
                        _ext2.default.trigger('trial_start', root_url);
                    }
                    return res;
                } catch (e) {
                    _zerr2.default.warn('trial_start failed %s', _zerr2.default.e2s(e));
                    _lib2.default.perr_err({ id: 'be_trial_start_error', info: { root_url, cmd,
                            err: _util4.default.omit(e, 'etask') } });
                    throw new Error(_util4.default.get(e, 'hola_info.data.err', 'unknown'));
                }
            });
        };

        Trial.prototype.monitor_active_trial = function () {
            if (this.trial_monitor)
            return;
            const _this = this;
            this.trial_monitor = (0, _etask2.default)({ async: true }, function* trial_monitor_() {
                this.finally(() => _this.trial_monitor = null);
                return yield monitor_active_trial();
            });
            E.sp.spawn(this.trial_monitor);
        };

        Trial.prototype.get_trial = function (root_url) {
            return this.trials.find(t => t.domain.includes(root_url));
        };

        Trial.prototype.get_trial_agent_port = function (rule, def_port, route_opt) {
            if (!rule || _ext2.default.get('is_premium') ||
            !['running', 'grace'].includes(this.trial_state(rule.name)))
            {
                return def_port;
            }
            return (route_opt || {}).peer ? 22226 : 22225;
        };

        Trial.prototype.trial_state = function (root_url) {
            let t;
            if (!root_url || !(t = this.get_trial(root_url)))
            return;
            if (!_util2.default.get_site_conf(root_url))
            return 'forbidden';
            const now = Date.now();
            if (t.expire_ts > now)
            return 'running';
            return t.grace_ms && t.expire_ts < now && now < t.grace_ms + t.expire_ts ?
            'grace' : 'expired';
        };

        Trial.prototype.set_time_left = function (root_url, value, reset_use) {
            let t, user_id;
            if (!(t = this.get_trial_active(root_url, true)) ||
            !(user_id = _ext2.default.get('user_id')))
            {
                return;
            }
            return (0, _etask2.default)('trial_set_time_left', function* set_time_left_() {
                try {
                    _lib2.default.perr_ok({ id: 'set_time_left', info: { root_url, value } });
                    const res = yield _bg_ajax2.default.ccgi_ajax({ url: _conf2.default.url_ccgi +
                        '/trial_set_time_left', qs: assign({ url: root_url, reset_use,
                            time_left: value, user_id }, _ext2.default.auth()) });
                    if (res.time_left)
                    {
                        t.expire_ts = Date.now() + res.time_left;
                        t.time_left = res.time_left;
                    }
                    if (res.use)
                    t.use = res.use;
                    _ext2.default.trigger('trial_change', root_url, t);
                    return res;
                } catch (e) {
                    _zerr2.default.warn('trial_set_time_left failed %s', _zerr2.default.e2s(e));
                    throw new Error(_util4.default.get(e, 'hola_info.data.err', 'unknown'));
                }
            });
        };

        Trial.prototype.reset = function (root_url) {
            let user_id;
            if (!(user_id = _ext2.default.get('user_id')))
            return;
            return (0, _etask2.default)(function* trial_reset() {
                try {
                    _lib2.default.perr_ok({ id: 'set_time_left_', info: { root_url } });
                    yield _bg_ajax2.default.ccgi_ajax({ url: _conf2.default.url_ccgi + '/trial_reset',
                        qs: assign({ url: root_url, user_id }, _ext2.default.auth()) });
                    refresh_trials();
                } catch (e) {
                    _zerr2.default.warn('trial_reset failed %s', _zerr2.default.e2s(e));
                    throw new Error(_util4.default.get(e, 'hola_info.data.err', 'unknown'));
                }
            });
        };

        Trial.prototype.uninit = function () {
            if (this.on_rule)
            E.stopListening(E.be_rule, 'rule_set', this.on_rule);
            if (this.trial_monitor)
            this.trial_monitor.return();
        };

        function update_trials() {
            if (update_trials.to)
            return;
            update_trials.to = _util6.default.set_timeout(() => {
                delete update_trials.to;
                if (E.get_trial_active())
                refresh_trials();
            }, _date2.default.ms.HOUR);
        }

        const clear_trial = trial => (0, _etask2.default)({ cancel: true }, function* clear_trial_() {
            if (trial.expire_ts <= Date.now() || !_ext2.default.get('user_id'))
            yield E.be_rule.disable_trial(trial.domain);
        });

        function monitor_active_trial(on_active_cb) {
            let trial_usage = 0,ended = {},cleared = {};
            return _etask2.default.interval(_date2.default.ms.SEC, function* monitor_active_trial_() {
                let is_active, is_grace;
                for (let t of handler.trials)
                {
                    let root_url = t.domain[0];
                    if (E.get_trial_active(root_url))
                    {
                        is_active = true;
                        ended[root_url] = cleared[root_url] = undefined;
                        continue;
                    }
                    if (!ended[root_url])
                    {
                        _ext2.default.trigger('trial_end', root_url);
                        const be_bg_main = window.be_bg_main;
                        if (be_bg_main)
                        {
                            be_bg_main.ga_send('event', { cat: 'ppc', act: 'trial_end',
                                lab: root_url });
                        }
                        ended[root_url] = true;
                    }
                    if (E.is_trial_grace_period(root_url))
                    is_grace = true;else

                    {
                        if (!cleared[root_url])
                        yield clear_trial(t);
                        cleared[root_url] = true;
                    }
                }
                if (on_active_cb)
                on_active_cb(is_active && !is_grace);
                if (!is_active)
                {
                    if (trial_usage > 0)
                    {
                        _lib2.default.perr_ok({ id: 'be_site_trial_usage',
                            info: { sec: trial_usage } });
                    }
                    trial_usage = 0;
                    if (!is_grace)
                    return yield this.break();
                }
                if (get_trial_using())
                trial_usage++;
            });
        }

        function get_trial_using(root_url) {
            var trial;
            if (!(trial = E.get_trial_active(root_url)))
            return;
            for (var rule, rules, i = 0; i < trial.domain.length; i++)
            {
                root_url = trial.domain[i];
                if (!_tabs2.default.has_root_url(root_url))
                return false;
                rules = E.be_rule.get_rules('http://' + root_url + '/', true);
                if ((rule = rules && rules[0]) && rule.enabled)
                return root_url;
            }
        }

        function refresh_trials() {handler.get_trials();}

        function update_trial(trials) {
            var now = Date.now();
            return trials.map(t => {
                let site;
                if (site = _util2.default.get_site_conf(t.domain))
                t.domain = site.root_url;
                if (!Array.isArray(t.domain))
                t.domain = [t.domain];
                if (t.expire_ts >= now && t.time_left !== undefined || t.time_left > 0)
                t.expire_ts = now + t.time_left;
                return t;
            });
        }

        function get_trials(url) {
            const _this = this;
            return (0, _etask2.default)('get_trials', function* get_trials_() {
                try {
                    const auth = _ext2.default.auth();
                    if (!auth || !auth.uuid || !auth.session_key)
                    {
                        _lib2.default.perr(_zerr2.default.L.NOTICE, { id: 'be_empty_user_session' });
                        return;
                    }
                    const trials = yield _bg_ajax2.default.ccgi_ajax(
                    { url: _conf2.default.url_ccgi + url, qs: auth });
                    if (!trials || !Array.isArray(trials))
                    return;
                    _this.trials = update_trial(trials);
                    _this.monitor_active_trial();
                } catch (e) {_zerr2.default.warn('get_trial failed %s', _zerr2.default.e2s(e));}
            });
        }

        E.is_trial_grace_period = root_url =>
        !_util4.default.is_mocha() && handler.is_trial_grace_period(root_url);

        E.set_trial = (root_url, cmd, opt) => handler.set_trial(root_url, cmd, opt);

        E.is_trial_available = root_url =>
        !_util4.default.is_mocha() && handler.is_trial_available(root_url);

        E.is_trial_expired = root_url =>
        !_util4.default.is_mocha() && handler.is_trial_expired(root_url);

        E.get_trial_active = (root_url, ignore_ts) =>
        handler.get_trial_active(root_url, ignore_ts);

        E.get_trial_agent_port = (rule, def_port, route_opt) => {
            return _util4.default.is_mocha() || !handler ? def_port :
            handler.get_trial_agent_port(rule, def_port, route_opt);
        };

        E.get_next_trial_ts = root_url => {
            let trial, site;
            if (!(site = _util2.default.get_site_conf(root_url)) || !site.trial ||
            !(trial = E.get_trial_active(root_url, true)))
            {
                return;
            }
            let limits, lperiod;
            if ((limits = site.trial.limits) && limits.count)
            {
                lperiod = limits.period || _date2.default.ms.DAY;
                if (trial.use && trial.use.count >= limits.count)
                return trial.use.ts + lperiod;
            }
            const wait = site.trial.wait !== undefined ? site.trial.wait : 2 * _date2.default.ms.MIN;
            return trial.expire_ts + wait;
        };

        E.set_time_left = (...args) => {
            if (handler.set_time_left)
            return handler.set_time_left(...args);
        };

        E.reset = (...args) => {
            if (handler.reset)
            return handler.reset(...args);
        };

        E.need_trial = root_url => {
            const site_conf = _util2.default.get_site_conf(root_url);
            return site_conf && site_conf.require_plus && !_ext2.default.get('is_premium') &&
            site_conf.trial && !E.get_trial_active(root_url);
        };

        E.init = be_rule => {
            E.be_rule = be_rule;
            E.sp = _util6.default.new_etask('be_trial');
            E.listenTo(_ext2.default, 'change:session_key', refresh_trials);
            E.listenTo(_ext2.default, 'change:user_id', () => {
                if (handler.get_trial_active() && !handler.trial_monitor)
                handler.monitor_active_trial();
            });
            E.listenTo(_ext2.default, 'change:ui_open', update_trials);
            E.listenTo(_premium2.default, 'user_updated', () => is_user_updated = true);
            handler = new Trial();
        };

        E.uninit = () => {
            E.sp.return();
            if (update_trials.to)
            update_trials.to = _util6.default.clear_timeout(update_trials.to);
            E.stopListening();
        };exports.default =

        E;});})();
//# sourceMappingURL=trial.js.map
