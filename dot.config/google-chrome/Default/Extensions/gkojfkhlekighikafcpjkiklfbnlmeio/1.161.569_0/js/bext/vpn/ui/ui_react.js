// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'react', 'react-dom', 'classnames', 'react-flip-toolkit', '/util/util.js', '/util/etask.js', '/util/url.js', '/util/string.js', '/util/storage.js', '/util/country.js', 'react-tiny-virtual-list', '/bext/vpn/ui/ui_lib.js', '/bext/vpn/ui/ui_api.js', '/bext/vpn/util/util.js', '/bext/vpn/ui/debug_ui.js', '/svc/vpn/pub/util.js', '/svc/vpn/pub/common_ui.js', '/bext/pub/util.js', '/bext/vpn/ui/privacy.js', '/bext/vpn/ui/context.js'], function (exports, _react, _reactDom, _classnames, _reactFlipToolkit, _util, _etask, _url, _string, _storage, _country, _reactTinyVirtualList, _ui_lib, _ui_api, _util3, _debug_ui, _util5, _common_ui, _util7, _privacy, _context) {Object.defineProperty(exports, "__esModule", { value: true });var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _classnames2 = _interopRequireDefault(_classnames);var _util2 = _interopRequireDefault(_util);var _etask2 = _interopRequireDefault(_etask);var _url2 = _interopRequireDefault(_url);var _string2 = _interopRequireDefault(_string);var _storage2 = _interopRequireDefault(_storage);var _country2 = _interopRequireDefault(_country);var _reactTinyVirtualList2 = _interopRequireDefault(_reactTinyVirtualList);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _ui_api2 = _interopRequireDefault(_ui_api);var _util4 = _interopRequireDefault(_util3);var _debug_ui2 = _interopRequireDefault(_debug_ui);var _util6 = _interopRequireDefault(_util5);var _common_ui2 = _interopRequireDefault(_common_ui);var _util8 = _interopRequireDefault(_util7);var _privacy2 = _interopRequireDefault(_privacy);var _context2 = _interopRequireDefault(_context);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;}var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};





















        const E = {};
        const { T } = _ui_lib2.default;
        const { CG } = _util8.default;
        const { perr, perr_err } = _ui_api2.default;
        const { App_context } = _context2.default;
        const { useContext, useState, useEffect, useLayoutEffect, useRef, memo,
            Fragment } = _react2.default;

        const A = _react2.default.forwardRef((props, ref) => _react2.default.createElement('a', _extends({ ref: ref, target: '_blank',
            rel: 'noopener noreferrer' }, props), props.children));

        const Power_btn = memo(function Power_btn(props) {
            let context = useContext(App_context);
            let cls = (0, _classnames2.default)('popup-header-controls-button', 'popup-header-switch',
            { enabled: context.enabled });
            return _react2.default.createElement('div', { id: 'g_switch', className: cls,
                onClick: () => _ui_api2.default.set_enabled(!context.enabled),
                title: T(context.enabled ? 'Turn off Hola' : 'Turn on Hola') },
            _react2.default.createElement('svg', { height: '100%', width: '100%', viewBox: '0 0 20 20' }, _react2.default.createElement('g', null,
            _react2.default.createElement('path', { d: 'M10,11.7c-0.6,0-1.2-0.5-1.2-1.1V1.1C8.8,0.5,9.4,0,10, 0c0.6,0,1.2,0.5,1.2,1.1v9.4 C11.2,11.2,10.6,11.7,10,11.7z' }),

            _react2.default.createElement('path', { d: 'M13.5,1.7v2.4c2.4,1.2,4.1,3.6,4.1,6.4c0,4-3.4,7.2-7.6, 7.2s-7.6-3.2-7.6-7.2c0-2.8,1.7-5.2,4.1-6.4V1.7 C2.7,3.1,0,6.5,0, 10.6C0,15.8,4.5,20,10,20s10-4.2,10-9.4C20,6.5,17.3,3.1,13.5,1.7z' }))));




        });

        const Menu_btn = memo(function Menu_btn(props) {
            return _react2.default.createElement('i', { className: (0, _classnames2.default)(
                'popup-header-controls-button popup-header-nav',
                { 'hamburger-active': props.is_menu_open }),
                onClick: props.on_click, title: T('Menu') },
            _react2.default.createElement('svg', { className: 'hamburger-top', height: '100%', width: '100%',
                viewBox: '0 0 14 2' },
            _react2.default.createElement('path', { d: 'M1 2h12c.6 0 1-.4 1-1s-.4-1-1-1H1C.4 0 0 .4 0 1s.4 1 1 1z' })),

            _react2.default.createElement('svg', { className: 'hamburger-middle', height: '100%', width: '100%',
                viewBox: '0 0 14 2' },
            _react2.default.createElement('path', { d: 'M1 2h12c.6 0 1-.4 1-1s-.4-1-1-1H1C.4 0 0 .4 0 1s.4 1 1 1z' })),

            _react2.default.createElement('svg', { className: 'hamburger-bottom', height: '100%', width: '100%',
                viewBox: '0 0 14 2' },
            _react2.default.createElement('path', { d: 'M1 2h12c.6 0 1-.4 1-1s-.4-1-1-1H1C.4 0 0 .4 0 1s.4 1 1 1z' })));


        });

        const Upgrade_link = memo(function Upgrade_link(props) {
            const { is_premium, root_url } = useContext(App_context);
            if (is_premium || !CG('upgrade_link.enabled', true))
            return null;
            const pos = CG('upgrade_link.position', 'left');
            const on_click = () =>
            _ui_api2.default.open_plus_page(root_url, 'ext_upgrade_t' + pos[0]);
            let is_paid = false; 
            const cls = (0, _classnames2.default)('upgrade-link', 'upgrade-link-' + pos, is_paid ?
            'renew' : 'upgrade');
            return _react2.default.createElement('a', { className: cls, onClick: on_click },
            is_paid ? T('Renew') : T('Upgrade'));

        });

        const Tpopup_close_btn = memo(function Tpopup_close_btn(props) {
            const { root_url } = useContext(App_context);
            const btn_ref = useRef();
            return _react2.default.createElement(Fragment, null,
            _react2.default.createElement('div', { className: 'popup-header-controls-button popup-header-close',
                ref: btn_ref, onClick: () => _ui_api2.default.tpopup_close_click('x_btn'),
                id: 'tpopup_close' }),
            _ui_api2.default.need_tpopup_hint() && _react2.default.createElement(_ui_lib2.default.Close_hint, { root_url: root_url,
                close_btn: btn_ref.current,
                period: _util8.default.get_dont_show_def_period(),
                on_click: _ui_api2.default.tpopup_close_hint_click }));

        });

        const Tooltip = memo(function Tooltip(props) {
            const { position = 'top', icon_cls, icon_div_cls, title, className,
                el } = props;
            const [visible, set_visible] = useState(false);
            useEffect(() => {
                if (!el)
                return;
                const show = () => set_visible(true);
                const hide = () => set_visible(false);
                el.addEventListener('mouseenter', show);
                el.addEventListener('mouseleave', hide);
                el.addEventListener('mousedown', hide);
                return () => {
                    el.removeEventListener('mouseenter', show);
                    el.removeEventListener('mouseleave', hide);
                    el.removeEventListener('mousedown', hide);
                };
            }, [el]);
            const cls = ['popup-tooltip', `popup-tooltip-${position}`,
            { 'popup-tooltip-visible': visible }, className];
            return _react2.default.createElement('div', { className: (0, _classnames2.default)(cls) },
            _react2.default.createElement('div', { className: 'header' },
            _react2.default.createElement('div', { className: icon_div_cls || 'f32' },
            _react2.default.createElement('i', { className: icon_cls })),

            _react2.default.createElement('h2', null, title)),

            _react2.default.createElement('div', { className: 'body' },
            props.children));


        });

        const Free_tooltip = memo(function Free_tooltip(props) {
            const opt = { position: 'bottom', title: 'Upgrade now!', key: 'tooltip',
                icon_cls: 'icon' };
            return _react2.default.createElement(Tooltip, _extends({}, opt, props),
            _react2.default.createElement('p', null, 'Faster servers. Unblock any site. Online protection.'));

        });

        const Error_tooltip = memo(function Error_tooltip(_ref) {let { error } = _ref,props = _objectWithoutProperties(_ref, ['error']);
            const opt = { position: 'bottom', title: 'There was an error',
                key: 'tooltip', icon_cls: 'icon', className: 'error-tooltip' };
            const dns_err = _util2.default.get(error, 'err') == 'ERR_DNS_FAILED';
            return _react2.default.createElement(Tooltip, _extends({}, opt, props),
            dns_err && _react2.default.createElement('p', null, 'Site is down or doesn\'t exist.'),
            !dns_err && _react2.default.createElement(Fragment, null,
            _react2.default.createElement('p', null, 'To fix the problem, click "No, fix it" below.'),
            _react2.default.createElement('p', null, 'If the issue is not fixed, contact us at ', _react2.default.createElement('a', null, 'help@hola.org'))));


        });

        const Trial_timer = memo(function Trial_timer() {
            const { root_url, trial } = useContext(App_context);
            const ref = useRef();
            const trial_left = _ui_lib2.default.use_trial_left(trial);
            const on_click = () =>
            _ui_api2.default.ga_send('checkout', { step: 5, lab: 'ext_timer' });
            if (!trial_left || !root_url)
            return null;
            const href = _util4.default.plus_ref('trial_timer_' +
            root_url.replace(/\./g, '_'), { root_url });
            return _react2.default.createElement('div', { className: 'popup-header-timer' },
            _react2.default.createElement(A, { ref: ref, className: 'trial-timer', href: href, onClick: on_click },
            _common_ui2.default.format_time(trial_left)),

            _react2.default.createElement(Tooltip, { el: ref.current, position: 'bottom', title: 'Upgrade to PLUS!' },
            _react2.default.createElement('p', null, 'Get unlimited unblocking time for ', root_url, '.')));


        });

        const Header = memo(function Header(props) {
            const { root_url, is_premium, trial, is_tpopup } = useContext(App_context);
            const logo_ref = useRef();
            useLayoutEffect(() => {
                document.body.classList.toggle('user-trial', !!trial);
                document.body.classList.toggle('user-premium', !!is_premium);
                document.body.classList.toggle('user-free', !is_premium);
            }, [!!trial, !!is_premium]);
            let on_click = () => {
                if (is_premium)
                _ui_api2.default.open_page('https://hola.org?utm_source=holaext');else

                _ui_api2.default.open_plus_page(root_url, 'logo_upgrade');
            };
            return _react2.default.createElement('div', { id: 'header', className: 'popup-header' },
            _react2.default.createElement('div', { className: 'popup-header-controls-left popup-header-controls' },
            _react2.default.createElement('div', { className: 'popup-header-controls-item' },
            _react2.default.createElement(Menu_btn, { on_click: () => props.toggle_menu(true),
                is_menu_open: props.is_menu_open }))),


            _react2.default.createElement('a', { className: 'popup-header-logo', tabIndex: '-1', onClick: on_click,
                ref: logo_ref },
            _react2.default.createElement('i', { className: 'popup-header-logo-img' })),

            !is_premium && _react2.default.createElement(Free_tooltip, { el: logo_ref.current }),
            _react2.default.createElement('div', { className: 'popup-header-controls-right popup-header-controls' },
            _react2.default.createElement('div', { className: 'popup-header-controls-item' },
            is_tpopup ? _react2.default.createElement(Tpopup_close_btn, null) : _react2.default.createElement(Power_btn, null))),


            !is_premium && trial && _react2.default.createElement(Trial_timer, null),
            _react2.default.createElement(Upgrade_link, null));

        });

        const Footer_item = ({ href, class_a, str_h2, str_p, str_msg }) => {
            const ref = useRef();
            const on_click = () => perr('be_ui_vpn_click_ext_promo', { type: class_a });
            return _react2.default.createElement(A, { ref: ref, href: href, className: class_a, onClick: on_click },
            _react2.default.createElement('div', { className: 'wrapper' },
            str_msg,
            _react2.default.createElement('i', { className: 'icon' })),

            _react2.default.createElement(Tooltip, { el: ref.current, title: str_h2 }, _react2.default.createElement('p', null, str_p)));

        };

        const Footer = memo(function Footer(props) {
            const { root_url, is_premium } = useContext(App_context);
            const is_mac = _util8.default.os_mac(),is_edge = _util8.default.browser() == 'edge';
            const items = [!is_edge && {
                href: 'https://play.google.com/store/apps/details?id=org.hola&' +
                'referrer=utm_source%3Dholaext',
                class_a: 'more-android',
                str_h2: 'Hola VPN on Android',
                str_p: 'Unblock any website or app' },
            !is_edge && {
                href: 'https://itunes.apple.com/il/app/hola-privacy-vpn/id903869356?' +
                'mt=8',
                class_a: 'more-ios',
                str_h2: 'Hola VPN on iOS',
                str_p: 'Unblock any website or app' },
            !is_mac && !is_edge && {
                href: 'https://hola.org/downloads',
                class_a: 'more-win',
                str_h2: 'Hola VPN on Windows',
                str_p: 'Unblock any website or app' },
            is_mac && !is_edge && {
                href: 'https://hola.org/downloads',
                class_a: 'more-mac',
                str_h2: 'Hola VPN on macOS',
                str_p: 'Unblock any website or app' },
            is_premium && !is_edge && {
                href: 'https://hola.org/accelerator?utm_source=holaext',
                class_a: 'more-va',
                str_h2: 'Accelerator',
                str_p: 'Stream videos faster' },
            !is_edge && {
                href: 'https://chrome.google.com/webstore/detail/hola-ad-remover/' +
                'lalfpjdbhpmnhfofkckdpkljeilmogfl',
                class_a: 'more-ab',
                str_h2: 'Ad remover',
                str_p: 'Block annoying ads, malware and tracking' },
            !is_premium && {
                href: _util4.default.plus_ref('ext_more_by_hola', { root_url }),
                class_a: 'more-premium',
                str_h2: 'Hola VPN PLUS',
                str_p: 'Try out Hola VPN PLUS',
                str_msg: 'Upgrade to' }].
            filter(item => !!item);
            if (!items.length)
            return null;
            const s = ['more-from-hola', is_premium && 'more-from-hola-premium'];
            return _react2.default.createElement('div', { id: 'footer', className: 'popup-container popup-footer' },
            _react2.default.createElement('div', { className: 'popup-footer-content' },
            _react2.default.createElement('div', { className: (0, _classnames2.default)(s) },
            _react2.default.createElement('div', { className: (0, _classnames2.default)('more-from-hola-items', { edge: is_edge }) },
            items.map(item => _react2.default.createElement(Footer_item, _extends({ key: item.class_a }, item)))))));




        });

        const Menu_products = memo(function Menu_products(props) {
            let { src_country } = useContext(App_context);
            let get_href = platform => {
                switch (platform) {

                    case 'ancroid':return `https://play.google.com/store/apps/details?` +
                        `id=org.hola.prem&referrer=utm_source%3Dholaext%26utm_content%3D` +
                        `${props.origin}-products`;
                    case 'ios':return `https://itunes.apple.com/us/app/hola-privacy-vpn-` +
                        `app-browser/id903869356?mt=8&ct=holaext-${props.origin}-products`;
                    default:return `https://hola.org/plus_setup?platform=${platform}&` +
                        `utm_source=holaext&utm_content=${props.origin}-products`;}

            };
            let links = [
            { platform: 'windows', title: 'Windows' },
            { platform: 'mac', title: 'macOS' },
            { platform: 'android', title: 'Android' },
            { platform: 'ios', title: 'iOS' },
            { platform: 'smarttv', title: 'Smart TV' },
            { platform: 'console', title: T('Consoles') }];

            src_country = src_country || '';
            return _react2.default.createElement('div', { className: 'products' },
            _react2.default.createElement(A, { href: 'https://hola.org/unblock/popular/' + src_country.toLowerCase(),
                className: 'more-sites' }, _react2.default.createElement(T, null, 'Unblock more sites...')),
            _react2.default.createElement('div', { className: 'list' },
            links.map(l => _react2.default.createElement(A, { key: l.platform, href: get_href(l.platform),
                title: l.title, className: 'item ' + l.platform }))));


        });

        const User_info = memo(function User_info(props) {
            let { user, is_premium, is_tpopup } = useContext(App_context);
            return _react2.default.createElement('div', { className: 'user-info-wrapper' },
            user ?
            _react2.default.createElement('div', { className: 'user-info', onClick: () => props.set_menu('account') },
            _react2.default.createElement('div', { className: 'user-status' },
            is_premium ? _react2.default.createElement(T, null, 'Hola VPN PLUS') : _react2.default.createElement(T, null, 'Hola Free VPN')),

            _react2.default.createElement('div', { className: 'user-name' },
            is_tpopup ? _react2.default.createElement(T, null, 'Your account') : user.display_name)) :


            _react2.default.createElement('a', { className: 'user_link user_link_login menu-button', id: 'sign_in',
                onClick: () => _ui_api2.default.login('menu') },
            _react2.default.createElement(T, null, 'Log in')));


        });

        const Incognito_modal = memo(function Incognito_modal({ on_close }) {
            useEffect(() => void perr('be_ui_incognito_modal_show'), []);
            const link_click = () => {
                perr('be_ui_incognito_modal_click');
                _ui_api2.default.open_ext_settings();
            };
            return _react2.default.createElement(_ui_lib2.default.Modal_view, { cls: 'incognito-modal', text_no: 'Cancel',
                text_yes: 'OK', on_yes: link_click, on_no: on_close },
            _react2.default.createElement('p', null, _react2.default.createElement(T, null, 'To use ', _react2.default.createElement('b', null, 'Hola VPN'), ' in incognito:')),
            _react2.default.createElement('ol', null,
            _react2.default.createElement('li', null, 'Open ', _react2.default.createElement('a', { onClick: link_click }, 'Extensions settings')),

            _react2.default.createElement('li', null, 'Enable ', _react2.default.createElement('b', null, 'Allow in incognito'))));


        });

        const set_body_size = ref => useLayoutEffect(() => {
            const el = ref.current;
            const height = el.clientHeight + el.getBoundingClientRect().top;
            if (document.body.clientHeight >= height)
            return;
            const prev = document.body.style.minHeight;
            document.body.style.minHeight = height + 'px';
            return () => document.body.style.minHeight = prev;
        }, []);

        const General_menu = memo(function General_menu(props) {
            let { user, is_premium, dev_mode, incognito_allowed } =
            useContext(App_context);
            let plus_try = _util4.default.plus_ref('holaext-menu-try', { utm_source:
                'holaext', utm_content: 'menu-try' });
            let protect = 'https://hola.org/plus_setup?platform=windows&utm_source=' +
            'holaext&utm_content=menu-protect';
            let install = 'https://hola.org/plus_setup?utm_source=holaext&' +
            'utm_content=menu-install';
            let show_incognito_item = _util8.default.browser() != 'firefox' &&
            !incognito_allowed;
            let on_debug = () => {
                _debug_ui2.default.render_debug_view();
                props.toggle_menu(false);
            };
            let ref = useRef();
            _ui_lib2.default.on_outside_click(ref, () => props.toggle_menu(false));
            set_body_size(ref);
            return _react2.default.createElement('div', { ref: ref, style: { display: 'block' },
                className: (0, _classnames2.default)('modal-menu-general', { 'user-signed': !!user }) },
            _react2.default.createElement(User_info, { set_menu: props.set_menu }),
            _react2.default.createElement('ul', { className: 'menu-items' },
            is_premium && _react2.default.createElement(Fragment, null,
            _react2.default.createElement('li', { className: 'menu-item-protect menu-item' },
            _react2.default.createElement(A, { href: protect }, _react2.default.createElement(T, null, 'Protect entire PC'))),

            _react2.default.createElement('li', { className: 'menu-item-install menu-item' },
            _react2.default.createElement(A, { href: install }, _react2.default.createElement(T, null, 'Install on other devices'))),

            _react2.default.createElement('li', { className: 'menu-item-divider menu-item' })),

            _util8.default.browser() != 'edge' &&
            _react2.default.createElement('li', { className: 'l_menuitem_lang menu-item-lang menu-item' },
            _react2.default.createElement('a', { onClick: () => props.set_menu('lang') },
            _react2.default.createElement(T, null, 'Language'),
            _react2.default.createElement('span', { className: 'lang_dropdown_code' },
            _ui_api2.default.get_locale().toUpperCase()))),



            _react2.default.createElement('li', { className: 'menu-item menu-item-settings' },
            _react2.default.createElement('a', { onClick: _ui_api2.default.open_settings }, _react2.default.createElement(T, null, 'Settings'))),

            _react2.default.createElement('li', { className: 'menu-item-help menu-item' },
            _react2.default.createElement(A, { className: 'user_link', href: 'https://hola.org/faq' }, _react2.default.createElement(T, null, 'Help'))),

            _react2.default.createElement('li', { className: 'menu-item-about menu-item' },
            _react2.default.createElement('a', { onClick: _ui_api2.default.open_about }, _react2.default.createElement(T, null, 'About'))),

            dev_mode && _react2.default.createElement('li', { className: 'menu-item-debug menu-item' },
            _react2.default.createElement('a', { onClick: on_debug }, _react2.default.createElement(T, null, 'Debug'))),

            show_incognito_item && _react2.default.createElement('li', { className: 'menu-item-incognito menu-item' },
            _react2.default.createElement('a', { onClick: props.on_incognito }, _react2.default.createElement(T, null, 'Incognito Mode'))),

            !is_premium && _react2.default.createElement('li', { className: 'menu-item-premium menu-item' },
            _react2.default.createElement(A, { href: plus_try }, _react2.default.createElement(T, null, 'Try Hola VPN PLUS'))),

            _react2.default.createElement('li', { className: 'menu-item-issue menu-item' },
            _react2.default.createElement('a', { onClick: _ui_api2.default.open_report_problem }, _react2.default.createElement(T, null, 'Report a problem')))),


            _react2.default.createElement(Menu_products, { origin: 'menu' }));

        });

        const Account_menu = memo(function Account_menu(props) {
            let { user, is_premium, is_tpopup } = useContext(App_context);
            let plus_upgrade = _util4.default.plus_ref('holaext-menu-account-upgrade',
            { utm_source: 'holaext', utm_content: 'menu-account-upgrade' });
            let plus_try = _util4.default.plus_ref('holaext-menu-account-try',
            { utm_source: 'holaext', utm_content: 'menu-account-try' });
            let cp_url = 'https://hola.org/cp?utm_source=holaext&utm_content=' +
            'menu-account-manage';
            let logout_click = () => {
                _ui_api2.default.logout();
                props.toggle_menu(false);
            };
            let ref = useRef();
            _ui_lib2.default.on_outside_click(ref, () => props.toggle_menu(false));
            set_body_size(ref);
            return _react2.default.createElement('div', { ref: ref, style: { display: 'block' },
                className: 'modal-menu-account' },
            _react2.default.createElement('div', { className: 'header' }, _react2.default.createElement(T, null, 'My account')),
            _react2.default.createElement('div', { className: 'info' },
            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'Account type:')),
            _react2.default.createElement('div', { className: 'value' },
            is_premium ? _react2.default.createElement(T, null, 'PLUS') : _react2.default.createElement(T, null, 'Free'),
            !is_premium ?
            _react2.default.createElement(A, { href: plus_upgrade, className: 'upgrade' }, _react2.default.createElement(T, null, 'Upgrade')) :
            _react2.default.createElement(A, { href: cp_url, className: 'manage' }, _react2.default.createElement(T, null, 'Manage'))),

            !is_tpopup && _react2.default.createElement(Fragment, null,
            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'User:')),
            _react2.default.createElement('div', { className: 'value ellipsis' }, user && user.email))),


            is_premium && _react2.default.createElement(Menu_products, { origin: 'menu-account' }),
            _react2.default.createElement('div', { className: 'log-out' },
            _react2.default.createElement('button', { className: 'menu-button', onClick: logout_click },
            _react2.default.createElement(T, null, 'Log out'))),


            !is_premium &&
            _react2.default.createElement('div', { className: 'try-premium' },
            _react2.default.createElement(A, { href: plus_try }, _react2.default.createElement(T, null, 'Try Hola VPN PLUS'))));


        });

        const Lang_menu = memo(function Lang_menu(props) {
            const ref = useRef();
            _ui_lib2.default.on_outside_click(ref, () => props.toggle_menu(false));
            const more_click = () => {
                _ui_api2.default.open_page('https://hola.org/translate?utm_source=holaext#more');
                props.toggle_menu(false);
            };
            const locale_click = l => {
                _ui_api2.default.set_locale(l);
                props.toggle_menu(false);
            };
            const locale = _ui_api2.default.get_locale();
            const locales = ['en', ..._ui_api2.default.get_locales()];
            return _react2.default.createElement('div', { ref: ref, className: 'l_ui_obj_lang_list' },
            _react2.default.createElement('div', { className: 'dropdown open' },
            _react2.default.createElement('ul', { className: 'dropdown-menu' },
            locales.map(l =>
            _react2.default.createElement('li', { key: l, className: (0, _classnames2.default)({ selected: l == locale }) },
            _react2.default.createElement('a', { onClick: () => locale_click(l) }, _react2.default.createElement(T, null, 'locale_en_' + l)))),

            _react2.default.createElement('li', null, _react2.default.createElement('a', { onClick: more_click }, _react2.default.createElement(T, null, 'More...'))))));



        });

        const Menu = memo(function Menu(props) {
            let [menu, set_menu] = useState('general');
            return _react2.default.createElement('div', { className: 'menu-container' },
            menu == 'account' && _react2.default.createElement(Account_menu, { toggle_menu: props.toggle_menu }),
            menu == 'general' && _react2.default.createElement(General_menu, { toggle_menu: props.toggle_menu,
                set_menu: set_menu, on_incognito: props.on_incognito }),
            menu == 'lang' && _react2.default.createElement(Lang_menu, { toggle_menu: props.toggle_menu }));

        });

        const Turned_off = memo(function Turned_off(props) {
            return _react2.default.createElement('div', { className: 'popup-disabled' },
            _react2.default.createElement('h1', null, _react2.default.createElement(T, null, 'Hola is off')),
            _react2.default.createElement('i', { className: 'popup-disabled-icon',
                onClick: () => _ui_api2.default.set_enabled(true) }),
            _react2.default.createElement('h2', null, _react2.default.createElement(T, null, 'Click to turn it on')));

        });

        const Vpn_title = memo(function Vpn_title(props) {
            const { rule, is_mitm_site } = useContext(App_context);
            const site = _react2.default.createElement('span', { className: 'ellipsis' }, props.site);
            const browser_name = _string2.default.capitalize(_util8.default.browser());
            let text;
            if (rule)
            {
                if (rule.mitm)
                text = _react2.default.createElement(T, null, site, ' unblocked!');else
                if (rule.protect == 'pc')
                text = _react2.default.createElement(T, null, 'Your PC is protected!');else
                if (rule.protect == 'browser')
                text = _react2.default.createElement(T, null, _react2.default.createElement('span', null, browser_name), ' browser protected!');else
                if (rule.protect == 'site')
                text = props.site ? _react2.default.createElement(T, null, site, ' protected!') : _react2.default.createElement(T, null, 'Protected!');else

                text = props.site ? _react2.default.createElement(T, null, site, ' country is:') : _react2.default.createElement(T, null, 'Country is:');
            } else
            if (is_mitm_site)
            text = _react2.default.createElement(T, null, 'Unblock ', site, '?');else

            text = _react2.default.createElement(T, null, 'Change ', site, ' country to:');
            return _react2.default.createElement('div', { className: 'popup-hover-title flex' },
            _react2.default.createElement('div', { className: 'popup-enabled-title' },
            _react2.default.createElement('h2', { className: 'popup-title' },
            _react2.default.createElement('span', { className: 'popup-title-container' },
            _react2.default.createElement('span', { className: 'popup-title-text' }, text)))));




        });

        const Country_item = memo(function Country_item(props) {
            const item = props.item;
            const flag_cls = (0, _classnames2.default)(['ui_lock_container', 'flag',
            item.disable && 'flag_disable' || item.mitm && 'flag_unblock' ||
            item.default_protect && 'flag_protect' ||
            item.country && item.country.toLowerCase()]);
            const on_click = (event, info) => {
                event.stopPropagation();
                props.on_click(info);
            };
            return _react2.default.createElement('li', { className: 'country', style: props.style },
            _react2.default.createElement('a', { className: 'f32 ui_lock_parent', onClick: e => on_click(e, item) },
            _react2.default.createElement('span', { className: flag_cls }),
            _react2.default.createElement('span', { className: 'flag_name', title: item.name }, item.name)));


        });

        const Countries_dropdown = memo(function Countries_dropdown(props) {
            let { is_premium, rule, is_mitm_ui_enabled } = useContext(App_context);
            let [is_open, set_open] = useState(false);
            useEffect(() => set_open(true));
            _ui_lib2.default.use_body_class('gray-cover-opened', true);
            let ref = useRef();
            _ui_lib2.default.on_outside_click(ref, () => props.toggle(false));
            let map_country = c => ({ country: c, name: T(c.toUpperCase()) });
            let pop = props.pop_countries.map(map_country);
            let all = _ui_api2.default.get_all_countries(rule && rule.protect).
            map(map_country).
            sort((a, b) => a.name.localeCompare(b.name));
            let stop = rule ? [{ name: T('Stop VPN'), disable: true }, { divider: true }] :
            [];
            let protect = is_premium ?
            [{ name: T('Protect'), country: 'us', default_protect: true }] : [];
            let mitm = is_mitm_ui_enabled ? [{ name: T('Unblock'), mitm: true }] : [];
            let items = [
            { spacer: true },
            ...stop,
            ...protect,
            ...pop,
            { divider: true },
            ...all,
            ...mitm,
            { spacer: true }];

            const render_item = ({ index, style }) => {
                if (items[index].spacer)
                return _react2.default.createElement('div', { style: style });
                style = _extends({}, style, { left: '8px', right: '8px', width: 'auto' });
                return items[index].divider ?
                _react2.default.createElement('li', { key: index, className: 'divider', style: style }) :
                _react2.default.createElement(Country_item, { key: index, on_click: props.on_unblock,
                    item: items[index], style: style });
            };
            const cls = (0, _classnames2.default)('dropdown-menu country-selection react-ui',
            { 'dropdown-menu-open': is_open });
            return _reactDom2.default.createPortal(_react2.default.createElement('div', { ref: ref, className: cls,
                onClick: e => e.stopPropagation() },
            _react2.default.createElement('ul', { role: 'menu' },
            _react2.default.createElement(_reactTinyVirtualList2.default, { width: '100%', height: 235, itemCount: items.length,
                itemSize: i => items[i].divider ? 7 : items[i].spacer ? 5 : 32,
                renderItem: render_item }))),

            document.querySelector('.react-root'));
        });

        const Vpn_work_buttons = memo(function Vpn_work_buttons(props) {
            const { src_country } = useContext(App_context);
            const click_yes = () => (0, _etask2.default)(function* () {
                set_click_no_count(0);
                yield _ui_api2.default.click_working({ src: 'ui' });
                props.click_yes();
            });
            const click_no = () => {
                let count = click_no_count + 1;
                set_click_no_count(count);
                _ui_api2.default.click_not_working({ count, src: 'ui', src_country });
            };
            const [click_no_count, set_click_no_count] = useState(0);
            let show_report_link = click_no_count > 0;
            return _react2.default.createElement(Fragment, null,
            _react2.default.createElement('h3', { className: 'popup-more-title' },
            _react2.default.createElement('span', { className: 'popup-more-title-text' }, _react2.default.createElement(T, null, 'Did it work?')),
            show_report_link && _react2.default.createElement('button', { className: 'popup-more-report',
                onClick: _ui_api2.default.open_report_problem },
            _react2.default.createElement(T, null, 'Report a problem'))),


            _react2.default.createElement('div', { className: 'popup-more-row' },
            _react2.default.createElement('button', { className: 'popup-button popup-button-yes', onClick: click_yes },
            _react2.default.createElement(T, null, 'Oh, yes!')),

            _react2.default.createElement('button', { className: 'popup-button popup-button-no', onClick: click_no },
            _react2.default.createElement(T, null, 'No, fix it'))));



        });

        const Bottom_buttons = memo(function Bottom_buttons(props) {
            const { is_premium, root_url } = useContext(App_context);
            const [yes_clicked, set_yes_clicked] = useState(false);
            const [rating, set_rating] = useState();
            const need_rating = _ui_api2.default.need_rating() && !rating;
            useEffect(() => {
                if (yes_clicked && !need_rating)
                {
                    let t = _util4.default.set_timeout(() => set_yes_clicked(false), 3000);
                    return () => _util4.default.clear_timeout(t);
                }
            }, [yes_clicked, need_rating]);
            if (!yes_clicked)
            return _react2.default.createElement(Vpn_work_buttons, { click_yes: () => set_yes_clicked(true) });
            if (need_rating)
            return _react2.default.createElement(_ui_lib2.default.Rate_us, { on_rated: r => set_rating(r) });
            const on_try_premium = () => _ui_api2.default.open_plus_page(root_url,
            _ui_api2.default.get_vpn_last_rating() == 5 ? 'ext_working' : 'ext_not_working');
            return _react2.default.createElement('div', { className: 'popup-rated-view' },
            !rating || rating == 5 ? _react2.default.createElement(T, null, 'Awesome!') : _react2.default.createElement(T, null, 'Thanks for your feedback'),
            !is_premium && _react2.default.createElement('button', { onClick: on_try_premium,
                className: 'popup-button popup-button-try' },
            _react2.default.createElement(T, null, 'Try Hola VPN PLUS')));


        });

        const Main_switch_tooltip = memo(function Main_switch_tooltip(props) {
            let { root_url, value, is_mitm, is_protect_pc, is_protect_browser,
                type, el } = props;
            let is_protect = type == 'protect';
            let country = _country2.default.code2label(props.country || '');
            let src_country = _country2.default.code2label(props.src_country || '');
            let flag_country = !is_mitm && !is_protect;
            let tooltip_opts = {
                el,
                position: 'bottom',
                icon_div_cls: flag_country ? 'fsvg_4x3' : 'f32',
                icon_cls: (0, _classnames2.default)('flag', props.country, {
                    'flag-country': flag_country,
                    'flag-unblock': is_mitm,
                    'flag-protect': is_protect }) };


            if (is_protect)
            {
                if (is_protect_pc)
                {
                    return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, {
                        title: _react2.default.createElement('span', null, 'All your PC traffic is secured') }),
                    _react2.default.createElement('p', null, 'Click to stop protecting your PC traffic'));

                }
                if (is_protect_browser)
                {
                    return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, {
                        title: _react2.default.createElement('span', null, 'All your browser traffic is secured') }),
                    _react2.default.createElement('p', null, 'Click to stop protecting your browser traffic'));

                }
                if (value)
                {
                    return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, {
                        title: _react2.default.createElement('span', null, 'Your connection with ', _react2.default.createElement('b', null, root_url), ' is secured') }),

                    _react2.default.createElement('p', null, 'Click to stop protecting your connection with ',
                    _react2.default.createElement('b', null, root_url)));

                }
                return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, {
                    title: _react2.default.createElement('span', null, 'Secure your connection') }),
                _react2.default.createElement('p', null, 'Click to encrypt and protect all your traffic with ',
                _react2.default.createElement('b', null, root_url)));

            }
            if (is_mitm)
            {
                if (value)
                {
                    return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, {
                        title: _react2.default.createElement('span', null, _react2.default.createElement('b', null, root_url), ' is unblocked') }),
                    _react2.default.createElement('p', null, 'Click to stop VPN and stop unblocking ', ' ',
                    _react2.default.createElement('b', null, root_url)));

                }
                return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, {
                    title: _react2.default.createElement('span', null, _react2.default.createElement('b', null, root_url), ' is blocked by your country') }),

                _react2.default.createElement('p', null, 'Click to start VPN for ', _react2.default.createElement('b', null, root_url), ' and unblock it'));

            }
            if (value)
            {
                return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, {
                    title: _react2.default.createElement('span', null, _react2.default.createElement('b', null, root_url), ' country is ', country) }),
                _react2.default.createElement('p', null, 'Click to stop VPN for ', _react2.default.createElement('b', null, root_url), ' and change country back to ',
                src_country));

            }
            return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, {
                title: _react2.default.createElement('span', null, 'Change country to ', country) }),
            _react2.default.createElement('p', null, 'Click to start VPN for ', _react2.default.createElement('b', null, root_url), ' and change country to ',
            country));

        });

        const Main_switch = memo(function Main_switch(props) {
            const ref = useRef();
            const [inside, set_inside] = useState(false);
            const on_click = () => {
                set_inside(true);
                if (props.onClick)
                props.onClick();
            };
            const { type = 'unblock', tooltip, value } = props;
            const cls = (0, _classnames2.default)({ [`${type}-switch`]: 1, active: value, inside });
            return _react2.default.createElement('div', { className: 'main-switch' },
            _react2.default.createElement('div', { ref: ref,
                className: cls,
                onClick: on_click,
                onMouseLeave: () => set_inside(false) },
            type == 'protect' ? T('Protect') : T('Unblock')),

            !!tooltip && _react2.default.createElement(Main_switch_tooltip, _extends({ el: ref.current }, props)));

        });

        const Unblock_protect = memo(function Unblock_protect({ root_url, on_unblock,
            pop_countries })
        {
            const protect_click = () => {
                perr('be_ui_click_protect', { value: !protect, country, is_mitm_site });
                if (protect)
                return on_unblock({ protect: false });
                if (!is_premium)
                return toggle_get_plus(true);
                on_unblock({ country, protect: 'site' });
            };
            const unblock_click = () => {
                perr('be_ui_click_unblock', { value: !rule, country, is_mitm_site });
                if (rule)
                return on_unblock({ disable: true });
                on_unblock(is_mitm_site ? { mitm: true } : { country });
            };
            const get_plus_no = () => toggle_get_plus(false);
            const get_plus_yes = () => {
                toggle_get_plus(false);
                _ui_api2.default.open_plus_page(root_url, 'ext_protect');
            };
            const { rule, src_country, is_mitm_site, is_premium, protect_ui } =
            useContext(App_context);
            const { protect } = rule || {};
            const [show_get_plus, toggle_get_plus] = useState(false);
            const country = (rule && rule.country || pop_countries[0] || '').
            toLowerCase();
            if (!country)
            return null;
            return _react2.default.createElement('div', { className: 'unblock-protect-view' },
            _react2.default.createElement(Main_switch, { root_url: root_url,
                tooltip: protect_ui.tooltips,
                onClick: unblock_click,
                value: !!rule,
                country: country,
                src_country: src_country,
                is_mitm: rule && rule.mitm || is_mitm_site }),
            _react2.default.createElement(Main_switch, { root_url: root_url,
                tooltip: protect_ui.tooltips,
                onClick: protect_click,
                value: !!protect,
                type: 'protect',
                is_protect_pc: protect == 'pc',
                is_protect_browser: protect == 'browser' }),
            show_get_plus && _react2.default.createElement(_ui_lib2.default.Modal_view, { signin: 'modal_get_plus',
                text_no: 'No, thanks!',
                text_yes: 'Get PLUS',
                on_yes: get_plus_yes,
                on_no: get_plus_no },
            _react2.default.createElement('div', null, 'Upgrade to ', _react2.default.createElement('b', null, 'PLUS'), ' for online security')));


        });

        const Protecting_item = memo(function Protecting_item({ img, on_click, checked,
            className, children })
        {
            const style = img ? { 'backgroundImage': img } : null;
            return _react2.default.createElement('label', { className: (0, _classnames2.default)('check', className) },
            _react2.default.createElement('input', { type: 'checkbox', checked: checked, onChange: on_click }),
            _react2.default.createElement('span', { className: 'cb_view' }),
            _react2.default.createElement('span', { className: 'logo', style: style }),
            _react2.default.createElement('span', { className: 'text' }, children));

        });

        const Protecting = memo(function Protecting({ url, root_url, on_unblock }) {
            const [show_modal, toggle_modal] = useState('');
            const { rule, protect_ui } = useContext(App_context);
            const { protect } = rule || {};
            const skip_url = _util4.default.is_skip_url(url);
            if (!protect || skip_url && !protect_ui.browser && !protect_ui.pc)
            return null;
            const browser = _util8.default.browser();
            const all_browser = protect == 'browser' || protect == 'pc';
            const pc_click = () => {
                if (!protect_ui.has_exe)
                {
                    perr('be_ui_vpn_needs_app');
                    return toggle_modal(true);
                }
                on_unblock({ protect: protect == 'pc' ? 'browser' : 'pc' });
            };
            return _react2.default.createElement('div', { className: 'protecting-view' },
            _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'Protecting:')),
            !skip_url && _react2.default.createElement(Protecting_item, {
                className: 'check-site',
                img: `url('http://favicon.yandex.net/favicon/${root_url}')`,
                on_click: () => on_unblock({ protect: protect ? false : 'site' }),
                checked: !!protect },
            root_url),

            protect_ui.browser && _react2.default.createElement(Protecting_item, {
                className: 'check-browser ' + browser,
                on_click: () => on_unblock({ protect: all_browser ? 'site' : 'browser' }),
                checked: all_browser },
            _react2.default.createElement(T, null, _react2.default.createElement('span', null, _string2.default.capitalize(browser)), ' browser')),

            protect_ui.pc && _react2.default.createElement(Protecting_item, {
                className: 'check-desktop',
                on_click: pc_click,
                checked: protect == 'pc' },
            _react2.default.createElement(T, null, 'All PC applicatons')),

            show_modal && _react2.default.createElement(_ui_lib2.default.Modal_view, { text_yes: 'Download',
                text_no: 'No, thanks!',
                on_yes: () => _ui_api2.default.open_page('https://hola.org/download'),
                on_no: () => toggle_modal(false) },
            _react2.default.createElement(T, null, 'For protecting PC applications you have to install ', _react2.default.createElement('b', null, 'Hola for Windows'))));



        });

        const Country_button = memo(function Country_button(props) {
            const { rule, className, show_lock, other, dropdown, show_plus_logo,
                error } = props;
            const ref = useRef();
            const mitm = props.mitm || rule && rule.mitm;
            const protect = rule && rule.protect && rule.default_protect;
            const country = props.country || rule && rule.country || '';
            const on_click = () => {
                if (rule || other)
                return void toggle_dropdown(true);
                on_unblock({ country: props.country, mitm: props.mitm });
            };
            const on_unblock = opt => {
                toggle_dropdown(false);
                if (!opt.disable)
                perr('be_ui_vpn_click_flag', opt);
                props.on_unblock(opt);
            };
            let flag = mitm ? 'flag_mitm' : protect ? 'flag_protect' :
            ['flag', other ? 'flag_other' : country.toLowerCase()];
            const [show_dropdown, toggle_dropdown] = useState(false);
            const cls = (0, _classnames2.default)('country_selection_opt', className, { error });
            return _react2.default.createElement(Fragment, null,
            _react2.default.createElement('span', { className: cls, ref: ref },
            _react2.default.createElement('span', { className: 'dropdown r_country_list r_country_list_dropdown' },
            _react2.default.createElement('span', { className: (0, _classnames2.default)('list_head btn',
                { hoverable: show_lock }) },
            _react2.default.createElement('span', { className: (0, _classnames2.default)({ hoverable: !show_lock }),
                onClick: on_click },
            _react2.default.createElement('span', { className: 'fsvg_4x3' },
            _react2.default.createElement('span', { className: (0, _classnames2.default)(flag, { show_plus_logo }) })),

            !mitm && !protect && _react2.default.createElement('div', { className: 'r_list_head_label' },
            _react2.default.createElement(T, null, other ? 'More...' : country.toUpperCase()))),


            dropdown && _react2.default.createElement('span', { onClick: () => toggle_dropdown(true),
                className: 'caret hoverable hoverable-x' }),
            show_lock && _react2.default.createElement('span', { className: 'caret' }))),


            show_dropdown && _react2.default.createElement(Countries_dropdown, { on_unblock: on_unblock,
                toggle: toggle_dropdown, pop_countries: props.pop_countries })),

            !!error && _react2.default.createElement(Error_tooltip, { el: ref.current, error: error }));

        });

        const Svg_circle = memo(function Svg_circle(props) {
            return _react2.default.createElement('svg', { width: '100%', height: '100%', viewBox: '0 0 200 200' },
            _react2.default.createElement('circle', _extends({ cx: '100', cy: '100', r: '80px', fill: 'none' }, props)));

        });

        const Loader = memo(function Loader(props) {
            const { busy } = useContext(App_context);
            const [finishing, set_finishing] = useState(false);
            const prev_busy = _ui_lib2.default.use_previous(busy);
            const need_finish = prev_busy && !busy;
            const show = busy || need_finish || finishing;
            useEffect(() => {
                if (!need_finish)
                return void set_finishing(false);
                set_finishing(true);
                const t = _util4.default.set_timeout(() => set_finishing(false), 2000);
                return () => _util4.default.clear_timeout(t);
            }, [busy]);
            _ui_lib2.default.use_body_class('is-popup-loading', show);
            const spinner = 'popup-loader-spinner';
            return _react2.default.createElement('div', { className: 'popup-status' },
            show && _react2.default.createElement('div', { className: 'popup-loader react-ui' },
            _react2.default.createElement('div', { className: (0, _classnames2.default)(spinner, 'popup-loader-back') },
            _react2.default.createElement(Svg_circle, { className: 'popup-loader-rail' })),

            finishing && _react2.default.createElement('div', { className: (0, _classnames2.default)(spinner,
                'popup-loader-finishing') },
            _react2.default.createElement(Svg_circle, { className: 'popup-loader-bubble' })),

            _react2.default.createElement('div', { className: (0, _classnames2.default)(spinner, 'popup-loader-fore') },
            _react2.default.createElement(Svg_circle, { className: 'popup-loader-spincircle' })),

            finishing && _react2.default.createElement('div', { className: (0, _classnames2.default)(spinner,
                'popup-loader-fore2') },
            _react2.default.createElement(Svg_circle, { className: 'popup-loader-spincircle' }))));



        });

        const Site_premium = memo(function Site_premium({ root_url }) {
            const id = root_url.replace(/\./g, '_');
            useEffect(() => {
                perr('be_uuid_site_premium_view', { root_url });
                perr('be_show_require_plus', { root_url });
                document.body.classList.add('site-premium-promote');
                return () => document.body.classList.remove('site-premium-promote');
            }, []);
            const on_click = () => {
                perr('uuid_site_premium_subscribe', { root_url });
                _ui_api2.default.open_require_plus(root_url);
            };
            return _react2.default.createElement('div', { className: (0, _classnames2.default)('site_premium intro_animation', id) },
            _react2.default.createElement('div', { className: 'top' },
            _react2.default.createElement('div', { className: 'image', onClick: on_click }),
            _react2.default.createElement('div', { className: 'titles' },
            _react2.default.createElement('div', { className: 'title', onClick: on_click }, root_url),
            _react2.default.createElement('div', { className: 'subtitle', onClick: on_click },
            _react2.default.createElement(T, null, 'Requires specialized servers'))),


            _react2.default.createElement('div', { className: 'try', onClick: on_click }, _react2.default.createElement(T, null, 'Subscribe to PLUS'))),

            _react2.default.createElement('div', { className: 'bottom' }));

        });

        const Stub_unblock = memo(function Stub_unblock() {
            const { is_premium, root_url } = useContext(App_context);
            if (is_premium || !_util8.default.is_google(root_url))
            return null;
            return _react2.default.createElement('div', { className: 'stub-unblock' }, 'To change IP for ',
            _react2.default.createElement('b', null, root_url), ', upgrade to ',
            _react2.default.createElement(A, { href: _util4.default.plus_ref('stub_unblock', { root_url }) }, 'PLUS'));

        });

        const Unblocker = memo(function Unblocker(props) {
            const on_unblock = opt => {
                if (need_premium)
                return void props.toggle_site_premium(root_url);
                _ui_api2.default.unblock_action(_extends({ url, redirects }, opt));
            };
            const ctx = useContext(App_context);
            const { is_premium, is_mitm_site, rule, is_tpopup, src_country } = ctx;
            let { root_url, url, redirects } = ctx;
            let is_redirect;
            if (!rule && redirects && redirects.length)
            {
                root_url = _util6.default.get_root_url(redirects[0]);
                url = redirects[0];
                is_redirect = true;
            }
            const vpn_only = !!(rule && rule.protect);
            const pop = _ui_lib2.default.use_etask(() =>
            _ui_api2.default.get_popular_countries({ root_url, src_country, vpn_only }),
            _ui_api2.default.get_default_countries({ root_url, src_country, vpn_only }),
            [root_url, src_country, vpn_only]);
            const need_premium = _ui_lib2.default.use_etask(() =>
            _ui_api2.default.get_force_premium_rule(root_url), false, [root_url]) &&
            !is_premium;
            const proxy_error = _util8.default.proxy_error_ui_enabled('popup') && !ctx.busy &&
            ctx.proxy_error;
            useEffect(() => {
                if (is_redirect)
                perr('be_ui_redirect', { chain: redirects });
            }, [is_redirect]);
            useEffect(() => {
                if (proxy_error)
                perr('be_ui_proxy_error', { root_url, rule, proxy_error });
            }, [proxy_error]);
            _ui_lib2.default.use_body_class('is-popup-disabled', !rule);
            _ui_lib2.default.use_body_class('is-popup-enable-view', !!rule);
            _ui_lib2.default.use_body_class('is-protect', rule && !!rule.protect);
            return _react2.default.createElement(Fragment, null,
            _react2.default.createElement(Unblock_protect, { root_url: root_url, on_unblock: on_unblock,
                pop_countries: pop }),
            _react2.default.createElement('div', { className: (0, _classnames2.default)('popup-enabled', { 'popup-multiselect':
                    !rule }) },
            _react2.default.createElement('div', { className: 'popup-enabled-content' },
            _react2.default.createElement(Vpn_title, { site: root_url }),
            _react2.default.createElement('div', { className: 'country_selected react-ui' },
            rule && _react2.default.createElement(Country_button, { on_unblock: on_unblock,
                pop_countries: pop,
                rule: rule,
                dropdown: true,
                error: proxy_error }),
            !rule && is_mitm_site && _react2.default.createElement(Country_button, { on_unblock: on_unblock,
                className: 'country_selection_center',
                pop_countries: pop,
                mitm: true,
                dropdown: true }),
            !rule && !is_mitm_site && is_tpopup && !!pop.length &&
            _react2.default.createElement(Country_button, { country: pop[0],
                pop_countries: pop,
                show_lock: true,
                show_plus_logo: need_premium,
                on_unblock: on_unblock }),
            !rule && !is_mitm_site && !is_tpopup && !!pop.length && _react2.default.createElement(Fragment, null,
            _react2.default.createElement(Country_button, { className: 'country_selection_left',
                pop_countries: pop,
                country: pop[1],
                on_unblock: on_unblock }),
            _react2.default.createElement(Country_button, { className: 'country_selection_center',
                pop_countries: pop,
                country: pop[0],
                show_plus_logo: need_premium,
                on_unblock: on_unblock,
                dropdown: true }),
            _react2.default.createElement(Country_button, { className: 'country_selection_right',
                pop_countries: pop,
                on_unblock: on_unblock,
                other: true,
                dropdown: true })))),



            rule && rule.protect && _react2.default.createElement(Protecting, {
                url: url, root_url: root_url, on_unblock: on_unblock }),
            rule && _react2.default.createElement(Stub_unblock, null),
            rule && _react2.default.createElement('div', { className: 'popup-more' }, _react2.default.createElement(Bottom_buttons, null))));


        });

        const Popular_item = memo(function Popular_item({ root_url, is_ps, on_click }) {
            const [img_state, set_img_state] = useState('loading');
            const on_load = () => set_img_state('ready');
            const on_error = () => set_img_state('error');
            const cls = (0, _classnames2.default)('popup-popular-item', is_ps ? 'premium-site' :
            'free-site');
            const cls_i = (0, _classnames2.default)('site-icon', 'icon-' + root_url.replace(/\./g, '-'),
            { 'icon-error': img_state == 'error' });
            return _react2.default.createElement('div', { title: root_url, className: cls,
                onClick: () => on_click(root_url) },
            _react2.default.createElement('i', { className: cls_i },
            _react2.default.createElement('img', { className: 'popup-popular-item-icon',
                style: { display: img_state != 'ready' && 'none' },
                onLoad: on_load, onError: on_error,
                src: _url2.default.add_proto(root_url) + '/favicon.ico' })),

            _react2.default.createElement('span', { className: 'popup-popular-item-name' }, root_url));

        });

        const Popular = memo(function Popular(props) {
            const { src_country, root_url, url } = useContext(App_context);
            const on_focus = () => perr('be_ui_popular_input_focus', { root_url, url });
            const on_redirect = search => {
                perr('be_ui_popular_click_go', { root_url, url, search });
                _ui_api2.default.search_popular(search);
            };
            const on_click = site_root_url => (0, _etask2.default)(function* () {
                if (yield _ui_api2.default.get_force_premium_rule(site_root_url))
                props.toggle_site_premium(site_root_url);else

                _ui_api2.default.open_popular({ root_url: site_root_url, src_country });
            });
            useEffect(() => void perr('be_ui_popular_view', { root_url, url }), []);
            const data = _ui_lib2.default.use_etask(() => _ui_api2.default.get_popular_sites(),
            { list: [], top_urls: [] });
            const href = 'https://hola.org/unblock/popular' + (
            src_country ? '/' + src_country : '') + '?utm_source=holaext';
            return _react2.default.createElement('div', { className: 'popular-view' },
            _react2.default.createElement(_common_ui2.default.Search_field, { on_focus: on_focus, on_redirect: on_redirect,
                top_urls: data.top_urls }),
            _react2.default.createElement('div', { className: 'popup-popular-list' },
            data.list.map(p =>
            _react2.default.createElement(Popular_item, _extends({ key: p.root_url, on_click: on_click }, p)))),

            _react2.default.createElement('div', { className: 'popular-view-footer' },
            _react2.default.createElement(A, { href: href }, _react2.default.createElement(T, null, 'More sites in your country...'))));


        });

        const Conflict_msg = memo(function Conflict_msg(props) {
            useEffect(() => void perr_err('be_render_ext_conflict'));
            const on_click = () => _ui_api2.default.open_page('chrome://extensions/');
            return _react2.default.createElement('div', { className: 'popup-error' },
            _react2.default.createElement('h2', { className: 'popup-title popup-error-title' },
            _react2.default.createElement(T, null, 'Hola cannot work because another extension is controlling your proxy settings.')),


            _react2.default.createElement('div', { className: 'popup-error-text' },
            _react2.default.createElement(T, null, 'Please disable other ', _react2.default.createElement('a', { onClick: on_click }, 'extensions'), ' that you think might control your proxy settings such as ad-blockers, other VPN services, etc.')));




        });

        const Content = memo(function Content() {
            const { inited, enabled, url, rule, ext_conflict } = useContext(App_context);
            const [premium_root_url, toggle_site_premium] = useState('');
            let inner, show_loader;
            if (!inited)
            inner = null;else
            if (ext_conflict)
            inner = _react2.default.createElement(Conflict_msg, null);else
            if (!enabled)
            {
                inner = _react2.default.createElement(Turned_off, null);
                show_loader = true;
            } else
            if (premium_root_url)
            inner = _react2.default.createElement(Site_premium, { root_url: premium_root_url });else
            if (_util4.default.is_skip_url(url) && !rule && !_ui_api2.default.allow_skip_url())
            inner = _react2.default.createElement(Popular, { toggle_site_premium: toggle_site_premium });else

            {
                inner = _react2.default.createElement(Unblocker, { toggle_site_premium: toggle_site_premium });
                show_loader = true;
            }
            return _react2.default.createElement(Fragment, null,
            show_loader && _react2.default.createElement(Loader, null),
            _react2.default.createElement('div', { className: 'be_ui_popup' },
            _react2.default.createElement('div', { id: 'popup', className: 'popup-container popup-content' },
            inner)));



        });

        const Privacy = memo(function Privacy(props) {
            const ref = useRef();
            useLayoutEffect(() => {
                const container = ref.current.parentNode;
                container.classList.add('privacy_view_container');
                return () => container.classList.remove('privacy_view_container');
            });
            return _react2.default.createElement('div', { ref: ref, className: 'privacy_view_root' },
            _react2.default.createElement(_privacy2.default.Privacy_view, null));

        });

        let tpopup_perr_sent = false,displayed = false,ready_sent = false;
        E.Vpn_ui = memo(function Vpn_ui(props) {
            const { is_tpopup, root_url, url, agree_ts, error, set_error, dev_mode,
                inited } = useContext(App_context);
            const [is_menu_open, set_menu_open] = useState(false);
            const [show_incognito_modal, toggle_incognito_modal] = useState(false);
            useEffect(() => {
                if (is_tpopup && root_url && !tpopup_perr_sent)
                {
                    perr('be_tpopup_open', { root_url, url });
                    tpopup_perr_sent = true;
                }
            }, [root_url]);
            useEffect(() => {
                if (!displayed && !is_tpopup)
                {
                    perr('be_ui_display_ext_vpn');
                    displayed = true;
                }
                _ui_api2.default.init_monitor_active();
                return () => _ui_api2.default.uninit_monitor_active();
            }, []);
            useEffect(() => {
                if (!inited || ready_sent)
                return;
                if (performance.mark)
                performance.mark('ui_ready');
                perr('be_ui_vpn_ready', _ui_api2.default.get_timings());
                ready_sent = true;
            }, [inited]);
            useLayoutEffect(() => {
                if (!_util4.default.is_tpopup())
                return;
                const on_body_click = () => _ui_api2.default.tpopup_close_click('ext_click');
                _ui_api2.default.on('body_click', on_body_click);
                return () => _ui_api2.default.off('body_click', on_body_click);
            }, []);
            const toggle_menu = val =>
            set_menu_open(val !== undefined ? val : !is_menu_open);
            const on_incognito = () => {
                toggle_menu(false);
                toggle_incognito_modal(true);
            };
            return !agree_ts ? _react2.default.createElement(Privacy, null) : _react2.default.createElement(_reactFlipToolkit.Flipped, { flipId: 'modal_flip' },
            _react2.default.createElement('div', { className: 'vpn-ui' },
            _react2.default.createElement(Header, { toggle_menu: toggle_menu, is_menu_open: is_menu_open }),
            _react2.default.createElement(Content, null),
            !!error && _react2.default.createElement(_ui_lib2.default.Alert_error, { on_close: () => set_error(false) }),
            !is_tpopup && _react2.default.createElement(Footer, null),
            dev_mode && !is_tpopup && _react2.default.createElement(_debug_ui2.default.Debug_ui, null),
            is_menu_open && _react2.default.createElement(Menu, { on_incognito: on_incognito,
                toggle_menu: toggle_menu }),
            show_incognito_modal && _react2.default.createElement(Incognito_modal, {
                on_close: () => toggle_incognito_modal(false) })));


        });exports.default =

        E;});})();
//# sourceMappingURL=ui_react.js.map
