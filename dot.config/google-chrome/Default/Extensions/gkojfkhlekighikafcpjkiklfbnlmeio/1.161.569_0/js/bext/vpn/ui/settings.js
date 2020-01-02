// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', 'classnames', 'react', 'react-dom', 'conf', '/util/date.js', '/util/util.js', '/util/url.js', '/util/etask.js', '/bext/vpn/ui/ui_lib.js', '/bext/vpn/ui/ui_api.js', '/bext/vpn/ui/page_lib.js', '/bext/vpn/util/util.js', '/bext/vpn/ui/privacy.js', '/svc/account/pub/membership.js'], function (exports, _underscore, _classnames, _react, _reactDom, _conf, _date, _util, _url, _etask, _ui_lib, _ui_api, _page_lib, _util3, _privacy, _membership) {Object.defineProperty(exports, "__esModule", { value: true });exports.init = undefined;var _underscore2 = _interopRequireDefault(_underscore);var _classnames2 = _interopRequireDefault(_classnames);var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _conf2 = _interopRequireDefault(_conf);var _date2 = _interopRequireDefault(_date);var _util2 = _interopRequireDefault(_util);var _url2 = _interopRequireDefault(_url);var _etask2 = _interopRequireDefault(_etask);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _ui_api2 = _interopRequireDefault(_ui_api);var _util4 = _interopRequireDefault(_util3);var _privacy2 = _interopRequireDefault(_privacy);var _membership2 = _interopRequireDefault(_membership);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;}
















        const { useState, useEffect } = _react2.default;

        const assign = Object.assign,T = _ui_lib2.default.T;
        const perr = (id, info) => _ui_api2.default.perr(id, info, {}, true);

        const Switch = ({ checked, on_change }) => {
            const toggle = () => {
                if (on_change)
                on_change(!checked);
            };
            const cls = 'switch' + (checked ? ' switch-checked' : '');
            return _react2.default.createElement('button', { type: 'button', role: 'switch', 'aria-checked': checked,
                className: cls, onClick: toggle });
        };

        const Label_checkbox = _ref => {let { children } = _ref,props = _objectWithoutProperties(_ref, ['children']);return (
                _react2.default.createElement('label', { className: 'label-checkbox' },
                _react2.default.createElement('input', _extends({ type: 'checkbox' }, props)),
                _react2.default.createElement('div', { className: 'content' }, children)));};


        const Link_button = ({ href, on_click, cls, style, new_tab, children }) => {
            const click = e => {
                if (!href)
                e.preventDefault();
                if (on_click)
                on_click(e);
            };
            return _react2.default.createElement('a', { className: (0, _classnames2.default)('link-button', cls), style: style,
                href: href, onClick: click, target: new_tab ? '_blank' : undefined },
            children);

        };

        const Link_line = ({ href, children }) =>
        _react2.default.createElement('div', { className: 'link-line' },
        _react2.default.createElement(Link_button, { href: href }, children));


        const Row = ({ cls, children }) =>
        _react2.default.createElement('div', { className: 'row-sp1' },
        _react2.default.createElement('div', { className: (0, _classnames2.default)('row-children', cls) }, children));


        const Report_problem = () =>
        _react2.default.createElement('div', { className: 'section report-problem' },
        _react2.default.createElement('a', { className: 'title', href: 'about.html#report_issue' },
        _react2.default.createElement(T, null, 'Report a problem')));



        const date2display = d => d ? _date2.default.strftime('%o %B %Y', (0, _date2.default)(d)) : '-';

        const Mobile_cancel_notice = props => {
            const store = _membership2.default.is_ios(props.membership) ? 'App Store' :
            'Google Play';
            const faq_url = props.hola_faq ? '/faq#premium-cancel' :
            _membership2.default.is_ios(props.membership) ?
            'https://support.apple.com/en-il/HT202039' :
            'https://support.google.com/googleplay/answer/7018481';
            return _react2.default.createElement('p', null, 'Note: To cancel your subscription, you must use ',
            store, '. See ',
            _react2.default.createElement('a', { href: faq_url }, 'the FAQ.'));

        };let

        Cancel_modal = class Cancel_modal extends _react2.default.Component {constructor(...args) {var _temp;return _temp = super(...args), this.
                state = {}, this.




                on_change = e => this.setState({ [e.target.name]: e.target.value }), this.




























































































                perr_commit = () => {
                    perr('cancel_subscription', {
                        user: _util2.default.get(this.props.user, 'hola_uid'),
                        is_mobile: _membership2.default.is_mobile(this.props.membership) });
                }, this.
                on_back = () => {
                    if (this.state.step == 'cancel')
                    {
                        this.perr_commit();
                        return this.cancel_subscr();
                    }
                    let step = this.history.pop();
                    if (!step)
                    return this.props.close();
                    this.setState({ step });
                }, this.
                on_next = () => {
                    let _this = this;
                    let { step } = this.state;
                    this.history.push(step);
                    return (0, _etask2.default)(function* () {
                        let next_step;
                        switch (step) {

                            case 'faq':next_step = 'reason';break;
                            case 'reason':
                                if (_membership2.default.is_mobile(_this.props.membership))
                                {
                                    _this.perr_commit();
                                    next_step = (yield _this.send_reason()) ? 'cancel_mobile' :
                                    'reason';
                                } else

                                next_step = 'cancel';
                                break;
                            default:
                                _ui_api2.default.refresh_user({ force_premium: true });
                                next_step = undefined;
                                _this.props.close();}

                        _this.setState({ step: next_step });
                    });
                }, _temp;}componentDidMount() {this.setState({ step: 'faq' });this.history = [];}render_faq() {const Faq = props => _react2.default.createElement('a', { href: 'https://hola.org/faq#' + props.id }, props.children);let body = _react2.default.createElement('div', null, _react2.default.createElement('p', null, _react2.default.createElement('b', null, 'Common issues:')), _react2.default.createElement('ul', null, _react2.default.createElement('li', null, _react2.default.createElement(Faq, { id: 'premium-streamingservices' }, 'Netflix/Hulu issues')), _react2.default.createElement('li', null, _react2.default.createElement(Faq, { id: 'premium-slowconn' }, 'Slow connection')), _react2.default.createElement('li', null, _react2.default.createElement(Faq, { id: 'premium-appearfree' }, 'My account appears as free'))), _react2.default.createElement('p', null, 'Search the ', _react2.default.createElement(Faq, { id: 'faq' }, 'Full FAQs')), _react2.default.createElement('p', null, 'Still need help? ', _react2.default.createElement('a', { href: '/premium_support' }, 'Contact us!')));return { title: T('Technical issue?'), next_label: T('Still want to cancel'), body };}render_reason() {let reason = this.state.reason || '';let body = _react2.default.createElement('input', { className: 'hfill', name: 'reason', value: reason, onChange: this.on_change, placeholder: 'Problems with a specific site? ' + 'Slow connection? Please let us know.' });return { title: T('Before you go... tell us why?'), next_label: T('Continue'), next_disabled: reason.trim().length < 8, body };}render_cancel() {let { cancel_error } = this.state;let body = _react2.default.createElement('div', null, _react2.default.createElement('p', null, 'The subscription allows you to enjoy uninterrupted secure browsing and unblocking of all your favorite sites, on all your devices.'), cancel_error && _react2.default.createElement(Alert_message, { type: 'error' }, cancel_error));return { title: T('Are you sure you want to cancel your subscription?'), next_label: T('Keep using Hola VPN'), back_label: T('Cancel my subscription'), body };}render_cancel_mobile() {return { next_label: T('Ok'), back_label: false, body: _react2.default.createElement(Mobile_cancel_notice, { membership: this.props.membership }) };}cancel_subscr() {let _this = this;return (0, _etask2.default)(function* () {this.on('uncaught', () => {perr('cancel_subscription_unknown_error', { user: _util2.default.get(_this.props.user, 'hola_uid'), is_mobile: _membership2.default.is_mobile(_this.props.membership) });_this.setState({ cancel_error: 'Unknown error' });});let data = { reason: _this.state.reason };let res = yield _ui_api2.default.hola_api_call('users/payment/cancel_subscription?no_redirect=1', { method: 'POST', text: true, data });_util4.default.assert(res == 'ok', new Error());_ui_api2.default.refresh_user({ force_premium: true });_this.props.close();});}send_reason() {let _this = this;return (0, _etask2.default)(function* () {try {let data = { reason: _this.state.reason };let res = yield _ui_api2.default.hola_api_call('users/payment/update_reason', { method: 'POST', text: true, data });return res.trim() == 'ok';} catch (e) {return false;}});}
            render() {
                let { step } = this.state;
                let res = this[`render_${step}`] && this[`render_${step}`]();
                if (!res)
                return null;
                const actions = [
                res.back_label !== false && _react2.default.createElement('a', { key: 'back', className: 'btn-secondary',
                    onClick: this.on_back },
                T(res.back_label || 'Go back')),

                _react2.default.createElement('a', { key: 'next', className: (0, _classnames2.default)({ disabled: res.next_disabled }),
                    onClick: res.next_disabled ? undefined : this.on_next },
                res.next_label)];


                return _react2.default.createElement(_page_lib.Modal, { title: res.title, on_close: this.props.close,
                    action: actions },
                res.body);

            }};


        const Alert_message = ({ duration, ts, type, children }) => {
            if (duration && ts + duration < Date.now())
            return null;
            return _react2.default.createElement('div', { className: (0, _classnames2.default)('alert-message', type) }, children);
        };

        const create_alert_info = (type, message, duration) => ({ type, message, duration,
            ts: Date.now() });let

        Account_details = class Account_details extends _react2.default.Component {

            constructor(props) {
                super(props);this.state = { password: '', new_pass: '' };this.















                update_membership = () =>
                this.setState({ membership: _ui_api2.default.get_membership() });this.
                on_change = e => this.setState({ [e.target.name]: e.target.value });this.
                switch_show = key => this.setState({ [key]: !this.state[key] });this.
                update_alert = (id, type, message, duration) => {
                    let { alerts = {} } = this.state;
                    if (!type)
                    return this.setState({ alerts: _extends({}, alerts, { [id]: undefined }) });
                    this.setState({ alerts: _extends({}, alerts, {
                            [id]: create_alert_info(type, message, duration) }) });
                    if (duration)
                    _util4.default.set_timeout(() => this.forceUpdate(), duration);
                };this.
                logout_sessions = () => {
                    let _this = this;
                    (0, _etask2.default)(function* () {
                        this.on('uncaught', () => {
                            _this.update_alert('logout', 'error',
                            'Unsuccessful logout all sessions except me');
                        });
                        _this.update_alert('logout');
                        let res = yield _ui_api2.default.hola_api_call('users/logout/others',
                        { method: 'POST', text: true });
                        _util4.default.assert(res == 'ok', new Error());
                        _this.update_alert('logout', 'success',
                        'Successful logout all sessions except me', 3000);
                    });
                };this.
                change_password = () => {
                    let _this = this;
                    let { password, new_pass } = this.state;
                    return (0, _etask2.default)(function* () {
                        this.on('uncaught', () => {
                            _this.update_alert('password', 'error',
                            'Current password is incorrect');
                        });
                        _this.update_alert('password');
                        if (!password || !new_pass)
                        {
                            return _this.update_alert('password', 'error',
                            'Please fill all fields');
                        }
                        let data = { password, new_pass, service: true };
                        let res = yield _ui_api2.default.hola_api_call('users/change_password',
                        { method: 'POST', data, text: true });
                        _util4.default.assert(res == 'ok', new Error());
                        yield _this.logout_sessions();
                        _this.setState({ show_change_password: false });
                        _this.update_alert('password', 'success',
                        'Password successfully changed', 3000);
                    });
                };this.
                avangate_update_cc = () => {
                    let _this = this;
                    return (0, _etask2.default)(function* () {
                        this.on('uncaught', () => {
                            _this.update_alert('avangate_update_cc', 'error',
                            'Unknown error');
                        });
                        _this.update_alert('avangate_update_cc');
                        let url = yield _ui_api2.default.hola_api_call(
                        'users/payment/single_sign_on');
                        _util4.default.assert(_url2.default.is_valid_url(url), new Error());
                        location.href = url.replace('?', 'payment_methods/?');
                    });
                };this.switch_show_password = this.switch_show.bind(this, 'show_change_password');this.switch_show_manage = this.switch_show.bind(this, 'show_manage_subscr');this.switch_show_cancel = this.switch_show.bind(this, 'show_cancel_modal');}componentDidMount() {_ui_api2.default.on('membership_changed', this.update_membership);this.update_membership();_ui_api2.default.refresh_user({ force_premium: true });}componentWillUnmount() {_ui_api2.default.off('membership_changed', this.update_membership);}
            render_alerts(keys) {
                let { alerts = {} } = this.state;
                return Object.entries(alerts).
                filter(([key, value]) => !!value && keys.includes(key)).
                map(([key, value]) => {
                    const { message } = value,props = _objectWithoutProperties(value, ['message']);
                    return _react2.default.createElement(Alert_message, _extends({ key: key }, props),
                    message);

                });
            }
            render() {
                let { user, is_plus } = this.props;
                let { show_change_password, show_manage_subscr, show_cancel_modal } =
                this.state;
                let m = this.state.membership;
                let is_active = _membership2.default.is_active(m);
                const status = !_membership2.default.is_active(m) ? 'Stopped' :
                _membership2.default.is_in_trial(m) ? 'Free trial' : 'Valid';
                return _react2.default.createElement(_page_lib.Section, { title: T('Account details:') },
                _react2.default.createElement(_page_lib.Label_line, { label: T('Account ID:') },
                user.displayName, ' (', user.hola_uid, ')'),

                _react2.default.createElement(_page_lib.Label_line, { label: T('Membership:') },
                is_plus ? 'PLUS' : 'FREE'),

                _react2.default.createElement(_page_lib.Label_line, null,
                _react2.default.createElement(Row, { cls: 'hfill' },
                _react2.default.createElement(Link_button, { on_click: this.switch_show_password },
                show_change_password ? 'Hide change password' :
                'Change password'),

                _react2.default.createElement(Link_button, { on_click: this.logout_sessions }, 'Logout all sessions except me')),



                this.render_alerts(['logout', 'password']),
                show_change_password && _react2.default.createElement('div', null,
                _react2.default.createElement(_page_lib.Label_line, { label: T('Current password:') },
                _react2.default.createElement('input', { name: 'password', type: 'password',
                    onChange: this.on_change })),

                _react2.default.createElement(_page_lib.Label_line, { label: T('New password:') },
                _react2.default.createElement('input', { name: 'new_pass', type: 'password',
                    onChange: this.on_change })),

                _react2.default.createElement(_page_lib.Label_line, { label: ' ' },
                _react2.default.createElement(Link_button, { cls: 'btn-primary', style: { marginRight: '20px' },
                    on_click: this.change_password }, 'Change password'),


                _react2.default.createElement(Link_button, { href: 'https://hola.org/forgot_password',
                    new_tab: true }, 'Forgot your password?')))),





                is_active && _react2.default.createElement(_page_lib.Label_line, { label: T('Subscribed on:') },
                _membership2.default.is_mobile(m) ? 'Mobile' : 'Desktop'),

                is_active && _react2.default.createElement(_page_lib.Label_line, { label: T('Subscription:') },
                _membership2.default.period_str(m)),

                is_active && m.cancelled && _react2.default.createElement(_page_lib.Label_line, null, 'You cancelled your subscription. It will remain active until ',

                date2display(m.end), '.'),

                is_active && _react2.default.createElement(_page_lib.Label_line, null,
                _react2.default.createElement(Row, { cls: 'center' },
                _react2.default.createElement(Link_button, { on_click: this.switch_show_manage },
                show_manage_subscr ? T('Hide') : T('Manage'))),


                show_manage_subscr && _react2.default.createElement('div', null,
                _react2.default.createElement(_page_lib.Label_line, { label: T('Started on:') },
                _membership2.default.period_start_str(m)),

                _react2.default.createElement(_page_lib.Label_line, {
                    label: T(m.period == '1 D' ? 'Expires on:' : 'Next renewal:') },
                _membership2.default.period_end_str(m)),

                _react2.default.createElement(_page_lib.Label_line, { label: T('Payment method:') },
                _membership2.default.payment_label(m),
                m.gateway == 'avangate' && _react2.default.createElement('div', null,
                _react2.default.createElement(Link_button, { on_click: this.avangate_update_cc }, 'Update Credit card')),



                this.render_alerts(['avangate_update_cc'])),

                _react2.default.createElement(_page_lib.Label_line, { label: T('Subscription status:') },
                status,
                _membership2.default.is_cancellable(m) && _react2.default.createElement('div', null,
                _react2.default.createElement(Link_button, { on_click: this.switch_show_cancel }, 'Cancel subscription'),


                show_cancel_modal &&
                _react2.default.createElement(Cancel_modal, { close: this.switch_show_cancel,
                    user: user, membership: m }))),


                _membership2.default.is_cancellable_mobile(m) && _react2.default.createElement(_page_lib.Label_line, null,
                _react2.default.createElement(Mobile_cancel_notice, { membership: m })))),



                _react2.default.createElement(Link_line, { href: 'https://hola.org/cp' },
                _react2.default.createElement(T, null, 'My account')));


            }};


        function Rule_item(props) {
            let { rule, href, cls, on_remove, on_switch, title } = props;
            return (
                _react2.default.createElement('li', { key: rule.name, className: (0, _classnames2.default)('rule-item', cls) },
                _react2.default.createElement('div', { className: 'icon-' + (props.icon || rule.mode || 'unblock') }),
                _react2.default.createElement('div', { className: 'f32' },
                _react2.default.createElement('i', { className: 'flag ' + rule.country })),

                href && _react2.default.createElement('a', { className: 'rule-name', href: href, target: '_blank',
                    rel: 'noopener noreferrer' },
                rule.name),

                title && _react2.default.createElement('div', { className: 'rule-name' }, _react2.default.createElement(T, null, title)),
                on_switch && _react2.default.createElement(Switch, { checked: rule.enabled, on_change: on_switch }),
                on_remove && _react2.default.createElement('div', { className: 'icon-remove', title: T('Delete'),
                    onClick: () => on_remove(rule) })));


        }let

        Unblock = class Unblock extends _react2.default.Component {constructor(...args) {var _temp2;return _temp2 = super(...args), this.
                state = {}, this.








                update_rules = () => {
                    this.setState({
                        rules: _ui_api2.default.get_rules(),
                        vpn_country: _ui_api2.default.get_vpn_country(),
                        protect_pc: _ui_api2.default.get_protect_pc(),
                        protect_browser: _ui_api2.default.get_protect_browser() });

                }, this.







                remove_rule = rule => {
                    let _this = this;
                    (0, _etask2.default)(function* () {
                        if (rule.mitm)
                        {
                            yield _ui_api2.default.mitm_set_ignore(rule.url);
                            _this.load_mitm_rules();
                            return;
                        }
                        let opt = assign({ enabled: 0, del: 1 }, _underscore2.default.pick(rule, 'sid', 'name',
                        'type', 'country'));
                        yield _ui_api2.default.set_rule(opt);
                        _ui_api2.default.fetch_rules();
                    });
                }, this.
                render_rule = rule => {
                    let href = 'http://' + (_url2.default.get_host(_url2.default.add_proto(rule.link || '') + '/') ||
                    rule.name);
                    return _react2.default.createElement(Rule_item, { key: rule.name, rule: rule, href: href,
                        on_remove: this.remove_rule,
                        cls: { 'rule-disabled': !rule.enabled } });
                }, this.
                switch_all_browser = enable => {
                    _ui_api2.default.set_enabled_for_browser(enable, { country: 'us' });
                }, this.
                switch_protect_pc = enable => {
                    _ui_api2.default.set_enabled_for_pc(enable, { country: 'us' });}, _temp2;}componentDidMount() {_ui_api2.default.on('rule_changed', this.update_rules);this.update_rules();this.load_mitm_rules();}componentWillUnmount() {_ui_api2.default.off('rule_changed', this.update_rules);}load_mitm_rules() {let _this = this;(0, _etask2.default)(function* () {let mitm_rules = yield _ui_api2.default.get_mitm_unblock_rules();_this.setState({ mitm_rules });});}
            get_rules() {
                let { state } = this;
                let rules = [],all_browser;
                Object.values(_util2.default.get(state, 'rules.unblocker_rules', {})).
                forEach(rule => {
                    if (_util4.default.is_all_browser(rule))
                    all_browser = rule;else

                    rules.push(rule);
                });
                (state.mitm_rules || []).forEach(r => rules.push({ name: r.name, url: r.url,
                    country: r.country, enabled: true, mitm: true }));
                let protect_pc = { mode: 'protect', country: state.vpn_country || 'us',
                    enabled: !!state.vpn_country };
                all_browser = all_browser || { country: 'us', enabled: 0 };
                return { rules, all_browser, protect_pc };
            }
            render() {
                let { rules, all_browser, protect_pc } = this.get_rules();
                let { country, is_plus } = this.props;
                let popular_url = 'https://hola.org/unblock/popular' + (country ?
                '/' + country.toLowerCase() : '') + '?utm_source=holaext_settings';
                return _react2.default.createElement(_page_lib.Section, { title: T('Unblock') },
                _react2.default.createElement('ul', null,
                is_plus && this.state.protect_browser &&
                _react2.default.createElement(Rule_item, { rule: all_browser, title: 'Protect browser',
                    on_switch: this.switch_all_browser, icon: 'protect' }),
                is_plus && this.state.protect_pc &&
                _react2.default.createElement(Rule_item, { rule: protect_pc, title: 'Protect entire PC',
                    on_switch: this.switch_protect_pc, icon: 'protect' }),
                _react2.default.createElement('li', { className: 'sub-section' },
                _react2.default.createElement('h3', { className: 'title' }, _react2.default.createElement(T, null, 'Sites')),
                !!rules.length &&
                _react2.default.createElement('ul', null, rules.map(this.render_rule)),
                _react2.default.createElement('a', { className: 'popular-btn', target: '_blank',
                    rel: 'noopener noreferrer', href: popular_url },
                _react2.default.createElement(T, null, 'Unblock more sites...')))));




            }};let


        Popups = class Popups extends _react2.default.Component {constructor(...args) {var _temp3;return _temp3 = super(...args), this.
                state = { rules: [] }, this.







                update_rules = () => {
                    let _this = this;
                    (0, _etask2.default)(function* () {
                        let all_sites = false;
                        let rules = yield _ui_api2.default.get_dont_show_rules('default');
                        if (rules.includes('all'))
                        {
                            all_sites = true;
                            rules = rules.filter(r => r != 'all');
                        }
                        _this.setState({ rules, all_sites });
                    });
                }, this.
                on_change = enable => {
                    _ui_api2.default.set_dont_show_again({ root_url: 'all', period: 'default',
                        type: 'default', src: 'settings', unset: !enable });
                }, this.
                on_remove = ({ name }) => {
                    _ui_api2.default.set_dont_show_again({ root_url: name, type: 'default',
                        unset: true });
                }, this.
                render_rule = root_url => {
                    let href = 'http://' + root_url;
                    return _react2.default.createElement(Rule_item, { key: root_url, rule: { name: root_url }, href: href,
                        on_remove: this.on_remove, cls: 'rule-item-popups' });
                }, _temp3;}componentDidMount() {_ui_api2.default.on('settings_changed', this.update_rules);this.update_rules();}componentWillUnmount() {_ui_api2.default.off('settings_changed', this.update_rules);}
            render() {
                let { rules, all_sites } = this.state;
                return _react2.default.createElement(_page_lib.Section, { title: T('Popups') },
                _react2.default.createElement('ul', null,
                _react2.default.createElement('li', { className: 'settings-item' },
                _react2.default.createElement(T, null, 'Don\'t show popup for any site'),
                _react2.default.createElement(Switch, { checked: all_sites, on_change: this.on_change })),

                _react2.default.createElement('li', { className: 'sub-section' },
                _react2.default.createElement('h3', { className: 'title' }, _react2.default.createElement(T, null, 'Sites')),
                !!rules.length &&
                _react2.default.createElement('ul', null, rules.map(this.render_rule)))));



            }};let


        Peer = class Peer extends _react2.default.Component {constructor(...args) {var _temp4;return _temp4 = super(...args), this.
                state = { checked: true }, this.
                on_change = () => {
                    let _this = this;
                    (0, _etask2.default)(function* () {
                        _this.setState({ checked: false });
                        yield _etask2.default.sleep(100);
                        _this.setState({ checked: true, modal: true });
                    });
                }, this.
                on_close_modal = () => this.setState({ modal: false }), _temp4;}
            render_modal() {
                let plus_url = _util4.default.plus_ref('p2p_settings');
                let get_plus = _react2.default.createElement('a', { className: 'upgrade-btn', href: plus_url,
                    target: '_blank', rel: 'noopener noreferrer' },
                _react2.default.createElement(T, null, 'Upgrade to'), _react2.default.createElement('i', { className: 'icon-plus' }));

                return _react2.default.createElement(_page_lib.Modal, { title: T('Upgrade to'), action: get_plus,
                    on_close: this.on_close_modal }, 'Upgrade to PLUS to stop sharing idle resources');


            }
            render() {
                let { is_plus } = this.props;
                return _react2.default.createElement(_page_lib.Section, { title: T('Peer to peer') },
                _react2.default.createElement('ul', null,
                _react2.default.createElement('li', { className: 'settings-item' },
                is_plus && _react2.default.createElement(T, null, 'Never share idle resources'),
                !is_plus && _react2.default.createElement(T, null, 'Allow to be a peer and share resources'),
                !is_plus && _react2.default.createElement(Switch, { checked: this.state.checked,
                    on_change: this.on_change }))),


                this.state.modal && this.render_modal());

            }};let


        Legal = class Legal extends _react2.default.Component {constructor(...args) {var _temp5;return _temp5 = super(...args), this.
                state = {}, this.







                update_agree_ts = () => this.setState({ agree_ts: _ui_api2.default.get_agree_ts() }), this.
                show_privacy = e => {
                    e.preventDefault();
                    this.setState({ modal: true });
                }, this.
                hide_privacy = () => this.setState({ modal: false }), this.
                on_change = () => {
                    let agree_ts = this.state.agree_ts ? '' : Date.now();
                    this.setState({ agree_ts });
                    _ui_api2.default.set_agree_ts(agree_ts);
                }, _temp5;}componentDidMount() {_ui_api2.default.on('agree_ts_changed', this.update_agree_ts);this.update_agree_ts();}componentWillUnmount() {_ui_api2.default.on('agree_ts_changed', this.update_agree_ts);}
            render_modal() {
                return _react2.default.createElement(_page_lib.Modal, { className: 'page-modal-legal', title: _privacy2.default.title,
                    on_close: this.hide_privacy },
                _react2.default.createElement(_privacy2.default.Text, null));

            }
            render() {
                return _react2.default.createElement(_page_lib.Section, { title: T('Legal'), cls: 'section-legal' },
                _react2.default.createElement('ul', null,
                _react2.default.createElement('li', { className: 'settings-item' },
                _react2.default.createElement(Label_checkbox, { onChange: this.on_change,
                    checked: !!this.state.agree_ts }, 'I agree that Hola can use my personal information as described in the ',

                ' ',
                _react2.default.createElement('a', { href: '', onClick: this.show_privacy,
                    onMouseDown: e => e.preventDefault() }, _privacy2.default.title)))),



                this.state.modal && this.render_modal());

            }};


        const Settings = () => {
            const get_user_info = () => ({
                user: _ui_api2.default.get_user(),
                is_plus: _ui_api2.default.get_is_premium() });

            const [user_info, set_user_info] = useState(get_user_info());
            const [svc_version, set_svc_version] = useState(_ui_api2.default.get_svc_version());
            const [country, set_country] = useState(_ui_api2.default.get_country());
            useEffect(() => {
                perr('settings_show');
                const update_user = () => set_user_info(get_user_info());
                const update_country = () => set_country(_ui_api2.default.get_country());
                const update_svc_version = () =>
                set_svc_version(_ui_api2.default.get_svc_version());
                _ui_api2.default.on('user_changed', update_user);
                _ui_api2.default.on('country_changed', update_country);
                _ui_api2.default.on('svc_version_changed', update_svc_version);
                return () => {
                    _ui_api2.default.off('user_changed', update_user);
                    _ui_api2.default.off('country_changed', update_country);
                    _ui_api2.default.off('svc_version_changed', update_svc_version);
                };
            }, []);
            return _react2.default.createElement(_page_lib.Page_layout, _extends({}, user_info, { title: T('Settings'), cls: 'settings' }),
            _react2.default.createElement(Report_problem, null),
            user_info.user && _react2.default.createElement(Account_details, user_info),
            _react2.default.createElement(Unblock, { country: country, is_plus: user_info.is_plus }),
            _react2.default.createElement(Popups, null),
            !!svc_version && _react2.default.createElement(Peer, { is_plus: user_info.is_plus }),
            !!_conf2.default.check_agree_ts && _react2.default.createElement(Legal, null),
            _react2.default.createElement(_page_lib.Legal_section, null,
            _react2.default.createElement(Link_line, { href: 'about.html' }, _react2.default.createElement(T, null, 'About'))));


        };

        const init = exports.init = () => (0, _etask2.default)(function* () {
            yield (0, _page_lib.init_api)();
            _reactDom2.default.render(_react2.default.createElement(Settings, null), document.querySelector('.react-root'));
        });});})();
//# sourceMappingURL=settings.js.map
