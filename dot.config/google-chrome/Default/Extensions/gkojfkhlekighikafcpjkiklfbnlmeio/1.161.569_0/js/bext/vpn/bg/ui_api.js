// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', 'conf', 'zon_config', '/util/util.js', '/util/zerr.js', '/util/storage.js', '/util/etask.js', '/bext/pub/backbone.js', '/bext/vpn/util/util.js', '/bext/pub/util.js', '/bext/vpn/bg/util.js', '/bext/vpn/bg/tabs.js', '/bext/vpn/bg/bg_ajax.js', '/bext/pub/ext.js', '/bext/vpn/bg/rule.js', '/bext/vpn/bg/premium.js', '/bext/vpn/bg/dev_mode.js', '/bext/vpn/bg/trial.js', '/bext/vpn/bg/vpn.js', '/bext/vpn/bg/info.js', '/bext/vpn/bg/tpopup.js', '/bext/vpn/bg/svc.js', '/bext/pub/browser.js'], function (exports, _underscore, _conf, _zon_config, _util, _zerr, _storage, _etask, _backbone, _util3, _util5, _util7, _tabs, _bg_ajax, _ext, _rule, _premium, _dev_mode, _trial, _vpn, _info, _tpopup, _svc, _browser) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _conf2 = _interopRequireDefault(_conf);var _zon_config2 = _interopRequireDefault(_zon_config);var _util2 = _interopRequireDefault(_util);var _zerr2 = _interopRequireDefault(_zerr);var _storage2 = _interopRequireDefault(_storage);var _etask2 = _interopRequireDefault(_etask);var _backbone2 = _interopRequireDefault(_backbone);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _util8 = _interopRequireDefault(_util7);var _tabs2 = _interopRequireDefault(_tabs);var _bg_ajax2 = _interopRequireDefault(_bg_ajax);var _ext2 = _interopRequireDefault(_ext);var _rule2 = _interopRequireDefault(_rule);var _premium2 = _interopRequireDefault(_premium);var _dev_mode2 = _interopRequireDefault(_dev_mode);var _trial2 = _interopRequireDefault(_trial);var _vpn2 = _interopRequireDefault(_vpn);var _info2 = _interopRequireDefault(_info);var _tpopup2 = _interopRequireDefault(_tpopup);var _svc2 = _interopRequireDefault(_svc);var _browser2 = _interopRequireDefault(_browser);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}























        _util4.default.assert_bg('bg_ui_api');
        const chrome = window.chrome;

        const E = new (_backbone2.default.task_model.extend({
            model_name: 'bg_ui_api',
            _defaults: function () {this.on('destroy', () => E.uninit());} }))();


        E.init = be_bg_main => {
            if (E.inited)
            return;
            E.set_enabled = be_bg_main.set_enabled;
            E.ga_send = be_bg_main.ga_send;
            E.set_agree_ts = be_bg_main.set_agree_ts;
            E.reset_bg_ajax = be_bg_main.reset_bg_ajax;
            E.bg_main_recover = () => be_bg_main.trigger('recover');
            _storage2.default.set('ui_popup_render_count', 0);
            const attributes = {
                ext_active: { model: _ext2.default, key: 'ext.active' },
                ext_conflict: { model: _ext2.default, key: 'ext.conflict' },
                is_premium: { model: _ext2.default },
                bext_config: { model: _ext2.default },
                vpn_countries: { model: _ext2.default },
                uuid: { model: _ext2.default },
                user_id: { model: _ext2.default },
                active_tab_url: { model: _tabs2.default, key: 'active.url' },
                active_tab_id: { model: _tabs2.default, key: 'active.id' },
                rules: { model: _rule2.default },
                rule_status: { model: _rule2.default, key: 'status' },
                rule_status_opt: { model: _rule2.default, key: 'status_opt' },
                user: { model: _premium2.default },
                membership: { model: _premium2.default },
                vpn_last_rating: { model: _info2.default },
                rate_on_store: { model: _info2.default },
                country: { model: _info2.default },
                location: { model: _info2.default },
                vpn_work_yes: { model: _info2.default },
                rate_us_count: { model: E },
                info_status: { model: _info2.default, key: 'status' },
                dev_mode: { model: _dev_mode2.default },
                vpn_country: { model: _svc2.default },
                svc_info: { model: _svc2.default, key: 'info' },
                svc_version: { model: _svc2.default, key: 'version' },
                svc_status: { model: _svc2.default, key: 'status' },
                mitm_ext_ui_enabled: { model: _vpn2.default },
                protect_pc: { model: _vpn2.default },
                protect_browser: { model: _vpn2.default },
                protect_tooltips: { model: _vpn2.default },
                vpn_status: { model: _vpn2.default, key: 'status' },
                bg_main_status: { model: be_bg_main, key: 'status' },
                bg_main_inited: { model: be_bg_main, key: 'inited' },
                enabled: { model: be_bg_main },
                agree_ts: { model: be_bg_main } };

            Object.keys(attributes).forEach(attr => {
                const model = attributes[attr].model;
                const model_key = attributes[attr].key || attr;
                E.listen_to(model, 'change:' + model_key,
                () => E.set(attr, model.get(model_key)));
            });
            const events = [
            { model: _tpopup2.default, event: 'body_click' },
            { model: _ext2.default, event: 'trial_end' },
            { model: _ext2.default, event: 'trial_start' },
            { model: _ext2.default, event: 'trial_change' },
            { model: _vpn2.default, event: 'storage_debug_change' },
            { model: _vpn2.default, event: 'force_trial' },
            { model: _vpn2.default, event: 'mitm_manual_unblock' },
            { model: _tpopup2.default, event: 'mouseleave' },
            { model: _tabs2.default, event: 'change:active.url', name: 'url_changed' },
            { model: _tabs2.default, event: 'change:active.id', name: 'tab_id_changed' },
            { model: _info2.default, event: 'change:country', name: 'country_changed' },
            { model: be_bg_main, event: 'change:enabled', name: 'enabled_changed' },
            { model: be_bg_main, event: 'change:inited', name: 'bg_main_inited' },
            { model: _ext2.default, event: 'change:is_premium', name: 'user_changed' },
            { model: _premium2.default, event: 'change:user', name: 'user_changed' },
            { model: _premium2.default, event: 'change:membership',
                name: 'membership_changed' },
            { model: _rule2.default, event: 'change:rules change:tabs_stub_rules',
                name: 'rule_changed' },
            { model: _vpn2.default, event: 'change:protect_pc change:mitm_active_manual',
                name: 'rule_changed' },
            { model: _svc2.default, event: 'change:vpn_country', name: 'rule_changed' },
            { model: _ext2.default, event: 'change:ext.active',
                name: 'ext_active_changed' },
            { model: _vpn2.default, event: 'change:mitm_site', name: 'mitm_site_changed' },
            { model: _info2.default, event: 'change:status', name: 'status_changed' },
            { model: _info2.default, event: 'change:settings', name: 'settings_changed' },
            { model: _rule2.default, event: 'change:status set_tab_state',
                name: 'status_changed' },
            { model: _rule2.default, event: 'change:tab_load_err', name: 'tab_load_err' },
            { model: _svc2.default, event: 'change:status', name: 'status_changed' },
            { model: _vpn2.default, event: 'change:status', name: 'vpn_status_changed' },
            { model: _rule2.default, event: 'set_tab_state' },
            { model: _svc2.default, event: 'change:info', name: 'svc_info_changed' },
            { model: _svc2.default, event: 'change:version', name: 'svc_version_changed' },
            { model: _vpn2.default, event: 'change:protect_pc change:protect_browser ' +
                'change:protect_tooltip', name: 'protect_changed' },
            { model: _ext2.default, event: 'change:ext.conflict',
                name: 'ext_conflict_changed' },
            { model: be_bg_main, event: 'change:agree_ts',
                name: 'agree_ts_changed' },
            { model: _dev_mode2.default, event: 'change:dev_mode',
                name: 'dev_mode_changed' }];

            events.forEach(v => {
                E.listenTo(v.model, v.event, (...args) => {
                    if (v.event.startsWith('change:'))
                    args = [];
                    E.trigger(v.name || v.event, ...args);
                });
            });
            _browser2.default.backbone.server.start(E, 'bg_ui_api');
            E.inited = true;
        };

        E.uninit = () => {
            if (!E.inited)
            return;
            E.inited = false;
            _browser2.default.backbone.server.stop('bg_ui_api');
            E.stopListening();
        };

        E.open_rate_us = () => {
            const urls = {
                chrome: 'https://chrome.google.com/webstore/detail' +
                '/hola-better-internet/gkojfkhlekighikafcpjkiklfbnlmeio/reviews',
                opera: 'https://addons.opera.com/en/extensions/details' +
                '/hola-better-internet/#feedback-container',
                firefox: 'https://addons.mozilla.org/ru/firefox/addon/hola-unblocker/' };

            if (!urls[_util6.default.browser()])
            return;
            _info2.default.set_rate_on_store(Date.now());
            E.open_new_tab({ url: urls[_util6.default.browser()], force_active: true });
        };

        E.set_rate_us_count = count => E.set('rate_us_count', count);

        const dev_info = () => {
            const ext_type = (() => {
                const types = _underscore2.default.invert(_conf2.default.ids);
                return id => types[id];
            })();
            try {
                var a = [],manifest;
                if (chrome && !(manifest = chrome.runtime.getManifest()).update_url &&
                !_util2.default.get(manifest, 'applications.gecko.update_url'))
                {
                    a.push('no update');
                }
                if (chrome && !_conf2.default.browser.firefox && !ext_type(chrome.runtime.id))
                a.push('unknown id');
                if (_zon_config2.default._RELEASE_LEVEL != 2)
                {
                    if (_zon_config2.default._RELEASE_LEVEL == 1)
                    a.push('rel1');
                    if (_zon_config2.default.BUILDTYPE_DEBUG)
                    a.push('debug');
                }
                if (_conf2.default.arch)
                a.push(_conf2.default.arch);
                return a.join(',');
            } catch (e) {(0, _zerr2.default)('dev_info %s', _zerr2.default.e2s(e));}
            return '';
        };

        E.get_product_info = () => {
            const build = _util6.default.build_info(),dev = dev_info();
            const res = [];
            const add = (name, value) => {
                if (value)
                res.push({ name, value });
            };
            add('Ext version', build.ext_version || _util6.default.version());
            add('WWW version', build.server_version);
            add('Service', build.svc_version);
            if (build.svc_mode)
            {
                let mode = build.svc_mode + ' active';
                if (build.svc_mode_pending)
                mode += ', ' + build.svc_mode_pending + ' pending';
                add('Mode', mode);
            }
            add('Product', build.product_type);
            add('Browser', build.browser);
            add('Platform', build.platform);
            add('CID', _svc2.default.get('cid_js'));
            add('UUID', _ext2.default.get('uuid'));
            add('Dev info', dev);
            return res;
        };

        E.trigger_not_working = opt => _ext2.default.trigger('not_working', opt);
        E.fetch_rules = () => _rule2.default.trigger('fetch_rules');
        E.storage_debug_change = () => _vpn2.default.trigger('storage_debug_change');
        E.trigger_force_trial = opt => _vpn2.default.trigger('force_trial', opt);
        E.bg_vpn_recover = () => _vpn2.default.trigger('recover');
        E.reset_busy = () => _vpn2.default.reset_busy();
        E.open_new_tab = _util8.default.open_new_tab;
        E.open_be_tab = _util8.default.open_be_tab;
        E.update_tab = _util8.default.update_tab;
        E.perr = _util6.default.perr;
        E.get_log = _util6.default.get_log;
        E.get_tab_load_err = _rule2.default.get_tab_load_err;
        E.get_enabled_rule = _vpn2.default.get_enabled_rule;
        E.send_vpn_work_report = _rule2.default.send_vpn_work_report;
        E.send_fix_it_report = _rule2.default.send_fix_it_report;
        E.set_dont_show_again = _info2.default.set_dont_show_again;
        E.get_dont_show_rules = _info2.default.get_dont_show_rules;
        E.is_dont_show = _info2.default.is_dont_show;
        E.get_rule_ratings = _rule2.default.get_rule_ratings;
        E.fix_vpn = _rule2.default.fix_vpn;
        E.set_rule = _rule2.default.set_rule;
        E.rule_task_cancel_all = _rule2.default.task_cancel_all;
        E.force_bext_config_update = _vpn2.default.force_bext_config_update;
        E.reauth = _vpn2.default.reauth;
        E.enable_root_url = _vpn2.default.enable_root_url;
        E.stop_vpn = _vpn2.default.stop_vpn;
        E.resume_videos = _tpopup2.default.resume_videos;
        E.hide_arrow_anim = _tpopup2.default.hide_arrow_anim;
        E.show_arrow_anim = _tpopup2.default.show_arrow_anim;
        E.close_tab_tpopup = _tpopup2.default.close_tab_tpopup;
        E.get_trial_active = _trial2.default.get_trial_active;
        E.set_trial = _trial2.default.set_trial;
        E.set_time_left = _trial2.default.set_time_left;
        E.is_trial_grace_period = _trial2.default.is_trial_grace_period;
        E.get_next_trial_ts = _trial2.default.get_next_trial_ts;
        E.is_trial_expired = _trial2.default.is_trial_expired;
        E.refresh_user = _premium2.default.refresh_user;
        E.refresh_anonymous = _premium2.default.refresh_anonymous;
        E.logout = _premium2.default.logout_user;
        E.resend_verification_email = _info2.default.resend_verification_email;
        E.set_vpn_last_rating = _info2.default.set_vpn_last_rating;
        E.get_redirect_list = _tabs2.default.get_redirect_list;
        E.mitm_set_ignore = _vpn2.default.mitm_set_ignore;
        E.mitm_set_unblock = _vpn2.default.mitm_set_unblock;
        E.is_mitm_active_manual = _vpn2.default.is_mitm_active_manual;
        E.mitm_need_popup = _vpn2.default.mitm_need_popup;
        E.set_login_redirect = _info2.default.set_login_redirect;
        E.set_email_verify_url = _info2.default.set_email_verify_url;
        E.get_unblocking_rate_url = _info2.default.get_unblocking_rate_url;
        E.get_unblocking_rate = _info2.default.get_unblocking_rate;
        E.set_dev_mode = _dev_mode2.default.enable;
        E.update_svc_info = _svc2.default.update_info;
        E.is_paid = _premium2.default.is_paid;
        E.is_mitm_site = _vpn2.default.is_mitm_site;
        E.get_mitm_unblock_rules = _vpn2.default.get_mitm_unblock_rules;
        E.set_enabled_for_browser = _vpn2.default.set_enabled_for_browser;
        E.set_enabled_for_pc = _vpn2.default.set_enabled_for_pc;
        E.tpopup_is_connected = _vpn2.default.tpopup_is_connected;
        E.hola_api_call = _bg_ajax2.default.hola_api_call;
        E.perr_ajax = _bg_ajax2.default.perr_ajax;
        E.simulate_ajax = _bg_ajax2.default.simulate_ajax;
        E.reset_ajax_simulation = _bg_ajax2.default.reset_ajax_simulation;
        E.show_tpopup = _tpopup2.default.show;
        E.close_tpopup = _tpopup2.default.close;
        E.resize_tpopup = _tpopup2.default.resize;
        E.set_force_suggestion = _tabs2.default.set_force_suggestion;
        E.do_tpopup = _vpn2.default.do_tpopup;
        E.vpn_change_agent = _svc2.default.vpn_change_agent;
        E.need_trial = _trial2.default.need_trial;
        E.reset_trial = _trial2.default.reset;
        E.unblock_action = _vpn2.default.unblock_action;
        E.get_force_premium_rules = _premium2.default.get_force_premium_rules;
        E.increment_vpn_work_yes = _info2.default.increment_vpn_work_yes;
        E.get_tab_state = _rule2.default.get_tab_state;
        E.get_force_premium_rule = _premium2.default.get_force_premium_rule;
        E.is_incognito_allowed = () =>
        _etask2.default.cb_apply(chrome.extension, '.isAllowedIncognitoAccess', []);
        E.push_event = _vpn2.default.push_event;exports.default =

        E;});})();
//# sourceMappingURL=ui_api.js.map
