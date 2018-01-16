import {Message} from './message.js';
import {MapMaker} from './map.js';
import {DisplaySymbol} from'./display_symbol.js';
import {DATASTORE, clearDataStore} from './datastore.js';
import {EntityFactory} from './entities.js';
import {StartupInput, PlayInput, EndInput, HCInput, PersistenceInput} from './key_bind.js';

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
  renderAvatar(display){
    display.clear();
  }
}

export class StartupMode extends UIMode {
  enter () {
    Message.clear();
    console.dir(this);
    if (!this.startupHandler){
      this.startupHandler = new StartupInput(this.Game);
    }
  }
  render(display) {
    display.clear();
    display.drawText(30, 6, "Hit any key to begin");
    display.drawText(35, 3, "Welcome to");
    display.drawText(38, 4, "WEED");
    display.drawText(37, 5, "STRIKE");
  }
  handleInput(eventType, evt){
    return this.startupHandler.handleInput(eventType, evt);
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
    if (!this.playHandler){
      this.playHandler = new PlayInput(this.Game);
    }
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
    this.state.cameraMapX = 0;
    this.state.cameraMapY = 0;
    let a = EntityFactory.create('avatar');
    let t = EntityFactory.create('tree');
    this.state.avatarID = a.getID();
    m.addEntityAtRandomPosition(a);
    m.addEntityAtRandomPosition(t);
    console.log('play mode - new game started');
    this.moveCameratoAvatar();
  }

  render(display) {
    display.clear();
    DATASTORE.MAPS[this.state.mapID].render(display, this.state.cameraMapX, this.state.cameraMapY);
  }

  renderAvatar(display){
    display.clear();
    display.drawText(0, 0, "AVATAR");
    display.drawText(0, 2, "time: " + this.getAvatar().getTime());
    display.drawText(0, 3, "location: " + this.getAvatar().getX() + ", " + this.getAvatar().getY());
    display.drawText(0, 4, "Max HP: " + this.getAvatar().getMaxHp());
    display.drawText(0, 5, "Current HP: " + this.getAvatar().getHp());
  }

  handleInput(eventType, evt){
    return this.playHandler.handleInput(eventType, evt, this.moveAvatar);
  }
  moveCamera(dx, dy){
    this.state.cameraMapX += dx;
    this.state.cameraMapY += dy;
    return true;
  }
  moveAvatar(dx, dy) {
    console.dir(this.getAvatar());
    if(this.getAvatar().tryWalk(dx, dy)) {
      this.moveCameratoAvatar();
      return true;
    }
    return false;
  }
  moveCameratoAvatar(){
    this.state.cameraMapX = this.getAvatar().getX();
    this.state.cameraMapY = this.getAvatar().getY();
  }
  getAvatar() {
    return DATASTORE.ENTITIES[this.state.avatarID];
  }
}
export class WinMode extends UIMode {
  enter(){
    Message.send("hit r to try again!")
    if (!this.endHandler){
      this.endHandler = new EndInput(this.Game);
    }
  }
  render(display) {
    display.clear();
    display.drawText(37, 3, "YOU")
    display.drawText(37, 4, "WIN")
  }
  handleInput(eventType, evt){
    return this.endHandler.handleInput(eventType, evt);
  }
}

export class LoseMode extends UIMode {
  enter(){
    Message.send("hit r to try again!")
    if (!this.endHandler){
      this.endHandler = new EndInput(this.Game);
    }
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
    return this.endHandler.handleInput(eventType, evt);
  }
}

export class CacheMode extends UIMode {
  enter(){
    Message.send("hit escape to return to your game")
    if (!this.hcHandler){
      this.hcHandler = new HCInput(this.Game);
    }
  }
  render(display){
    display.clear();
    display.drawText(1, 1, "Hit esc to exit");
    display.drawText(1, 2, Message.cache)
  }
  handleInput(eventType, evt){
    return this.hcHandler.handleInput(eventType, evt);
  }
}

export class HelpMode extends UIMode {
  enter() {
    if (!this.hcHandler){
      this.hcHandler = new HCInput(this.Game);
    }
  }
  render(display) {
    display.clear();
    display.drawText(35, 1, "Help Mode:");
    display.drawText(1, 2, "Playmode Controls: wasd to move, k to win, l to lose,");
    display.drawText(1, 3, "c to enter cache mode, and esc to enter persistence mode");
    display.drawText(1, 4, "persistence mode: n for new game, s to save, l to load, escape to exit");
    display.drawText(1, 5, "cache mode: escape to exit");
    display.drawText(1, 6, "upon winning or losing, hit r to retry");
    display.drawText(30, 7, "escape to exit");
  }
  handleInput(eventType, evt){
    return this.hcHandler.handleInput(eventType, evt);
  }
}

export class PersistenceMode extends UIMode {
  enter(){
    Message.send("hit escape to return to your game")
    if (!this.persistenceHandler){
      this.persistenceHandler = new PersistenceInput(this.Game);
    }
  }
  render(display){
    display.clear();
    display.drawText(30, 3, "N for new game");
    display.drawText(30, 4, "S to save game");
    display.drawText(30, 5, "L to load game");
  }
  handleInput(eventType, evt){
    return this.persistenceHandler.handleInput(eventType, evt, this.handleSave, this.handleLoad);
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
    let mapData = JSON.parse(state.MAPS[mapID]);
    DATASTORE.MAPS[mapID] = MapMaker(mapData); //mapData.xdim, mapData.ydim, mapData.setRngState);
    DATASTORE.MAPS[mapID].build();
  }
  for (let entID in state.ENTITIES){
      DATASTORE.ENTITIES[entID] = JSON.parse(state.ENTITIES[entID]);
      let ent = EntityFactory.create(DATASTORE.ENTITIES[entID].name);
      if (DATASTORE.ENTITIES[entID].name == 'avatar') {
        this.Game.modes.play.state.avatarID = ent.getID();
      }
      DATASTORE.MAPS[Object.keys(DATASTORE.MAPS)[0]].addEntityAt(ent, DATASTORE.ENTITIES[entID].x, DATASTORE.ENTITIES[entID].y)
      delete DATASTORE.ENTITIES[entID];
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
