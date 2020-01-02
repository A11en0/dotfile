// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'react', 'react-dom', '/bext/vpn/ui/page_lib.js', '/bext/vpn/ui/ui_lib.js', '/util/url.js', '/util/etask.js', '/bext/vpn/ui/ui_api.js'], function (exports, _react, _reactDom, _page_lib, _ui_lib, _url, _etask, _ui_api) {Object.defineProperty(exports, "__esModule", { value: true });exports.init = undefined;var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _url2 = _interopRequireDefault(_url);var _etask2 = _interopRequireDefault(_etask);var _ui_api2 = _interopRequireDefault(_ui_api);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};








        const { useState, useEffect } = _react2.default;
        const T = _ui_lib2.default.T;
        const REPORT_HASH = '#report_issue';

        const Report_problem = () => {
            const [modal, set_modal] = useState(false);
            const [url, set_url] = useState('');
            const [subj, set_subj] = useState('');
            useEffect(() => {
                const on_hash_change = () =>
                set_modal(window.location.hash == REPORT_HASH);
                window.addEventListener('hashchange', on_hash_change, false);
                on_hash_change();
                let qs = _url2.default.qs_parse(window.location.search.replace(/^\?/, ''));
                set_url(qs.url);
                set_subj(qs.subj);
                return () =>
                window.removeEventListener('hashchange', on_hash_change);
            }, []);
            const hide_modal = () => window.location.hash = '';
            return _react2.default.createElement('div', { className: 'section report-problem' },
            _react2.default.createElement('a', { className: 'title', href: '#report_issue' },
            _react2.default.createElement(T, null, 'Report a problem')),

            modal && _react2.default.createElement(_page_lib.Report_problem_modal, { url: url, init_subj: subj,
                close_cb: hide_modal }));

        };

        let dev_mode_counter = 0,dev_mode_first_ts = 0;
        const About_details = () => {
            const [dev_mode, set_dev_mode] = useState(_ui_api2.default.get_dev_mode());
            const info = _ui_lib2.default.use_etask(() => _ui_api2.default.get_product_info(), []);
            useEffect(() => {
                const update = () => set_dev_mode(_ui_api2.default.get_dev_mode());
                _ui_api2.default.on('dev_mode_changed', update);
                return () => _ui_api2.default.off('dev_mode_changed', update);
            }, []);
            const on_title_click = () => {
                let now = Date.now();
                if (!dev_mode_first_ts || now - dev_mode_first_ts > 5000)
                {
                    dev_mode_first_ts = now;
                    dev_mode_counter = 0;
                }
                dev_mode_counter++;
                if (dev_mode_counter != 5)
                return;
                dev_mode_counter = 0;
                dev_mode_first_ts = 0;
                _ui_api2.default.set_dev_mode(!dev_mode);
            };
            const send_email = e => {
                _ui_api2.default.perr_err('be_report_problem', { email: 1 }, { with_log: true,
                    rate_limit: { count: 1 } });
            };
            let s = dev_mode ? ' (Dev mode)' : '';
            return _react2.default.createElement(_page_lib.Section, { title: T('About Hola') + s, on_click: on_title_click },
            info.map(line => _react2.default.createElement(_page_lib.Label_line, { key: line.name, label: T(line.name) + ':' },
            line.value)),

            _react2.default.createElement(_page_lib.Label_line, null, 'Send email to ',
            _react2.default.createElement(_ui_lib2.default.Link_mailto, { on_click: send_email })));


        };

        const About_layout = () => {
            const get_user_info = () => ({
                user: _ui_api2.default.get_user(),
                is_plus: _ui_api2.default.get_is_premium() });

            const [user_info, set_user_info] = useState(get_user_info());
            useEffect(() => {
                const update = () => set_user_info(get_user_info());
                _ui_api2.default.on('user_changed', update);
                return () => _ui_api2.default.off('user_changed', update);
            }, []);
            return _react2.default.createElement(_page_lib.Page_layout, _extends({}, user_info, { title: T('About'), cls: 'about' }),
            _react2.default.createElement(Report_problem, null),
            _react2.default.createElement(About_details, null),
            _react2.default.createElement(_page_lib.Legal_section, null));

        };

        const init = exports.init = () => (0, _etask2.default)(function* () {
            yield (0, _page_lib.init_api)();
            _reactDom2.default.render(_react2.default.createElement(About_layout, null), document.querySelector('.react-root'));
        });});})();
//# sourceMappingURL=about.js.map
