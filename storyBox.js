/*
 *  A Command Line Interface example
 *
 * Handles user feedback trough 1-X keyboard keys to move through the story
 *
 */

/* global __dirname */

const keypress = require('keypress');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const libinkle = require('libinkle');
const execSync = require('child_process').execSync;
const feedAfter = 2;
var chunkCount = 1

function shellescape(a) {
  var ret = [];

  a.forEach(function(s) {
    if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
      s = s.replace(/"/g,'"\\""');
      s = "'"+s.replace(/'/g,"'\\''")+"'";
      s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
        .replace(/\\'''/g, "\\'" ); // remove non-escaped single-quote if there are enclosed between 2 escaped
    }
    ret.push(s);
  });

  return ret.join(' ');
}

var buf = fs.readFileSync(path.resolve(__dirname, 'stories/8v99.json'));
const inkle = new libinkle({source: buf.toString() });
inkle.keySet = [];
inkle.getChoicesByKeys = function () {
    var choices = this.getChoices();
    var choicesList = this.getChoicesByName();
    this.keySet = _.keys(choicesList);
    printChunk("", {feedAfter:1});
    _.each(choicesList, function (val, key) {
        printChunk("[" + key + "] " + choices[val], {bold:true});
    });
    printChunk("", {feedAfter: feedAfter, cut:true});
};

inkle.start();
function printChunk(message, options){
    options = options || {};
    options = JSON.stringify(options);
    message = _.isArray( message ) ? message : [message];
    for( i = 0; i < message.length ; i++ ){
        bit = message[i]
        fs.writeFileSync( "/tmp/buffer", options+"\n"+bit );
        code = execSync('/usr/bin/php php-print/print.php '+options);
    }
}

printChunk('#'+chunkCount,{alignRight:true});
chunkCount++;
printChunk(inkle.getText());
inkle.getChoicesByKeys();
// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name === 'c') {
        process.stdin.pause();
    }
    if (!_.has(key, 'sequence')) {
        return;
    }
    chosenKey = key.sequence;
    if (_.indexOf(inkle.keySet, chosenKey) === -1) {
        return;
    }
    // Progress story
    inkle.choose(inkle.getChoicesByName()[chosenKey]);
    printChunk('#'+chunkCount,{alignRight:true});
    chunkCount++;
    printChunk(inkle.getText(),{});
    inkle.getChoicesByKeys();
    if (inkle.isFinished()) {
        process.stdin.pause();
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();

