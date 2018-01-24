import ROT from 'rot-js';
import * as U from './util.js';
import {StartupMode, PlayMode, WinMode, LoseMode, CacheMode, HelpMode, PersistenceMode, LevelMode} from './ui_mode.js';
import {Message} from './message.js';
import {DATASTORE} from './datastore.js';
import {TIME_ENGINE} from './timing.js';

export let Game = {
SPACING: 1.1,
  display: {
    main: {
      w: 80,
      h: 24,
      o: null
    },
    avatar: {
      w: 20,
      h: 24,
      o: null
    },
    message: {
      w: 100,
      h: 6,
      o: null
    }
  },

  modes: {
    startup: '',
    play: '',
    win: '',
    lose: '',
    cache: '',
    help: '',
    persistence: '',
  },
  curMode: '',

  init: function() {
    this.display.main.o = new ROT.Display({
      width: this.display.main.w,
      height: this.display.main.h,
      spacing: this.SPACING});
    this.display.avatar.o = new ROT.Display({
      width: this.display.avatar.w,
      height: this.display.avatar.h,
      spacing: this.SPACING});
    this.display.message.o = new ROT.Display({
      width: this.display.message.w,
      height: this.display.message.h,
      spacing: this.SPACING});
    Message.targetDisplay = this.display.message.o
    this.setupModes();
    this.switchMode('startup');
    DATASTORE.GAME = this;
  },

  setupModes: function(){
    this.modes.startup = new StartupMode(this);
    this.modes.play = new PlayMode(this);
    this.modes.win = new WinMode(this);
    this.modes.lose = new LoseMode(this);
    this.modes.cache = new CacheMode(this);
    this.modes.help = new HelpMode(this);
    this.modes.persistence = new PersistenceMode(this);
    this.modes.level = new LevelMode(this);
  },

  switchMode: function(newModeName){
    if (this.curMode) {
      this.curMode.exit();
    }
    this.curMode = this.modes[newModeName];
    if (this.curMode){
      console.log(this.curMode)
      this.curMode.enter();
    }
    this.render();
  },
  setupNewGame: function(){
    this.randomSeed = 5 + Math.floor(Math.random()*100000);
    console.log("using random seed "+this.randomSeed);
    ROT.RNG.setSeed(this.randomSeed);
    this.modes.play.setupNewGame();
    TIME_ENGINE.start();
  },

  getDisplay: function (displayId) {
    if (this.display.hasOwnProperty(displayId)) {
      return this.display[displayId].o;
    }
    return null;
  },

  render: function() {
    this.renderAvatar();
    this.renderMain();
    this.renderMessage();
  },

  renderAvatar: function() {
    this.curMode.renderAvatar(this.display.avatar.o);
  },

  renderMessage: function() {
    Message.render(this.display.message.o);
  },

  renderMain: function() {
    //if(this.curMode.hasOwnProperty('render')){
    this.curMode.render(this.display.main.o);
    //}
  },

  bindEvent: function(eventType) {
    window.addEventListener(eventType, (evt) => {
      this.eventHandler(eventType, evt);
    });
  },

  eventHandler: function (eventType, evt) {
    // When an event is received have the current ui handle it
    if (this.curMode !== null && this._curMode != '') {
        if (this.curMode.handleInput(eventType, evt)){
          this.render();
          //Message.ageMessages();
        }
    }
  },

  toJSON: function() {
    let json = '';
    json = JSON.stringify({
      rseed: this.randomSeed,
      playModeState: this.modes.play,
      });
    return json;
  },

  restoreFromState(stateData){
    this.state = stateData;
  },

  fromJSON: function(json) {
    let state = JSON.parse(json);
    this.randomSeed = state.rseed;
    this.modes.play.restoreFromState(state.playModeState);
  }
};
