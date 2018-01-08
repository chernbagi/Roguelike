import ROT from 'rot-js';
import * as U from './util.js';
import {StartupMode, PlayMode, WinMode, LoseMode, CacheMode, PersistenceMode} from './ui_mode.js';
import {Message} from './message.js'
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
    persistence: '',
  },
  curMode: '',

  init: function() {
    console.dir(this);
    console.dir(ROT);
    this._randomSeed = 5 + Math.floor(Math.random()*100000);
    //this._randomSeed = 76250;
    console.log("using random seed "+this._randomSeed);
    ROT.RNG.setSeed(this._randomSeed);

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
  },

  setupModes: function(){
    this.modes.startup = new StartupMode(this);
    this.modes.play = new PlayMode(this);
    this.modes.win = new WinMode(this);
    this.modes.lose = new LoseMode(this);
    this.modes.cache = new CacheMode(this);
    this.modes.persistence = new PersistenceMode(this);
  },

  switchMode: function(newModeName){
    if (this.curMode) {
      this.curMode.exit();
      this.render();
    }
    this.curMode = this.modes[newModeName];
    if (this.curMode){
      console.log(this.curMode)
      this.curMode.enter();
    }
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
    //this.curMode.render(this.display.avatar.o);
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
  }
};
