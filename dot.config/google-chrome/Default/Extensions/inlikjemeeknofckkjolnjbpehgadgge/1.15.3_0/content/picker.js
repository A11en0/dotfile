brwsr_def('picker', ['jquery', 'underscore', 'async', 'id', 'api', 'util', 'locator'],
  function($, _, async, ID, Api, util, Locator) {
    const Picker = {
      MODE_SELECT: 'SELECT',
      MODE_NOOP: 'NOOP',
      XPATH_ATTRS: ['id', 'data-id', 'name', 'class', 'data-name', 'role', 'title'],
      // Add local listener, used by pickerui.js to show feedback.
      addListener: addListener,
      removeListener: removeListener,
      mode: 'NOOP', // or SELECT
      frame_bounds: {left: 0, top: 0, width: 0, height: 0},
      selections: [],
    };

    function getOperationType(el) {
      const childBox = getFirstContainedSelection(el);
      if (childBox) return Picker.MODE_NOOP;

      const parentBox = getContainingSelections(el);
      if (parentBox) {
        return parentBox.getOp() == 'INCLUDE' ? 'EXCLUDE' : 'INCLUDE';
      }
      return 'INCLUDE';
    }

    function getSelection(el) {
      return _.find(Picker.selections, function(sel) {
        return _.any(sel.getTargets(), function(target) {
          return target == el;
        });
      });
    }

    function findSelectionById(id) {
      return _.find(Picker.selections, function(selection) {
        return selection.id == id;
      });
    }

    function getContainingSelections(el) {
      const parentEl = _.find($(el).parents().toArray(), getSelection);
      if (parentEl) return getSelection(parentEl);
    }

    function getFirstContainedSelection(el) {
      const selections = [];
      Locator.visitEls(el, function(child) {
        if (selections.length > 0) return false; // stop all visits

        const sel = getSelection(child);
        if (sel) {
          selections.push(sel);
          return false; // to stop visiting this subtree
        }
      });
      return selections.pop();
    }

    function getContainedSelections(el) {
      const selections = [];
      Locator.visitEls(el, function(_el) {
        if (el == _el) return; // this does not smell right.
        const sel = getSelection(_el);
        if (sel) {
          selections.push(sel);
          return false; // to stop visiting this subtree
        }
      });
      return selections;
    }

    function isMouseOutIntoIframe(event) {
      return (event.relatedTarget.nodeName == 'IFRAME' ||
    event.relatedTarget.nodeName == 'FRAME');
    }

    function isInternalEl(el) {
      return el.className.indexOf(Api.NS) >= 0;
    }

    const listeners = [];

    // A direct local bridge for modules in same environment.
    function addListener(listener) {
      listeners.push(listener);
    }

    function notifyListeners(type, args) {
      _.each(listeners, function(listener) {
        const call = listener[type];
        call && call.apply(listener, _.isArray(args) ? args : [args]);
      });
    }

    function removeListener(listener) {
      const index = _.indexOf(listners, listener);
      listeners.splice(index, 1);
    }

    function trigger(event) {
      notifyListeners.call(this, event.type, [event]);
      Api.trigger(event);
    }

    function Selection(options) {
      // XXX lot of HTML work could have been done using a template.
      const
        self = this;


      const id = options.id || ID();

      // Reference element used to mark it on the webpage

      let targets=[];

      // Element that was originally selected by user. May be null?

      let originalTarget = options.originalTarget;


      let locator = options.locator;

      if (!locator) throw new Error('Invalid options. A locator must be set');

      this.id = id;

      this.close = close;
      this.getOp = getOp;
      this.getLocator = getLocator;
      this.getTargets = getTargets;
      this.narrow = narrow;
      this.setLocator = setLocator;
      this.widen = widen;
      this.updateDisplay = updateDisplay;

      trigger({type: 'select:new', data: {id: id, op: options.op}});

      setLocator(locator);

      function close() {
        const
          children = _.flatten(_.map(targets, getContainedSelections));


        const selections = Picker.selections;

        if (_.indexOf(selections, self) >= 0) {
          selections.splice(_.indexOf(selections, self), 1);
        }

        trigger({type: 'select:close', data: {id: id}});

        _.each(children, function(child) {
          child.close();
        });

        setTimeout(function() {
          trigger({type: 'select:mark_none'});
        }, 100);
      }

      function getOp() {
        return options.op;
      }

      function getLocator() {
        return locator;
      }

      function getTargets() {
        return targets;
      }

      function narrow() {
        // For now we support narrowing uniquely matched elements only.
        if (targets.length != 1) return;

        const
          // List of elements till originalTarget
          list = $(originalTarget).parents().add(originalTarget).toArray();


        const _target = _.find(targets[0].childNodes, function(child) {
          return _.indexOf(list, child) >= 0;
        });

        // XXX restrict narrowing till we have an item that is a marker
        if (_target && !getSelection(_target)) {
          setElementLocator(_target);
        }
      }

      function setElementLocator(target) {
        setLocator({
          expr: Locator.findXPath(target, Picker.XPATH_ATTRS),
          type: 'xpath',
        });
      }

      function setLocator(_locator) {
        locator = _locator;
        // TODO Set target based on locator expression
        Locator.locate(locator, function(err, _targets) {
          if (err) {
            // console.error('Error matching elements for locator: ', locator);
            _targets = [];
          }
          setTargets(_targets);
          // If originalTarget is not set, set it to the first matching element?
          !originalTarget && (originalTarget = _targets[0]);
        });
      }

      function setTargets(_targets) {
        targets = _targets||[];
        updateDisplay();
      }

      function widen() {
        if (targets.length == 0) return;

        const _target = targets[0].parentElement;
        if (_target && !getSelection(_target)) {
          setElementLocator(_target);
        }
      }

      function updateDisplay() {
        const
          rects = _.map(targets, function(el) {
            const rect = _.pick(el.getBoundingClientRect(), 'bottom', 'height', 'left', 'right', 'top', 'width', 'x', 'y');
            rect.top += window.pageYOffset;
            rect.left += window.pageXOffset;
            return rect;
          });

        trigger({
          type: 'select:display',
          data: {
            id: id,
            locator: locator,
            rects: rects,
            info: targets.length > 0 ? elInfo(targets[0]) : '',
          },
        });
      }
    }

    syncRects = _.debounce(syncRects);

    Api.extend({

      picker_getSelection: Api.syncToAsync(function() {
        const includes = _(Picker.selections).chain().filter(function(sel) {
          return sel.getOp() == 'INCLUDE';
        }).map(function(sel) {
          return sel.getLocator();
        }).value();
        const excludes = _(Picker.selections).chain().filter(function(sel) {
          return sel.getOp() == 'EXCLUDE';
        }).map(function(sel) {
          return sel.getLocator();
        }).value();

        return {excludes: excludes, includes: includes};
      }),

      picker_reset: Api.syncToAsync(reset),

      picker_select_call: function(input, callback) {
        const id = input.id; const args = input.args||[]; const sel = findSelectionById(id);
        if (!sel) {
          callback({
            msg: 'Selection not found:' + id,
          });
        } else {
          const fn = sel[input.method];
          if (!fn) {
            callback({
              msg: 'Unknown method: ' + input.method,
            });
          } else {
            const val = fn.apply(sel, args);
            callback(null, val);
          }
        }
      },

      picker_select_new: function(input, callback) {
        Locator.locate(input.locator, function(err, _targets) {
          if (err) {
            return callback(err);
          }
          const selection = new Selection(_.extend({
            originalTarget: _targets[0],
          }, input));
          Picker.selections.push(selection);
          callback();
        });
      },

      picker_setMode: Api.syncToAsync(setMode),
    });

    trigger({type: 'select:load'});

    function elInfo(el) {
      return (el.nodeName.toLowerCase() + (el.id ? '#' + el.id : '') +
    (el.className ? '.' + el.className : ''));
    }

    function reset() {
      _.each(Picker.selections.slice(0), function(selection) {
        selection.close();
      });
      trigger({type: 'select:mark_none'});
      trigger({type: 'select:reset'});
    }

    function setMode(input) {
      Picker.mode = input || Picker.MODE_NOOP;
      Picker.mode == Picker.MODE_SELECT ? start() : stop();
      trigger({type: 'select:mode', data: Picker.mode});
      trigger({type: 'select:mark_none'});
    }

    function start() {
      window.addEventListener('click', VB_click, true);
      window.addEventListener('message', VB_message, true);
      window.addEventListener('mousedown', VB_mousedown, true);
      window.addEventListener('mouseover', VB_mouseover, true);
      // mousein?
      window.addEventListener('mouseout', VB_mouseout, true);
      window.addEventListener('mouseup', VB_mouseup, true);
      window.addEventListener('resize', VB_resize, true);
      window.addEventListener('scroll', VB_scroll, true);
      $('*').on('scroll', VB_scroll);

      syncRects();
    }

    function stop() {
      window.removeEventListener('click', VB_click, true);
      window.removeEventListener('message', VB_message, true);
      window.removeEventListener('mousedown', VB_mousedown, true);
      window.removeEventListener('mouseover', VB_mouseover, true);
      window.removeEventListener('mouseout', VB_mouseout, true);
      window.removeEventListener('mouseup', VB_mouseup, true);
      window.removeEventListener('resize', VB_resize, true);
      window.removeEventListener('scroll', VB_scroll, true);
      $('*').off('scroll', VB_scroll);

      trigger({type: 'select:mark_none'});
    }

    function syncRects() {
      // Set frame's bounds
      // console.log('syncRects');
      util.getWindowOffset(function(err, offset) {
        // console.log('getWindowOffset:', offset, location.href);

        Picker.frame_bounds = _.extend({
          width: $(window).outerWidth(),
          height: $(window).outerHeight(),
          pageYOffset: window.pageYOffset,
          pageXOffset: window.pageXOffset,
        }, offset);

        trigger({
          type: 'select:frame_bounds',
          data: Picker.frame_bounds,
        });
      });

      // Update display for affected elements.
      _.each(Picker.selections, function(selection) {
        selection.updateDisplay();
      });

      // Send message to child frames to update their display coordinates
      // console.log('syncRects: send message to frames');
      $('iframe,frame').each(function() {
        // console.log('sending message to:' + this.src);
        this.contentWindow.postMessage({
          brwsr_type: Api.MSG_EVENT,
          type: 'layout_change',
        }, '*');
      });
    }

    function VB_click(event) {
      if (isInternalEl(event.target)) return;

      event.stopPropagation();
      event.preventDefault();
    }

    function VB_message(event) {
      const
        data = event.data;


      const type = data && data.brwsr_type;

      if (type == Api.MSG_EVENT) {
        if (event.data.type == 'layout_change') {
          syncRects();
        }
      }
    }

    function VB_mousedown(event) {
      if (isInternalEl(event.target)) return;

      const op = getOperationType(event.target);

      if (op != Picker.MODE_NOOP) {
        trigger({type: 'select:mark_none'});
        const
          selection = new Selection({
            locator: {
              expr: Locator.findXPath(event.target, Picker.XPATH_ATTRS),
              type: 'xpath',
            },
            originalTarget: event.target,
            op: op,
          });
        Picker.selections.push(selection);
      }
      event.stopPropagation();
      event.preventDefault();
    }

    var
      VB_mouseover = _.throttle(function(event) {
        const target = event.target;


        const op = getOperationType(target);

        if (isInternalEl(event.target)) return;

        if (op == Picker.MODE_NOOP) {
          trigger({type: 'select:mark_none'});
        } else {
          const
            rect = target.getBoundingClientRect();
          trigger({
            type: 'select:mark',
            data: {
              op: op,
              rects: [{
                top: rect.top + window.pageYOffset,
                left: rect.left + window.pageXOffset,
                width: $(target).outerWidth(),
                height: $(target).outerHeight(),
              }],
              info: elInfo(target),
            },
          });
        }
      }, 250, {leading: false});

    var
      VB_mouseout = _.throttle(function(event) {
        if (isInternalEl(event.target)) return;

        if (!event.relatedTarget || isMouseOutIntoIframe(event)) {
          trigger({type: 'select:mark_none'});
        }
      }, 250, {leading: false});

    function VB_mouseup(event) {
      if (isInternalEl(event.target)) return;

      event.preventDefault();
      event.stopPropagation();
    }

    function VB_resize(event) {
      syncRects();
    }

    function VB_scroll(event) {
      // console.log('VB_scroll');
      syncRects();
    }


    return Picker;
  });

// console.log('picker:load', location.href);
