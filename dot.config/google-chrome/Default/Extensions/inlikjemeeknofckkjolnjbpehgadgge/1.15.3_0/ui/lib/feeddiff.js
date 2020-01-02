(function(global) {

  function hashFeed(feed) {
    var
    async   = global.async,
    entries = feed.entries;
    _.each(entries, function(entry) {
      entry._hash = [entry.link, entry.title, entry.description||entry.summary||''].join(':');
    });
    return feed;
  }

  function findChanges(dict) {

   var
   changes      = [],
   newEntries   = dict.newHashedFeed.entries,
   newHashes    = _.pluck(newEntries, '_hash'),
   oldHashes    = _.pluck(dict.oldHashedFeed.entries, '_hash');

   for(var i = 0; i < newHashes.length; i += 1) {
    var aHash = newHashes[i];
      if(oldHashes.indexOf(aHash) < 0) {  // if new hash not present in old hash array hten pushed to changes[]
        changes.push(newEntries[i]);
      }
    }

    return changes;
  }

  function findIndex(entries, entry) {
    for(var i=0; i<entries.length; i++) {
      if(entries[i].link == entry.link) {
        return i;
      }
    }
  }

  function getUpdatedEntries(diffHtml, dict, context, callback) {

    dict['newHashedFeed'] = hashFeed(dict['newHashedFeed']);
    dict['oldHashedFeed'] = dict['oldHashedFeed'] && hashFeed(dict['oldHashedFeed']);

    var
    changes       = findChanges(dict),
    updEntries    = [],
    addedEntries  = [],
    oldEntries    = dict.oldHashedFeed.entries,
    newEntries    = dict.newHashedFeed.entries,
    newHashes     = _.pluck(dict.newHashedFeed.entries, '_hash'),
    oldHashes     = _.pluck(dict.oldHashedFeed.entries, '_hash');

    async.each(changes, function(entry, callback) {
      var index = findIndex(oldEntries, entry);
      if(index >= 0 && entry['_hash'] != oldHashes[index]) {// if new entry present in previous entry also but hash doesn't match
          //do diffing over this entry and push to changes
        // TODO diff for title
        var doc1 = oldEntries[index].description || oldEntries[index].summary;
        var doc2 = entry.description || entry.summary;
        diffHtml(`<div>${doc1}</div>`, `<div>${doc2}</div>`, context+index, function(err, data){
          if(err){
            return callback(err);
          }
          entry.description = data;
          updEntries.push(entry);
          callback();
        });
      } else {
        entry.description || (entry.description = entry.summary);
        addedEntries.push(entry);
        callback();
      }
    }, function(err) {
      var res = {'changes': changes,'newEntries': addedEntries, 'updatedEntries': updEntries};
      callback(err, res)
    });
  }

  global.feeddiff = {
    getUpdatedEntries: getUpdatedEntries,
  };

  if(typeof define != 'undefined' && define.amd) {
    define('feeddiff', ['async'], function(_async){
      async = _async;
      return global.feeddiff
    });
  }
})(this);


