function playerToMonoSource(context, player) {
  var source = context.createMediaElementSource(player);
  var stereoSplitter = context.createChannelSplitter(2);
  var stereoSplitterGainL = context.createGain();
  var stereoSplitterGainR = context.createGain();
  var monoMerger = context.createChannelMerger(1);
  var gainL = context.createGain();
  var gainR = context.createGain();
  // Connect source to stereoSplitter
  source.connect(stereoSplitter, 0, 0);
  // Connect split channels to gain nodes
  stereoSplitter.connect(stereoSplitterGainL, 0);
  stereoSplitter.connect(stereoSplitterGainR, 1);
  stereoSplitterGainL.gain.value = 0.5;
  stereoSplitterGainR.gain.value = 0.5;
  // Connect gain nodes to monoMerger
  stereoSplitterGainL.connect(monoMerger, 0, 0);
  stereoSplitterGainR.connect(monoMerger, 0, 0);
  return monoMerger;
}


function VizstudioAudioPosition(options) {
  options ||= {}
  if (options.players) {
    this.players = options.players
  }
  else if (options.selector) {
    this.players = document.querySelectorAll(options.selector)
  }
  else {
    this.players = document.querySelectorAll('.zone video, .zone audio')
  }

  console.log(this.players);
  this.panPlayers();
}


VizstudioAudioPosition.prototype.panPlayers = function() {
  this.context = new AudioContext();
  console.log(this.context.destination.maxChannelCount);

  if (this.context.destination.maxChannelCount >= 8) {
    this.channelCount = 8
  }
  else {
    this.channelCount = 2;
  }

  this.context.destination.channelCount = this.channelCount;

  for(var i=0; i < this.players.length; i++) {
    var player = this.players[i];
    this.panPlayer(player);
  }
}


// positions are in range 0-1 beginning at center speaker and moving clockwise
VizstudioAudioPosition.prototype.componentLevelsSurround7 = function(position) {
  var p = position;

  // initialize levels at 0
  var levels = [0,0,0,0,0,0,0,0]

  // channel/speaker mappings:
  // channel 0 = left front
  // channel 1 = right front
  // channel 2 = center
  // channel 4 = left rear
  // channel 5 = right rear
  // channel 6 = left side
  // channel 7 = right side

  // channels and speaker positions, ordered from cetner moving clockwise:
  var channels = [
    [2, 0], [1, .08], [7, .25], [5, .42], [4, .58], [6, .75], [0, .92] 
  ]

  function getLevelPair(x1, x2, xs) {
    // x1 = position of first (left) speaker
    // x2 = position of second (right) position speaker
    // xs = position of source

    // d = distance between speakers
    var d = x2 - x1;

    // l1 && l2 = levels of left and right speakers
    var l1 = 1 - ((xs - x1) / d);
    var l2 = 1 - ((x2 - xs) / d);

    return [precise(l1, 2), precise(l2, 2)];
  }

  for (i = 0; i < channels.length; i++) {
    // i and i2 are the current channel's index and the next one (repeats after channels.length - 1)
    let i2 = (i + 1) % channels.length;

    // p1 and p2 are the positions of the current and next channels
    let p1 = channels[i][1]
    let p2 = (channels[i2][1] > channels[i][1]) ? channels[i2][1] : 1;

    if (p == p1) {
      levels[channels[i][0]] = 1;
    }
    else if (p > p1 && p < p2) {
      let channelPair = [channels[i][0], channels[i2][0]];
      let levelPair = getLevelPair(p1, p2, p);
      levels[channelPair[0]] = parseFloat(levelPair[0]);
      levels[channelPair[1]] = parseFloat(levelPair[1]);
    }
    else {
      continue;
    }
  }

  return levels;
}


// positions are in range 0-1 beginning at center speaker and moving clockwise
VizstudioAudioPosition.prototype.componentLevelsStereo = function(position) {
  var p = parseFloat(position);
  var rLevel;

  if (p <= 0.5) {
    rLevel = p + 0.5;
    console.log(rLevel);
  }
  else {
    rLevel = p - 0.5;
  }

  let lLevel = 1 - rLevel;
  return [precise(lLevel, 2), precise(rLevel, 2)];
}


VizstudioAudioPosition.prototype.panPlayer = function(player) {
  // downsample stero audio to mono and
  var zone = player.closest('.zone');
  var source = playerToMonoSource(this.context, player);
  var components = this.generateAudioComponents();
  // var position = parseFloat(player.getAttribute('data-audio-position'));
  var position = this.getCenterPosition(player);
  
  if (this.channelCount == 2) {
    var levels = this.componentLevelsStereo(position);
  }
  else if (this.channelCount == 8) {
    var levels = this.componentLevelsSurround7(position);
  }

  console.log(this.componentLevelsSurround7(position));

  for (var i=0; i < levels.length; i++) {
    let k = 'gain' + i;
    let level = levels[i];
    source.connect(components[k]);
    components[k].gain.value = level;
    components[k].connect(components.surroundMerger, 0, i);
  }

  components.surroundMerger.connect(this.context.destination);
  return player;
}


VizstudioAudioPosition.prototype.generateAudioComponents = function() {
  var surroundMerger = this.context.createChannelMerger(this.channelCount);
  // surroundMerger config
  surroundMerger.channelCountMode = 'explicit';
  surroundMerger.channelInterpretation = 'discrete';

  // create return object and add surround channels
  var components = {};

  for (var i=0; i < this.channelCount; i++) {
    var k = 'gain' + i;
    components[k] = this.context.createGain();
  }

  components['surroundMerger'] = surroundMerger;
  return components;
}


VizstudioAudioPosition.prototype.getCenterPosition = function(player) {
  var vizstudio = document.querySelector('.vizstudio');
  var zone = player.closest('.zone');
  var zoneRect = zone.getBoundingClientRect();
  var vizstudioRect = vizstudio.getBoundingClientRect();

  let left = Math.floor(zoneRect.left) - Math.floor(vizstudioRect.left);
  let center = left + (Math.floor(zoneRect.width / 2));
  console.log(center);
  
  let vPos = center / vizstudioRect.width;
  let raw = modulo((vPos - 0.5), 1);
  return precise(raw, 2)
}
