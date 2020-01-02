// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', '/bext/pub/lib.js', '/bext/pub/backbone.js', '/util/etask.js', '/util/zerr.js', '/util/date.js', '/svc/account/pub/membership.js', '/bext/pub/ext.js', '/bext/pub/util.js', '/bext/vpn/bg/bg_ajax.js', '/util/util.js', '/bext/vpn/util/util.js', '/util/version_util.js', '/bext/vpn/bg/force_lib.js', '/bext/vpn/bg/info.js'], function (exports, _lib, _backbone, _etask, _zerr, _date, _membership2, _ext, _util, _bg_ajax, _util3, _util5, _version_util, _force_lib, _info) {Object.defineProperty(exports, "__esModule", { value: true });var _lib2 = _interopRequireDefault(_lib);var _backbone2 = _interopRequireDefault(_backbone);var _etask2 = _interopRequireDefault(_etask);var _zerr2 = _interopRequireDefault(_zerr);var _date2 = _interopRequireDefault(_date);var _membership3 = _interopRequireDefault(_membership2);var _ext2 = _interopRequireDefault(_ext);var _util2 = _interopRequireDefault(_util);var _bg_ajax2 = _interopRequireDefault(_bg_ajax);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _version_util2 = _interopRequireDefault(_version_util);var _force_lib2 = _interopRequireDefault(_force_lib);var _info2 = _interopRequireDefault(_info);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}















        _util6.default.assert_bg('be_premium');
        const assign = Object.assign;
        const chrome = window.chrome;
        const E = new (_backbone2.default.task_model.extend({
            model_name: 'premium',
            _defaults: function () {this.on('destroy', () => E.uninit());} }))();

        let membership_timeout, daily_refresh_timer, sid;
        const test_users = ['deploy@hola.org', 'qa.hola@gmail.com',
        'qa.hola2@gmail.com', 'yulia@hola.org', 'holaplus.payment@gmail.com',
        'holavpntests@gmail.com', 'deploy.vpnext@gmail.com', 'nikita+2@hola.org',
        'nikita+vpn@hola.org'];

        E.is_active = () => _membership3.default.is_active(E.get('membership'));

        E.is_paid = () => _membership3.default.is_paid(E.get('membership'));

        E.logout_user = () => (0, _etask2.default)(function* logout_user() {
            E.be_rule.disable_premium();
            yield _bg_ajax2.default.hola_api_call('users/logout/inline', { method: 'POST',
                text: true });
            set_user(null);
            E.set('membership', null);
            _ext2.default.set('is_premium', false);
        });

        const set_user = user => {
            let email;
            if (user && user.user)
            email = _util4.default.get(user.user.emails, '0.value');
            E.set('is_test_user', +test_users.includes(email));
            _ext2.default.set('user_id', _util4.default.get(user, 'user._id', ''));
            _ext2.default.set('hola_uid', _util4.default.get(user, 'user.hola_uid'));
            E.set('user', user && user.user);
        };

        var last_refreshed = 0;
        E.refresh_user = opt => {
            opt = assign({}, opt);
            let user_id = _ext2.default.get('user_id');
            var now;
            if ((now = Date.now()) - last_refreshed < 300)
            {
                _lib2.default.perr(_zerr2.default.L.NOTICE, { id: 'refresh_user_multiple', rate_limit:
                    { count: 2 }, info: { user_id } });
            }
            last_refreshed = now;
            return (0, _etask2.default)({ name: 'refresh_user', cancel: true }, function* () {
                try {
                    const _user = yield _info2.default.get_user_data({
                        data: { uuid: _ext2.default.get('uuid'), source: 'be_premium' } });
                    set_user(_user);
                    let _membership;
                    if (user_id != _util4.default.get(_user, 'user._id') || opt.force_premium)
                    {
                        _membership = yield _bg_ajax2.default.hola_api_call(
                        'users/payment/get_membership');
                    } else

                    _membership = yield E.get('membership');
                    const old_is_active = E.is_active();
                    E.set('membership', _membership);
                    _ext2.default.set('is_premium', E.is_active());
                    if (old_is_active !== E.is_active())
                    {
                        if (opt.exp_synced)
                        {
                            _lib2.default.perr(_zerr2.default.L.ERR, { id: 'premium_out_of_sync',
                                info: { membership: _membership } });
                        }
                        if (old_is_active)
                        E.be_rule.disable_premium();
                    }
                    return _membership;
                } catch (err) {
                    _lib2.default.perr(_zerr2.default.L.ERR, { id: 'refresh_user_fail',
                        info: _zerr2.default.e2s(err) });
                    _util6.default.clear_timeout(membership_timeout);
                    membership_timeout = _util6.default.set_timeout(() =>
                    E.sp.spawn(E.refresh_user(opt)), Math.random() * _date2.default.ms.HOUR);
                } finally {
                    E.trigger('user_updated');
                }
            });
        };

        let refresh_user_et;
        E.schedule_refresh_user = opt => {
            if (refresh_user_et)
            refresh_user_et.return();
            E.sp.spawn((0, _etask2.default)(function* schedule_refresh_user_() {
                refresh_user_et = this;
                this.finally(() => {refresh_user_et = null;});
                yield _etask2.default.sleep(1000);
                yield E.refresh_user(opt);
            }));
        };

        E.refresh_anonymous = opt => (0, _etask2.default)({ name: 'refresh_anonymous', cancel: true },
        function* refresh_anonymous_() {
            const res = yield _info2.default.autologin_capable();
            if (res)
            yield E.refresh_user(opt);
        });

        function is_blacklist(root_url, host) {
            if (!root_url)
            return false;
            host = host || root_url; 
            if (_ext2.default.get('is_premium'))
            return false;
            const blacklist = (E.be_rule.get('rules') || {}).blacklist || {};
            return blacklist[host] || blacklist[root_url];
        }

        function get_force_rule(conf_name, root_url, opt) {
            let rule;
            if (is_blacklist(root_url))
            {
                rule = { id: root_url, domain: new RegExp(root_url), blacklist: true };
                return rule;
            }
            opt = opt || {};
            rule = _force_lib2.default.find_rule(root_url, _ext2.default.get('bext_config'),
            conf_name, _info2.default.get('country'));
            if (!rule)
            return false;
            const install_ver = _ext2.default.get('install_version');
            if (!opt.ignore_install_version && rule.install_ver_min && install_ver &&
            _version_util2.default.cmp(install_ver, rule.install_ver_min) < 0)
            {
                return false;
            }
            const site_conf = _util2.default.get_site_conf(root_url);
            if (!site_conf)
            return rule;
            const suggestion_conf = _util2.default.get_suggestion_conf(site_conf,
            _info2.default.get('country'));
            if (suggestion_conf)
            return false;
            return rule;
        }

        E.get_force_premium_rule = get_force_rule.bind(undefined, 'force_premium');
        E.get_force_privacy_rule = get_force_rule.bind(undefined, 'get_privacy');

        E.get_force_premium_rules = (root_urls, opt) =>
        root_urls.map(root_url => E.get_force_premium_rule(root_url, opt));

        const info_inited_cb = () => {
            if (_util4.default.is_mocha() && last_refreshed)
            return;
            E.sp.spawn(E.refresh_user());
        };

        const get_sid = () => (0, _etask2.default)(function* hola_api_call_() {
            let c = yield _etask2.default.cb_apply(chrome.cookies, '.get',
            [{ url: 'https://hola.org/', name: 'connect.sid' }]);
            sid = c.value;
        });

        E.init = be_rule => {
            E.be_rule = be_rule;
            E.sp = _util6.default.new_etask('be_premium');
            _info2.default.on('inited', info_inited_cb);
            daily_refresh_timer = _util6.default.set_interval(
            E.refresh_user.bind(E, { force_premium: true }), _date2.default.ms.DAY,
            { sp: E.sp, name: 'refresh_user' });
            chrome.cookies.onChanged.addListener(on_cookie_change);
            E.sp.spawn(get_sid);
        };

        E.uninit = () => {
            _info2.default.off('inited', info_inited_cb);
            E.sp.return();
            _util6.default.clear_timeout(membership_timeout);
            _util6.default.clear_interval(daily_refresh_timer);
            chrome.cookies.onChanged.removeListener(on_cookie_change);
            last_refreshed = 0;
            E.clear();
        };

        function on_cookie_change(change) {
            const cookie = change.cookie;
            if (change.removed || cookie.name != 'connect.sid' ||
            cookie.domain != 'hola.org' || sid == cookie.value)
            {
                return;
            }
            sid = cookie.value;
            E.schedule_refresh_user();
        }exports.default =

        E;});})();
//# sourceMappingURL=premium.js.map
