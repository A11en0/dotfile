let URL;
export function start({url, ...info}) {
  URL = url;

  //  console.log('Error reporter initiated!')

  window.addEventListener('unhandledrejection', function(event) {
    // console.log('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');

    // console.log(typeof event.reason, event)
    const reason = event.reason;


    const type = typeof reason;


    let message;
    if (type=='object') {
      message = {
        ...reason,
        ...info,
      };
    } else {
      message = {
        file_url: '',
        message: JSON.stringify(reason),
        ...info,
      };
    }
    send(message);
  });

  window.onerror = function(msg, url, lineNo, columnNo, error) {
    const string = msg.toLowerCase();
    const substring = 'script error';
    // console.log('error occured')
    if (string.indexOf(substring) > -1) {
      // alert('Script Error: See Browser Console for Detail');
    } else {
      const message = {
        'message': msg,
        'file_url': url,
        'app_url': document.URL,
        'line': lineNo,
        'column': columnNo,
        'stack': error.stack,
        ...info,
      };

      send(message);
    }
    return false;
  };
}

export function report({error, ...info}) {
  error || (error = new Error(info.message || 'Unknown error'));
  const message = {
    'app_url': document.URL,
    'e.message': error.message,
    'stack': error.stack,
    ...info,
  };

  send(message);
}

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

function send(message) {
  fetch(URL, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(message, getCircularReplacer()),
  })
    .then(function(data) {
      // console.log('Request success: ', data);
    })
    .catch(function(error) {
      console.error('Request failure: ', error);
    });
}
