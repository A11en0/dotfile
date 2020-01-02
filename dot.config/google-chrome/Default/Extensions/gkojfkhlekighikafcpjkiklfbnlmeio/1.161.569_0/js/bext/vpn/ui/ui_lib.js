// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'react', 'react-dom', 'classnames', 'react-transition-group', '/util/zerr.js', '/util/date.js', '/util/etask.js', '/bext/pub/locale.js', '/bext/vpn/util/util.js', '/bext/vpn/ui/ui_api.js'], function (exports, _react, _reactDom, _classnames, _reactTransitionGroup, _zerr, _date, _etask, _locale, _util, _ui_api) {Object.defineProperty(exports, "__esModule", { value: true });var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _classnames2 = _interopRequireDefault(_classnames);var _zerr2 = _interopRequireDefault(_zerr);var _date2 = _interopRequireDefault(_date);var _etask2 = _interopRequireDefault(_etask);var _locale2 = _interopRequireDefault(_locale);var _util2 = _interopRequireDefault(_util);var _ui_api2 = _interopRequireDefault(_ui_api);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}











        const E = {};
        const { memo, useRef, useEffect, useLayoutEffect, useState } = _react2.default;

        const LONG_CB_MS = 500;
        E.PureComponent = class PureComponent extends _react2.default.PureComponent {constructor(...args) {var _temp;return _temp = super(...args), this.
                timers = {}, this.
                events = {}, _temp;}
            componentWillUnmount() {
                let t0 = Date.now();
                let a = Object.keys(this.timers);
                a.forEach(name => this.clear_timer(name));
                a = Object.keys(this.events);
                a.forEach(event => this.off(event));
                if (this._componentWillUnmount)
                this._componentWillUnmount();
                let t1 = Date.now();
                if (t1 - t0 > LONG_CB_MS)
                {
                    _zerr2.default.warn('long cb componentWillUnmount %s took %sms',
                    this.displayName, t1 - t0);
                }
                if (this.sp)
                {
                    this.sp.return();
                    delete this.sp;
                }
            }
            etask(task) {
                let name = this.constructor.displayName || this.constructor.name;
                this.sp = this.sp || _util2.default.new_etask('Component_' + name);
                this.sp.spawn(task);
                return task;
            }
            has_timer(name) {return !!this.timers[name];}
            set_timer(name, cb, ms) {
                this.clear_timer(name);
                this.timers[name] = { cb, ms,
                    timer: _util2.default.set_timeout(() => this.on_timer(name), ms) };
            }
            clear_timer(name) {
                let t = this.timers[name];
                if (!t)
                return;
                _util2.default.clear_timeout(t.timer);
                delete this.timers[name];
            }
            on_timer(name) {
                let t = this.timers[name];
                if (!t)
                return (0, _zerr2.default)('timer not found %s', name);
                try {
                    let t0 = Date.now();
                    t.cb();
                    let t1 = Date.now();
                    if (t1 - t0 > LONG_CB_MS)
                    {
                        _zerr2.default.warn('long cb timer %s:%s took %sms',
                        this.displayName, name, t1 - t0);
                    }
                } catch (e) {(0, _zerr2.default)('timer %s error %s', name, e);}
                this.clear_timer(name);
            }
            on(obj, event, cb, call_on_init) {
                let _this = this;
                this.off(obj, event, cb);
                let e = this.events[event] = this.events[event] || { a: [] };
                let cb2 = function () {
                    let t0 = Date.now();
                    let ret = cb.apply(_this, arguments);
                    let t1 = Date.now();
                    if (t1 - t0 > LONG_CB_MS)
                    {
                        _zerr2.default.warn('long cb event %s:%s took %sms', _this.displayName,
                        event, t1 - t0);
                    }
                    return ret;
                };
                e.a.push({ obj, cb, cb2 });
                obj.on(event, cb2);
                if (call_on_init)
                cb2();
            }
            off(obj, event, cb) {
                if (event === undefined && cb === undefined)
                {
                    event = obj;
                    let e = this.events[event];
                    if (!e)
                    return;
                    let a = Object.assign([], e.a);
                    return a.forEach(ee => this.off(ee.obj, event, ee.cb));
                }
                _util2.default.assert(event != undefined && cb != undefined,
                new Error('invalid off params'));
                let e = this.events[event];
                if (!e)
                return;
                let i = e.a.findIndex(ee => ee.cb === cb && ee.obj === obj);
                if (i == -1)
                return;
                let ee = e.a.splice(i, 1)[0];
                ee.obj.off(event, ee.cb2);
                if (!e.a.length)
                delete this.events[event];
            }};


        const T = E.T = props => {
            if (typeof props == 'string')
            return (0, _locale2.default)(props);
            const { children } = props;
            if (typeof children == 'string')
            return (0, _locale2.default)(children.replace(/\s+/g, ' '));
            if (Array.isArray(children))
            {
                let obj = [],str = [];
                for (let v of children)
                {
                    if (typeof v == 'string')
                    str.push(v);else

                    {
                        obj.push(v);
                        str.push('$' + obj.length);
                    }
                }
                let translated = (0, _locale2.default)(str.join('')).split(/(\$\d+)/);
                return translated.map(v => {
                    let m = v.match(/\$(\d+)/);
                    return m ? obj[m[1] - 1] : v;
                });
            }
            console.error('<T> must receive text to translate. Received: ', children);
            return null;
        };

        E.Rate_us = function Rate_us({ on_rated }) {
            _react2.default.useEffect(() => {
                _ui_api2.default.perr('be_vpn_rating_display');
                let count = (_ui_api2.default.get_rate_us_count() || 0) + 1;
                _ui_api2.default.set_rate_us_count(count);
                if (count > 5)
                _ui_api2.default.perr('be_rate_us_too_often', { count });
            }, []);
            const on_rate = rate => {
                _ui_api2.default.perr('be_vpn_rating_rate', { rating: rate });
                _ui_api2.default.click_star(rate);
                on_rated(rate);
            };
            return _react2.default.createElement('div', { className: 'popup-rating' },
            _react2.default.createElement('h3', { className: 'popup-rating-title popup-more-title' }, _react2.default.createElement(T, null, 'Rate us')),
            _react2.default.createElement('div', { className: 'popup-rating-msg' }, _react2.default.createElement(T, null, 'Thank you!')),
            _react2.default.createElement('div', { className: 'popup-rating-container' },
            _react2.default.createElement('span', { onClick: () => on_rate(1) }),
            _react2.default.createElement('span', { onClick: () => on_rate(2) }),
            _react2.default.createElement('span', { onClick: () => on_rate(3) }),
            _react2.default.createElement('span', { onClick: () => on_rate(4) }),
            _react2.default.createElement('span', { onClick: () => on_rate(5) })));


        };

        E.Modal_view = memo(function Modal_view(props) {
            const { on_no, on_yes } = props;
            const ref = useRef();
            E.use_body_class('gray-cover-opened', true);
            E.on_outside_click(ref, on_no);
            return _reactDom2.default.createPortal(_react2.default.createElement('div', { ref: ref,
                className: (0, _classnames2.default)('modal-view react-ui', props.cls) },
            _react2.default.createElement('div', { className: 'btn_close', onClick: on_no }),
            props.signin && _react2.default.createElement('a', { className: 'sign-in',
                onClick: () => _ui_api2.default.login(props.signin) }, _react2.default.createElement(T, null, 'Log in')),
            _react2.default.createElement('div', { className: 'message' }, props.children),
            _react2.default.createElement('div', { className: 'buttons' },
            !!props.text_no && _react2.default.createElement('div', { className: 'btn_no', onClick: on_no },
            props.text_no),

            on_yes && _react2.default.createElement('div', { className: 'btn_yes', onClick: on_yes },
            props.text_yes))),


            document.querySelector('.react-root'));
        });

        E.Link_mailto = function Link_mailto({ to = 'help_be@hola.org', on_click }) {
            const href = E.use_etask(() => _ui_api2.default.get_problem_mailto_url({ to }));
            if (!href)
            return null;
            return _react2.default.createElement('a', { href: href, target: 'report_mailto', onClick: on_click },
            to,
            _react2.default.createElement('iframe', { name: 'report_mailto', style: { display: 'none' } }));

        };

        E.Alert_error = memo(function Alert_error({ on_close }) {
            const is_offline = () => window.navigator.onLine === false;
            const [offline, set_offline] = useState(is_offline());
            useEffect(() => {
                const update_status = () => set_offline(is_offline());
                window.addEventListener('offline', update_status);
                window.addEventListener('online', update_status);
                _ui_api2.default.perr('be_ui_err', { offline: is_offline() });
                return () => {
                    window.removeEventListener('offline', update_status);
                    window.removeEventListener('online', update_status);
                };
            }, []);
            const on_yes = () => {
                _ui_api2.default.perr('be_ui_popup_reload');
                _ui_api2.default.reload_ext({ info: 'error' }, true);
            };
            if (offline)
            {
                return _react2.default.createElement(E.Modal_view, { cls: 'alert-error', on_no: on_close,
                    text_no: T('Close') },
                _react2.default.createElement('p', null, _react2.default.createElement('b', null, 'No internet')),
                _react2.default.createElement('p', { className: 'list-header' }, 'Try:'),
                _react2.default.createElement('ul', { className: 'with-header' },
                _react2.default.createElement('li', null, 'Checking the network cables, modem, and router'),
                _react2.default.createElement('li', null, 'Reconnecting to Wi-Fi')));


            }
            return _react2.default.createElement(E.Modal_view, { cls: 'alert-error', on_no: on_close, on_yes: on_yes,
                text_no: T('Close'), text_yes: T('Reload extension') },
            _react2.default.createElement('p', null, 'Sorry, Hola is not available right now.'),
            _react2.default.createElement('ol', null,
            _react2.default.createElement('li', null, 'Check you have Internet connection'),
            _react2.default.createElement('li', null, _react2.default.createElement('a', { onClick: on_yes }, 'Reload'), ' the extension'),
            _react2.default.createElement('li', null, 'Email us at ', _react2.default.createElement(E.Link_mailto, { to: 'support@hola.org' }))));


        });

        E.Progress_bar = function Progress_bar({ visible }) {
            let style = { visibility: visible ? 'visible' : 'hidden' };
            return _react2.default.createElement('div', { className: 'progress-bar', style: style });
        };

        E.is_mouse_over = (el, event) => {
            if (!el)
            return false;
            let r = el.getBoundingClientRect();
            let x = event.clientX,y = event.clientY;
            return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        };

        E.Close_hint = memo(function Close_hint(props) {
            const [show, set_show] = useState(props.show_on_init);
            const [hover, set_hover] = useState(false);
            const prev_hover = E.use_previous(hover);
            const ref = useRef();
            const arrow_ref = useRef();
            useEffect(() => {
                const on_body_mouse_move = e => {
                    const over_close_btn = E.is_mouse_over(props.close_btn, e);
                    set_hover(E.is_mouse_over(ref.current, e) ||
                    E.is_mouse_over(arrow_ref.current, e) || over_close_btn);
                    if (!show && over_close_btn)
                    set_show(true);
                };
                const on_mouse_leave = e => set_hover(false);
                document.body.addEventListener('mousemove', on_body_mouse_move);
                _ui_api2.default.on('mouseleave', on_mouse_leave);
                return () => {
                    document.body.removeEventListener('mousemove', on_body_mouse_move);
                    _ui_api2.default.off('mouseleave', on_mouse_leave);
                };
            }, [props.close_btn, show]);
            useEffect(() => {
                let timer;
                if (prev_hover && !hover)
                timer = _util2.default.set_timeout(() => set_show(false), 300);
                return () => _util2.default.clear_timeout(timer);
            }, [hover]);
            let period = props.period;
            switch (_date2.default.str_to_dur(props.period)) {

                case _date2.default.ms.DAY:period = 'one day';break;
                case _date2.default.ms.WEEK:period = 'one week';break;
                case _date2.default.ms.MONTH:period = 'one month';break;
                case _date2.default.ms.YEAR:period = 'one year';break;}

            let style = { display: 'block' },arrow_style = {};
            if (props.offset)
            {
                style.right = -props.offset + 'px';
                arrow_style.right = 10 + props.offset + 'px';
            }
            return _react2.default.createElement(_reactTransitionGroup.CSSTransition, { 'in': show, classNames: 'popup-hint',
                onExited: props.on_hide, mountOnEnter: true, unmountOnExit: true,
                timeout: 150 },
            _react2.default.createElement('div', { className: 'popup-hint popup-header-close-hint',
                style: style, ref: ref },
            _react2.default.createElement('div', { className: 'hint_close_arrow', style: arrow_style,
                ref: arrow_ref }),
            _react2.default.createElement('div', { className: 'hint_dont_show' }, _react2.default.createElement(T, null, 'Don\'t show again')),
            _react2.default.createElement('div', { className: 'hint_option',
                onClick: () => props.on_click(props.root_url) },
            _react2.default.createElement(T, null, 'for ', _react2.default.createElement('b', null, props.root_url), ' for ', period)),

            _react2.default.createElement('div', { className: 'hint_option', onClick: () => props.on_click('all') },
            _react2.default.createElement(T, null, 'for ', _react2.default.createElement('b', null, 'any site'), ' for ', period))));



        });

        E.use_body_class = (cls, val) => {
            useLayoutEffect(() => {
                document.body.classList.toggle(cls, val);
                return () => document.body.classList.remove(cls);
            });
        };

        E.use_previous = value => {
            const ref = useRef();
            useEffect(() => void (ref.current = value), [value]);
            return ref.current;
        };

        E.on_outside_click = (ref, cb) => {
            useLayoutEffect(() => {
                const click_outside = e => {
                    if (ref.current && !ref.current.contains(e.target))
                    cb();
                };
                const body_click = () => cb();
                document.body.addEventListener('click', click_outside);
                _ui_api2.default.on('body_click', body_click);
                return () => {
                    document.body.removeEventListener('click', click_outside);
                    _ui_api2.default.off('body_click', body_click);
                };
            });
        };

        E.use_etask = (task, def, inputs) => {
            const [data, set_data] = useState(def);
            useEffect(() => {
                const et = (0, _etask2.default)(function* () {set_data((yield task()));});
                return () => et.return();
            }, inputs || []);
            return data;
        };

        E.use_countdown = ts => {
            const [time, set_time] = useState(Math.max(ts - Date.now(), 0));
            useEffect(() => {
                const et = (0, _etask2.default)(function* () {
                    let t;
                    while ((t = ts - Date.now()) > 0)
                    {
                        set_time(t);
                        yield _etask2.default.sleep(1000);
                    }
                    set_time(0);
                });
                return () => et.return();
            }, [ts]);
            return time;
        };

        E.use_trial_left = trial => E.use_countdown(trial ? trial.expire_ts : 0);

        E.handle_flipper_animation = opt => {
            let el;
            if (el = document.querySelector('.modal-watermark'))
            {
                el.style.willChange = 'transform';
                if (el = el.querySelector('.modal-header'))
                el.style.willChange = 'transform';
            }
            opt.hideEnteringElements();
            opt.animateExitingElements();
            opt.animateEnteringElements();
            opt.animateFlippedElements().then(() => {
                if (el = document.querySelector('.modal-watermark'))
                {
                    el.style.willChange = '';
                    if (el = el.querySelector('.modal-header'))
                    el.style.willChange = '';
                }
            });
        };exports.default =

        E;});})();
//# sourceMappingURL=ui_lib.js.map
