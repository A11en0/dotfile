// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'react', 'react-dom', '/util/etask.js', '/util/util.js', '/util/storage.js', '/bext/pub/util.js', '/bext/vpn/util/util.js', '/protocol/pub/countries.js', '/util/zerr.js', '/bext/pub/locale.js', '/bext/vpn/ui/ui_api.js', '/bext/vpn/ui/ui_lib.js', '/util/url.js', '/svc/vpn/pub/util.js'], function (exports, _react, _reactDom, _etask, _util, _storage, _util3, _util5, _countries, _zerr, _locale, _ui_api, _ui_lib, _url, _util7) {Object.defineProperty(exports, "__esModule", { value: true });var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _etask2 = _interopRequireDefault(_etask);var _util2 = _interopRequireDefault(_util);var _storage2 = _interopRequireDefault(_storage);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _countries2 = _interopRequireDefault(_countries);var _zerr2 = _interopRequireDefault(_zerr);var _locale2 = _interopRequireDefault(_locale);var _ui_api2 = _interopRequireDefault(_ui_api);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _url2 = _interopRequireDefault(_url);var _util8 = _interopRequireDefault(_util7);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}














        const E = {};
        const CG = _util4.default.CG,zget = _util2.default.get;

        function set_dbg_conf(path, value) {
            _util6.default.set_dbg_conf(path, value);
            _ui_api2.default.force_bext_config_update();
        }

        function get_be_dev_mode() {
            let bg = window.chrome.extension.getBackgroundPage();
            if (!bg)
            (0, _zerr2.default)('cannot get background');
            return zget(bg, 'be_bg_main.be_dev_mode');
        }let

        Debug_conf_switch = class Debug_conf_switch extends _react2.default.PureComponent {
            constructor(props) {
                super(props);this.
























                handle_change = e => {
                    const checked = e.target.checked;
                    if (!this.props.on_check)
                    this.set_conf_value(checked ? this.value : undefined);
                    this.setState({ checked }, () => {
                        if (this.props.on_check)
                        this.props.on_check(checked);
                    });
                };this.value = props.value === undefined ? true : props.value;this.state = { checked: _util2.default.equal_deep(this.value, this.get_conf_value()) };}get_conf_value() {let be_dev_mode = get_be_dev_mode();if (this.props.dev_mode_conf) return be_dev_mode.get(this.props.name);if (this.props.storage) return _storage2.default.get_json(this.props.name);return _util6.default.get_dbg_conf(this.props.name);}set_conf_value(value) {let be_dev_mode = get_be_dev_mode();if (this.props.dev_mode_conf) return be_dev_mode.set(this.props.name, value);else if (this.props.storage) {_storage2.default.set_json(this.props.name, value);_ui_api2.default.storage_debug_change();} else set_dbg_conf(this.props.name, value);}
            render() {
                return _react2.default.createElement('div', { className: 'debug_switch' },
                _react2.default.createElement('label', null,
                _react2.default.createElement('input', { type: 'checkbox', checked: this.state.checked,
                    onChange: this.handle_change }),
                this.props.children));


            }};let


        Debug_conf_agent = class Debug_conf_agent extends _react2.default.PureComponent {constructor(...args) {var _temp;return _temp = super(...args), this.
                switch_ref = _react2.default.createRef(), this.
                state = { value: this.init_value(), visible: false, error: null }, this.








                on_change = event => {
                    try {
                        let val = JSON.parse(event.target.value);
                        this.setState({ value: val, error: null });
                    } catch (e) {this.setState({ error: 'Wrong JSON' });}
                }, this.
                on_save = () => {
                    if (this.state.error)
                    return;
                    this.switch_ref.current.set_conf_value(this.state.value);
                    _util4.default.reload_ext_native();
                }, this.
                toggle_check = checked => {
                    this.setState(({ visible }) => {
                        if (!checked)
                        _storage2.default.clr(this.props.name);
                        return { visible: checked, value: this.props.value };
                    });
                }, _temp;}componentDidMount() {this.setState({ visible: this.switch_ref.current.state.checked });}init_value() {if (!this.props.storage) return this.props.value;return _storage2.default.get_json(this.props.name) || this.props.value;}
            render() {
                let { value, visible, error } = this.state;
                let { name, title } = this.props;
                return _react2.default.createElement('div', { className: 'debug_area' },
                _react2.default.createElement(Debug_conf_switch, { ref: this.switch_ref, name: name, value: value,
                    storage: this.props.storage, on_check: this.toggle_check },
                title),

                visible && _react2.default.createElement('div', null,
                _react2.default.createElement('textarea', { rows: '5', onChange: this.on_change },
                JSON.stringify(value, null, 2)),
                _react2.default.createElement('button', { onClick: this.on_save }, 'Save & Reload'),

                error && _react2.default.createElement('div', { style: { color: 'red' } }, error)));


            }};let


        Debug_conf_ajax = class Debug_conf_ajax extends _react2.default.PureComponent {constructor(...args) {var _temp2;return _temp2 = super(...args), this.
                state = { value: this.init_value(), show_area: false, error: null,
                    checked: false }, this.

























                on_change = event => {
                    this.setState({ value: event.target.value, error: null });
                }, this.
                on_save = () => {
                    try {
                        if (!this.state.show_area)
                        return void this.setState({ show_area: true, error: null });
                        if (this.state.error)
                        return;
                        let { value } = this.state;
                        let new_val = value.split('\n').reduce((a, s, i) => {
                            if (s == '')
                            throw new Error(`String ${i + 1} is empty`);
                            let parts = s.split(' ');
                            if (parts.length != 2)
                            throw new Error(`String ${i + 1} wrong`);
                            let [k, v] = parts;
                            if (!/(delay|fail|timeout):\d{1,}/.test(v))
                            throw new Error(`Wrong value for ${k}`);
                            a[k] = v;
                            return a;
                        }, {});
                        this.set_value(new_val);
                        this.setState({ show_area: false });
                    } catch (e) {this.setState({ error: e.message });}
                }, this.
                on_check = () => {
                    this.setState(({ checked, show_area }) => {
                        if (checked)
                        {
                            _ui_api2.default.reset_ajax_simulation();
                            _storage2.default.clr(this.props.name);
                        }
                        return { show_area: !checked, value: this.props.value, error: null,
                            checked: !checked };
                    });
                }, _temp2;}componentDidMount() {this.setState({ checked: this.state.value != this.props.value });}init_value() {if (!this.props.storage) return this.props.value;let storage_val = _storage2.default.get_json(this.props.name);return storage_val ? this.format_value(storage_val) : '';}set_value(value) {if (this.props.storage) {_storage2.default.set_json(this.props.name, value);_ui_api2.default.storage_debug_change();} else set_dbg_conf(this.props.name, value);_ui_api2.default.simulate_ajax(value);}format_value(obj) {let res = [];for (let p in obj) res.push(`${p} ${obj[p]}`);return res.join('\n');}
            render() {
                let { value, show_area, checked, error } = this.state;
                let { title } = this.props;
                return _react2.default.createElement('div', { className: 'debug_area' },
                _react2.default.createElement('div', { className: 'debug_switch' },
                _react2.default.createElement('label', null,
                _react2.default.createElement('input', { type: 'checkbox', checked: checked,
                    onChange: this.on_check }),
                title)),


                checked && _react2.default.createElement('a', { onClick: this.on_save }, show_area ? 'Save' : 'Config'),

                show_area && _react2.default.createElement('div', null,
                _react2.default.createElement('textarea', { rows: '5', onChange: this.on_change },
                value),
                error && _react2.default.createElement('div', { style: { color: 'red' } }, error)));


            }};let


        Change_trial = class Change_trial extends _react2.default.PureComponent {constructor(...args) {var _temp3;return _temp3 = super(...args), this.
                state = { value: 60, error: null }, this.











                on_change = event => this.setState({ value: event.target.value }), this.
                on_go_click = () => {
                    let _this = this;
                    this.setState({ error: null });
                    (0, _etask2.default)(function* () {
                        try {
                            yield _ui_api2.default.set_time_left(_ui_api2.default.get_root_url(),
                            _this.state.value * 1000);
                        } catch (e) {_this.setState({ error: e.toString() });}
                    });
                }, this.
                on_reset_wait_click = () => {
                    let _this = this;
                    this.setState({ error: null });
                    (0, _etask2.default)(function* () {
                        try {
                            yield _ui_api2.default.set_time_left(_ui_api2.default.get_root_url(), 0, true);
                        } catch (e) {_this.setState({ error: e.toString() });}
                    });
                }, this.
                on_reset_click = () => {
                    let _this = this;
                    this.setState({ error: null });
                    (0, _etask2.default)(function* () {
                        try {
                            yield _ui_api2.default.reset_trial(_ui_api2.default.get_root_url());
                        } catch (e) {_this.setState({ error: e.toString() });}
                    });
                }, _temp3;}componentDidMount() {let _this = this;return (0, _etask2.default)(function* () {let root_url = _ui_api2.default.get_root_url();let trial = yield _ui_api2.default.get_trial_active(root_url);let next_trial_ts = yield _ui_api2.default.get_next_trial_ts(root_url);let trial_ended = yield _ui_api2.default.is_trial_expired(root_url);_this.setState({ trial, trial_ended, value: 60, waiting: !trial && next_trial_ts > Date.now() });});}
            render() {
                let { state } = this;
                if (!state.trial && !state.waiting && !state.trial_ended)
                return null;
                return _react2.default.createElement('div', { className: 'change-trial' },
                state.trial && _react2.default.createElement('div', null, 'Move trial time: ',
                _react2.default.createElement('input', { type: 'number', min: '10', step: '30',
                    value: Math.round(state.value), onChange: this.on_change }), 'sec ',
                _react2.default.createElement('button', { onClick: this.on_go_click }, ' Go')),

                state.waiting && _react2.default.createElement('button', { onClick: this.on_reset_wait_click,
                    style: { marginRight: '10px' } }, 'Reset trial wait'),
                _react2.default.createElement('button', { onClick: this.on_reset_click }, 'Reset trial'),
                state.error && _react2.default.createElement('div', { className: 'error-msg' }, state.error));

            }};


        function debug_zerr_set(data) {set_dbg_conf('debug.zerr', data);}let

        Debug_conf_zerr_level = class Debug_conf_zerr_level extends _react2.default.PureComponent {
            constructor(props) {
                super(props);this.



                handle_change = e => {
                    debug_zerr_set({ level: e.target.value });
                    this.setState({ level: e.target.value });
                };let level = zget(_util6.default.get_dbg_conf('debug.zerr'), 'level');this.state = { level: _zerr2.default.L[level] || _zerr2.default.level };}
            render() {
                const levels = Object.keys(_zerr2.default.L).map(k => _react2.default.createElement('option', { key: k, value: k,
                    selected: _zerr2.default.L[k] == this.state.level }, k));
                return _react2.default.createElement('div', null, 'Zerr level: ', _react2.default.createElement('select', { onChange: this.handle_change }, levels));

            }};let


        Debug_view = class Debug_view extends _react2.default.PureComponent {constructor(...args) {var _temp4;return _temp4 = super(...args), this.
                state = {}, this.
                on_rule_rating = () => this.setState({ page: 'rule_rating' }), this.
                on_disable_debug = () => (0, _etask2.default)(function* () {
                    yield _ui_api2.default.set_dev_mode(false);
                    _ui_api2.default.close_popup();
                }), _temp4;}
            render() {
                let enable_mitm = { disable: false, trigger: true, discovery: 'auto' };
                let enable_mitm_ui = Object.assign({ popup: { enable: true },
                    enable_ext_ui: 1 }, enable_mitm);
                let ver = _util4.default.version();
                let fa = { ip: '172.93.221.216', host: 'zagent1571.hola.org',
                    port: 22222 };
                let fa_rule = { ip: '38.32.25.106', host: 'zagent1685.hola.org',
                    port: 22222 };
                let fap_rule = Object.assign({}, fa_rule, { port: 22223 });
                return _react2.default.createElement('div', { className: 'debug_view' },
                _react2.default.createElement('header', null,
                _react2.default.createElement('h1', null, 'Debug ',
                _react2.default.createElement('i', { className: 'btn_close', onClick: unmount }))),


                this.state.page == 'rule_rating' ? _react2.default.createElement(Rule_rating_view, null) : undefined,
                !this.state.page ?
                _react2.default.createElement('div', null,
                _react2.default.createElement('a', { onClick: this.on_disable_debug }, 'Disable debug'),
                _react2.default.createElement(Debug_conf_zerr_level, null),
                _react2.default.createElement(Debug_conf_switch, { name: 'protect_ui2.protect_pc' }, 'Enable desktop app in protect ui'),


                _react2.default.createElement(Debug_conf_switch, { name: 'protect_ui2.protect_browser' }, 'Enable browser in protect ui'),


                _react2.default.createElement(Debug_conf_switch, { name: 'debug.show_redirect' }, 'Show redirect in popup'),


                _react2.default.createElement(Debug_conf_switch, { name: 'debug.show_rule_rating' }, 'Show rule rating in popup'),


                _react2.default.createElement(Debug_conf_switch, { name: 'mitm', value: enable_mitm }, 'Enable mitm trigger'),


                _react2.default.createElement(Debug_conf_switch, { name: 'mitm', value: enable_mitm_ui }, 'Enable mitm trigger + ui'),


                _react2.default.createElement(Debug_conf_agent, { name: 'be_force_agent', value: fa,
                    storage: true, title: 'Force agent' }),
                _react2.default.createElement(Debug_conf_switch, { name: 'be_force_agent', value: fa_rule,
                    storage: true }, 'Force using pool for streaming'),


                _react2.default.createElement(Debug_conf_switch, { name: 'be_force_agent', value: fap_rule,
                    storage: true }, 'Force using peer for streaming'),


                _react2.default.createElement(Debug_conf_switch, { name: 'debug_watermark_trial', value: true,
                    storage: true }, 'Watermark trial debug'),


                _react2.default.createElement(Debug_conf_switch, { dev_mode_conf: true, name: 'debug_proxy' }, 'Proxy debug'),


                _react2.default.createElement(Debug_conf_switch, { dev_mode_conf: true, name: 'debug_pac' }, 'PAC debug (virtual_pac_engine)'),


                _react2.default.createElement(Debug_conf_switch, { name: 'geo_popup.watermark.allow_hide',
                    value: true }, 'Allow to hide watermark'),


                _react2.default.createElement(Debug_conf_switch, { name: 'proxy_error_ui',
                    value: { min_ver: ver, icon: true, popup: true, dialog: true } }, 'Enable proxy error UI'),


                _react2.default.createElement(Debug_conf_ajax, { name: 'be_ajax_simulator', value: '',
                    storage: true, title: 'Ajax simulator' }),
                _react2.default.createElement(Change_trial, null),
                _react2.default.createElement('a', { onClick: this.on_rule_rating }, 'Rule rating page')) :
                undefined);


            }};


        function get_popular_country(host, rule_ratings) {
            return _util6.default.get_popular_country({ host: host || E.get_host(),
                rule_ratings: rule_ratings });
        }

        function get_ratings(host, rule_ratings) {
            var popular_countries = get_popular_country(host, rule_ratings);
            var tld = _util6.default.get_tld_country(host);
            var ratings = [popular_countries[0], popular_countries[1]];
            if (tld && tld != ratings[0].proxy_country &&
            tld != ratings[1].proxy_country)
            {
                ratings.push({ proxy_country: tld, rating: 0.1 });
                ratings.sort((a, b) => b.rating - a.rating);
            }
            if (tld && tld != ratings[0].proxy_country &&
            tld != ratings[1].proxy_country)
            {
                ratings.push({ proxy_country: tld, rating: 0.1 });
                ratings.sort((a, b) => b.rating - a.rating);
            }
            return ratings;
        }

        let min_suggest_rate = 0.3; 
        let Rule_rating_view = class Rule_rating_view extends _react2.default.PureComponent {constructor(...args) {var _temp5;return _temp5 = super(...args), this.
                state = {}, this.






















































































                onChange = e => {
                    let country = e.target.value;
                    _zerr2.default.notice('set country %s', country);
                    this.set_country(country);
                }, _temp5;}set_country(country) {let _this = this,url = _ui_api2.default.get_url() || '';let host = _url2.default.get_host(url);let root_url = _util8.default.get_root_url(url);let rate, show_geo, rule_ratings, ratings, force_premium, need_mitm;(0, _etask2.default)(function* set_country_() {try {const unblocking_rate_url = yield _ui_api2.default.get_unblocking_rate_url(200, country);const unblocking_rate = yield _ui_api2.default.get_unblocking_rate(200, country);for (let i = 0, r; !rate && (r = unblocking_rate[i]); i++) {if (r.root_url == root_url) rate = r;}show_geo = rate && rate.unblocking_rate > min_suggest_rate;rule_ratings = yield _ui_api2.default.get_rule_ratings({ root_url, country, limit: 20, vpn_only: true });const premium = yield _ui_api2.default.get_force_premium_rule(root_url);force_premium = !!premium;need_mitm = yield _ui_api2.default.mitm_need_popup(url);ratings = get_ratings(host, rule_ratings);_this.setState({ inited: true, rate, show_geo, ratings, rule_ratings, force_premium, need_mitm, country, root_url, unblocking_rate_url });} catch (e) {console.error('debug_ui error %s %o', e, e);}});}componentDidMount() {this.set_country(_ui_api2.default.get_country());}on_debug_rule_rating() {E.render_debug_view();}render() {let { compact } = this.props;let { country, root_url, unblocking_rate_url, rate, show_geo, inited, ratings, rule_ratings, force_premium, need_mitm } = this.state;console.log('---- country %s root_url %s unblocking_rate_url %s ' + 'rate %o show_geo', country, root_url, unblocking_rate_url, rate, show_geo);var flag = ratings && ratings[0].proxy_country;var flag2 = ratings && ratings[1].proxy_country; 
                var s = { overflow: 'auto', wordWrap: 'normal' };if (compact) {if (!inited) return _react2.default.createElement('div', null);let info = !rate ? 'no rating' : 'rate from ' + country + ' ' + parseInt(rate.unblocking_rate * 100) + '% (' + parseInt(rate.popularity) + ')';return _react2.default.createElement('div', { style: { textAlign: 'left', overflow: 'auto' }, onClick: this.on_debug_rule_rating }, _react2.default.createElement('div', { style: s }, _react2.default.createElement('div', null, info), 'flags ', flag, ' ', flag2, force_premium ? ' plus' : '', need_mitm ? ' mitm' : '', show_geo ? ' geo' : ''));}return _react2.default.createElement('div', { style: { textAlign: 'left' } }, _react2.default.createElement('div', { style: s }, 'root_url: ', root_url), _react2.default.createElement('div', { style: s }, 'your country: ', country), _react2.default.createElement('div', { style: s }, _react2.default.createElement(Country_list, { country: 'IL', onChange: this.onChange })), _react2.default.createElement('div', { style: s }, '1st flag: ', flag), _react2.default.createElement('div', { style: s }, '2nd flag: ', flag2), _react2.default.createElement('div', { style: s }, 'premium popup: ', '' + !!force_premium), _react2.default.createElement('div', { style: s }, 'mitm popup: ', '' + !!need_mitm), _react2.default.createElement('div', { style: s }, 'geo popup: ', '' + !!show_geo), _react2.default.createElement('div', { style: s }, 'geo threshold: ', min_suggest_rate), _react2.default.createElement('div', { style: s }, _react2.default.createElement('br', null), _react2.default.createElement('div', null, json_str(rate)), _react2.default.createElement('br', null), _react2.default.createElement('div', null, json_str(ratings)), _react2.default.createElement('br', null), _react2.default.createElement('div', null, json_str(rule_ratings)), _react2.default.createElement('br', null), _react2.default.createElement('div', null, 'unblocking_rate_url: ', unblocking_rate_url)));}};
        E.Rule_rating_view = Rule_rating_view;

        const Country_list = ({ country, onChange }) => _react2.default.createElement('select', { onChange: onChange },
        _countries2.default.proxy_countries.bext.map(c => _react2.default.createElement('option', { key: c, value: c,
            selected: c == country }, (0, _locale2.default)(c))));


        const Redirect_view = props => {
            const tab_id = _ui_api2.default.get_tab_id();
            const list = _ui_lib2.default.use_etask(() => _ui_api2.default.get_redirect_list(tab_id), [],
            [tab_id]) || [];
            if (!list.length)
            return _react2.default.createElement('span', null);
            const s = { overflow: 'auto', wordWrap: 'normal', textAlign: 'left' };
            return _react2.default.createElement('div', { style: s }, 'redirects: ', json_str(list));
        };
        E.Redirect_view = Redirect_view;

        let used_ips = [];let
        Proxy_view = class Proxy_view extends _react2.default.Component {constructor(...args) {var _temp6;return _temp6 = super(...args), this.
                state = {}, this.






































































                toggle_ui_ps = () => {
                    let ui_ps = this.state.ui_ps;
                    this.setState({ ui_ps: !ui_ps });
                }, this.
                toggle_bg_ps = () => {
                    let bg_ps = this.state.bg_ps;
                    this.setState({ bg_ps: !bg_ps });
                }, this.
                reset_events = () => {
                    let bg = window.chrome.extension.getBackgroundPage();
                    if (!bg)
                    return (0, _zerr2.default)('cannot get background');
                    let { be_vpn } = bg.be_bg_main;
                    be_vpn.reset_events();
                }, this.
                refresh_data = () => {
                    let _this = this;
                    let url = _ui_api2.default.get_url();
                    let bg = window.chrome.extension.getBackgroundPage();
                    if (!bg)
                    return (0, _zerr2.default)('cannot get background');
                    let { be_rule, be_vpn, unblocker_lib } = bg.be_bg_main;
                    let events = be_vpn.events_to_str();
                    let ip_mismatch = be_vpn.get_event_n('pac_miss');
                    let pac_slow = be_vpn.get_event_n('pac_slow');
                    let stuck = be_vpn.get_event_n('>stuck');
                    let verify_err = be_vpn.get_event_n('<verify_err');
                    let rules = be_rule.get_rules(url);
                    let rule = rules && rules[0];
                    this.setState({ events, pac_slow, stuck, ip_mismatch, verify_err });
                    if (rule)
                    {
                        let country = rule.country;
                        let chosen = unblocker_lib.get_chosen_agent({ country,
                            prot: 'HTTPS' }, rule);
                        this.setState({ rule, country,
                            rule_route: be_vpn.be_tab_unblocker.get_rule_route(rules[0]),
                            agents: unblocker_lib.debug && unblocker_lib.debug.
                            get_agents(),
                            chosen });

                        (0, _etask2.default)(function* debug_refresh_data() {
                            let rule_agents = yield unblocker_lib.get_agents(null, rule);
                            _this.setState({ rule_agents });
                        });
                    }
                    if (this.state.ui_ps)
                    this.setState({ ui_ps_str: _etask2.default.ps() });
                    if (this.state.bg_ps)
                    this.setState({ bg_ps_str: bg.be_bg_main.etask.ps() });
                }, _temp6;}componentDidMount() {this.timer = setInterval(this.refresh_data, 1000);}componentWillUnmount() {clearInterval(this.timer);}render() {const { country, rule, rule_route, agents, chosen, rule_agents, events, ui_ps, ui_ps_str, bg_ps, bg_ps_str, ip_mismatch, pac_slow, verify_err, stuck } = this.state;const ip = zget(chosen, '0.ip');const host = (zget(chosen, '0.host') || '').replace('.hola.org', '');if (!used_ips.includes(ip)) used_ips.push(ip);const sw = { color: 'orange', fontWeight: 'bold' };const se = { color: 'red', fontWeight: 'bold' };const bw = zget(chosen, '0.bw_available');const rtt = zget(chosen, '0.rtt');const sip_mismatch = ip_mismatch ? se : null;const spac_slow = pac_slow ? se : null;const sstuck = stuck ? se : null;const sverify_err = verify_err ? se : null;const stext = { height: '100px', fontSize: '10px' };const stext_wide = { width: '360px', height: '150px', fontSize: '10px' };const sbw = bw > 200 ? null : bw > 50 ? sw : se;const srtt = rtt < 700 ? null : rtt < 1000 ? sw : se;const sips = used_ips.length < 5 ? null : used_ips.length < 10 ? sw : se; 
                return _react2.default.createElement('div', { style: { textAlign: 'left', maxWidth: '400px', maxHeight: '500px', overflow: 'scroll', fontSize: '12px' } }, _react2.default.createElement('div', null, _react2.default.createElement('b', null, country), _react2.default.createElement('span', null, ' ', host, ' ', ip), _react2.default.createElement('span', null, ', '), _react2.default.createElement('span', { style: sips }, 'unique_ips: ', used_ips.length)), _react2.default.createElement('div', null, _react2.default.createElement('span', { style: sbw }, Math.round(bw), ' MBs'), _react2.default.createElement('span', { style: srtt }, ', verify ', rtt, 'ms'), ip_mismatch && _react2.default.createElement('span', { style: sip_mismatch }, ', pac MISS: ', ip_mismatch), pac_slow && _react2.default.createElement('span', { style: spac_slow }, ', pac SLOW: ', pac_slow), stuck && _react2.default.createElement('span', { style: sstuck }, ', STUCK: ', stuck), verify_err && _react2.default.createElement('span', { style: sverify_err }, ', verify err: ', verify_err)), _react2.default.createElement('div', null, _react2.default.createElement('span', null, 'XXX disable debug'), _react2.default.createElement('span', null, 'XXX pool_ip'), _react2.default.createElement('span', null, 'XXX typeerror'), _react2.default.createElement('span', null, 'XXX trace_errors/show_errors'), _react2.default.createElement('span', null, 'XXX show proxy_rule for site'), _react2.default.createElement('span', null, 'XXX show bext_config'), _react2.default.createElement('button', { onClick: this.toggle_ui_ps }, 'ui ps'), ui_ps && _react2.default.createElement('textarea', { style: stext_wide, value: 'ui ' + ui_ps_str }), _react2.default.createElement('button', { onClick: this.toggle_bg_ps }, 'bg ps'), bg_ps && _react2.default.createElement('textarea', { style: stext_wide, value: 'bg ' + bg_ps_str })), _react2.default.createElement('button', { onClick: this.reset_events }, 'reset events'), _react2.default.createElement('textarea', { style: stext_wide, value: events }), _react2.default.createElement('textarea', { style: stext, value: 'rule_route: ' + JSON.stringify(rule_route, null, ' ') }), _react2.default.createElement('textarea', { style: stext, value: 'chosen: ' + JSON.stringify(chosen, null, ' ') }), _react2.default.createElement('textarea', { style: stext, value: 'rule_agents: ' + JSON.stringify(rule_agents, null, ' ') }));}};

        E.Proxy_view = Proxy_view;

        E.Debug_ui = function Debug_ui() {
            let debug_proxy = get_be_dev_mode().get('debug_proxy');
            return _reactDom2.default.createPortal(_react2.default.createElement('div', { className: 'debug-ui' },
            CG('debug.show_rule_rating') && _react2.default.createElement(E.Rule_rating_view, { compact: true }),
            CG('debug.show_redirect') && _react2.default.createElement(E.Redirect_view, null),
            debug_proxy && _react2.default.createElement(E.Proxy_view, null)),
            document.body);
        };

        function json_str(o) {
            let s = JSON.stringify(o || '');
            return s.replace(/,/, ', ').replace(/"/g, '');
        }

        let react_root;
        const unmount = () => {
            _reactDom2.default.unmountComponentAtNode(react_root);
            document.body.removeChild(react_root);
        };

        E.render_debug_view = () => {
            react_root = document.createElement('div');
            react_root.classList.add('react_root');
            document.body.appendChild(react_root);
            _reactDom2.default.render(_react2.default.createElement(Debug_view, null), react_root);
        };exports.default =

        E;});})();
//# sourceMappingURL=debug_ui.js.map
