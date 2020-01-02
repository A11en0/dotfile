// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', 'react', 'react-dom', 'classnames', 'react-flip-toolkit', '/util/util.js', '/util/etask.js', '/util/escape.js', '/util/date.js', '/util/url.js', '/svc/vpn/pub/util.js', '/bext/pub/util.js', '/bext/vpn/ui/ui_lib.js', '/bext/vpn/util/util.js', '/util/storage.js', '/svc/vpn/pub/common_ui.js', '/bext/vpn/ui/ui_api.js', '/bext/vpn/ui/context.js', '/bext/vpn/ui/page_lib.js'], function (exports, _underscore, _react, _reactDom, _classnames, _reactFlipToolkit, _util, _etask, _escape, _date, _url, _util3, _util5, _ui_lib, _util7, _storage, _common_ui, _ui_api, _context, _page_lib) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _classnames2 = _interopRequireDefault(_classnames);var _util2 = _interopRequireDefault(_util);var _etask2 = _interopRequireDefault(_etask);var _escape2 = _interopRequireDefault(_escape);var _date2 = _interopRequireDefault(_date);var _url2 = _interopRequireDefault(_url);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _util8 = _interopRequireDefault(_util7);var _storage2 = _interopRequireDefault(_storage);var _common_ui2 = _interopRequireDefault(_common_ui);var _ui_api2 = _interopRequireDefault(_ui_api);var _context2 = _interopRequireDefault(_context);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};



















        const { useState, useEffect, useRef, useContext, Fragment, memo } = _react2.default;
        const { App_context } = _context2.default;
        const E = {};
        const assign = Object.assign,T = _ui_lib2.default.T,ms = _date2.default.ms,CG = _util6.default.CG;
        const { Slides_switch } = _common_ui2.default;

        _util8.default.assert_ui('be_watermark_popup');

        const top_url = _util2.default.get(window, 'hola.tpopup_opt.url');
        const root_url = _util4.default.get_root_url(top_url);
        const flag_cls = c => 'flag ' + (c || '').toLowerCase();

        const get_rule = () => {
            let rules = _util8.default.get_rules(_ui_api2.default.get_rules(), top_url);
            return rules && rules[0] || null;
        };

        const perr = (id, info, new_name) => {
            info = assign({ url: top_url, root_url }, info);
            const rule = get_rule();
            if (rule && rule.enabled)
            info.proxy_country = rule.country;
            _ui_api2.default.perr(id, info, {}, new_name !== false);
        };

        const pref_perr = ({ prefix, is_mitm }, mitm_pref) => (id, info) => {
            prefix = prefix || (is_mitm ? mitm_pref || 'mitm' : 'geo');
            perr(`${prefix}_${id}`, info);
        };

        const get_all_countries = () => {
            return (0, _etask2.default)(function* () {
                const src_country = _ui_api2.default.get_country();
                const all = _ui_api2.default.get_all_countries().
                sort((a, b) => T(a).localeCompare(T(b)));
                const pop = (yield _ui_api2.default.get_popular_ratings({ root_url, src_country })).
                map(v => v.proxy_country);
                return pop.concat(all).map(c => c.toLowerCase());
            });
        };

        const use_countries = countries => {
            const all_index = (countries || []).indexOf('*');
            let all = _ui_lib2.default.use_etask(() => all_index != -1 ? get_all_countries() : [],
            ['us', 'uk'], [countries]);
            if (all_index == -1)
            return countries;
            const res = (countries || []).slice();
            all = all.filter(c => !res.includes(c));
            res.splice(all_index, 1, ...all);
            return res;
        };

        const start_trial = country => {
            return (0, _etask2.default)(function* () {
                try {
                    let trial = (yield _ui_api2.default.get_trial_active(root_url)) || (
                    yield _ui_api2.default.set_trial(root_url));
                    _util6.default.set_site_storage(root_url, 'trial', { country,
                        dont_show_ended: false });
                    return trial;
                } catch (e) {
                    let err = e.toString();
                    if (err.includes('trial_forbidden_domain'))
                    {
                        _ui_api2.default.force_bext_config_update(true);
                        perr('geo_suggestion_start_trial_err_disabled', { country });
                    } else

                    perr('geo_suggestion_start_trial_err', { country, err });
                    throw e;
                }
            });
        };

        let size_synced;
        const set_iframe_pos = opt => {
            let _opt = {
                width: `${opt.width}px`,
                height: `${opt.height}px`,
                fade: !!opt.fade,
                animate: size_synced && opt.animate,
                animation_time: opt.animation_time };

            _opt.left = _opt.right = _opt.top = _opt.bottom = 'auto';
            let pos = opt.position.split('_');
            _opt[pos[0]] = (opt['margin_' + pos[0]] || 0) + 'px';
            _opt[pos[1]] = (opt['margin_' + pos[1]] || 0) + 'px';
            size_synced = true;
            return resize_iframe(_opt);
        };

        const maximize_iframe = () => resize_iframe({ width: 'calc(100% - 15px)',
            height: '100%', top: 0, left: 0, bottom: 0, right: '15px', fade: true });

        const resize_iframe = opt => {
            document.documentElement.style.pointerEvents = 'none';
            const on_mouse = () => {
                document.removeEventListener('mousemove', on_mouse);
                document.removeEventListener('mouseenter', on_mouse);
                document.removeEventListener('mouseleave', on_mouse);
                document.documentElement.style.pointerEvents = '';
            };
            document.addEventListener('mousemove', on_mouse);
            document.addEventListener('mouseenter', on_mouse);
            document.addEventListener('mouseleave', on_mouse);
            return _ui_api2.default.resize_tpopup(opt);
        };

        const WATERMARK = 'watermark',SUGGESTION = 'suggestion';
        const SUBSCRIBE = 'subscribe',VERIFY_EMAIL = 'verify_email';
        const PROXY_ERROR = 'proxy_error';

        const Modal_header = memo(function Modal_header(props) {
            let url = top_url;
            let login_url = 'https://hola.org/login?' + _escape2.default.qs({ next: url });
            return _react2.default.createElement('div', { className: 'modal-header ' + (props.slide || '') },
            props.back_click &&
            _react2.default.createElement('button', { className: 'go-back', onClick: props.back_click },
            _react2.default.createElement('div', { className: 'icon' })),

            _react2.default.createElement('a', { className: 'logo', href: 'https://hola.org', target: '_blank',
                rel: 'noopener noreferrer' }),
            props.show_signin &&
            _react2.default.createElement('a', { className: 'sign-in', onClick: props.login_click,
                href: login_url, target: '_blank', rel: 'noopener noreferrer' },
            _react2.default.createElement(T, null, 'Log in')),
            props.title && _react2.default.createElement('h1', null, _react2.default.createElement(T, null, props.title)),
            _react2.default.createElement('button', { className: 'close', onClick: props.close_click }));

        });

        const get_plans = for_trial => {
            let plan_ids = for_trial ?
            CG('payment.trial_plan_ids', ['1m', '1y', '2y']) :
            CG('payment.plan_ids', ['free', '1m', '1y']);
            let all_plans = CG('payment.all_plans', [
            { period: '1 M', id: '1m', price: 11.95 },
            { period: '1 Y', id: '1y', price: 83.88 }]);
            return _common_ui2.default.fill_plans_info(plan_ids, all_plans);
        };

        const get_plan_url = (plan, ref) =>
        _util8.default.plus_ref(ref, { plan_id: plan.id, root_url });

        const Subscribe = memo(function Subscribe(props) {
            const { slide, is_mitm, force_flip, close_cb, set_slide } = props;
            const _perr = (id, info) => {
                pref_perr(props)(`subscribe_${id}`, info);
            };
            const close_click = () => {
                _perr('close');
                close_cb();
            };
            const login_click = () => {
                _ui_api2.default.set_login_redirect(_url2.default.get_host(top_url));
                _perr('login');
            };
            const back_click = () => {
                set_slide('stop_vpn');
            };
            const hide_popup_click = () => {
                _perr('hide_popup');
                set_slide('subscribe');
            };
            const plan_click = plan => {
                _perr('plan_click', { plan: plan.id });
                if (plan.id == 'free')
                close_cb();
            };
            const ref = useRef();
            _ui_lib2.default.on_outside_click(ref, close_cb);
            useEffect(() => void _perr('show'), []);
            const [sliding, set_sliding] = useState(false);
            return _react2.default.createElement(_reactFlipToolkit.Flipped, { flipId: 'modal_flip' },
            _react2.default.createElement('div', { ref: ref, className: 'modal modal-dialog modal-subscribe',
                style: { pointerEvents: sliding ? 'none' : 'auto' } },
            _react2.default.createElement(Modal_header, { login_click: login_click,
                slide: slide,
                show_signin: !_ui_api2.default.get_user_id(),
                back_click: slide == 'subscribe' && back_click,
                title: slide == 'subscribe' && 'Choose your plan',
                close_click: close_click }),
            _react2.default.createElement(Slides_switch, { slide: slide,
                exited_cb: () => force_flip(),
                exiting_cb: () => set_sliding(true),
                entered_cb: () => set_sliding(false) },
            _react2.default.createElement(Stop_vpn_body, { key: 'stop_vpn',
                hide_popup_click: hide_popup_click }),
            _react2.default.createElement(Choose_plan_body, { key: 'subscribe',
                is_mitm: is_mitm,
                plan_click: plan_click }))));



        });

        const Stop_vpn_body = memo(function Stop_vpn_body({ hide_popup_click }) {
            return _react2.default.createElement('div', { className: 'modal-body stop-vpn-body' },
            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'To remove the popup subscribe to PLUS')),
            _react2.default.createElement('div', { className: 'buttons-container' },
            _react2.default.createElement(Subscribe_btn, { on_click: hide_popup_click, title: 'Subscribe',
                text: 'Subscribe to get unlimited online privacy' })));


        });

        const Choose_plan_body = memo(function Choose_plan_body({ is_mitm, plan_click }) {
            let free_list = ['Unblock any site', '2 hour/day video streaming',
            '2 connected devices', 'SD video streaming'];
            let ref = (is_mitm ? 'mitm_popup_' : 'watermark_') +
            root_url.replace(/\./g, '_');
            return _react2.default.createElement('div', { className: 'modal-body choose-plan-body' },
            _react2.default.createElement('div', { className: 'buttons-container bext-plan-btns' },
            get_plans().map(plan => plan.id == 'free' ?
            _react2.default.createElement(_common_ui2.default.Free_plan, { key: 'free', on_click: plan_click,
                sub_title: 'Show popup', list: free_list }) :
            _react2.default.createElement(_common_ui2.default.Plan, { key: plan.period, plan: plan,
                on_click: plan_click,
                href: get_plan_url(plan, ref) }))));


        });

        const Watermark_debug = memo(function Watermark_debug({ position }) {
            const { trial } = useContext(App_context);
            const [value, set_value] = useState('00:15');
            const pattern = '\\d{1,2}:\\d{1,2}';
            const on_change = event => set_value(event.target.value);
            const on_click = () => {
                if (!value.match(pattern))
                return;
                let t = value.split(':');
                let time = t[0] * ms.MIN + t[1] * ms.SEC;
                (0, _etask2.default)(function* () {
                    try {yield _ui_api2.default.set_time_left(root_url, time);}
                    catch (e) {alert(e.toString());}
                });
            };
            const on_close_click = () => {
                _storage2.default.set_json('debug_watermark_trial', false);
                _ui_api2.default.storage_debug_change();
            };
            if (!trial)
            return null;
            const pos = position.split('_');
            const style = pos[1] == 'right' ? { left: '-122px' } : { right: '-120px' };
            return _react2.default.createElement('div', { className: 'watermark-debug', style: style },
            _react2.default.createElement('input', { value: value, onChange: on_change, pattern: pattern }),
            _react2.default.createElement('button', { onClick: on_click }, 'set'),
            _react2.default.createElement('button', { className: 'close', onClick: on_close_click }));

        });

        let canvas;
        const get_timer_width = time => {
            if (!time)
            return 0;
            canvas = canvas || document.createElement('canvas');
            let context = canvas.getContext('2d');
            context.font = 'bold 14px sans-serif';
            let metrics = context.measureText(_common_ui2.default.format_time(time));
            return Math.ceil(metrics.width) + 22;
        };let

        Watermark = class Watermark extends _react2.default.PureComponent {
            constructor(props) {
                super(props);this.























                on_storage_dbg_change = () => this.setState({ debug_trial:
                    _storage2.default.get_json('debug_watermark_trial') });this.
                perr = (id, info) => {
                    pref_perr(this.props)(`watermark_${id}`, info);
                };this.
















































































                click = () => {
                    this.perr('click');
                    let _this = this;
                    (0, _etask2.default)({ cancel: true }, function* () {
                        yield set_iframe_pos({ width: 274, height: 417, margin_right: 15,
                            fade: false, position: _this.state.position });
                        yield _etask2.default.sleep(50);
                        _ui_api2.default.set_tpopup_type(null);
                    });
                };this.
                set_position_cb = position => {
                    _util6.default.set_site_storage(root_url, 'watermark_pos', position);
                    this.setState({ position });
                };this.
                on_mouse_leave = e => this.setState({ hover: false });this.
                on_body_mouse_move = e => {
                    if (!this.el || this.props.flipping)
                    return;
                    let ch = document.getElementsByClassName('popup-header-close-hint')[0];
                    if (_ui_lib2.default.is_mouse_over(ch, e))
                    return void this.setState({ hover: true });
                    let r = this.el.getBoundingClientRect();
                    let x = e.clientX,y = e.clientY;
                    let right = r.right,top = r.top;
                    let left = r.left - 4,bottom = r.bottom + 2;
                    if (this.state.hover && this.state.debug_trial && this.props.trial)
                    {
                        if (this.state.position.endsWith('_right'))
                        left -= 120;else

                        right += 120;
                    }
                    let sqr = v => v * v;
                    let radius = 14,r2 = sqr(radius),hover;
                    if (x > right - radius && y > bottom - radius)
                    hover = sqr(x - right + radius) + sqr(y - bottom + radius) <= r2;else
                    if (x > right - radius && y < top + radius)
                    hover = sqr(x - right + radius) + sqr(top + radius - y) <= r2;else
                    if (x < left + radius && y > bottom - radius)
                    hover = sqr(left + radius - x) + sqr(y - bottom + radius) <= r2;else
                    if (x < left + radius && y < top + radius)
                    hover = sqr(left + radius - x) + sqr(top + radius - y) <= r2;else

                    hover = x >= left && x <= right && y >= top && y <= bottom;
                    this.setState({ hover });
                };this.state = { hover: false, debug_trial: _storage2.default.get_json('debug_watermark_trial'), position: _util6.default.get_site_storage(root_url, 'watermark_pos', CG('geo_popup.watermark.position', 'top_right')) };}componentDidMount() {this.perr('show');_ui_api2.default.on('mouseleave', this.on_mouse_leave);document.body && document.body.addEventListener('mousemove', this.on_body_mouse_move);_ui_api2.default.on('storage_debug_change', this.on_storage_dbg_change);this.sync_size();}componentWillUnmount() {_ui_api2.default.off('mouseleave', this.on_mouse_leave);document.body && document.body.removeEventListener('mousemove', this.on_body_mouse_move);_ui_api2.default.off('storage_debug_change', this.on_storage_dbg_change);if (this.sync_size_et) this.sync_size_et.return();}componentDidUpdate(prev_props, prev_state) {let trial_changed = this.props.trial != prev_props.trial;let position_changed = this.state.position != prev_state.position;let hover_changed = this.state.hover != prev_state.hover;let promo_changed = this.need_promo(this.props) != this.need_promo(prev_props);let size_changed = hover_changed || trial_changed || promo_changed;if (position_changed || size_changed || prev_props.flipping && !this.props.flipping) {this.sync_size(position_changed, size_changed);}if (position_changed) this.setState({ hover: false });}get_size(arrow_anim) {let width = this.props.is_mitm ? 82 : 95;let height = 28;if (this.need_trial_timer()) width += get_timer_width(_ui_api2.default.get_trial_left(this.props.trial));if (this.state.hover) {width = Math.max(width + 50, 166);if (!arrow_anim) {height += 80;height += this.need_promo(this.props) ? 25 : 0;}}return { width, height };}get_iframe_size(arrow_anim) {let { width, height } = this.get_size();if (!arrow_anim && this.state.debug_trial && this.props.trial) width += 115; 
                if (!arrow_anim && this.state.hover) {width += 50;height += 24;}return { width: width + 12, height: height + 24 };}sync_size(position_changed, size_changed) {let _this = this;if (this.props.flipping) return;if (this.sync_size_et) this.sync_size_et.return();(0, _etask2.default)({ cancel: true }, function* () {_this.sync_size_et = this;this.finally(() => {_this.sync_size_et = null;});let size = _this.get_size();let iframe_opt = assign({}, _this.get_iframe_size(), { margin_right: 15, animate: !size_changed && position_changed, animation_time: 300, position: _this.state.position });if (size_changed && _this.state.hover) {yield set_iframe_pos(iframe_opt);_this.setState(size);} else {_this.setState(size);if (size_changed) yield _etask2.default.sleep(300);yield set_iframe_pos(iframe_opt);}});}need_trial_timer() {return !!this.props.trial && !_util6.default.get_site_conf(root_url, 'trial.hide_timer');}need_promo(props) {return !props.is_premium && !!CG('geo_popup.watermark.promo_text');}render() {
                const { hover, width, height, position, debug_trial } = this.state;
                const { is_mitm, country, trial_timer_click_cb, can_close,
                    close_cb } = this.props;
                const show_timer = this.need_trial_timer();
                const style = { width: width + 'px', height: height + 'px' };
                return _react2.default.createElement(_reactFlipToolkit.Flipped, { flipId: 'modal_flip' },
                _react2.default.createElement('div', { className: 'modal modal-watermark ' + position,
                    style: style, ref: el => this.el = el },
                _react2.default.createElement(_reactFlipToolkit.Flipped, { inverseFlipId: 'modal_flip', scale: true },
                _react2.default.createElement('div', { className: 'modal-header' + (hover ? ' hover' : '') },
                _react2.default.createElement('div', { className: 'logo-wrap', onClick: this.click },
                _react2.default.createElement('div', { className: 'logo' })),

                _react2.default.createElement(Flag, { is_mitm: is_mitm, country: country,
                    on_click: this.click }),
                show_timer && _react2.default.createElement(Trial_timer, { on_click: trial_timer_click_cb }),
                hover && _react2.default.createElement(Arrows, { position: position,
                    iframe_size: this.get_iframe_size(true),
                    watermark_size: this.get_size(true),
                    perr_cb: this.perr,
                    position_cb: this.set_position_cb }),
                _react2.default.createElement(Close_btn, { hover: hover,
                    position: position,
                    can_close: can_close,
                    perr_cb: this.perr,
                    close_cb: close_cb }),
                debug_trial && _react2.default.createElement(Watermark_debug, { position: position }))),


                _react2.default.createElement(Watermark_body, { hover: hover, perr_cb: this.perr })));


            }};


        const Flag = memo(function Flag({ is_mitm, on_click, country }) {
            return _react2.default.createElement('div', { className: 'flag-wrap', onClick: on_click },
            is_mitm && _react2.default.createElement('div', { className: 'unblocking-img' }),
            !is_mitm && _react2.default.createElement('div', { className: 'selected-country f32' },
            _react2.default.createElement('span', { className: flag_cls(country) })));


        });

        const Close_btn = memo(function Close_btn({ hover, perr_cb, close_cb, can_close,
            position })
        {
            const [show_hint, set_show_hint] = useState(false);
            useEffect(() => {
                if (!hover && show_hint)
                set_show_hint(false);
            }, [hover]);
            const btn_ref = useRef();
            const close_click = () => {
                if (can_close)
                return void set_show_hint(true);
                perr_cb('close');
                close_cb();
            };
            const hint_click = url => {
                perr_cb('close');
                close_cb({ root_url: url });
            };
            const pos = position.split('_');
            return _react2.default.createElement(Fragment, null,
            _react2.default.createElement('button', { className: 'close', onClick: close_click, ref: btn_ref }),
            hover && show_hint && _react2.default.createElement(_ui_lib2.default.Close_hint, { root_url: root_url,
                show_on_init: true,
                offset: pos[1] == 'left' ? 40 : 0,
                close_btn: btn_ref.current,
                period: _util6.default.get_dont_show_def_period(),
                on_click: hint_click,
                on_hide: () => set_show_hint(false) }));

        });

        const Arrows = memo(function Arrows({ position, position_cb, iframe_size,
            watermark_size, perr_cb })
        {
            const [hover, set_hover] = useState(null);
            useEffect(() => {
                if (!hover)
                return void _ui_api2.default.hide_arrow_anim(_ui_api2.default.get_connection_id());
                const { width, height } = iframe_size;
                let direction,css = {};
                if (hover == 'up-down')
                {
                    css.height = `calc(100% - ${height}px)`;
                    css.width = `${width}px`;
                    css[pos[0]] = `${height}px`;
                    css[pos[1]] = pos[1] == 'right' ? '15px' : '0';
                    direction = pos[0] == 'top' ? 'down' : 'up';
                } else

                {
                    css.width = `calc(100% - ${width}px)`;
                    css.height = `${height}px`;
                    css[pos[1]] = `${width}px`;
                    css[pos[0]] = '0';
                    direction = pos[1] == 'right' ? 'left' : 'right';
                }
                _ui_api2.default.show_arrow_anim(_ui_api2.default.get_connection_id(), { css,
                    direction, size: watermark_size });
                return () => _ui_api2.default.hide_arrow_anim(_ui_api2.default.get_connection_id());
            }, [hover]);
            const pos = position.split('_');
            const listeners = {
                onClick: ({ currentTarget: el }) => {
                    let new_pos;
                    if (el.classList.contains('arrow-left'))
                    new_pos = `${pos[0]}_left`;else
                    if (el.classList.contains('arrow-right'))
                    new_pos = `${pos[0]}_right`;else
                    if (el.classList.contains('arrow-down'))
                    new_pos = `bottom_${pos[1]}`;else

                    new_pos = `top_${pos[1]}`;
                    position_cb(new_pos);
                    set_hover(null);
                    perr_cb('arrow', { new_pos });
                },
                onMouseEnter: ({ currentTarget: el }) => {
                    if (el.classList.contains('left-right'))
                    set_hover('left-right');else
                    if (el.classList.contains('up-down'))
                    set_hover('up-down');
                },
                onMouseLeave: e => set_hover(null) };

            const y_direction = pos[0] == 'top' ? 'down' : 'up';
            const x_direction = pos[1] == 'right' ? 'left' : 'right';
            const up_down = `arrow-btn up-down arrow-${y_direction} ` + (
            hover == 'up-down' ? ' hover' : '');
            const left_right = `arrow-btn left-right arrow-${x_direction} ` + (
            hover == 'left-right' ? ' hover' : '');
            return _react2.default.createElement('div', { className: 'arrow-buttons' },
            _react2.default.createElement('button', _extends({ className: left_right }, listeners),
            _react2.default.createElement('div', { className: 'arrow-anim' }, _react2.default.createElement('div', { className: 'arrow-icon' }))),

            _react2.default.createElement('button', _extends({ className: up_down }, listeners),
            _react2.default.createElement('div', { className: 'arrow-anim' }, _react2.default.createElement('div', { className: 'arrow-icon' }))));


        });

        const Trial_timer = memo(function Trial_timer({ on_click }) {
            const { trial } = useContext(App_context);
            const trial_left = _ui_lib2.default.use_trial_left(trial);
            return _react2.default.createElement('div', { className: 'trial-timer', onClick: on_click },
            _common_ui2.default.format_time(trial_left));

        });

        const Dots = memo(function Dots({ count }) {
            return _react2.default.createElement('div', { className: 'loading-dots' },
            new Array(count || 3).fill(0).map((v, i) => _react2.default.createElement('span', { key: i }, '.')));

        });


        const Promo_link = memo(function Promo_link() {
            const { is_premium } = useContext(App_context);
            const promo_text = CG('geo_popup.watermark.promo_text');
            const promo_link = CG('geo_popup.watermark.promo_link',
            'https://hola.org/plus?ref=watermark_promo');
            return !is_premium && promo_text ? _react2.default.createElement('a', { className: 'promo-link',
                href: _escape2.default.uri(promo_link, { root_url, uuid: _ui_api2.default.get_uuid() }),
                target: '_blank', rel: 'noopener noreferrer' }, promo_text) : null;
        });

        const Watermark_body = memo(function Watermark_body({ hover, perr_cb }) {
            const { rule } = useContext(App_context);
            const [view, set_view] = useState('buttons');
            const [rating, set_rating] = useState();
            useEffect(() => {
                if (view == 'buttons' || view == 'fixing')
                return;
                const reset = () => {
                    set_view('buttons');
                    perr_cb('reset_back_to_normal');
                };
                const t = _util8.default.set_timeout(reset, view == 'rated' ? 3 * ms.SEC :
                10 * ms.SEC);
                return () => _util8.default.clear_timeout(t);
            }, [view]);
            const yes_click = () => (0, _etask2.default)(function* () {
                set_rating(null);
                yield _ui_api2.default.click_working({ src: 'watermark' });
                set_view(_ui_api2.default.need_rating() ? 'rate_us' : 'rated');
            });
            const on_rated = r => {
                set_rating(r);
                set_view('rated');
            };
            const no_click = event => {
                set_view('fixing');
                if (!rule)
                return;
                let tab_id = _ui_api2.default.get_tab_id();
                _ui_api2.default.fix_vpn({ rule, root_url, url: top_url, tab_id });
                _ui_api2.default.trigger_not_working({ tab_id, src: 'watermark' });
                _ui_api2.default.send_fix_it_report({ rule, send_logs: true, src: 'watermark' });
            };
            if (!hover)
            return null;
            let inner = null;
            switch (view) {

                case 'buttons':
                    inner = _react2.default.createElement(Vpn_work_buttons, { yes_click, no_click });
                    break;
                case 'rate_us':
                    inner = _react2.default.createElement(_ui_lib2.default.Rate_us, { on_rated: on_rated });
                    break;
                case 'rated':
                    inner = _react2.default.createElement('div', { className: 'popup-rated-view' }, !rating || rating == 5 ?
                    _react2.default.createElement(T, null, 'Awesome!') : _react2.default.createElement(T, null, 'Thanks for your feedback'));
                    break;
                case 'fixing':
                    inner = _react2.default.createElement('div', { className: 'fixing-view' },
                    _react2.default.createElement('span', { className: 'common-ui-busy' }),
                    _react2.default.createElement('span', null, _react2.default.createElement(T, null, 'Fixing', _react2.default.createElement('br', null), 'connection', _react2.default.createElement(Dots, null))));

                    break;}

            return _react2.default.createElement(_reactFlipToolkit.Flipped, { inverseFlipId: 'modal_flip', scale: true },
            _react2.default.createElement('div', { className: 'modal-body' },
            inner,
            _react2.default.createElement(Promo_link, null)));


        });

        const Vpn_work_buttons = memo(function Vpn_work_buttons({ yes_click, no_click }) {
            return _react2.default.createElement('div', { className: 'vpn-work-buttons' },
            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'Is it working?')),
            _react2.default.createElement('div', { className: 'buttons' },
            _react2.default.createElement('button', { className: 'btn-yes', onClick: yes_click }, _react2.default.createElement(T, null, 'Yes')),
            _react2.default.createElement('button', { className: 'btn-no', onClick: no_click }, _react2.default.createElement(T, null, 'No'))));


        });

        const Stop_btn = memo(function Stop_btn({ country, is_mitm, title, on_click }) {
            return _react2.default.createElement('div', { className: 'action-button stop-btn', onClick: on_click },
            _react2.default.createElement('div', { className: 'action-button-inner' },
            _react2.default.createElement('div', { className: 'vpn-switch' },
            _react2.default.createElement('div', { className: 'power-switch' }),
            _react2.default.createElement('div', { className: 'fsvg_4x3' },
            _react2.default.createElement('div', { className: flag_cls(is_mitm ? 'flag_mitm' : country || 'us') }),
            _react2.default.createElement('div', { className: 'strike-line' }))),


            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, title))));


        });

        const Mitm_btn = memo(function Mitm_btn({ enable, on_click }) {
            return _react2.default.createElement('div', { className: 'action-button mitm-unblock', onClick: on_click },
            _react2.default.createElement('div', { className: enable ? 'unlock-anim' : 'lock-anim' },
            _react2.default.createElement('div', { className: 'power-switch' }),
            _react2.default.createElement('div', { className: 'img-wrapper' },
            _react2.default.createElement('div', { className: 'lock-img' }),
            _react2.default.createElement('div', { className: 'unlock-img' }),
            _react2.default.createElement('div', { className: 'strike-line' }))),


            _react2.default.createElement('div', { className: 'title' },
            enable ?
            _react2.default.createElement(T, null, 'Unblock ', _react2.default.createElement('span', { className: 'site-name' }, root_url)) :
            _react2.default.createElement(T, null, 'Continue without VPN')));


        });

        const Geo_btn = memo(function Geo_btn({ country, enable, title, on_click }) {
            return _react2.default.createElement('div', { className: 'action-button geo-unblock',
                onClick: () => on_click(country) },
            _react2.default.createElement('div', { className: 'action-button-inner' },
            _react2.default.createElement('div', { className: 'fsvg_4x3 flag-img' },
            _react2.default.createElement('div', { className: flag_cls(country) })),

            _react2.default.createElement('div', { className: 'title' },
            _react2.default.createElement(T, null, title || (enable ? country.toUpperCase() : 'No VPN')))));



        });

        const Continue_trial_btn = memo(function Continue_trial_btn({ on_click }) {
            const { trial } = useContext(App_context);
            const [trial_changed, set_trial_changed] = useState(0);
            useEffect(() => {
                const inc_trial_changed = () => set_trial_changed(trial_changed + 1);
                _ui_api2.default.on('trial_change', inc_trial_changed);
                return () => _ui_api2.default.off('trial_change', inc_trial_changed);
            }, []);
            const next_trial_ts = _ui_lib2.default.use_etask(
            () => _ui_api2.default.get_next_trial_ts(root_url), 0, [trial, trial_changed]);
            const trial_left = _ui_lib2.default.use_trial_left(trial);
            const wait_left = _ui_lib2.default.use_countdown(next_trial_ts);
            const [img_state, set_img_state] = useState('loading');
            const [need_wait, set_need_wait] = useState(false);
            const wait = !trial && !!wait_left;
            const _on_click = () => {
                if (wait)
                {
                    set_need_wait(true);
                    _util8.default.set_timeout(() => set_need_wait(false), 300);
                    return;
                }
                if (on_click)
                on_click();
            };
            const cls = (0, _classnames2.default)('action-button2 continue-trial', { 'need-wait': need_wait });
            const icon_cls = (0, _classnames2.default)('site-icon', 'icon-' + root_url.replace(/\./g, '-'),
            { 'icon-error': img_state == 'error' });
            const time = trial_left || wait_left || _util6.default.get_site_conf(root_url,
            'trial.period', 15 * ms.MIN);
            const time_arr = _common_ui2.default.format_time(time).split(' ').map(item => {
                const m = item.match(/(\d*)(\D*)/);
                return { digit: m && m[1], letter: m && m[2] };
            });
            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow = _date2.default.align(tomorrow, 'DAY');
            const next_trial_tomorrow = !trial && next_trial_ts > tomorrow.getTime();
            return _react2.default.createElement('div', { className: cls, onClick: _on_click },
            _react2.default.createElement('div', { className: 'action-button-inner' },
            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'Continue')),
            next_trial_tomorrow && _react2.default.createElement('div', { className: 'sub-title' },
            _react2.default.createElement(T, null, 'for free tomorrow')),

            _react2.default.createElement('div', { className: icon_cls },
            _react2.default.createElement('img', { style: { display: img_state != 'ready' && 'none' },
                onLoad: () => set_img_state('ready'),
                onError: () => set_img_state('error'),
                src: _util2.default.get(window, 'hola.tpopup_opt.icon') })),

            _react2.default.createElement('div', { className: 'trial-time-container' },
            wait && _react2.default.createElement('div', { className: 'trial-time-text' }, _react2.default.createElement(T, null, 'Starting in...')),

            _react2.default.createElement('div', { className: 'trial-time' },
            time_arr.map(item => _react2.default.createElement('span', { key: item.letter },
            _react2.default.createElement('span', { className: 'digit' }, item.digit),
            _react2.default.createElement('span', { className: 'letter' }, item.letter)))),


            !wait && _react2.default.createElement('div', { className: 'trial-time-text' }, _react2.default.createElement(T, null, 'remaining')))));



        });

        const Subscribe_btn = memo(function Subscribe_btn({ on_click, title, text }) {
            return _react2.default.createElement('div', { className: 'action-button2 subscribe-btn', onClick: on_click },
            _react2.default.createElement('div', { className: 'action-button-inner' },
            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, title)),
            _react2.default.createElement('div', { className: 'sub-title' }, _react2.default.createElement(T, null, 'to Hola VPN Plus')),
            _react2.default.createElement('div', { className: 'hola-logo' }),
            _react2.default.createElement('div', { className: 'unlimited-text' }, _react2.default.createElement(T, null, text))));


        });

        const Dropdown_list = memo(function Dropdown_list({ countries, parent, on_click,
            on_hide })
        {
            const container = parent && parent.offsetParent;
            const ref = useRef();
            _ui_lib2.default.on_outside_click(ref, on_hide);
            if (!container)
            return null;
            let style = {
                top: parent.offsetTop + 'px',
                left: parent.offsetLeft + 'px',
                width: parent.offsetWidth + 'px',
                height: parent.offsetHeight + 'px' };

            return _reactDom2.default.createPortal(
            _react2.default.createElement('div', { ref: ref, className: 'modal-backdrop', onClick: on_hide },
            _react2.default.createElement('div', { className: 'countries-dropdown', style: style },
            _react2.default.createElement('ul', null,
            countries.map((c, index) =>
            _react2.default.createElement('li', { key: c + index, onClick: () => on_click(c) },
            _react2.default.createElement('span', { className: 'f32' }, _react2.default.createElement('span', { className: flag_cls(c) })),
            _react2.default.createElement(T, null, c.toUpperCase())))))),




            container);
        });

        const More_btn = memo(function More_btn({ countries, on_click }) {
            const ref = useRef();
            const [show_dropdown, toggle_dropdown] = useState(false);
            let unique_number = new Set(countries).size;
            let list_text = countries.length < 6 ?
            countries.slice(1).map(c => T(c.toUpperCase())).join(', ') :
            unique_number > 190 ?
            _react2.default.createElement(T, null, 'Choose from over ', _react2.default.createElement('span', null, '190'), ' countries') :
            _react2.default.createElement(T, null, 'Choose from ', _react2.default.createElement('span', null, unique_number), ' countries');
            return _react2.default.createElement('div', { className: 'action-button geo-unblock more-btn', ref: ref,
                onClick: () => !show_dropdown && toggle_dropdown(true) },
            show_dropdown ? _react2.default.createElement(Dropdown_list, { countries: countries, on_click: on_click,
                on_hide: () => toggle_dropdown(false), parent: ref.current }) :
            _react2.default.createElement('div', { className: 'action-button-inner' },
            _react2.default.createElement('div', { className: 'fsvg_4x3' },
            _react2.default.createElement('div', { className: 'flag flag_other' })),

            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'More')),
            _react2.default.createElement('div', { className: 'more-countries' },
            list_text)));



        });

        const Suggestion_body = memo(function Suggestion_body(props) {
            useEffect(() => void pref_perr(props, 'mitm_popup')('suggestion_show'), []);
            const { is_mitm, no_click, yes_click } = props;
            const countries = use_countries(props.countries || []);
            let site = root_url;
            let buttons;
            if (is_mitm)
            {
                buttons = [_react2.default.createElement(Mitm_btn, { enable: false, on_click: no_click, key: 'no' }),
                _react2.default.createElement(Mitm_btn, { enable: true, on_click: yes_click, key: 'yes' })];
            } else

            {
                buttons = [_react2.default.createElement(Geo_btn, { key: 'no', enable: false,
                    country: _ui_api2.default.get_country(), on_click: no_click })];
                if (countries.length < 3)
                {
                    buttons = buttons.concat(countries.map(c => _react2.default.createElement(Geo_btn, { key: 'yes_' + c,
                        enable: true, country: c, on_click: yes_click })));
                } else

                {
                    buttons.push(_react2.default.createElement(Geo_btn, { key: 'yes_' + countries[0], enable: true,
                        country: countries[0], on_click: yes_click }));
                    buttons.push(_react2.default.createElement(More_btn, { key: 'more', countries: countries,
                        on_click: yes_click }));
                }
            }
            return _react2.default.createElement('div', { className: 'modal-body suggestion-body' },
            is_mitm ?
            _react2.default.createElement('div', { className: 'title' },
            _react2.default.createElement('div', { className: 'stop-icon' }),
            _react2.default.createElement(T, null, _react2.default.createElement('span', { className: 'site-name' }, site), ' is blocked in your country or office')) :


            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'Select ',
            _react2.default.createElement('span', { className: 'site-name' }, site), ' edition:')),

            _react2.default.createElement('div', { className: 'buttons-container' }, buttons));

        });

        let geo_login_success_sent;
        const Login_body = memo(function Login_body({ country, login_cb }) {
            const { user } = useContext(App_context);
            useEffect(() => {
                perr('geo_login_show');
                _ui_api2.default.set_email_verify_url(top_url);
                _ui_api2.default.set_login_redirect(_url2.default.get_host(top_url));
            }, []);
            useEffect(() => {
                if (!user)
                return;
                if (!geo_login_success_sent)
                perr('geo_login_success');
                geo_login_success_sent = true;
                login_cb();
            }, [user]);
            let url = _escape2.default.uri('https://hola.org/bext_login',
            { uuid: _ui_api2.default.get_uuid(), root_url });
            return _react2.default.createElement('div', { className: 'modal-body login-body' },
            _react2.default.createElement('div', { className: 'title' },
            _react2.default.createElement(T, null, 'Sign in to unblock ', _react2.default.createElement('span', { className: 'site-name' }, root_url)),
            _react2.default.createElement('span', { className: 'f32' }, _react2.default.createElement('span', { className: flag_cls(country) }))),

            _react2.default.createElement('div', { className: 'iframe-container' },
            _react2.default.createElement('iframe', { src: url })));


        });

        const trial_aj_event = (trial, id) => _ui_api2.default.aj_event((trial ?
        'be_aj_trial_time_remaining_popup_' : 'be_aj_trial_time_ended_popup_') + id);

        const Trial_choose_plan_body = memo(function Trial_choose_plan_body() {
            const { trial } = useContext(App_context);
            useEffect(() => void perr('geo_trial_choose_plan_show'), []);
            const on_click = plan => {
                trial_aj_event(trial, 'select_plan_' + plan.id);
                _ui_api2.default.ga_send('checkout', { step: 5, lab: 'ext_trial' });
                perr(trial ? 'geo_trial_subscribe_plan_click' :
                'geo_trial_ended_plan_click', { plan: plan.id });
            };
            let ref = 'trial_' + (trial ? 'remaining_' : 'ended_') +
            root_url.replace(/\./g, '_');
            let plans = get_plans(true).filter(p => p.id != 'free');
            return _react2.default.createElement('div', { className: 'modal-body trial-choose-plan-body' },
            _react2.default.createElement('div', { className: 'buttons-container bext-plan-btns' },
            plans.map(plan => _react2.default.createElement(_common_ui2.default.Plan, { key: plan.period,
                plan: plan,
                on_click: on_click,
                href: get_plan_url(plan, ref) }))));


        });

        const Trial_subscribe_body = memo(function Trial_subscribe_body(props) {
            const { trial } = useContext(App_context);
            useEffect(() => {
                if (!props.country)
                {
                    perr('trial_subscribe_no_country');
                    _ui_api2.default.close_tpopup();
                }
            }, [props.country]);
            useEffect(() => {
                trial_aj_event(trial, 'show');
                (0, _etask2.default)(function* () {
                    let grace_period = yield _ui_api2.default.is_trial_grace_period(root_url);
                    _perr('show', { grace_period, tab_active: _ui_api2.default.is_tab_active(),
                        trial_left: _ui_api2.default.get_trial_left(trial) });
                });
            }, []);
            const _perr = (id, info) => {
                let prefix = trial ? 'geo_trial_subscribe_' : 'geo_trial_ended_';
                perr(prefix + id, info);
            };
            const on_continue = () => {
                (0, _etask2.default)(function* () {
                    trial_aj_event(trial, 'click_continue');
                    let next_trial_ts = yield _ui_api2.default.get_next_trial_ts(root_url);
                    let wait_left = next_trial_ts - Date.now();
                    _perr('plan_click_free', { trial_left: _ui_api2.default.get_trial_left(trial),
                        wait_left });
                    if (trial)
                    return void props.close_cb();
                    if (wait_left > 0)
                    return;
                    if (_util6.default.get_site_conf(root_url, 'trial.wait2'))
                    props.trial_wait_cb();else

                    props.unblock_cb(props.country);
                });
            };
            const on_subscribe = () => {
                trial_aj_event(trial, 'click_upgrade');
                props.subscribe_cb();
            };
            return _react2.default.createElement('div', { className: 'modal-body trial-subscribe-body' },
            _react2.default.createElement('div', { className: 'title' },
            _react2.default.createElement('span', { className: 'f32' },
            _react2.default.createElement('span', { className: flag_cls(props.country) })),

            _react2.default.createElement(T, null, 'Watch ', _react2.default.createElement('span', { className: 'site-name' }, root_url), ' ', _react2.default.createElement('span', null,
            (props.country || '').toUpperCase()), ' edition')),

            _react2.default.createElement('div', { className: 'buttons-container' },
            _react2.default.createElement(Continue_trial_btn, { on_click: on_continue }),
            _react2.default.createElement('div', { className: 'buttons-or' }, _react2.default.createElement(T, null, 'or')),
            _react2.default.createElement(Subscribe_btn, { on_click: on_subscribe, title: 'Upgrade',
                text: 'Unlimited secure use' })));


        });

        const Trial_wait_body = memo(function Trial_wait_body(props) {
            const [wait_start_ts] = useState(Date.now());
            const wait2 = _util6.default.get_site_conf(root_url, 'trial.wait2');
            const wait_left = _ui_lib2.default.use_countdown(wait_start_ts + wait2);
            useEffect(() => void perr('geo_trial_wait_show'), []);
            useEffect(() => {
                if (wait_left)
                return;
                perr('geo_trial_wait_timer_finished');
                props.unblock_cb(props.country);
            }, [wait_left]);
            const never_wait_click = () => perr('geo_trial_wait_click_never_wait');
            const upgrade_click = () => perr('geo_trial_wait_click_upgrade');
            const now_only_click = () => perr('geo_trial_wait_click_now_only');
            const r = 44;
            const c = 2 * Math.PI * r;
            const fg_s = {
                strokeDasharray: c,
                strokeDashoffset: Math.floor(wait_left / 1000) / Math.round(wait2 / 1000) * c };

            const min_price = _underscore2.default.min(get_plans(true).map(p => p.month_price)) || 2.99;
            const ref = 'trial_timer_' + root_url.replace(/\./g, '_');
            const href = _escape2.default.uri('https://hola.org/plus?ref=' + ref,
            { root_url, uuid: _ui_api2.default.get_uuid() });
            return _react2.default.createElement('div', { className: 'modal-body trial-wait-body' },
            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'Please wait')),
            _react2.default.createElement('div', { className: 'trial-wait-countdown' },
            _react2.default.createElement('svg', { className: 'wait-circle', viewBox: '0 0 100 100' },
            _react2.default.createElement('circle', { cx: '50', cy: '50', r: r, className: 'wait-circle-bg' }),
            _react2.default.createElement('circle', { cx: '50', cy: '50', r: r, className: 'wait-circle-fg',
                style: fg_s })),

            _react2.default.createElement('span', null, Math.ceil(wait_left / 1000), _react2.default.createElement('span', null, 's'))),

            _react2.default.createElement('a', { className: 'never-wait', target: '_blank', rel: 'noopener noreferrer',
                href: href, onClick: never_wait_click },
            _react2.default.createElement(T, null, 'Never wait again?')),

            _react2.default.createElement('a', { className: 'upgrade-button', target: '_blank', rel: 'noopener noreferrer',
                href: href, onClick: upgrade_click },
            _react2.default.createElement(T, null, 'Upgrade to PLUS now')),

            _react2.default.createElement('a', { className: 'button-sub-title', target: '_blank', rel: 'noopener noreferrer',
                href: href, onClick: now_only_click },
            _react2.default.createElement(T, null, 'Now only for $', _react2.default.createElement('span', null, min_price.toFixed(2)), '/Month')));


        });

        const Geo_suggestion = memo(function Geo_suggestion(props) {
            const { trial } = useContext(App_context);
            const _perr = (id, info) => pref_perr(props)(id, info);
            const close_click = () => {
                if (['trial_subscribe', 'trial_choose_plan',
                'stop_vpn_confirmation'].includes(props.slide))
                {
                    trial_aj_event(trial, 'click_x');
                }
                _perr('suggestion_close');
                props.close_cb();
            };
            const back_click = (props.slide == 'trial_choose_plan' ||
            props.slide == 'trial_wait') && props.back_cb;
            const no_click = () => {
                _perr('suggestion_no');
                props.close_cb();
            };
            const yes_click = country => {
                _perr('suggestion_yes', { country });
                props.unblock_cb(country);
            };
            const try_again = () => {
                let country = props.country;
                _perr('suggestion_try_again', { country });
                props.unblock_cb(country);
            };
            return _react2.default.createElement(_reactFlipToolkit.Flipped, { flipId: 'modal_flip' },
            _react2.default.createElement('div', { className: 'modal modal-dialog modal-suggestion' },
            _react2.default.createElement(Modal_header, { close_click: close_click,
                back_click: back_click,
                title: props.slide == 'trial_choose_plan' && 'Choose your plan',
                show_signin: false,
                slide: props.slide }),
            _react2.default.createElement(_ui_lib2.default.Progress_bar, { visible: props.busy }),
            props.trial_error &&
            _react2.default.createElement('div', { className: 'error-message' },
            _react2.default.createElement(T, null, 'We\'ve encountered an error. Please ', _react2.default.createElement('a', { onClick: try_again },
            _react2.default.createElement(T, null, 'try again')))),

            _react2.default.createElement(Slides_switch, { slide: props.slide, exited_cb: () => props.force_flip() },
            _react2.default.createElement(Suggestion_body, { key: 'suggestion',
                countries: props.countries,
                yes_click: yes_click,
                no_click: no_click,
                prefix: props.prefix }),
            _react2.default.createElement(Trial_subscribe_body, { key: 'trial_subscribe',
                country: props.country,
                subscribe_cb: props.subscribe_cb,
                close_cb: props.close_cb,
                trial_wait_cb: props.trial_wait_cb,
                unblock_cb: props.unblock_cb }),
            _react2.default.createElement(Trial_wait_body, { key: 'trial_wait',
                country: props.country,
                unblock_cb: props.unblock_cb }),
            _react2.default.createElement(Trial_choose_plan_body, { key: 'trial_choose_plan' }),
            _react2.default.createElement(Login_body, { key: 'login', country: props.country,
                login_cb: () => props.unblock_cb(props.country) }),
            _react2.default.createElement(Stop_vpn_confirmation, { key: 'stop_vpn_confirmation',
                country: props.country,
                is_mitm: false,
                close_vpn: close_click }))));



        });

        const Mitm_suggestion = memo(function Mitm_suggestion({ close_cb }) {
            const ignore = () => {
                _ui_api2.default.mitm_set_ignore(top_url, _ui_api2.default.get_tab_id());
                _ui_api2.default.close_tpopup();
            };
            const close_click = () => {
                perr('mitm_popup_suggestion_close');
                ignore();
            };
            const no_click = () => {
                perr('mitm_popup_suggestion_no');
                ignore();
            };
            const yes_click = () => {
                perr('mitm_popup_suggestion_yes');
                _ui_api2.default.mitm_set_unblock(top_url);
                close_cb();
            };
            return _react2.default.createElement(_reactFlipToolkit.Flipped, { flipId: 'modal_flip' },
            _react2.default.createElement('div', { className: 'modal modal-dialog modal-mitm-suggestion' },
            _react2.default.createElement(Modal_header, { close_click: close_click }),
            _react2.default.createElement(Suggestion_body, { is_mitm: true, yes_click: yes_click,
                no_click: no_click })));


        });

        const Stop_vpn_confirmation = memo(function Stop_vpn_confirmation(props) {
            const stop_vpn = () => {
                pref_perr(props)(`watermark_stop_vpn`);
                _util6.default.set_site_storage(root_url, 'trial.dont_show_ended', true);
                _ui_api2.default.stop_vpn(top_url, _ui_api2.default.get_tab_id());
            };
            let { country, close_vpn } = props;
            return _react2.default.createElement('div', { className: 'modal-body stop-vpn-confirmation' },
            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'Do you want to stop trial?')),
            _react2.default.createElement('div', { className: 'buttons-container' },
            _react2.default.createElement(Stop_btn, { on_click: stop_vpn, title: 'Stop trial', country: country }),
            _react2.default.createElement(Geo_btn, { on_click: close_vpn, title: 'Back to trial', country: country })));


        });

        const Verify_email = memo(function Verify_email(props) {
            let { user } = useContext(App_context);
            const [resent, set_resent] = useState(0);
            useEffect(() => void perr('geo_verify_email_show'), []);
            const resend_click = () => {
                set_resent(resent + 1);
                _ui_api2.default.resend_verification_email();
                perr('geo_verify_email_resend');
            };
            let email = _util2.default.get(user, 'emails.0.value');
            let slide = 'verify_email';
            return _react2.default.createElement('div', { className: 'modal modal-dialog modal-verify-email' },
            _react2.default.createElement(Modal_header, null),
            _react2.default.createElement(Slides_switch, { slide: slide, refresh: resent },
            _react2.default.createElement('div', { key: slide, className: 'modal-body verify-email-body' },
            _react2.default.createElement('div', { className: 'title' },
            _react2.default.createElement(T, null, 'Verify your email address')),

            _react2.default.createElement('p', null, _react2.default.createElement(T, null, 'Verification email was sent to ', _react2.default.createElement('b', null, email))),
            _react2.default.createElement('p', null, _react2.default.createElement(T, null, 'Check your mailbox and follow the instructions to complete the registration process.')),

            _react2.default.createElement('div', { className: 'resend-btn', onClick: resend_click },
            _react2.default.createElement(T, null, 'Resend email', resent ? ' again' : '')),

            _react2.default.createElement('p', null, _react2.default.createElement(T, null, 'Problems? Contact us at ', _react2.default.createElement('a', { href: 'mailto:help@hola.org',
                target: '_parent' }, 'help@hola.org'))))));



        });

        const Proxy_error = memo(function Proxy_error() {
            const { proxy_error, rule } = useContext(App_context);
            const [report, toggle_report] = useState(false);
            const [close_confirm, toggle_close_confirm] = useState(false);
            useEffect(() => void perr('proxy_error_show', { proxy_error, rule }), []);
            const close_click = () => {
                perr('proxy_error_close', { proxy_error, rule });
                _ui_api2.default.close_tpopup();
            };
            const stop_vpn_click = () => {
                perr('proxy_error_stop_vpn', { proxy_error, rule });
                _ui_api2.default.stop_vpn(top_url, _ui_api2.default.get_tab_id());
                _ui_api2.default.close_tpopup();
            };
            const try_again_click = () => {
                perr('proxy_error_try_again', { proxy_error, rule });
                let tab_id = _ui_api2.default.get_tab_id();
                _ui_api2.default.fix_vpn({ rule, root_url, url: top_url, tab_id });
                _ui_api2.default.trigger_not_working({ tab_id, src: 'watermark' });
                _ui_api2.default.send_fix_it_report({ rule, send_logs: true, src: 'watermark' });
            };
            const google_click = () => {
                perr('proxy_error_google', { proxy_error, rule });
                _ui_api2.default.open_page('https://google.com/search?q=' + root_url);
            };
            const contact_click = () => {
                perr('proxy_error_support', { proxy_error, rule });
                toggle_report(true);
            };
            const dns_err = _util2.default.get(proxy_error, 'err') == 'ERR_DNS_FAILED';
            const country = rule && rule.country;
            return _react2.default.createElement('div', { className: 'modal modal-dialog modal-proxy-error' },
            _react2.default.createElement(Modal_header, { close_click: () => toggle_close_confirm(true) }),
            _react2.default.createElement('div', { className: 'modal-body proxy-error-body' },
            _react2.default.createElement('div', { className: 'title' },
            _react2.default.createElement('div', { className: 'error-icon' }),
            dns_err ? _react2.default.createElement(Fragment, null,
            _react2.default.createElement(T, null, 'Sorry, ', _react2.default.createElement('span', { className: 'site-name' }, root_url), ' is down.'),
            _react2.default.createElement('br', null),
            _react2.default.createElement(T, null, 'DNS resolution failed. Verify you spelled the site correctly.')) :

            _react2.default.createElement(T, null, 'Sorry, there was an error. We are checking it out...')),


            _react2.default.createElement('ul', { className: 'proxy-error-actions' },
            _react2.default.createElement('li', { onClick: try_again_click },
            _react2.default.createElement('span', { className: 'action-icon f32' },
            _react2.default.createElement('span', { className: flag_cls(country) })),

            _react2.default.createElement(T, null, 'Try again')),

            _react2.default.createElement('li', { onClick: stop_vpn_click },
            _react2.default.createElement('span', { className: 'action-icon stop-vpn' }),
            _react2.default.createElement(T, null, 'Stop VPN')),

            dns_err && _react2.default.createElement('li', { onClick: google_click },
            _react2.default.createElement('span', { className: 'action-icon search-google' }),
            _react2.default.createElement(T, null, 'Search Google for ', _react2.default.createElement('span', null, root_url))),

            _react2.default.createElement('li', { onClick: contact_click },
            _react2.default.createElement('span', { className: 'action-icon contact-support' }),
            _react2.default.createElement(T, null, 'Contact Hola Support')))),



            (report || close_confirm) && _react2.default.createElement('div', { className: 'modal-backdrop' }),
            report && _react2.default.createElement(_page_lib.Report_problem_modal, { url: top_url,
                close_cb: () => toggle_report(false) }),
            close_confirm && _react2.default.createElement(_page_lib.Modal, { title: T('Stop VPN'),
                className: 'stop-vpn-message',
                on_close: () => toggle_close_confirm(false),
                action: [
                _react2.default.createElement('a', { key: 'yes', onClick: stop_vpn_click }, _react2.default.createElement(T, null, 'Yes')),
                _react2.default.createElement('a', { key: 'no', className: 'btn-secondary', onClick: close_click },
                _react2.default.createElement(T, null, 'No'))] },

            _react2.default.createElement(T, null, 'Do you want to stop VPN for ', _react2.default.createElement('span', { className: 'site-name' },
            root_url), '?')));


        });let

        Popup_base = class Popup_base extends _react2.default.Component {

            constructor(props, context) {
                super(props, context);this.















                force_flip = () => this.setState(state => ({ flip_key: state.flip_key + 1 }));this.
                set_slide = slide => this.setState({ slide });this.state = { mode: props.initial_mode, slide: '', flip_key: 1, flipping: false };}componentDidMount() {document.body && document.body.classList.add('watermark');if (this.state.mode && this.state.mode != WATERMARK) maximize_iframe();}componentWillUnmount() {document.body && document.body.classList.remove('watermark');}
            set_mode(mode, slide) {
                let prev_mode = this.state.mode,prev_slide = this.state.slide;
                if (prev_mode == mode && prev_slide == slide)
                return;
                let _this = this;
                (0, _etask2.default)(function* () {
                    _this.setState({ flipping: prev_mode != mode });
                    const update_state = () => _this.setState({ mode, slide });
                    if ((!prev_mode || prev_mode == WATERMARK) && mode != WATERMARK)
                    {
                        yield maximize_iframe();
                        yield _etask2.default.sleep(50);
                        update_state();
                    } else
                    if (prev_mode != WATERMARK && mode == WATERMARK)
                    {
                        resize_iframe({ fade: false });
                        update_state();
                    } else

                    update_state();
                });
            }
            render() {
                let { mode, flip_key } = this.state;
                if (!mode)
                return null;
                return _react2.default.createElement(_reactFlipToolkit.Flipper, { className: 'flipper',
                    flipKey: `${mode}_${flip_key}`,
                    handleEnterUpdateDelete: _ui_lib2.default.handle_flipper_animation,
                    onComplete: () => this.setState({ flipping: false }),
                    spring: { stiffness: 700, damping: 60 } },
                this.render_inner());

            }};Popup_base.contextType = App_context;let


        Watermark_popup = class Watermark_popup extends Popup_base {
            constructor(props, context) {
                super(props, context);_initialiseProps.call(this);
                let state = this.state = this.state || {};
                const opt = get_watermark_opt(props, context);
                if (!opt)
                return void _ui_api2.default.close_tpopup();
                state.mode = opt.initial_mode;
                state.slide = opt.initial_slide;
                state.country = opt.country;
                state.countries = opt.countries;
                this.autostart_trial = opt.autostart_trial;
            }
            componentDidMount() {
                super.componentDidMount();
                _ui_api2.default.on('force_trial', this.on_force_trial);
                _ui_api2.default.on('trial_start', this.on_trial_start);
                _ui_api2.default.on('trial_end', this.on_trial_end);
                if (this.autostart_trial)
                this.unblock_cb(this.state.country);
            }
            componentWillUnmount() {
                super.componentWillUnmount();
                _ui_api2.default.off('force_trial', this.on_force_trial);
                _ui_api2.default.off('trial_start', this.on_trial_start);
                _ui_api2.default.off('trial_end', this.on_trial_end);
            }
            componentDidUpdate(prev_props, prev_state) {
                if (super.componentDidUpdate)
                super.componentDidUpdate(prev_props, prev_state);
                if (this.state.mode == SUBSCRIBE && this.can_close_watermark())
                close();
            }



















            can_close_watermark() {
                return this.context.is_premium || CG('geo_popup.watermark.allow_hide');
            }
            do_unblock(country, trial) {
                let _this = this;
                (0, _etask2.default)(function* () {
                    trial = trial || _this.context.trial;
                    const tab_id = _ui_api2.default.get_tab_id();
                    _ui_api2.default.enable_root_url({ root_url: _util4.default.get_root_url(top_url),
                        country, src: trial && 'trial' });
                    _ui_api2.default.resume_videos(_ui_api2.default.get_connection_id());
                    if (yield _ui_api2.default.is_dont_show(tab_id, root_url, 'watermark'))
                    _ui_api2.default.close_tpopup();else

                    _this.setState({ country }, () => _this.set_mode(WATERMARK));
                });
            }






















































































            render_inner() {
                let { state, props, context } = this;
                switch (state.mode) {

                    case WATERMARK:return _react2.default.createElement(Watermark, {
                            flipping: state.flipping || props.flipping,
                            country: state.country,
                            trial: context.trial,
                            is_premium: context.is_premium,
                            can_close: this.can_close_watermark(),
                            close_cb: this.close_cb,
                            trial_timer_click_cb: this.trial_timer_click_cb });
                    case SUBSCRIBE:return _react2.default.createElement(Subscribe, {
                            slide: state.slide,
                            country: state.country,
                            set_slide: this.set_slide,
                            force_flip: this.force_flip,
                            close_cb: this.close_cb });
                    case SUGGESTION:return _react2.default.createElement(Geo_suggestion, {
                            country: state.country,
                            countries: state.countries,
                            slide: state.slide,
                            trial_error: state.trial_error,
                            busy: state.busy,
                            close_cb: this.close_cb,
                            trial_wait_cb: () => this.set_slide('trial_wait'),
                            unblock_cb: this.unblock_cb,
                            subscribe_cb: this.subscribe_click,
                            back_cb: this.back_click,
                            force_flip: this.force_flip,
                            prefix: props.prefix });
                    case VERIFY_EMAIL:return _react2.default.createElement(Verify_email, {
                            verified_cb: this.verified_cb });
                    case PROXY_ERROR:return _react2.default.createElement(Proxy_error, null);}

            }};var _initialiseProps = function () {this.on_force_trial = opt => {if (opt.tab_id != _ui_api2.default.get_tab_id() || this.state.mode != SUGGESTION || !opt.country) {return;}if (this.state.slide == 'suggestion') this.unblock_cb(opt.country);else this.setState({ country: opt.country });};this.on_trial_start = () => {let country = _util6.default.get_site_storage(root_url, 'trial.country');this.setState({ country });this.set_mode(WATERMARK);};this.on_trial_end = () => {this.set_mode(SUGGESTION, 'trial_subscribe');};this.unblock_cb = country => {if (this.unblock_et) return;let _this = this;this.setState({ country });_ui_api2.default.set_dont_show_again({ tab_id: _ui_api2.default.get_tab_id(), root_url, period: 'default', src: 'unblock_cb', type: 'suggestion' });(0, _etask2.default)(function* () {_this.unblock_et = this;_this.setState({ busy: true });this.finally(() => {_this.unblock_et = null;_this.setState({ busy: false });});perr('geo_suggestion_unblock', { country, slide: _this.state.slide, mode: _this.state.mode, user_id: _ui_api2.default.get_user_id(), root_url });let trial = yield _ui_api2.default.get_trial_active(root_url);if (!_util6.default.get_site_conf(root_url, 'require_plus') || _this.context.is_premium || trial) {_this.do_unblock(country, trial);return;}if (!_ui_api2.default.get_user_id()) return void _this.set_mode(SUGGESTION, 'login');if ((yield _ui_api2.default.get_next_trial_ts(root_url)) > Date.now()) return void _this.set_mode(SUGGESTION, 'trial_subscribe');try {trial = yield start_trial(country);_this.setState({ trial_error: null });_this.do_unblock(country, trial);} catch (e) {if (e.toString().includes('trial_forbidden_domain')) return void _ui_api2.default.close_tpopup();if (!_this.state.mode) _this.set_mode(SUGGESTION, 'suggestion');_this.setState({ trial_error: e.message || true });}});};this.close_cb = opt => {const { mode, slide } = this.state;const { trial, rule, is_grace_period } = this.context;const type = mode == SUGGESTION ? 'suggestion' : 'watermark';if ((mode == WATERMARK || mode == SUBSCRIBE) && this.can_close_watermark()) return void close(_extends({ type }, opt));else if (mode == SUGGESTION) {if (trial) return void this.set_mode(WATERMARK);if (slide == 'stop_vpn_confirmation') return void this.set_slide('trial_subscribe');if (slide == 'trial_subscribe' || slide == 'trial_choose_plan' || slide == 'trial_wait') {if (rule && is_grace_period) return void this.set_slide('stop_vpn_confirmation');_util6.default.set_site_storage(root_url, 'trial.dont_show_ended', true);}close(_extends({ type }, opt));} else if (mode == SUBSCRIBE) this.set_mode(WATERMARK);else if (mode == WATERMARK) this.set_mode(SUBSCRIBE, 'stop_vpn');};this.trial_timer_click_cb = () => {perr('trial_timer_click');this.set_mode(SUGGESTION, 'trial_subscribe');};this.subscribe_click = () => {this.set_mode(SUGGESTION, 'trial_choose_plan');};this.back_click = () => {if (this.state.slide == 'trial_choose_plan' || this.state.slide == 'trial_wait') {this.set_slide('trial_subscribe');}};this.verified_cb = () => {
            };};let

        Mitm_popup = class Mitm_popup extends Popup_base {constructor(...args) {var _temp;return _temp = super(...args), this.





















                close_cb = opt => {
                    if (this.context.is_premium)
                    return void _ui_api2.default.close_tpopup();
                    let { mode } = this.state;
                    if (mode == SUGGESTION || mode == SUBSCRIBE)
                    this.set_mode(WATERMARK);else
                    if (mode == WATERMARK)
                    this.set_mode(SUBSCRIBE, 'stop_vpn');
                }, _temp;}componentDidMount() {super.componentDidMount();let _this = this;this.on_manual_unblock = () => (0, _etask2.default)(function* () {let enabled = yield _ui_api2.default.is_mitm_active_manual(_ui_api2.default.get_tab_id());if (_this.state.mode == SUGGESTION && enabled) _this.close_cb();});_ui_api2.default.on('mitm_manual_unblock', this.on_manual_unblock);}componentWillUnmount() {super.componentWillUnmount();_ui_api2.default.off('mitm_manual_unblock', this.on_manual_unblock);}componentDidUpdate(prev_props, prev_state) {if (super.componentDidUpdate) super.componentDidUpdate(prev_props, prev_state);if (this.context.is_premium && this.state.mode == SUBSCRIBE) _ui_api2.default.close_tpopup();}
            render_inner() {
                let { state, props, context } = this;
                return state.mode == WATERMARK ?
                _react2.default.createElement(Watermark, { is_mitm: true,
                    flipping: state.flipping || props.flipping,
                    close_cb: this.close_cb,
                    is_premium: context.is_premium }) :
                state.mode == SUBSCRIBE ?
                _react2.default.createElement(Subscribe, { close_cb: this.close_cb,
                    slide: state.slide,
                    set_slide: this.set_slide,
                    force_flip: this.force_flip,
                    is_mitm: true }) :
                _react2.default.createElement(Mitm_suggestion, { close_cb: this.close_cb });
            }};


        const close = (opt = {}) => (0, _etask2.default)(function* () {
            yield _ui_api2.default.set_dont_show_again({
                tab_id: _ui_api2.default.get_tab_id(),
                root_url: opt.root_url || root_url,
                period: 'default',
                src: 'x_btn',
                type: opt.type || 'watermark' });

            _ui_api2.default.close_tpopup();
        });

        const get_watermark_opt = (opt = {}, ctx) => {
            let autostart_trial = false;
            let site_conf = _util6.default.get_site_conf(root_url);
            let force_trial = _util6.default.get_site_storage(root_url, 'force_trial');
            let force_country = force_trial && force_trial.country;
            if (force_trial)
            _util6.default.set_site_storage(root_url, 'force_trial', null);
            if (ctx.rule && !ctx.trial && site_conf && site_conf.require_plus &&
            !ctx.is_premium && !ctx.is_grace_period)
            {
                perr('rule_without_trial', site_conf);
                _ui_api2.default.stop_vpn(top_url, _ui_api2.default.get_tab_id());
                return;
            }
            if (_util6.default.proxy_error_ui_enabled('dialog') && ctx.rule &&
            ctx.proxy_error)
            {
                return { initial_mode: PROXY_ERROR };
            }
            let mode, slide, countries, country;
            let suggestion_conf = _util6.default.get_suggestion_conf(site_conf,
            ctx.src_country) || {};
            let suggested = force_country || suggestion_conf.proxy;
            let { suggest_country, force_suggestion } = opt;
            if (suggest_country || force_suggestion)
            {
                suggested = ['*'];
                if (suggest_country)
                suggested.unshift(suggest_country.toLowerCase());
            }
            if (suggested && !Array.isArray(suggested))
            suggested = [suggested];
            let trial_country = force_country || _util2.default.get(ctx.rule, 'country') ||
            _util2.default.get(get_rule(), 'country') ||
            _util6.default.get_site_storage(root_url, 'trial.country');
            let is_trial_expired = ctx.is_trial_expired && trial_country;
            if (force_country && !is_trial_expired && !ctx.trial)
            {
                country = force_country;
                autostart_trial = true;
            } else
            if ((!ctx.rule || ctx.is_grace_period) && suggested &&
            suggested.length && !ctx.trial)
            {
                mode = SUGGESTION;
                if (suggested)
                countries = suggested.map(c => c.toLowerCase());
                if (!is_trial_expired || force_trial && !force_country)
                slide = 'suggestion';else

                {
                    slide = 'trial_subscribe';
                    country = trial_country;
                }
            } else

            {
                country = ctx.rule && ctx.rule.country;
                if (!country)
                return void perr('watermark_no_country');
                mode = WATERMARK;
            }
            if (0 && _util8.default.must_verify_email(ctx.user))
            mode = VERIFY_EMAIL;
            return {
                initial_mode: mode,
                initial_slide: slide,
                country,
                countries,
                autostart_trial };

        };

        E.Watermark_wrapper = function Watermark_wrapper(props) {
            const { inited } = useContext(App_context);
            return inited ? _react2.default.createElement(Watermark_popup, props) : null;
        };

        E.Mitm_wrapper = function Mitm_wrapper(props) {
            const { inited, rule } = useContext(App_context);
            return inited ? _react2.default.createElement(Mitm_popup, _extends({ initial_mode: rule ? WATERMARK : SUGGESTION },
            props)) : null;
        };

        E.t = { get_watermark_opt, Watermark_popup };exports.default =
        E;});})();
//# sourceMappingURL=watermark.js.map
