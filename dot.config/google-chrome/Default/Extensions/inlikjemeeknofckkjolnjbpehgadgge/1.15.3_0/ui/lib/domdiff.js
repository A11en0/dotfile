// Uses text content to hash a node and its children

(function(global) {
var
BREAKING_ELS      = ['ARTICLE', 'BLOCKQUOTE', 'CAPTION', 'CODE', 'DD', 'DIV', 'FIELDSET', 'FOOTER', 'FORM', 'HEADER', 'LI', 'OL', 'SECTION', 'SUMMARY', 'TABLE', 'TBODY', 'TFOOT', 'THEAD', 'TR', 'UL', 'IMG', 'BR'],
SPACED_ELS        = ['A', 'ABBR', 'ACRONYM', 'ADDRESS', 'BUTTON', 'TD'];

function HashedNode(domNode, parent) {
  var
  self       = this,
  index      = -1,
  text       = null,
  words      = null,
  childNodes = _.filter(_.map(domNode.childNodes, function(domNode) {
    return new HashedNode(domNode, self);
  }), function(node) {
    return !!node.getText();
  });

  this.childNodes = childNodes;
  this.domNode    = domNode;
  this.getIndex   = getIndex;
  this.getText    = getText;
  this.parent     = parent;

  getIndex();

  function getIndex() {
    if(index < 0) {
      if(parent) {
        index = _.indexOf(parent.childNodes, self);
      }
    }
    return index;
  }

  function getText() {
    if(text !== null) {
      return text;
    }

    if(domNode.nodeName == '#text') {
      text = domNode.data;
    } else if(domNode.nodeName == 'IMG') {
      return domNode.src;
    } else if(domNode.nodeName == 'VIDEO') {
      return domNode.src;
    } else if(domNode.attributes) {
      var
      buf = _.map(childNodes, function(node) {
        var
        text     = node.getText(),
        nodeName = node.domNode.nodeName;
        if(_.indexOf(SPACED_ELS, nodeName) >= 0) {
          text += ' ';
        } else if(_.indexOf(BREAKING_ELS, nodeName) >= 0) {
          text += '\n';
        }
        return text;
      });
      text = buf.join(' ');
    } else {
      // comments etc.
      text = '';
    }
    text = text.replace(/\s*\n+(\s*\n+)*/g, ' ').replace(/[ \t]+/g, ' ').trim();
    return text;
  }

}

function markMov(el) {
  el.setAttribute('class', 'xmov ' + (el.getAttribute('class')||''));
  //setStyle(el, 'background-color', '#eef');
}

function markIns(el) {
  console.log('markIns');
  el.setAttribute('class', 'xins ' + (el.getAttribute('class')||''));
  //setStyle(el, 'background-color', '#5f5');
}

function markDel(el) {
  console.log('markDel');
  el.setAttribute('class', 'xdel ' + (el.getAttribute('class')||''));
  //setStyle(el, 'background-color', '#faa');
}

function setStyle(el, name, value) {
  el.setAttribute('style', (el.getAttribute('style')||'') + name+':'+value+';');
}

function diff(oldNode, newNode, context) {
  context || (context = {});

  //console.log('diff: ', oldNode.domNode, newNode.domNode);
  if(oldNode.getText() == newNode.getText()) {
    return;
  }

  // Match words from two different sequences to see if it matches up
  var
  allNewChn   = newNode.childNodes,
  allOldChn   = oldNode.childNodes,
  newChildren = allNewChn.slice(0),
  oldChildren = allOldChn.slice(0),
  document    = newNode.domNode.ownerDocument,
  newChild,
  oldChild,
  newText,
  oldText,
  lenRatio,
  lenCS,
  maxLenCS,
  maxLen,
  matchRatio,
  matchedOldNodes,
  nextNewChildToDiff,
  addedDOMNode;

  if(newNode.domNode.nodeName == '#text') {
    diffAndReplaceTextNode(newNode, oldNode.getText(), context);
  }

  // Compare siblings to find matching nodes.
  for(var ni = 0; ni < newChildren.length; ni += 1) {
    newChild = newChildren[ni];
    for(var oi = 0; oi < oldChildren.length; oi += 1) {
      oldChild = oldChildren[oi];
      if(!oldChild.matched && oldChild.getText() == newChild.getText()) {
        newChild.matched = oldChild.matched = true;
        newChild.indexDelta = newChild.getIndex() - oldChild.getIndex();
        //console.log('indexDelta:', newChild.indexDelta, newChild.getIndex(), newChild.getText());
        break;
      }
    }
  }

  // Create list of children that did not match
  newChildren = _.filter(_.filter(newChildren, filterUnmatched), filterTextful);
  oldChildren = _.filter(_.filter(oldChildren, filterUnmatched), filterTextful);

  // Find partial matches between different non-matching nodes and find best
  // matches
  for(var ni = 0; ni < newChildren.length; ni += 1) {
    newChild = newChildren[ni];

    newText         = newChild.getText();
    matchedOldNodes = [];

    // Find oldChild that is similar to the newChild
    for(var oi = 0; oi < oldChildren.length; oi += 1) {
      oldChild = oldChildren[oi];

      oldText  = oldChild.getText();


      if(lenRatio > 10 || lenRatio < 0.1) {
        // Too big a difference to find a match
        continue;
      }

      /*
      var
      total = global.total || 0;
      */

      maxLen = Math.min(newText.length, oldText.length);

      start = Date.now();

      matchData = longestCommonSequenceData(oldText, newText, context);

      lenCS    = matchData.lenCS;
      maxLenCS = matchData.maxLenCS;

      /*
      total += (Date.now() - start);
      global.total = total;
      */

      //console.log('lcs took:', (Date.now() - start), total, oldText.length, newText.length);

      matchRatio = lenCS/maxLenCS;

      if(maxLen < 50) {
        if(lenCS > Math.sqrt(maxLenCS)) {
          matchedOldNodes.push([matchRatio, oldChild]);
        }
      } else if(maxLen < 100) {
        if(matchRatio > .15) {
          matchedOldNodes.push([matchRatio, oldChild]);
        }
      } else if(maxLen < 500) {
        if(matchRatio > .08) {
          matchedOldNodes.push([matchRatio, oldChild]);
        }
      } else if(maxLen < 5000) {
        if(matchRatio > .02) {
          matchedOldNodes.push([matchRatio, oldChild]);
        }
      } else {
        if(matchRatio > .01) {
          matchedOldNodes.push([matchRatio, oldChild]);
        }
      }
    }

    // Sort nodes based in order of match ratio
    newChild.matchedOldNodes = _.sortBy(matchedOldNodes, function(item) {
      return -item[0];  // Descending
    });
  }

  // Diff partial matches.
  while((nextNewChildToDiff = findNextChildToDiff())) {
    var
    matchedRatioNode = nextNewChildToDiff.matchedOldNodes[0]; // 1st is always the most wanted

    if(matchedRatioNode) {
      // It may not be a good idea to diff in case the two nodes are very far
      // apart in list, the matchRatio should consider relative index of a node
      // in its parent
      var
      bestMatchedOldChildNode = matchedRatioNode[1];
      // Find difference between children
      diff(bestMatchedOldChildNode, nextNewChildToDiff, context);
      nextNewChildToDiff.matched = bestMatchedOldChildNode.matched = true;
      nextNewChildToDiff.partialMatch = true;
      nextNewChildToDiff.indexDelta = nextNewChildToDiff.getIndex() - bestMatchedOldChildNode.getIndex();

      // Remove matched old node from others' matched lists
      pruneMatchedOldNodes();

      //console.log('diffing node with ratio:', matchedRatioNode[0], matchedRatioNode[1].getText());
    } else {
      if(nextNewChildToDiff.getText().length > 0) {
        var
        addedDOMNode = nextNewChildToDiff.domNode
        if(addedDOMNode.nodeName == '#text') {
          var
          elIns = document.createElement('ins');
          markIns(elIns);
          elIns.textContent = addedDOMNode.data;
          addedDOMNode.parentNode.replaceChild(elIns, addedDOMNode);
        } else if(addedDOMNode.attributes) {
          markIns(addedDOMNode);
        }
      }
    }
  }

  if(context.skipDels) {
    return;
  }

  var
  ni          = 0,
  oi          = 0,
  indexOffset = 0,
  deletedDOM  = null;

  newChild = allNewChn[ni];
  oldChild = allOldChn[oi];

  /*
   * Iterate over each new and old child to find their place in the document.
   */
  while(newChild || oldChild) {
    // FIXME Review and write a cleaner algorithm to mark added and removed data.
    if(oldChild) {
      //console.log('oldChild:', oldChild.getText(), oldChild.matched, oldChild.getIndex(), newChild && newChild.getIndex(), indexOffset);
      if(oldChild.matched) {
        oi          += 1;
        oldChild    = allOldChn[oi];
        continue;
      } else {
        while(oldChild && !oldChild.matched &&
          (!newChild ||
          oldChild.getIndex() <= (newChild.getIndex() - indexOffset))) {
          // This is a deleted node that should be placed before current newChild
          if(newChild) {
            // Merge oldChild into newChild if old/newChild is a table cell
            var
            nodeName = newChild.domNode.nodeName;
            if(nodeName == 'TD' || nodeName == 'TH') {
              // TODO Add children from oldChild to newChild
              _.each(oldChild.domNode.childNodes, function(domNode) {
                if(domNode.nodeName == '#text') {
                  var
                  deletedDOM = document.createElement('del');
                  deletedDOM.textContent = domNode.data;
                  markDel(deletedDOM);
                } else {
                  deletedDOM = document.importNode(domNode, true);
                  markDel(deletedDOM);
                }
                newChild.domNode.appendChild(deletedDOM);
              });
            } else {
              var
              refDOMNode = newChild.domNode;
              if(refDOMNode.parentNode != newNode.domNode) {
                refDOMNode = refDOMNode.parentNode;
              }
              if(oldChild.domNode.nodeName == '#text') {
                var
                deletedDOM = document.createElement('del');
                deletedDOM.textContent = oldChild.domNode.data;
                newNode.domNode.appendChild(deletedDOM);
                newNode.domNode.insertBefore(deletedDOM, refDOMNode);
                markDel(deletedDOM);
              } else {
                deletedDOM = newNode.domNode.insertBefore(document.importNode(oldChild.domNode, true), refDOMNode);
                markDel(deletedDOM);
              }
            }
          } else {
            // There is no newChild for a reference. Add it to parent.
            if(oldChild.domNode.nodeName == '#text') {
              deletedDOM = document.createElement('del');
              deletedDOM.textContent = oldChild.domNode.data;
              markDel(deletedDOM);
            } else {
              deletedDOM = document.importNode(oldChild.domNode, true);
              markDel(deletedDOM);
            }
            if(newNode.domNode.nodeName == '#text') {
              // XXX In some cases newNode is a #text node. Why?
              newNode.parent.domNode.appendChild(deletedDOM);
            } else {
              // Its an element
              newNode.domNode.appendChild(deletedDOM);
            }
          }
          indexOffset -= 1;

          oi          += 1;
          oldChild    = allOldChn[oi];
        }
      }
    }

    if(!newChild) {
      continue;
    }

    if(newChild.matched && !newChild.partialMatch) {
      // Do not color merged nodes
      if((newChild.indexDelta - indexOffset) != 0) {
        // Color moved
        var
        movedDOMNode = newChild.domNode;
        if(movedDOMNode.nodeName == '#text') {
          var
          elSpan = document.createElement('span');
          elSpan.textContent = movedDOMNode.data;
          movedDOMNode.parentNode.replaceChild(elSpan, movedDOMNode);
          markMov(elSpan);
          //setStyle(elSpan, 'background-color', '#eef');
        } else if(movedDOMNode.attributes) {
          markMov(movedDOMNode);
          //setStyle(movedDOMNode, 'background-color', '#eef');
        }
      }
    } else if (!newChild.matched){
      // Neither matched nor merged. Was inserted and colored green.
      indexOffset += 1;
    }
    ni += 1;
    newChild = allNewChn[ni];
  }

  function findNextChildToDiff() {
    newChildren = _.sortBy(newChildren, function(aNode) {
      var
      matchedRatioNode =  _.find(aNode.matchedOldNodes, function(item) {
        var
        matchRatio = item[0],
        oldNode    = item[1];
        return !oldNode.matched;
      });
      return matchedRatioNode ? -matchedRatioNode[0] : 0;
    });
    return newChildren.shift();
  }

  function pruneMatchedOldNodes() {
    _.each(newChildren, function(newChild) {
      newChild.matchedOldNodes = _.filter(newChild.matchedOldNodes, function(item) {
        return !item[1].matched;
      });
    });
  }

  function filterUnmatched(node) {
    return !node.matched;
  }

  function filterTextful(node) {
    return node.getText();
  }
}

function diffAndReplaceTextNode(node, oldText, context) {
  var
  domNode = node.domNode,
  document= domNode.ownerDocument,
  newText = domNode.data,
  elSpan  = document.createElement('span'),
  dmp     = new diff_match_patch(),
  a       = dmp.diff_wordsToChars_(oldText, newText),
  diffs   = dmp.diff_main(a.chars1, a.chars2, false);

  dmp.diff_charsToLines_(diffs, a.wordArray);

  _.each(diffs, function(aDiff) {
    if(aDiff[0] == DIFF_DELETE) {
      // Depending on option, add it or ignore it
      if(context.skipDels !== true) {
        var
        elDel = document.createElement('del');
        elDel.textContent = aDiff[1];
        elSpan.appendChild(elDel);
        markDel(elDel);
      }
    } else if(aDiff[0] == DIFF_INSERT) {
      var
      elIns = document.createElement('ins');
      elIns.textContent = aDiff[1];
      elSpan.appendChild(elIns);
      markIns(elIns);
    } else {
      elSpan.appendChild(document.createTextNode(aDiff[1]));
    }
  });

  domNode.parentNode.replaceChild(elSpan, domNode);
  return;
}

function longestCommonSequenceData(string1, string2, context) {
  if(string1.length < string2.length) {
    var
    tmp = string1;

    string1 = string2;
    string2 = tmp;
  }

  var
  lcs = context.lcs || (context.lcs = {}),
  str1Data = lcs[string1] || (lcs[string1] = {}),
  str12Data = str1Data[string2] || (str1Data[string2] = {});

  if(str12Data.maxLenCS) {
    return str12Data;
  }

  var
  lines    = context.lines || (context.lines = {}),
  words    = context.words || (context.words = {}),
  newWords = words[string1] || (words[string1] = string1.split(/\s+/g)),
  oldWords = words[string2] || (words[string2] = string2.split(/\s+/g)),
  list1    = newWords,
  list2    = oldWords,
  newLines = lines[string1] || (lines[string1] = string1.split(/\.\s*/g)),
  oldLines = lines[string2] || (lines[string2] = string2.split(/\.\s*/g)),
  lenCS,
  maxLenCS;

  if(newWords.length > 1000 && oldWords.length > 1000) {
    list1 = newLines;
    list2 = oldLines;
  }

  str12Data.lenCS = longestCommonSequence(list1, list2);
  str12Data.maxLenCS = Math.min(list1.length, list2.length);

  return str12Data;
}

function longestCommonSequence(list1, list2){
  // init max value
  var
  longestCommonSubstring = 0;

  // init 2D array with 0
  var 
  table = [],
  len1 = list1.length,
  len2 = list2.length,
  row, col;

  for(row = 0; row <= len1; row++){
    table[row] = [];
    for(col = 0; col <= len2; col++){
      table[row][col] = 0;
    }
  }

  // fill table
  var i, j;
  for(i = 0; i < len1; i++){
    for(j = 0; j < len2; j++){
      if(list1[i]==list2[j]){
        if(table[i][j] == 0){
          table[i+1][j+1] = 1;
        } else {
          table[i+1][j+1] = table[i][j] + 1;
        }
        if(table[i+1][j+1] > longestCommonSubstring){
          longestCommonSubstring = table[i+1][j+1];
        }
      } else {
        table[i+1][j+1] = 0;
      }
    }
  }
  return longestCommonSubstring;
}

global.domdiff = {
  HashedNode: HashedNode,
  diff:       diff
};

if(typeof define != 'undefined' && define.amd) {
  define('domdiff', global.domdiff);
}

})(this);

