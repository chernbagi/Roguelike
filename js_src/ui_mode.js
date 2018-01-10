import {Message} from './message.js';
import {MapMaker} from './map.js'
import {DisplaySymbol} from'./display_symbol.js'
import {DATASTORE, clearDataStore} from './datastore.js';

class UIMode {
  constructor(Game){
    console.log("created " + this.constructor.name);
    this.Game = Game;
  }
  enter(){
    console.log("entered " + this.constructor.name);
  }
  exit(){
    console.log("exited " + this.constructor.name);
  }
  handleInput(eventType, evt){
    console.log("handling " + this.constructor.name);
    console.log(`event type is ${eventType}`)
    console.dir(evt)
    return(true)
  }
   render(display){
    console.log("redering " + this.constructor.name);
    display.drawText(2, 2, "redering " + this.constructor.name);
  }
}

export class StartupMode extends UIMode {
  enter () {
    Message.clear()
  }
  render(display) {
    display.clear();
    display.drawText(30, 6, "Hit any key to begin");
    display.drawText(35, 3, "Welcome to");
    display.drawText(38, 4, "WEED");
    display.drawText(37, 5, "STRIKE");
  }
  handleInput(eventType, evt){
    if (eventType == 'keyup') {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('persistence');
      return true;
    }
  }
}

export class PlayMode extends UIMode {
  constructor(Game){
    super(Game);
    this.state = {
      mapID: '',
      cameraMapX: '',
      cameraMapY: ''
    };
  }

  enter(){
    Message.send("hit escape to enter persistence mode")
    if (!this.state.mapID){
      let m = MapMaker({xdim: 80, ydim: 24});
      this.state.mapID = m.getID();
      m.build();
    }

    this.state.cameraMapX = 20;
    this.state.cameraMapY = 12;
    this.cameraSymbol = new DisplaySymbol('@', '#eb4');
  }

  toJSON() {
    return JSON.stringify(this.state);
  }
  restoreFromState(stateDataString){
    this.state = JSON.parse(stateDataString);
  }

  setupNewGame() {
    let m = MapMaker({xdim: 80, ydim: 24});
    this.state.mapID = m.getID();
    m.build();
    this.state.cameraMapX = 20;
    this.state.cameraMapY = 12;
    this.cameraSymbol = new DisplaySymbol('@', '#eb4');
  }

  render(display) {
    display.clear();
    display.drawText(30, 3, "w to win l to lose");
    DATASTORE.MAPS[this.state.mapID].render(display, this.state.cameraMapX, this.state.cameraMapY);
    this.cameraSymbol.render(display, display.getOptions().width/2, display.getOptions().height/2)
  }
  handleInput(eventType, evt){
    console.log(evt);
    if (eventType == 'keyup') {
      if (evt.key == "w") {
        console.dir(this);
        console.log(this.Game);
        this.Game.switchMode('win');
        return true;
      }
      if (evt.key == "l") {
        console.dir(this);
        console.log(this.Game);
        this.Game.switchMode('lose');
        return true;
      }
      if (evt.key == "c") {
        console.dir(this);
        console.log(this.Game);
        this.Game.switchMode('cache');
        return true;
      }
      if (evt.key == "Escape") {
        console.dir(this);
        console.log(this.Game);
        this.Game.switchMode('persistence');
        return true;
      }
      if (evt.key == "7") {
        this.moveCamera(-1, -1);
        return true;
      }
    }
  }
  moveCamera(dx, dy){
    this.state.cameraMapX += dx;
    this.state.cameraMapY += dy;
    return true;
  }
}

export class WinMode extends UIMode {
  enter(){
    Message.send("hit r to try again!")
  }
  render(display) {
    display.clear();
    display.drawText(37, 3, "YOU")
    display.drawText(37, 4, "WIN")
  }
  handleInput(eventType, evt){
    if (eventType == 'keyup' && evt.key == "r") {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('startup');
      return true;
    }
  }
}

export class LoseMode extends UIMode {
  enter(){
    Message.send("hit r to try again!")
  }
  render(display) {
    display.clear();
    display.drawText(37, 3, "YOU");
    display.drawText(37, 4, "LOSE");
  }
  enter(){
    Message.send("hit r to play again!")
  }
  handleInput(eventType, evt){
    if (eventType == 'keyup' && evt.key == "r") {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('startup');
      return true;
    }
  }
}

export class CacheMode extends UIMode {
  enter(){
    Message.send("hit escape to return to your game")
  }
  render(display){
    display.clear();
    display.drawText(1, 1, "Hit esc to exit");
    display.drawText(1, 2, Message.cache)
  }
  handleInput(eventType, evt){
    console.log(evt)
    if (eventType == 'keyup' && evt.key == "Escape") {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('play');
      return true;
    }
  }
}
export class PersistenceMode extends UIMode {
  enter(){
    Message.send("hit escape to return to your game")
  }
  render(display){
    display.clear();
    display.drawText(30, 3, "N for new game");
    display.drawText(30, 4, "S to save game");
    display.drawText(30, 5, "L to load game");
  }
  handleInput(eventType, evt){
    if (eventType == 'keyup') {
      if (evt.key=="n" || evt.key == "N"){
        console.log("new game");
        this.Game.setupNewGame();
        this.Game.switchMode('play');
        return(true);
      }
      if (evt.key=="s" || evt.key=="S"){
        this.handleSave();
        return(true);
      }
      if (evt.key== "l" || evt.key=="L"){
        this.handleLoad();
        this.Game.switchMode('play');
        return(true);
      }
      if (evt.key == "Escape") {
        this.Game.switchMode('play');
        return(true);
      }
      return false;
    }
  }


handleSave() {
  if (! this.localStorageAvailable()) {
      return;
  }
  window.localStorage.setItem('savestate', JSON.stringify(DATASTORE));
  console.log('save game')
  this.Game.hasSaved = true;
  Message.send('Game saved');
  this.Game.switchMode('play');
}

handleLoad() {
  if (! this.localStorageAvailable()) {
      return;
  }
  let restorationString = window.localStorage.getItem('savestate')
  let state = JSON.parse(restorationString);
  clearDataStore();
  DATASTORE.ID_SEQ = state.ID_SEQ;
  DATASTORE.GAME = state.GAME;
  this.Game.fromJSON(state.GAME);
  for (let mapID in state.MAPS){
    let mapData = JSON.parse(state.MAPS[mapID])
    DATASTORE.MAPS[mapID] = MapMaker(mapData) //mapData.xdim, mapData.ydim, mapData.setRngState);
    DATASTORE.MAPS[mapID].build();
  }

  console.log('post-load datastore')
  console.dir(DATASTORE)
}
localStorageAvailable() {
    // NOTE: see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    try {
      var x = '__storage_test__';
      window.localStorage.setItem( x, x);
      window.localStorage.removeItem(x);
      return true;
    }
    catch(e) {
      Message.send('Sorry, no local data storage is available for this browser so game save/load is not possible');
      return false;
    }
  }
}
