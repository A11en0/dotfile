// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'zon_config', '/bext/pub/backbone.js', '/bext/vpn/bg/info.js', '/bext/vpn/bg/tabs.js', '/svc/vpn/pub/util.js', '/bext/pub/ext.js', '/bext/vpn/bg/util.js', '/util/etask.js', '/util/util.js'], function (exports, _zon_config, _backbone, _info, _tabs, _util, _ext, _util3, _etask, _util5) {Object.defineProperty(exports, "__esModule", { value: true });var _zon_config2 = _interopRequireDefault(_zon_config);var _backbone2 = _interopRequireDefault(_backbone);var _info2 = _interopRequireDefault(_info);var _tabs2 = _interopRequireDefault(_tabs);var _util2 = _interopRequireDefault(_util);var _ext2 = _interopRequireDefault(_ext);var _util4 = _interopRequireDefault(_util3);var _etask2 = _interopRequireDefault(_etask);var _util6 = _interopRequireDefault(_util5);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}










        const chrome = window.chrome;
        const E = new (_backbone2.default.task_model.extend({ model_name: 'dev_mode' }))();

        const force_tpopup = type => {
            var tab_url = _tabs2.default.get('active.url');
            var tab_id = _tabs2.default.get('active.id');
            if (!tab_url || !tab_id)
            return;
            var domain = _util2.default.get_root_url(tab_url);
            _info2.default.set_force_tpopup(domain, type);
            if (type == 'suggestion')
            _tabs2.default.set_force_suggestion(tab_id, true);
            chrome.tabs.reload(tab_id);
        };

        const on_change_mode = () => {
            _ext2.default.set('dev_mode', E.get('dev_mode'));
            _util2.default.enable_events_logging(E.get('dev_mode'));
            if (!chrome || !chrome.contextMenus)
            return;
            chrome.contextMenus.removeAll();
            if (!E.get('dev_mode'))
            return;
            chrome.contextMenus.create({
                id: 'hola-vpn-dev-tpopup',
                title: 'Show tpopup',
                contexts: ['browser_action'],
                onclick: () => {force_tpopup();} });

            chrome.contextMenus.create({
                id: 'hola-vpn-dev-mitm-popup',
                title: 'Show mitm popup',
                contexts: ['browser_action'],
                onclick: () => {force_tpopup('mitm_popup');} });

            chrome.contextMenus.create({
                id: 'hola-vpn-dev-watermark-popup',
                title: 'Show watermark popup',
                contexts: ['browser_action'],
                onclick: () => {force_tpopup('watermark');} });

            chrome.contextMenus.create({
                id: 'hola-vpn-dev-suggestion-popup',
                title: 'Force trial suggestion',
                contexts: ['browser_action'],
                onclick: () => {force_tpopup('suggestion');} });

        };

        function on_change(e) {
            _util4.default.storage_local_set({ dev_mode_conf: e.attributes });
            E.trigger('change:dev_mode');
        }

        E.enable = dev_mode => E.set('dev_mode', !!dev_mode);

        E.init = () => {
            E.on('change:dev_mode', on_change_mode);
            return (0, _etask2.default)(function* dev_mod_init() {
                let o = yield _util4.default.storage_local_get('dev_mode_conf');
                _util6.default.forEach(o, (name, val) => E.set(name, val));
                E.on('change', on_change);
            });
        };

        E.uninit = () => {
            E.off('change', on_change);
            E.off('change:dev_mode', on_change_mode);
        };exports.default =

        E;});})();
//# sourceMappingURL=dev_mode.js.map
