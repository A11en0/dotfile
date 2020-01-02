// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'react', '/util/util.js', '/util/etask.js', '/util/date.js', '/bext/pub/util.js', '/bext/vpn/ui/ui_lib.js', '/bext/vpn/util/util.js', '/bext/vpn/ui/ui_api.js'], function (exports, _react, _util, _etask, _date, _util3, _ui_lib, _util5, _ui_api) {Object.defineProperty(exports, "__esModule", { value: true });var _react2 = _interopRequireDefault(_react);var _util2 = _interopRequireDefault(_util);var _etask2 = _interopRequireDefault(_etask);var _date2 = _interopRequireDefault(_date);var _util4 = _interopRequireDefault(_util3);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _util6 = _interopRequireDefault(_util5);var _ui_api2 = _interopRequireDefault(_ui_api);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}









        _util6.default.assert_ui('be_ui_context');
        const { SEC } = _date2.default.ms,{ perr_err } = _ui_api2.default;
        const E = {};
        E.App_context = _react2.default.createContext();

        E.Provider = class App_context_provider extends _ui_lib2.default.PureComponent {constructor(...args) {var _temp;return _temp = super(...args), this.
                state = {
                    enabled: true,
                    is_tpopup: _util6.default.is_tpopup(),
                    src_country: null,
                    rule: null,
                    is_mitm_site: false,
                    is_mitm_ui_enabled: _ui_api2.default.get_mitm_ext_ui_enabled(),
                    user: null,
                    is_premium: false,
                    trial: null,
                    is_trial_expired: null,
                    is_grace_period: null,
                    url: '',
                    root_url: '',
                    redirects: [],
                    busy_info: {},
                    busy: false,
                    error: false,
                    inited: false,
                    proxy_error: false,
                    dev_mode: _ui_api2.default.get_dev_mode(),
                    ext_conflict: false,
                    incognito_allowed: false,
                    agree_ts: 1,
                    protect_ui: {},
                    set_error: error => this.setState({ error }) }, _temp;}

            componentDidMount() {
                const _this = this;
                this.etask((0, _etask2.default)(function* () {
                    if (!_this.props.tpopup_type)
                    {
                        if (_ui_api2.default.get_user())
                        _ui_api2.default.refresh_user({ force_premium: true });else

                        {
                            _ui_api2.default.refresh_anonymous({ force_premium: true });
                            _ui_api2.default.force_bext_config_update();
                        }
                        _ui_api2.default.update_svc_info();
                    }
                    else if (_util4.default.browser() == 'firefox')
                        yield _ui_api2.default.refresh_user();
                    yield _this.update_url();
                    yield _this.update_country();
                    yield _this.update_enabled();
                    yield _this.update_user();
                    yield _this.update_trial();
                    yield _this.update_mitm_site();
                    yield _this.update_status();
                    yield _this.update_protect_ui();
                    yield _this.update_conflict();
                    yield _this.update_agree_ts();
                    yield _this.update_enabled_rule();
                    yield _this.update_proxy_error();
                    _this.on(_ui_api2.default, 'url_changed', _this.update_url);
                    _this.on(_ui_api2.default, 'country_changed', _this.update_country);
                    _this.on(_ui_api2.default, 'enabled_changed', _this.update_enabled);
                    _this.on(_ui_api2.default, 'trial_start trial_change', _this.update_trial);
                    _this.on(_ui_api2.default, 'trial_end', _this.on_trial_end);
                    _this.on(_ui_api2.default, 'user_changed', _this.update_user);
                    _this.on(_ui_api2.default, 'rule_changed', _this.update_enabled_rule);
                    _this.on(_ui_api2.default, 'ext_active_changed', _this.update_enabled_rule);
                    _this.on(_ui_api2.default, 'mitm_site_changed', _this.update_mitm_site);
                    _this.on(_ui_api2.default, 'status_changed', _this.update_status);
                    _this.on(_ui_api2.default, 'set_tab_state', _this.on_tab_state);
                    _this.on(_ui_api2.default, 'svc_info_changed', _this.update_protect_ui);
                    _this.on(_ui_api2.default, 'protect_changed', _this.update_protect_ui);
                    _this.on(_ui_api2.default, 'ext_conflict_changed', _this.update_conflict);
                    _this.on(_ui_api2.default, 'agree_ts_changed', _this.update_agree_ts);
                    _this.on(_ui_api2.default, 'user_action_error', _this.on_user_action_error);
                    _this.on(_ui_api2.default, 'tab_load_err', _this.update_proxy_error);
                    _this.setState({
                        inited: true,
                        incognito_allowed: yield _ui_api2.default.is_incognito_allowed() });

                }));
            }
            componentDidUpdate(prev_props, prev_state) {
                let { state, props } = this;
                let changed_root_url = prev_state.root_url != state.root_url;
                let changed_user = prev_state.user != state.user;
                if (changed_root_url || changed_user)
                {
                    this.update_trial();
                    this.update_enabled_rule();
                }
                if (changed_root_url)
                this.update_mitm_site();
                if (!props.tpopup_type && state.rule && prev_state.rule != state.rule &&
                state.rule.enabled)
                {
                    _ui_api2.default.reauth(state.rule);
                }
                if (prev_state.busy != state.busy)
                {
                    this.clear_timer('busy_timer');
                    this.clear_timer('very_busy_timer');
                    if (state.busy && !props.tpopup_type)
                    {
                        this.set_timer('busy_timer', () => {
                            perr_err('be_ui_vpn_busy_slow', state.busy_info);
                            this.set_timer('very_busy_timer', () => {
                                perr_err('be_ui_vpn_busy_very_slow', state.busy_info);
                                _ui_api2.default.reset_busy();
                            }, 13 * SEC);
                        }, 7 * SEC);
                    }
                }
            }
            setState(state) {
                return _etask2.default.cb_apply(super.setState, this, [state]);
            }
            update_country() {
                const country = _ui_api2.default.get_country();
                this.setState({ src_country: country });
                this.clear_timer('country_timer');
                if (country)
                {
                    if (this.no_country_perr_sent && !this.props.tpopup_type)
                    perr_err('be_ui_vpn_no_country_recover', { country });
                    return;
                }
                if (!this.props.tpopup_type)
                {
                    this.set_timer('country_timer', () => {
                        _ui_api2.default.no_country_perr();
                        this.no_country_perr_sent = true;
                    }, 3 * SEC);
                }
            }
            update_enabled_rule() {
                let _this = this;
                return this.etask((0, _etask2.default)(function* () {
                    let tab_id = _ui_api2.default.get_tab_id(),url = _ui_api2.default.get_url();
                    _this.setState({ rule: yield _ui_api2.default.get_enabled_rule({ tab_id,
                            url }) });
                }));
            }
            update_proxy_error() {
                let _this = this;
                return this.etask((0, _etask2.default)(function* () {
                    let tab_id = _ui_api2.default.get_tab_id();
                    let proxy_error = yield _ui_api2.default.get_tab_load_err(tab_id);
                    _this.setState({ proxy_error });
                }));
            }
            update_mitm_site() {
                let _this = this;
                return this.etask((0, _etask2.default)(function* () {
                    let url = _ui_api2.default.get_url();
                    _this.setState({ is_mitm_site: yield _ui_api2.default.is_mitm_site(url) });
                }));
            }
            update_status() {
                let _this = this;
                return this.etask((0, _etask2.default)(function* () {
                    const wait = 300 - (Date.now() - (_this.update_status_ts || 0));
                    if (wait > 0)
                    yield _etask2.default.sleep(wait);
                    let s = { busy_info: yield _ui_api2.default.get_busy_info() };
                    s.busy = s.busy_info.busy;
                    _this.setState(s);
                    _this.update_status_ts = Date.now();
                }));
            }
            on_tab_state(event) {
                if (!['fix_vpn_err', 'set_rule_err'].includes(event.curr))
                return;
                this.setState({ error: true });
                if (!this.props.tpopup_type)
                perr_err('be_ui_vpn_tab_state', { state: event });
            }
            on_user_action_error(event) {
                if (_ui_api2.default.get_enabled())
                this.setState({ error: true });
            }
            update_url() {
                let _this = this;
                return this.etask((0, _etask2.default)(function* () {
                    let root_url_prev = _this.state.root_url;
                    let url = _ui_api2.default.get_url(),root_url = _ui_api2.default.get_root_url();
                    let redirects = yield _ui_api2.default.get_redirect_urls();
                    _this.setState({ url, root_url, redirects });
                    if (root_url_prev && root_url_prev != root_url &&
                    !_this.props.tpopup_type)
                    {
                        let info = { root_url, root_url_prev, ext_enabled:
                            _ui_api2.default.get_ext_active() };
                        if (window.hola)
                        info.t = Date.now() - window.hola.t.l_start;
                        perr_err('be_ui_vpn_root_url_changed', info);
                    }
                }));
            }
            update_enabled() {
                this.setState({ enabled: _ui_api2.default.get_enabled() });
            }
            update_user() {
                let _this = this;
                return this.etask((0, _etask2.default)(function* () {
                    let is_premium = _ui_api2.default.get_is_premium();
                    let user = _ui_api2.default.get_user();
                    if (!user)
                    return void _this.setState({ user, is_premium });
                    _this.setState({ is_premium, user: {
                            is_paid: yield _ui_api2.default.is_paid(),
                            display_name: user.displayName,
                            verified: user.verified,
                            hola_uid: user.hola_uid,
                            email: _util2.default.get(user.emails, '0.value') } });

                }));
            }
            update_trial() {
                let _this = this;
                return this.etask((0, _etask2.default)(function* () {
                    const root_url = _ui_api2.default.get_root_url();
                    if (!root_url || !_ui_api2.default.get_user() || _ui_api2.default.get_is_premium())
                    {
                        yield _this.setState({ trial: null, is_trial_expired: false,
                            is_grace_period: false });
                        return;
                    }
                    yield _this.setState({
                        trial: yield _ui_api2.default.get_trial_active(root_url),
                        is_trial_expired: yield _ui_api2.default.is_trial_expired(root_url),
                        is_grace_period: yield _ui_api2.default.is_trial_grace_period(root_url) });

                }));
            }
            on_trial_end() {
                const _this = this;
                this.etask((0, _etask2.default)(function* () {
                    yield _this.update_trial();
                    if (!_this.state.trial && _this.state.is_tpopup &&
                    _this.props.tpopup_type != 'watermark')
                    {
                        _ui_api2.default.set_tpopup_type('watermark');
                    }
                }));
            }
            update_protect_ui() {
                this.setState({ protect_ui: {
                        pc: _ui_api2.default.get_protect_pc(),
                        browser: _ui_api2.default.get_protect_browser(),
                        tooltips: _ui_api2.default.get_protect_tooltips(),
                        has_exe: !!_ui_api2.default.get_svc_info() } });

            }
            update_conflict() {
                this.setState({ ext_conflict: _ui_api2.default.get_ext_conflict() });
            }
            update_agree_ts() {
                this.setState({ agree_ts: _ui_api2.default.get_agree_ts() });
            }
            render() {
                return _react2.default.createElement(E.App_context.Provider, { value: this.state },
                this.props.children);

            }};exports.default =


        E;});})();
//# sourceMappingURL=context.js.map
