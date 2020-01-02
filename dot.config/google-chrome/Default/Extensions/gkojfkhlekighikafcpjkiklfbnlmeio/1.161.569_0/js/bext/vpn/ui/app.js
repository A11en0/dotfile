// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', 'react', 'react-dom', 'react-flip-toolkit', '/util/zerr.js', '/util/util.js', '/util/storage.js', '/bext/pub/util.js', '/bext/vpn/util/util.js', '/bext/vpn/ui/ui_lib.js', '/bext/vpn/ui/ui_react.js', '/bext/vpn/ui/watermark.js', '/bext/vpn/ui/ui_api.js', '/bext/vpn/ui/context.js'], function (exports, _underscore, _react, _reactDom, _reactFlipToolkit, _zerr, _util, _storage, _util3, _util5, _ui_lib, _ui_react, _watermark, _ui_api, _context) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _zerr2 = _interopRequireDefault(_zerr);var _util2 = _interopRequireDefault(_util);var _storage2 = _interopRequireDefault(_storage);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _ui_react2 = _interopRequireDefault(_ui_react);var _watermark2 = _interopRequireDefault(_watermark);var _ui_api2 = _interopRequireDefault(_ui_api);var _context2 = _interopRequireDefault(_context);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};














        _util6.default.assert_ui('ui_app');
        const E = {},{ T } = _ui_lib2.default;

        const Spinner = () => _react2.default.createElement('div', { className: 'spinner' },
        Array(8).fill(0).map((v, i) => _react2.default.createElement('div', { key: i })));

        const Init_slow = () => _react2.default.createElement('div', { className: 'app-init-slow' },
        _react2.default.createElement(Spinner, null), _react2.default.createElement(T, null, 'Starting...'));

        const Init_error = () => {
            const on_reload_click = () => _ui_api2.default.reload_ext({ info: 'error' }, true);
            return _react2.default.createElement('div', { className: 'popup-error' },
            _react2.default.createElement('h2', { className: 'popup-title popup-error-title' },
            _react2.default.createElement(T, null, 'Hola is not available right now, but we are working on it.')),

            _react2.default.createElement('div', { className: 'popup-error-text' },
            _react2.default.createElement('ol', { className: 'popup-error-list' },
            _react2.default.createElement('li', { className: 'popup-error-list-item' },
            _react2.default.createElement('a', { className: 'popup-error-reload', onClick: on_reload_click },
            _react2.default.createElement(T, null, 'Reload Hola'))),


            _react2.default.createElement('li', { className: 'popup-error-list-item' },
            _react2.default.createElement(T, null, 'Check your Internet connection')))));




        };let

        Error_boundary = class Error_boundary extends _react2.default.Component {constructor(...args) {var _temp;return _temp = super(...args), this.
                state = { error: false }, _temp;}
            static getDerivedStateFromError(error) {
                return { error: true };
            }
            componentDidCatch(err, info) {
                this.setState({ error: true });
                _ui_api2.default.perr_err('be_ui_vpn_render_err', info, { err });
                if (_util6.default.is_tpopup())
                _ui_api2.default.close_tpopup();
            }
            render() {
                const reset_errror = () => this.setState({ error: false });
                if (this.state.error)
                {
                    return _util6.default.is_tpopup() ? null :
                    _react2.default.createElement(_ui_lib2.default.Alert_error, { on_close: reset_errror });
                }
                return this.props.children;
            }};


        const reducer = (state, action) => {
            if (action.type == 'set_tpopup_type')
            {
                if (!action.value)
                resize_handler_init();else

                resize_handler_uninit();
                return _extends({}, state, { tpopup_type: action.value, flipping: true });
            }
            if (action.type == 'flip_end')
            return _extends({}, state, { flipping: false });
        };

        const App = () => {
            const [state, dispatch] = (0, _react.useReducer)(reducer, {
                tpopup_type: _util6.default.get_tpopup_type(),
                flipping: false });

            (0, _react.useEffect)(() => {
                const listener = t => dispatch({ type: 'set_tpopup_type', value: t });
                _ui_api2.default.on('set_tpopup_type', listener);
                return () => _ui_api2.default.off('set_tpopup_type', listener);
            }, []);
            const opt = { flipping: state.flipping };
            let inner;
            if (state.tpopup_type == 'mitm_popup')
            inner = _react2.default.createElement(_watermark2.default.Mitm_wrapper, opt);else
            if (state.tpopup_type == 'watermark')
            inner = _react2.default.createElement(_watermark2.default.Watermark_wrapper, opt);else
            if (state.tpopup_type == 'suggestion')
            {
                let country = _util2.default.get(window, 'hola.tpopup_opt.country');
                let _opt = country ?
                { suggest_country: country, prefix: 'stub_rule' } :
                { force_suggestion: true, prefix: 'suggest' };
                inner = _react2.default.createElement(_watermark2.default.Watermark_wrapper, _extends({}, opt, _opt));
            } else

            inner = _react2.default.createElement(_ui_react2.default.Vpn_ui, opt);
            return _react2.default.createElement(_context2.default.Provider, { tpopup_type: state.tpopup_type },
            _react2.default.createElement(_reactFlipToolkit.Flipper, { className: 'flipper',
                flipKey: state.tpopup_type,
                handleEnterUpdateDelete: _ui_lib2.default.handle_flipper_animation,
                onComplete: () => dispatch({ type: 'flip_end' }),
                spring: { stiffness: 700, damping: 60 } },
            inner));


        };

        let init_slow_timer, init_error_timer, auto_reload_timer;

        const schedule_auto_reload = () => {
            if (_util6.default.is_tpopup())
            {
                _ui_api2.default.perr_err('be_popup_reload_ext_skip', {},
                { filehead: _zerr2.default.log_tail(), rate_limit: { count: 10 } });
                _ui_api2.default.close_tpopup();
                return;
            }
            auto_reload_timer = _util6.default.set_timeout(() =>
            _ui_api2.default.reload_ext({ info: 'auto_reload' }), 10000);
        };

        const init_err_info = () => {
            const s = {};
            _storage2.default.set('ui_popup_init_err', _storage2.default.get_int('ui_popup_init_err') + 1);
            if (!_storage2.default.get_int('ui_popup_inited'))
            s.never = 1;
            if (_storage2.default.get_int('ui_popup_init_err') > 1)
            s.errors = _storage2.default.get_int('ui_popup_init_err');
            if (_storage2.default.get_int('ajax_timeout'))
            s.timeout = _storage2.default.get_int('ajax_timeout');
            return s;
        };

        const reset_init_err = () => {
            if (!_storage2.default.get_int('ui_popup_inited'))
            _storage2.default.set('ui_popup_inited', 1);
            if (_storage2.default.get_int('ajax_timeout'))
            _storage2.default.clr('ajax_timeout');
            if (_storage2.default.get_int('ui_popup_init_err'))
            {
                _ui_api2.default.perr('be_ui_popup_recover',
                'errors ' + _storage2.default.get_int('ui_popup_init_err'));
                _storage2.default.clr('ui_popup_init_err');
            }
        };

        const send_render_stats = () => {
            if (_util6.default.get_tpopup_type())
            return;
            const count = (_storage2.default.get_int('ui_popup_render_count') || 0) + 1;
            _storage2.default.set('ui_popup_render_count', count);
            const err = window.hola.err,info = _ui_api2.default.get_timings();
            _util2.default.if_set(_util2.default.get(err, 'require'), info, 'require');
            _util2.default.if_set(count, info, 'count');
            _ui_api2.default.perr('popup_render' + (info.popup_render_ms > 4000 ? '_slow' : ''),
            info);
            _ui_api2.default.push_event(_util6.default.is_tpopup() ? 'tpopup_render' :
            'popup_render', {});
        };

        let resize_timer, resize_inited_ts, mut_observer;
        const resize = () => {
            let b = document.body;
            if (!resize_inited_ts || Date.now() - resize_inited_ts < 1000)
            return;
            let h = b.clientHeight;
            let w = b.clientWidth;
            _util6.default.clear_timeout(resize_timer);
            resize_timer = _util6.default.set_timeout(resize, 1000);
            if (resize.width == w && resize.height == h)
            return;
            resize.width = w;
            resize.height = h;
            _ui_api2.default.resize_tpopup({ width: w, height: h });
        };

        const resize_handler_init = () => {
            if (resize_inited_ts)
            return;
            resize_inited_ts = Date.now();
            if (!window.MutationObserver)
            return;
            mut_observer = new window.MutationObserver(_underscore2.default.debounce(resize));
            mut_observer.observe(document.documentElement, { attributes: true,
                childList: true, characterData: true, subtree: true,
                attributeOldValue: false, characterDataOldValue: false });
        };

        const resize_handler_uninit = () => {
            if (!resize_inited_ts)
            return;
            resize_inited_ts = null;
            resize_timer = _util6.default.clear_timeout(resize_timer);
            if (mut_observer)
            mut_observer.disconnect();
            mut_observer = null;
            resize.width = null;
            resize.height = null;
        };

        const render = (component, root) =>
        void _reactDom2.default.render(_react2.default.createElement(Error_boundary, null, component), root);

        E.pre_init = () => {
            init_slow_timer = _util6.default.set_timeout(() => {
                _ui_api2.default.perr_err('be_ui_popup_slow_render');
                render(_react2.default.createElement(Init_slow, null), document.querySelector('#popup'));
                init_error_timer = _util6.default.set_timeout(() => E.render_init_err(),
                20000);
            }, 2000);
        };

        E.render_init_err = () => {
            schedule_auto_reload();
            _ui_api2.default.perr_err('be_ui_obj_init_err', init_err_info(),
            { filehead: _zerr2.default.log_tail() });
            render(_react2.default.createElement(Init_error, null), document.querySelector('#popup'));
        };

        E.init = () => {
            try {
                _util6.default.clear_timeout(init_slow_timer);
                _util6.default.clear_timeout(init_error_timer);
                _util6.default.clear_timeout(auto_reload_timer);
                _reactDom2.default.unmountComponentAtNode(document.querySelector('#popup'));
                reset_init_err();
                document.body.classList.add(_util4.default.browser());
                render(_react2.default.createElement(App, null), document.querySelector('.react-root'));
                if (_util6.default.is_tpopup())
                {
                    document.body.classList.add('tpopup');
                    const st = document.documentElement.style;
                    st.width = st.maxWidth = st.height = st.maxHeight = '100%';
                    _ui_api2.default.show_tpopup();
                    if (!_util6.default.get_tpopup_type())
                    {
                        document.body.classList.add('show_anim');
                        resize_handler_init();
                    }
                }
                if (performance.mark)
                performance.mark('popup_render');
            } catch (e) {
                (0, _zerr2.default)('app init error %s', _zerr2.default.e2s(e));
                _ui_api2.default.perr_err('be_ui_app_init_err', {}, { err: e });
                E.render_init_err(e);
            }
            send_render_stats();
        };

        E.uninit = () => {
            _reactDom2.default.unmountComponentAtNode(document.querySelector('.react-root'));
            resize_handler_uninit();
        };exports.default =

        E;});})();
//# sourceMappingURL=app.js.map
