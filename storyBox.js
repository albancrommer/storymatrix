/*
 *  A Command Line Interface example
 *
 * Handles user feedback trough 1-X keyboard keys to move through the story
 *
 */

/* global __dirname */

const keypress = require('keypress');
const config = require('./config');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const libinkle = require('libinkle');
const execSync = require('child_process').execSync;
const feedAfter = 2;

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

function printChunk(message, options){
    options = options || {};
    options = JSON.stringify(options);
    message = _.isArray( message ) ? message : [message];
    for( i = 0; i < message.length ; i++ ){
        bit = message[i]
        fs.writeFileSync( "/tmp/buffer", options+"\n"+bit );
        // code = execSync('/usr/bin/php php-print/print.php '+options);
        console.log( bit );
    }
}

var inkle = {}
var game = {}
game.library = config.library
game.stage = ""
game.storyList = []
game.printLibrary = function(){
    var out = []
    out.push( "Choisissez votre librairie d'histoires :");
    _.each( game.library, function( val, key ){
        out.push( '['+key+'] '+val[0]);
    })
    printChunk( out.join("\n"),{"cut":true,"feedAfter":5});
    game.stage = "chooseLibrary"
}
game.chooseLibrary = function(chosenKey){
    if( game.library.length <= chosenKey ) {
      return;
    }
    var chosenLibrary = game.library[chosenKey];
    game.storyList = chosenLibrary[1];
    printChunk("Vous avez choisi : " + chosenLibrary[0],{"feedAfter":5});
    game.chooseStory()
}
game.end = function(){
    printChunk( "FIN",{"feedBefore":3,"feedAfter":1});
    printChunk( "Félicitations, vous avez fini l'histoire.",{"feedAfter":3,"cut":true});
    game.chooseStory();
}
game.chooseStory = function(){
    var out = []
    out.push( "Choisissez votre histoire : ");
    _.each( game.storyList, function( val, key ){
        out.push( '['+key+'] '+val[1]);
    })
    printChunk( out.join("\n"),{"cut":true,"feedAfter":5});
    game.stage = "start";
}
game.start = function(chosenKey){
    if( game.storyList.length <= chosenKey ) {
      return;
    }
    game.chunkCount = 1
    var chosenStory = game.storyList[chosenKey]
    var chosenId = chosenStory[0]
    printChunk("Vous avez choisi : " + chosenStory[1],{"feedAfter":4});
    var buf = fs.readFileSync(path.resolve(__dirname, 'stories/'+chosenId+'.json'));
    inkle = new libinkle({source: buf.toString() });
    inkle.keySet = [];
    inkle.getChoicesByKeys = function () {
        var choices = this.getChoices();
        var choicesList = this.getChoicesByName();
        inkle.keySet = _.keys(choicesList);
        printChunk("", {feedAfter:1});
        _.each(choicesList, function (val, key) {
                printChunk("[" + key + "] " + choices[val], {bold:true});
                });
        printChunk("", {feedAfter: feedAfter, cut:true});
    };
    printChunk('#'+game.chunkCount,{alignRight:true});
    game.chunkCount++;
    inkle.start();
    printChunk(inkle.getText());
    inkle.getChoicesByKeys();
    game.stage = "play";
}

game.progress = function( chosenKey ){

    if( inkle.getChoicesByName().length <= chosenKey ) {
        return;
    }
    // Progress story
    inkle.choose(inkle.getChoicesByName()[chosenKey]);
    printChunk('#'+game.chunkCount,{alignRight:true});
    game.chunkCount++;
    printChunk(inkle.getText(),{});
    inkle.getChoicesByKeys();
    if (inkle.isFinished()) {
        //process.stdin.pause();
        game.end();
    }
}

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// Init the game
game.printLibrary()

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name === 'c') {
        process.stdin.pause();
    return
    }
    if ((key && key.name === 'escape') || (key && key.name === 'tab')) {
        game.chooseStory()
    return
    }
    var chosenKey = parseInt( ch||key.sequence );
    if( isNaN(chosenKey) ){
      return;
    }
    switch( game.stage ) {
      case "chooseLibrary" : 
          game.chooseLibrary(chosenKey)
      break;
      case "start" : 
          game.start(chosenKey)
      break;
      default:
          game.progress( chosenKey )
      break;
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();

