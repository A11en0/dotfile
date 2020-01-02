brwsr_def('live', ['jquery', 'underscore', 'async', 'api', 'locator'],
  function($, _, async, Api, Locator) {
    let
      lastResult;


    const observer = new MutationObserver(function(mutations) {
      check();
    });


    const observerConfig = {
      attributes: true,
      attributeFilter: ['class', 'id', 'name', 'value', 'src', 'href'],
      childList: true,
      characterData: true,
      subtree: true,
    };


    const options = {};

    function check() {
      // Remove all mutation observers before starting a check
      observer.disconnect();
      Api.call({
        path: 'filterHTML',
        data: options,
      }, function(err, data) {
        async.parallel({
          text: function(callback) {
            Api.call({path: 'getText'}, callback);
          },
          html: function(callback) {
            Api.call({path: 'getHTML'}, callback);
          },
        }, function(err, result) {
          if (err) {
            console.error('Error monitoring page: ', err);
            Api.trigger({type: 'live:err', err: err});
          } else {
            if (result.text.length > 0) {
              if (!lastResult || lastResult.text != result.text) {
                Api.trigger({type: 'live:result', result: result});
                lastResult = result;
              }
            } else {
            }
          }
          // Add mutation observers back
          // XXX Add observer to common parent of matched elements?
          //  - It is likely that in some cases things might get slower
          observer.observe(document.body||document.documentElement, observerConfig);
        });
      });
    }

    Api.extend({
      live_init: Api.syncToAsync(function(_options) {
        _.extend(options, _options);
        check();
      }),
    });
  });
