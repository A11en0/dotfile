// LICENSE_CODE ZON
;(function () {
  'use strict'; define(['exports', 'react', '/bext/vpn/ui/ui_api.js'], function (exports, _react, _ui_api) {Object.defineProperty(exports, "__esModule", { value: true });var _react2 = _interopRequireDefault(_react);var _ui_api2 = _interopRequireDefault(_ui_api);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}



    const E = {};

    E.Text = function Text() {
      return _react2.default.createElement('div', { className: 'privacy_text' },
      _react2.default.createElement('h3', null, 'What types of information do we collect?'),
      _react2.default.createElement('p', null, 'We collect the following types of data from you when you use the Services:'),

      _react2.default.createElement('ul', null,
      _react2.default.createElement('li', null, 'Log Data: Log data may include the following information- browser type, web pages you visit, time spent on those pages, access times and dates.'),




      _react2.default.createElement('li', null, 'Personal Information: Personal information is information that may be of a private or sensitive nature, and which identifies or may identify you. The Personal Information we may collect and retain includes your IP address, your name and email address, screen name, payment and billing information or other information we may ask from time to time as will be required for the on-boarding process and services provisioning. When you create an account on the Services you are able to do so by using your credentials with a designated third party website or service ("Third Party Account") such as Gmail\xAE. Doing so will enable you to link your account and your Third Party Account. If you choose this option, a Third Party Account pop-up box will appear that you will need to approve in order to proceed, and which will describe the types of information that we will obtain. This information includes your Personal Information stored on your Third Party Account, such as user-name, email address, profile picture, birth date, gender and preferences. Any Anonymous Information that is specifically connected or linked to any Personal Information, is treated by us as Personal Information, as long as such connection or linkage exists.'),





















      _react2.default.createElement('li', null, 'Registering through social network account: When you register or sign-in to the Services via your social network account (e.g., Facebook, Google+), we will have access to basic information from your social network account, such as your full name, home address, email address, birth date, profile picture, friends list, personal description, as well as any other information you made publicly available on such account or agreed to share with us. At all times, we will abide by the terms, conditions and restrictions of the social network platform.')),











      _react2.default.createElement('h3', null, 'How do we use your information?'),
      _react2.default.createElement('p', null, 'We use your information in order to provide you with the Service. This means that we will use the information to set up your account, provide you with support regarding the Service, communicate with you for updates, marketing offers or concerns you may have and conduct statistical and analytical research to improve the Service.'),






      _react2.default.createElement('h3', null, 'Information we share'),
      _react2.default.createElement('p', null, 'We do not rent or sell any Personal Information. We may disclose Personal Information to other trusted third party service providers or partners for the purposes of providing you with the Services, storage and analytics. We may also transfer or disclose Personal Information to our subsidiaries, affiliated companies.'),






      _react2.default.createElement('p', null, 'We may also share your Personal Information and other information in special cases if we have good reason to believe that it is necessary to: (1) comply with law, regulation, subpoena or court order; (2) detect, prevent or otherwise address fraud, security, violation of our policies or technical issues; (3) enforce the provisions of this Privacy Policy or any other agreements between you and us, including investigation of potential violations thereof; (4) protect against harm to the rights, property or safety of us, its partners, its affiliates, users, or the public.'),










      _react2.default.createElement('h3', null, 'Your Choices and Rights'),
      _react2.default.createElement('p', null, 'We strive to give you ways to update your information quickly or to delete it. To exercise such right, you may contact us at:',

      ' ',
      _react2.default.createElement('a', { href: 'mailto:privacy@hola.org' }, 'privacy@hola.org')),

      _react2.default.createElement('h3', null, 'Contact Us'),
      _react2.default.createElement('p', null, 'If you feel that your privacy was not treated in accordance with our Privacy Policy, or if you believe that your privacy has been compromised by any person in the course of using the Services, please contact Hola at: ',




      _react2.default.createElement('a', { href: 'mailto:privacy@hola.org' }, 'privacy@hola.org'), ' and our privacy officer shall promptly investigate.'));



    };

    E.title = 'Hola Firefox Add-on Privacy Policy';

    E.Privacy_view = function Privacy_view() {
      return _react2.default.createElement('div', null,
      _react2.default.createElement('header', null,
      _react2.default.createElement('h1', null, E.title)),

      _react2.default.createElement(E.Text, null),
      _react2.default.createElement('div', { className: 'actions' },
      _react2.default.createElement('button', { onClick: () => _ui_api2.default.set_agree_ts(Date.now()) }, 'I Agree')));


    };exports.default =

    E;});})();
//# sourceMappingURL=privacy.js.map
