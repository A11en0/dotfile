// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', '/util/util.js', '/util/etask.js', '/util/escape.js', '/util/url.js', '/util/zerr.js', '/util/date.js', '/util/string.js', '/bext/pub/browser.js', '/svc/vpn/pub/util.js', '/bext/pub/util.js', '/bext/vpn/util/util.js', '/util/storage.js', '/protocol/pub/countries.js', '/bext/pub/backbone.js', '/bext/pub/locale.js'], function (exports, _underscore, _util, _etask, _escape, _url, _zerr, _date, _string, _browser, _util3, _util5, _util7, _storage, _countries, _backbone, _locale) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _util2 = _interopRequireDefault(_util);var _etask2 = _interopRequireDefault(_etask);var _escape2 = _interopRequireDefault(_escape);var _url2 = _interopRequireDefault(_url);var _zerr2 = _interopRequireDefault(_zerr);var _date2 = _interopRequireDefault(_date);var _string2 = _interopRequireDefault(_string);var _browser2 = _interopRequireDefault(_browser);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _util8 = _interopRequireDefault(_util7);var _storage2 = _interopRequireDefault(_storage);var _countries2 = _interopRequireDefault(_countries);var _backbone2 = _interopRequireDefault(_backbone);var _locale2 = _interopRequireDefault(_locale);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};

















        _util8.default.assert_ui('be_ui_api');
        _etask2.default.set_zerr(_zerr2.default);
        _zerr2.default.set_exception_handler('be', (id, info, err) => perr_err(id, info, { err }));
        const E = new _backbone2.default.model({ model_name: 'ui_api' });
        const assign = Object.assign,root2url = _util8.default.root2url,qw = _string2.default.qw;
        const CG = _util6.default.CG;
        const chrome = window.chrome;

        const ping_bg_api = () => {
            if (!_browser2.default.use_msg)
            return;
            const et = _etask2.default.wait();
            const ping = () => _browser2.default.backbone.client.ping('bg_ui_api', 500, ret => {
                if (ret.error)
                {
                    (0, _zerr2.default)('ping bg failed %s', _zerr2.default.json(ret));
                    ping();
                } else

                et.continue();
            });
            ping();
            return et;
        };

        const init_bg_api = () => (0, _etask2.default)(function* () {
            let module;
            while (!(module = _browser2.default.backbone.client.start('bg_ui_api')))
            {
                (0, _zerr2.default)(`bg_ui_api start failed, retrying`);
                yield _etask2.default.sleep(300);
            }
            if (!_browser2.default.use_msg)
            return module;
            const et = _etask2.default.wait();
            const cb = () => {
                if (!module.get('_backbone_client_started'))
                return;
                module.off('change:_backbone_client_started', cb);
                et.continue();
            };
            module.on_init('change:_backbone_client_started', cb);
            yield et;
            return module;
        });

        E.init = () => (0, _etask2.default)(function* () {
            if (E.inited)
            return;
            E.inited = true;
            _browser2.default.init();
            yield ping_bg_api();
            E.bg_ui_api = yield init_bg_api();
            _countries2.default.add_il();
            E.listenTo(E.bg_ui_api, 'body_click', e => {
                if (_util8.default.is_tpopup() && e.connection_id == E.get_connection_id())
                E.trigger('body_click');
            });
            E.listenTo(E.bg_ui_api, 'trial_end', root_url => {
                if (root_url == E.get_root_url())
                E.trigger('trial_end');
            });
            E.listenTo(E.bg_ui_api, 'trial_start', root_url => {
                if (root_url == E.get_root_url())
                E.trigger('trial_start');
            });
            E.listenTo(E.bg_ui_api, 'trial_change', (root_url, trial) => {
                if (root_url == E.get_root_url())
                E.trigger('trial_change', trial);
            });
            const events = qw`storage_debug_change force_trial mitm_manual_unblock
        mouseleave url_changed tab_id_changed country_changed enabled_changed
        bg_main_inited user_changed membership_changed rule_changed
        ext_active_changed mitm_site_changed status_changed settings_changed
        tab_load_err vpn_status_changed svc_info_changed svc_version_changed
        protect_changed ext_conflict_changed agree_ts_changed
        dev_mode_changed set_tab_state`;
            events.forEach(event =>
            E.listenTo(E.bg_ui_api, event, (...args) => E.trigger(event, ...args)));
            E.reset_bg_ajax();
            _util6.default.set_ajax_cb(req => E.perr_ajax(req));
            _util6.default.set_bext_config_cb(() => E.get_bext_config());
        });

        E.uninit = () => {
            if (!E.inited)
            return;
            E.inited = false;
            _util6.default.set_ajax_cb(null);
            _util6.default.set_bext_config_cb(null);
            _browser2.default.backbone.client.stop('bg_ui_api');
            E.bg_ui_api = null;
            E.stopListening();
        };

        const perr_fn = (level, opt, new_name) => {
            if (opt && opt.with_log)
            opt = _extends({}, opt, { ui_log: _util6.default.get_zerr_log() });
            opt = _extends({}, opt, { is_tpopup: _util8.default.is_tpopup() });
            if (E.bg_ui_api)
            {
                try {return E.bg_ui_api.fcall('perr', [level, opt, new_name]);}
                catch (e) {(0, _zerr2.default)('bg perr failed ' + _zerr2.default.e2s(e));}
            }
            return _util6.default.perr(level, opt, new_name);
        };

        const perr = E.perr = (id, info, opt, new_name) =>
        perr_fn(_zerr2.default.L.NOTICE, _extends({ id, info }, opt), new_name);

        const perr_err = E.perr_err = (id, info, opt, new_name) => {
            opt = opt || {};
            let { err } = opt;
            let bt = err ? _zerr2.default.e2s(err) : opt.bt;
            if (err && err.hola_info)
            {
                bt = 'status ' + err.hola_info.status +
                ' ' + err.hola_info.method + ' ' + err.hola_info.url +
                ' text ' + ('' + err.hola_info.response_text).substr(0, 256) +
                bt;
            }
            if (err && !opt.info && err.etask)
            err = _underscore2.default.omit(err, 'etask');
            return perr_fn(_zerr2.default.L.ERR, _extends({ id, info }, opt, { err, bt }), new_name);
        };

        E.set_enabled = on => (0, _etask2.default)(function* () {
            perr('be_ui_click_' + (on ? 'on' : 'off'));
            if (E.get_ext_conflict())
            return;
            let tab_id = E.get_tab_id(),url = E.get_url();
            let rule = yield E.get_enabled_rule({ tab_id, url });
            if (rule && rule.protect == 'pc')
            E.unblock_action({ url, disable: true });
            E.bg_ui_api.fcall('set_enabled', [on]);
        });

        E.login = src => {
            let url = E.get_url();
            E.set_login_redirect(_url2.default.get_host(url));
            E.open_page(_url2.default.qs_add('https://hola.org/signin', { utm_source: 'holaext',
                utm_content: src, signin_redirect: true, next: url }));
            E.close_popup();
        };

        E.push_event = (name, opt) => E.bg_ui_api.ecall('push_event', [name, opt]);

        E.close_popup = () => {
            if (_util8.default.is_tpopup())
            E.close_tpopup();else

            window.close();
        };

        E.open_about = () => E.open_be_tab({ url: 'about.html', force_active: true });

        E.open_settings = () =>
        E.open_be_tab({ url: 'settings.html', force_active: true });

        E.open_page = (url, curr_tab) => {
            if (curr_tab)
            E.update_tab(E.get_tab_id(), url);else

            E.open_new_tab({ url, force_active: true });
        };

        E.open_plus_page = (root_url, ref) => {
            E.ga_send('checkout', { step: 5, option: ref });
            E.open_page(_util8.default.plus_ref(ref, { root_url }));
        };

        E.search_popular = url => (0, _etask2.default)(function* () {
            yield E.set_force_suggestion(E.get_tab_id(), true);
            E.open_page(url, true);
            E.close_popup();
        });

        E.open_popular = ({ root_url, src_country }) => (0, _etask2.default)(function* () {
            let popular = yield E.get_popular_countries({ root_url, src_country });
            let country = popular[0],url = root2url(root_url);
            yield E.unblock_action({ url, country });
            E.open_page(url, true);
        });

        E.open_ext_settings = () => {
            E.open_new_tab({ url: `chrome://extensions/?id=${chrome.runtime.id}`,
                force_active: true });
        };

        E.force_trial = ({ root_url, tab_id, country }) => (0, _etask2.default)(function* () {
            const is_tpopup = _util8.default.is_tpopup();
            this.finally(() => {
                if (!is_tpopup)
                E.close_popup();
            });
            if (!is_tpopup && (yield E.tpopup_is_connected(tab_id)))
            {
                E.trigger_force_trial({ country, tab_id });
                return this.return();
            }
            _util6.default.set_site_storage(root_url, 'force_trial', { country, tab_id });
            if (is_tpopup)
            return void E.set_tpopup_type('watermark');
            let arr = _util6.default.get_site_conf(root_url, 'root_url', []);
            let same_site = root_url == E.get_root_url() || arr.includes(root_url) &&
            arr.includes(E.get_root_url());
            if (same_site)
            return yield E.do_tpopup(tab_id);
            E.open_page(root2url(root_url), true);
        });

        E.unblock_action = opt => (0, _etask2.default)(function* () {
            let tab_id = E.get_tab_id();
            let { url, country, disable } = opt;
            let root_url = _util4.default.get_root_url(url);
            if (!E.get_ext_active())
            {
                perr_err('be_ui_vpn_set_enabled_mismatch');
                E.trigger('user_action_error');
                return;
            }
            try {
                if (!disable && (yield E.need_trial(root_url)))
                return yield E.force_trial({ root_url, tab_id, country });
                yield E.bg_ui_api.ecall('unblock_action', [_extends({ tab_id }, opt)]);
                perr('be_ui_vpn_script_set_ok', assign({ tab_id, root_url }, opt));
            } catch (e) {
                perr_err('be_ui_vpn_script_set_err', assign({ tab_id, root_url }, opt),
                { err: e });
                E.trigger('user_action_error', e);
            }
        });

        E.open_require_plus = root_url => {
            E.open_plus_page(root_url, 'require_plus_' + root_url.replace(/\./g, '_'));
            E.close_popup();
        };

        E.get_all_countries = vpn_only => {
            let vpn = E.get_vpn_countries() || [];
            return _countries2.default.proxy_countries.bext.filter(c => c.toLowerCase() != 'kp' && (
            !vpn_only || vpn.includes(c.toLowerCase())));
        };

        E.get_popular_ratings = ({ root_url, src_country }) => (0, _etask2.default)(function* () {
            if (!root_url)
            return _util8.default.get_popular_country({});
            let cache = _storage2.default.get_json('popup_rating_cache');
            let rule_ratings = cache && root_url == cache.root_url && cache.rule_ratings;
            if (!Array.isArray(rule_ratings))
            {
                try {
                    let opt = { root_url, src_country, limit: 20, vpn_only: true };
                    let rule = yield E.get_enabled_rule({ tab_id: E.get_tab_id(),
                        url: root2url(root_url) });
                    if (rule && rule.country)
                    opt.proxy_country = rule.country;
                    rule_ratings = yield E.get_rule_ratings(opt);
                    _storage2.default.set_json('popup_rating_cache', { rule_ratings, root_url });
                } catch (e) {
                    perr_err('be_ui_vpn_rule_ratings_err', { root_url }, { err: e });
                }
            }
            let invalid_countries = [];
            rule_ratings = Array.isArray(rule_ratings) && rule_ratings.filter(r => {
                let c = r.proxy_country.toUpperCase();
                if (_countries2.default.proxy_countries.bext.includes(c))
                return true;
                invalid_countries.push(c);
            });
            if (invalid_countries.length)
            {
                perr_err('be_ui_vpn_rating_invalid_countries', { invalid_countries,
                    rule_ratings, cache }, { rate_limit: { count: 1 } });
            }
            return _util8.default.get_popular_country({ host: root_url, rule_ratings });
        });

        const get_popular_by_ratings = ({ root_url, src_country, vpn_only, ratings }) => {
            let site_conf = _util6.default.get_site_conf(root_url);
            let suggestion_conf = _util6.default.get_suggestion_conf(site_conf, src_country);
            let suggested = ((suggestion_conf || {}).proxy || []).filter(c => c != '*');
            let popular = ratings.map(r => r.proxy_country);
            let res = suggested.concat(popular.filter(p => !suggested.includes(p)));
            if (vpn_only)
            {
                let vpn = E.get_vpn_countries() || [];
                res = res.filter(c => vpn.includes(c.toLowerCase()));
            }
            return res;
        };

        E.get_popular_countries = ({ root_url, src_country, vpn_only }) => (0, _etask2.default)(
        function* ()
        {
            let ratings = yield E.get_popular_ratings({ root_url, src_country });
            return get_popular_by_ratings({ root_url, src_country, vpn_only, ratings });
        });

        E.get_default_countries = ({ root_url, src_country, vpn_only }) => {
            let ratings = _util8.default.get_popular_country({ host: root_url });
            return get_popular_by_ratings({ root_url, src_country, vpn_only, ratings });
        };

        E.get_popular_sites = () => (0, _etask2.default)(function* () {
            let limit = 6;
            let list = (yield E.get_unblocking_rate(limit)) || [];
            let root_urls = list.map(p => p.root_url);
            let list_ps = yield E.get_force_premium_rules(root_urls,
            { ignore_install_version: true });
            list = list.map((p, i) => _extends({}, p, { is_ps: _util6.default.get_site_conf(p.root_url,
                'require_plus') || list_ps[i] }));
            return { list, top_urls: root_urls };
        });

        E.get_redirect_urls = () => (0, _etask2.default)(function* () {
            if (_util8.default.is_tpopup())
            return [];
            let list,tab_id = E.get_tab_id();
            list = yield E.get_redirect_list(tab_id);
            if (!list || !list.length)
            return [];
            list = list.map(root2url).filter(u => !_util8.default.is_skip_url(u));
            list.push(E.get_url());
            for (let url of list)
            {
                if (yield E.get_force_premium_rule(_util4.default.get_root_url(url)))
                return [];
            }
            return list;
        });

        E.click_working = ({ src }) => (0, _etask2.default)(function* () {
            let url = E.get_url(),tab_id = E.get_tab_id();
            yield E.increment_vpn_work_yes();
            let rule = yield E.get_enabled_rule({ tab_id, url });
            E.send_vpn_work_report({ rule, src });
        });

        E.click_not_working = ({ src, count, src_country }) => (0, _etask2.default)(function* () {
            let url = E.get_url(),tab_id = E.get_tab_id();
            let root_url = _util4.default.get_root_url(url);
            try {
                let rule = yield E.get_enabled_rule({ tab_id, url });
                if (!rule)
                {
                    return void perr_err('be_ui_vpn_no_rule', { country: src_country,
                        root_url, url });
                }
                if (rule.protect == 'pc')
                E.vpn_change_agent();else

                E.fix_vpn({ rule, root_url, url, tab_id, src_country });
                E.trigger_not_working({ tab_id, src });
                E.send_fix_it_report({ rule, send_logs: count == 1, src });
            } catch (e) {
                perr_err('be_ui_vpn_fix_it_err', { tab_id, root_url }, { err: e });
                E.trigger('user_action_error', e);
            }
        });

        E.click_star = rating => {
            E.set_vpn_last_rating(rating);
            if (rating == 5 && !E.get_rate_on_store())
            E.open_rate_us();
        };

        E.need_rating = () => {
            if (E.get_is_premium() || _util6.default.browser() == 'edge')
            return false;
            let vpn_work_yes = E.get_vpn_work_yes() || 0;
            let rating = E.get_vpn_last_rating() || 0;
            return rating < 5 && vpn_work_yes % 4 == 1;
        };

        E.open_report_problem = () => {
            perr('be_report_problem', {}, { rate_limit: { count: 1 } });
            let url = 'about.html?' + _escape2.default.qs({ url: E.get_url() });
            E.open_be_tab({ url: url + '#report_issue', force_active: true });
        };

        E.get_force_premium_rule = root_url => (0, _etask2.default)(function* () {
            if (E.get_is_premium())
            return false;
            return yield E.bg_ui_api.ecall('get_force_premium_rule', [root_url]);
        });

        E.need_tpopup_hint = () => !_util8.default.get_tpopup_type();

        E.tpopup_close_click = src => (0, _etask2.default)(function* () {
            const type = _util8.default.get_tpopup_type();
            if (type == 'watermark' || type == 'suggestion')
            return void E.set_tpopup_type('watermark');else
            if (type == 'mitm_popup')
            return void E.set_tpopup_type('mitm_popup');
            const root_url = E.get_root_url();
            const period = E.get_is_premium() ? 'default' : 'session';
            yield E.set_dont_show_again({ root_url, src, period, tab_id: E.get_tab_id(),
                type: null });
            E.close_tpopup(true);
        });

        E.tpopup_close_hint_click = root_url => (0, _etask2.default)(function* () {
            yield E.set_dont_show_again({ root_url, period: 'default', src: 'x_tooltip',
                type: null });
            E.close_tpopup(true);
        });

        E.init_monitor_active = () => {
            let data = _storage2.default.get_json('monitor_active') || {};
            data.ui_open_ts = Date.now();
            _storage2.default.set_json('monitor_active', data);
        };

        E.uninit_monitor_active = () => {
            let data = _storage2.default.get_json('monitor_active') || {};
            data.ui_close_ts = Date.now();
            _storage2.default.set_json('monitor_active', data);
        };

        E.allow_skip_url = () => _util8.default.is_new_tab(E.get_url());

        E.set_locale = l => {
            if (l == _locale2.default.locale)
            return;
            perr('be_popup_lang', { locale: l }, { rate_limit: { count: 20 } });
            _storage2.default.set('locale', l);
            window.location.reload();
        };
        E.get_locale = () => _locale2.default.locale;
        E.get_locales = () => _locale2.default.locales;

        E.resize_tpopup = opt => (0, _etask2.default)(function* () {
            try {
                return yield E.bg_ui_api.ecall('resize_tpopup',
                [E.get_connection_id(), opt]);
            } catch (e) {
                console.error('resize_tpopup err %o', e);
            }
        });
        E.show_tpopup = () => E.bg_ui_api.ecall('show_tpopup', [E.get_connection_id()]);
        E.close_tpopup = hide_anim => (0, _etask2.default)(function* () {
            if (hide_anim)
            {
                document.body.classList.add('hide_anim');
                yield _etask2.default.sleep(1000);
            }
            if (E.bg_ui_api)
            E.bg_ui_api.ecall('close_tpopup', [E.get_connection_id()]);else

            (0, _zerr2.default)('cannot close tpopup: no bg_ui_api');
        });

        E.no_country_perr = () => {
            perr_err('be_ui_vpn_no_country', {
                url: E.get_url(),
                be_info: { country: E.get_country(), location: E.get_location() },
                status: {
                    rmt: E.get_bg_main_status() + ' ' + (
                    E.get_bg_main_inited() ? 'inited' : 'not_inited'),
                    be_vpn: E.get_vpn_status(),
                    be_rule: E.get_rule_status(),
                    be_info: E.get_info_status() } });


        };

        E.is_busy = () => (0, _etask2.default)(function* () {return (yield E.get_busy_info()).busy;});
        E.get_busy_info = () => (0, _etask2.default)(function* () {
            let info = { rule_status_opt: E.get_rule_status_opt(),
                rule_busy: E.get_rule_status() == 'busy',
                ext_busy: E.get_info_status() == 'busy',
                svc_busy: E.get_svc_status() == 'busy' };
            info.tab_state = yield E.get_tab_state(E.get_tab_id());
            info.stoppping = _util2.default.get(info.rule_status_opt, 'desc', '').
            includes('Stopping') || info.tab_state == 'disable_rule';
            info.error = info.tab_state && info.tab_state.includes('err');
            info.busy = info.ext_busy || E.get_enabled() && !info.error &&
            !info.stoppping && (info.tab_state != 'idle' || info.rule_busy ||
            info.svc_busy);
            return info;
        });

        E.reload_ext = (opt, force) => {
            const do_reload = () => {
                _util8.default.set_timeout(() => {
                    try {_zerr2.default.notice('going for full reload');} catch (e) {}
                    _util6.default.reload_ext_native();
                }, 500);
            };
            if (_util6.default.reload_ext(do_reload, force ? 100 : _date2.default.ms.DAY))
            {
                perr_err('be_popup_reload_ext', 'r.' + opt.info,
                { rate_limit: { count: 20 }, err: new Error('') });
            }
        };

        E.send_issue_report = info => (0, _etask2.default)(function* () {
            try {info.bg_log = yield E.get_log();}
            catch (e) {info.bg_log_err = e;}
            perr('be_issue_report', info);
        });

        E.get_problem_mailto_url = opt => (0, _etask2.default)(function* () {
            opt = opt || {};
            const info = yield E.get_product_info();
            return _escape2.default.mailto_url({
                to: opt.to || 'help_be@hola.org',
                subject: 'Problem with Hola extension',
                body: '(Please include a brief explanation of the problem and ' +
                'a screenshot if possible)\n\n' +
                'Information automatically generated about my problem:\n' +
                info.map(item => `${item.name}: ${item.value}`).join('\n') });

        });

        E.aj_event = id => {
            perr(id);
            E.ga_send('event', { cat: 'be_aj', act: id });
        };

        E.get_connection_id = () => _util2.default.get(window, 'hola.tpopup_opt.connection_id');

        E.set_tpopup_type = type => E.trigger('set_tpopup_type', type);

        E.get_trial_left = trial => trial ? Math.max(trial.expire_ts - Date.now(), 0) : 0;

        E.get_root_url = () => _util4.default.get_root_url(E.get_url());

        E.get_url = () => _util8.default.is_tpopup() ?
        _util2.default.get(window, 'hola.tpopup_opt.url') :
        E.get_active_tab_url() || '';

        E.get_tab_id = () => _util8.default.is_tpopup() ?
        _util2.default.get(window, 'hola.tpopup_opt.tab_id') :
        E.get_active_tab_id();

        E.is_tab_active = () => E.get_active_tab_id() == E.get_tab_id();

        E.get_timings = () => {
            const res = {};
            if (!performance.getEntriesByType)
            return res;
            for (let item of performance.getEntriesByType('mark'))
            res[item.name + '_ms'] = Math.round(item.startTime);
            return res;
        };

        const bg_attributes = qw`is_premium ext_active enabled bext_config
    vpn_countries uuid active_tab_url active_tab_id rules user membership
    vpn_last_rating rate_on_store country location user_id mitm_ext_ui_enabled
    dev_mode agree_ts ext_conflict svc_info svc_version vpn_country protect_pc
    protect_browser protect_tooltips vpn_status rule_status rule_status_opt
    info_status svc_status bg_main_status bg_main_inited vpn_work_yes
    rate_us_count`;
        bg_attributes.forEach(attr => E['get_' + attr] = () =>
        E.bg_ui_api && E.bg_ui_api.get(attr));

        const bg_functions = qw`get_tab_load_err get_enabled_rule send_vpn_work_report
    send_fix_it_report trigger_not_working set_dont_show_again
    get_dont_show_rules is_dont_show get_rule_ratings fix_vpn set_rule
    fetch_rules rule_task_cancel_all force_bext_config_update enable_root_url
    stop_vpn storage_debug_change resume_videos hide_arrow_anim
    show_arrow_anim close_tab_tpopup get_trial_active set_trial
    set_time_left is_trial_grace_period get_next_trial_ts is_trial_expired
    refresh_user refresh_anonymous logout resend_verification_email
    set_vpn_last_rating get_redirect_list mitm_set_ignore mitm_set_unblock
    is_mitm_active_manual mitm_need_popup set_login_redirect
    set_email_verify_url get_unblocking_rate_url get_unblocking_rate
    set_dev_mode update_svc_info is_paid is_mitm_site get_mitm_unblock_rules
    set_enabled_for_browser set_enabled_for_pc tpopup_is_connected
    hola_api_call perr_ajax bg_vpn_recover simulate_ajax ga_send set_agree_ts
    reset_bg_ajax bg_main_recover open_new_tab open_be_tab open_rate_us
    update_tab get_log reset_ajax_simulation set_force_suggestion do_tpopup
    vpn_change_agent trigger_force_trial need_trial get_force_premium_rules
    increment_vpn_work_yes get_tab_state get_product_info reset_trial reauth
    is_incognito_allowed reset_busy set_rate_us_count`;
        bg_functions.forEach(f => E[f] = (...args) =>
        E.bg_ui_api && E.bg_ui_api.ecall(f, [...args]));exports.default =

        E;});})();
//# sourceMappingURL=ui_api.js.map
