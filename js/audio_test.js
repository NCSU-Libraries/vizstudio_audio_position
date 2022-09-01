function AudioTest() {
  this.started = false;
  this.playing = false;
  this.players = document.querySelectorAll('video');
  this.playerIndex = 0;
  
  this.enableKeyboardConrol();
}

AudioTest.prototype.incrementPlayerIndex = function() {
  this.playerIndex = (this.playerIndex + 1) % this.players.length;
}

AudioTest.prototype.start = function() {
  var _this = this;
  
  // new VizstudioAudioPosition({global: true});
  new VizstudioAudioPosition();

  this.interval = setInterval(function() {
    var player = _this.players[_this.playerIndex];
    player.play();
    _this.incrementPlayerIndex();
  }, 2000);
  this.started = true;
  this.playing = true;
}


AudioTest.prototype.restart = function() {
  var _this = this;

  // this.panPlayers();

  this.interval = setInterval(function() {
    var player = _this.players[_this.playerIndex];
    player.play();
    _this.incrementPlayerIndex();
  }, 2000);
  this.started = true;
  this.playing = true;
}


AudioTest.prototype.stop = function() {
  var _this = this;
  clearInterval(this.interval);
  _this.players.forEach(function(player) {
    player.pause();
    player.currentTime = 0;
  });  
  this.playing = false;
}


AudioTest.prototype.enableKeyboardConrol = function() {
  var _this = this;
  document.addEventListener('keydown', function(event) {
    if (!_this.started) {
      _this.start();
    }
    else if (!_this.playing) {
      _this.restart();
    }
    else {
      _this.stop();
    }
  });  
}


/* PANNER METHODS */

// AudioTest.prototype.panPlayers = function(position) {
//   for(var i=0; i < this.players.length; i++) {
//     var player = this.players[i];
//     this.panPlayer(player);
//   }
// }


// AudioTest.prototype.panPlayer = function(player) {
//   // downsample stero audio to mono and
//   var source = this.playerToMonoSource(player);
//   var channel = player.getAttribute('data-channel');
//   channel = parseInt(channel);
//   var components = this.generateAudioComponents(source);

//   for (var i=0; i < this.players.length; i++) {
//     var k = 'gain' + i;
//     var level = (i == channel) ? 1 : 0;
//     source.connect(components[k]);
//     components[k].gain.value = level;
//     components[k].connect(components.surroundMerger, 0, channel);
//   }

//   components.surroundMerger.connect(this.context.destination);
//   return player;
// }


// AudioTest.prototype.generateAudioComponents = function(source) {
//   var surroundMerger = this.context.createChannelMerger(8);
//   // surroundMerger config
//   surroundMerger.channelCountMode = 'explicit';
//   surroundMerger.channelInterpretation = 'discrete';

//   // create return object and add surround channels
//   var components = {};

//   for (var i=0; i < this.players.length; i++) {
//     var k = 'gain' + i;
//     components[k] = this.context.createGain();
//   }

//   components['surroundMerger'] = surroundMerger;
//   return components;
// }


// AudioTest.prototype.playerToMonoSource = function(player) {
//   var source = this.context.createMediaElementSource(player);
//   var stereoSplitter = this.context.createChannelSplitter(2);
//   var stereoSplitterGainL = this.context.createGain();
//   var stereoSplitterGainR = this.context.createGain();
//   var monoMerger = this.context.createChannelMerger(1);
//   var gainL = this.context.createGain();
//   var gainR = this.context.createGain();
//   // Connect source to stereoSplitter
//   source.connect(stereoSplitter, 0, 0);
//   // Connect split channels to gain nodes
//   stereoSplitter.connect(stereoSplitterGainL, 0);
//   stereoSplitter.connect(stereoSplitterGainR, 1);
//   stereoSplitterGainL.gain.value = 0.5;
//   stereoSplitterGainR.gain.value = 0.5;
//   // Connect gain nodes to monoMerger
//   stereoSplitterGainL.connect(monoMerger, 0, 0);
//   stereoSplitterGainR.connect(monoMerger, 0, 0);
//   return monoMerger;
// }
