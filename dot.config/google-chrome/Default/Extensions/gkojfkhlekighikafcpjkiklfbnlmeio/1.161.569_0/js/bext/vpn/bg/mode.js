// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', '/bext/pub/backbone.js', '/util/zerr.js', '/bext/vpn/bg/svc.js', '/bext/pub/lib.js', '/util/storage.js', '/util/date.js'], function (exports, _backbone, _zerr, _svc, _lib, _storage, _date) {Object.defineProperty(exports, "__esModule", { value: true });var _backbone2 = _interopRequireDefault(_backbone);var _zerr2 = _interopRequireDefault(_zerr);var _svc2 = _interopRequireDefault(_svc);var _lib2 = _interopRequireDefault(_lib);var _storage2 = _interopRequireDefault(_storage);var _date2 = _interopRequireDefault(_date);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}






        let be_bg_main = window.be_bg_main; 
        const E = new (_backbone2.default.task_model.extend({
            model_name: 'mode',
            _defaults: function () {this.on('destroy', () => E.uninit());} }))();


        function update_pending(new_mode, change) {
            var last_mode = _storage2.default.get('last_mode'),pending;
            if (new_mode == 'ext' && last_mode)
            pending = last_mode;
            if (pending == E.get('pending'))
            return;
            change.pending = pending;
            _zerr2.default.info('pending mode set to ' + pending);
        }

        let disconnections = [],ignore_svc;

        function maybe_ignore_svc() {
            if (_svc2.default.get('proxyjs_connected') || E.get('mode') != 'exe')
            return;
            disconnections.push((0, _date2.default)());
            disconnections = disconnections.slice(-2);
            if (disconnections.length == 2 &&
            Date.now() - disconnections[0] < _date2.default.ms.SEC * 10)
            {
                _zerr2.default.info('Too frequent disconnections - ignoring svc');
                ignore_svc = true;
            }
        }

        function is_svc_connected() {
            return _svc2.default.get('cid_js') && _svc2.default.get('session_key_cid_js') &&
            _svc2.default.get('proxyjs_connected');
        }

        function update_mode() {
            var new_mode = is_svc_connected() && !ignore_svc ? 'exe' : 'ext';
            var change = {},mode_changed;
            if (new_mode != E.get('mode'))
            mode_changed = true;
            maybe_ignore_svc();
            update_pending(new_mode, change);
            Object.assign(change, {
                mode: new_mode,
                is_svc: new_mode != 'ext',
                is_ext: new_mode == 'ext',
                'svc.detected': !!_svc2.default.get('version'),
                'svc.version': _svc2.default.get('version'),
                'svc.cid_js': _svc2.default.get('cid_js'),
                'svc.session_key_cid_js': _svc2.default.get('session_key_cid_js'),
                'svc.info': _svc2.default.get('info'),
                'svc.callback_raw': _svc2.default.get('callback_raw'),
                'svc.callback_ts': _svc2.default.get('callback_ts') });

            if (mode_changed)
            change.ts = Date.now();
            E.safe_set(change);
            be_bg_main.safe_set(change); 
            if (!mode_changed)
            return;
            if (new_mode != 'ext')
            _storage2.default.set('last_mode', new_mode);
            _zerr2.default.info('mode set to ' + new_mode);
            _lib2.default.perr_ok({ id: 'mode_change', info: {
                    new_mode: new_mode,
                    proxyjs_connected: _svc2.default.get('proxyjs_connected'),
                    cid_js: _svc2.default.get('cid_js'),
                    session_key_cid_js: _svc2.default.get('session_key_cid_js') } });

            E.set('mode_change_count', (E.get('mode_change_count') || 0) + 1);
        }

        E.init = () => {
            be_bg_main = window.be_bg_main; 
            E.listenTo(_svc2.default, 'all', update_mode);
            update_mode();
        };

        E.uninit = () => {
            E.stopListening();
            E.clear();
        };exports.default =

        E;});})();
//# sourceMappingURL=mode.js.map
