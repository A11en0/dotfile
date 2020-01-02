// LICENSE_CODE ZON
;(function () {
  'use strict'; define(['exports', 'react', 'react-dom', 'classnames', '/util/url.js', '/util/etask.js', '/bext/vpn/ui/ui_lib.js', '/bext/vpn/ui/ui_api.js', '/bext/vpn/util/util.js'], function (exports, _react, _reactDom, _classnames, _url, _etask, _ui_lib, _ui_api, _util) {Object.defineProperty(exports, "__esModule", { value: true });exports.init_api = exports.Report_problem_modal = exports.Legal_section = exports.Modal = exports.Label_line = exports.Section = exports.Page_layout = undefined;var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _classnames2 = _interopRequireDefault(_classnames);var _url2 = _interopRequireDefault(_url);var _etask2 = _interopRequireDefault(_etask);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _ui_api2 = _interopRequireDefault(_ui_api);var _util2 = _interopRequireDefault(_util);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}








    const { useState, useEffect } = _react2.default;
    const T = _ui_lib2.default.T;

    const Header = props => {
      let logo_url = 'https://hola.org?utm_source=holaext&utm_content=settings';
      let cp_url = 'https://hola.org/cp?utm_source=holaext&utm_content=settings';
      let login_url =
      'https://hola.org/signin?utm_source=holaext&utm_content=settings';
      let upgrade_url = _util2.default.plus_ref('ext_settings_upgrade');
      let logo_cls = 'logo ' + (props.is_plus ? 'logo-plus' : 'logo-free');
      return (
        _react2.default.createElement('div', { className: 'header' },
        _react2.default.createElement('a', { className: logo_cls, target: '_blank', rel: 'noopener noreferrer',
          href: logo_url }),
        _react2.default.createElement('div', { className: 'title' }, props.title),
        !props.is_plus &&
        _react2.default.createElement('div', { className: 'upgrade-btn' },
        _react2.default.createElement('a', { target: '_blank', rel: 'noopener noreferrer',
          href: upgrade_url }, _react2.default.createElement(T, null, 'Upgrade to'))),

        props.user &&
        _react2.default.createElement('a', { className: 'user-name', target: '_blank', rel: 'noopener noreferrer',
          href: cp_url }, props.user.displayName),
        !props.user &&
        _react2.default.createElement('a', { className: 'login-btn', target: '_blank', rel: 'noopener noreferrer',
          href: login_url }, 'Sign in')));


    };

    const Page_layout = exports.Page_layout = ({ user, is_plus, title, cls, children }) =>
    _react2.default.createElement('div', { className: (0, _classnames2.default)('page-layout', cls) },
    _react2.default.createElement(Header, { user: user, is_plus: is_plus, title: title }),
    _react2.default.createElement('div', { className: 'content' }, children));


    const Section = exports.Section = props =>
    _react2.default.createElement('div', { className: (0, _classnames2.default)('section', props.cls) },
    _react2.default.createElement('div', { className: 'title', onClick: props.on_click }, props.title),
    _react2.default.createElement('div', { className: 'card' }, props.children));


    const Label_line = exports.Label_line = props => _react2.default.createElement('label', { className: 'label-line' },
    props.label && _react2.default.createElement('div', { className: 'label-line-label' }, props.label),
    _react2.default.createElement('div', { className: 'label-line-children' }, props.children));


    const Modal = exports.Modal = ({ action, title, on_close, children, className }) => {
      return _reactDom2.default.createPortal(_react2.default.createElement('div', { className: 'page-layout' },
      _react2.default.createElement('div', { className: (0, _classnames2.default)('page-modal', className) },
      _react2.default.createElement('div', { className: 'page-modal-body' },
      _react2.default.createElement('div', { className: 'page-modal-title' },
      _react2.default.createElement('h3', null, title),
      _react2.default.createElement('div', { className: 'icon-remove', title: T('Close'),
        onClick: on_close })),

      _react2.default.createElement('div', { className: 'page-modal-content' }, children),
      action && _react2.default.createElement('div', { className: 'page-modal-actions' }, action)))),


      document.body);
    };

    const Legal_section = exports.Legal_section = props => _react2.default.createElement(Section, { title: T('Legal') },
    _react2.default.createElement(Label_line, { label: T('Privacy Policy') },
    _react2.default.createElement('a', { href: 'https://hola.org/legal/privacy' }, 'https://hola.org/legal/privacy')),



    _react2.default.createElement(Label_line, { label: T('End User License') },
    _react2.default.createElement('a', { href: 'https://hola.org/legal/sla' }, 'https://hola.org/legal/sla')),



    props.children);


    const Report_problem_modal = exports.Report_problem_modal = ({ url, init_subj, close_cb }) => {
      useEffect(() => void _ui_api2.default.perr_err('be_report_problem', { perr: 1 },
      { with_log: true, rate_limit: { count: 1 } }), []);
      const [valid_email, set_valid_email] = useState(true);
      const [email, set_email] = useState('');
      const [subj, set_subj] = useState(init_subj || '');
      const [desc, set_desc] = useState('');
      const verify_email = () =>
      set_valid_email(_url2.default.is_valid_email(email));
      const on_change = setter => ev => setter(ev.target.value);
      const send_click = () => {
        _ui_api2.default.send_issue_report({ email, subj, desc, url });
        close_cb();
      };
      const send_report = _react2.default.createElement('a', { className: 'send-report-btn', onClick: send_click },
      _react2.default.createElement(T, null, 'Send'));
      return _react2.default.createElement(Modal, { title: T('Report a problem'), on_close: close_cb,
        action: send_report },
      _react2.default.createElement('div', { className: (0, _classnames2.default)('form-group', { 'has-error': !valid_email }) },
      _react2.default.createElement('input', { type: 'text', placeholder: 'Your e-mail', className: 'form-control',
        onBlur: verify_email, value: email, onChange: on_change(set_email) }),
      !valid_email &&
      _react2.default.createElement('span', { className: 'help-block' }, 'Please enter a valid email.')),

      _react2.default.createElement('div', { className: 'form-group' },
      _react2.default.createElement('input', { type: 'text', placeholder: 'Subject', className: 'form-control',
        value: subj, onChange: on_change(set_subj) })),

      _react2.default.createElement('div', { className: 'form-group' },
      _react2.default.createElement('textarea', { placeholder: 'Description', rows: '10',
        className: 'form-control', onChange: on_change(set_desc) })));


    };

    const init_api = exports.init_api = () => (0, _etask2.default)(function* () {
      window.addEventListener('unload', uninit);
      yield _ui_api2.default.init();
    });

    const uninit = () => _ui_api2.default.uninit();});})();
//# sourceMappingURL=page_lib.js.map
