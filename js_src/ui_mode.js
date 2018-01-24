import {Message} from './message.js';
import {MapMaker} from './map.js';
import {DisplaySymbol} from'./display_symbol.js';
import {DATASTORE, clearDataStore} from './datastore.js';
import {EntityFactory} from './entities.js';
import {StartupInput, PlayInput, EndInput, HCInput, PersistenceInput, LevelInput} from './key_bind.js';
import {TIME_ENGINE, SCHEDULER} from './timing.js';
import ROT from 'rot-js';

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
    console.log('DATASTORE')
    console.dir(DATASTORE);
    clearDataStore();
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
    display.drawText(37, 4, "HERO'S");
    display.drawText(37, 5, "GAMBIT");
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
      cameraMapY: '',
      level: 1
    };
  }

  enter(){
    Message.send("hit escape to enter persistence mode")
    if (!this.playHandler){
      this.playHandler = new PlayInput(this.Game);
    }
    TIME_ENGINE.unlock();
  }

  toJSON() {
    return JSON.stringify(this.state);
  }
  restoreFromState(stateDataString){
    this.state = JSON.parse(stateDataString);
  }

  setupNewGame() {
    SCHEDULER.clear();
    let m = MapMaker({xdim: 40, ydim: 12});
    this.state.mapID = m.getID();
    m.build();
    this.state.cameraMapX = 0;
    this.state.cameraMapY = 0;
    let a = EntityFactory.create('avatar');
    this.state.avatarID = a.getID();
    m.addEntityAtRandomPosition(a);
    this.levelHandler(m, EntityFactory);
    console.log('play mode - new game started');
    this.moveCameratoAvatar();
    Message.clearCache();
    DATASTORE.GAME = this.Game;
    DATASTORE.LEVEL = this.state.level;
  }

  setupNewLevel() {
    SCHEDULER.clear();
    let avatar = DATASTORE.ENTITIES[this.getAvatar().getID()];
    let x = avatar.state.x;
    let y = avatar.state.y;
    this.state.level = DATASTORE.LEVEL;
    this.state.level += 1;
    clearDataStore();
    DATASTORE.ENTITIES[avatar.getID()] = avatar;
    DATASTORE.GAME = this.Game;
    let m = MapMaker({xdim: 40, ydim: 12});
    this.state.mapID = m.getID();
    m.build();
    this.state.cameraMapX = 0;
    this.state.cameraMapY = 0;
    m.addEntityAt(avatar, x, y);
    SCHEDULER.add(avatar, true);
    this.levelHandler(m, EntityFactory);
    console.log(DATASTORE.ENTITIES[this.state.avatarID]);
    this.moveCameratoAvatar();
    DATASTORE.LEVEL = this.state.level;
    Message.send('Level ' + this.state.level*1);
    this.render(this.Game.display.main.o);
  }

  render(display) {
    display.clear();
    DATASTORE.MAPS[this.state.mapID].render(display, this.state.cameraMapX, this.state.cameraMapY);
    if (DATASTORE.MAPS[this.state.mapID].nextLevel()){
      this.setupNewLevel();
    }
  }

  renderAvatar(display){
    display.clear();
    display.drawText(0, 0, "AVATAR");
    display.drawText(0, 2, "Time: " + this.getAvatar().getTime());
    display.drawText(0, 3, "Location: " + this.getAvatar().getX() + ", " + this.getAvatar().getY());
    display.drawText(0, 4, "Max HP: " + this.getAvatar().getMaxHp());
    display.drawText(0, 5, "Current HP: " + this.getAvatar().getHp());
    display.drawText(0, 6, "Melee Damage: " + this.getAvatar().getMeleeDamage());
    display.drawText(0, 7, "Level: " + this.getAvatar().getLevel());
    display.drawText(0, 8, "Stat Points: " + this.getAvatar().getSP());
    display.drawText(0, 9, "Strength: " + this.getAvatar().getStr());
    display.drawText(0, 10, "Intelligence: " + this.getAvatar().getInt());
    display.drawText(0, 11, "Vitality: " + this.getAvatar().getVit());
    display.drawText(0, 12, "Agility: " + this.getAvatar().getAgi());
    display.drawText(0, 13, "Soldiers Killed: ");// + this.getAvatar().getAgi());
    display.drawText(0, 14, "Centaurions Killed: ");// + this.getAvatar().getAgi());
    display.drawText(0, 15, "Generals Killed: ");// + this.getAvatar().getAgi());
  }

  handleInput(eventType, evt){
    let eventOutput = this.playHandler.handleInput(eventType, evt);
    if (eventOutput == 'w') {
      this.moveAvatar(0, -1);
      return true;
    }
    if (eventOutput == 's') {
      this.moveAvatar(0, 1);
      return true;
    }
    if (eventOutput == 'a') {
      this.moveAvatar(-1, 0);
      return true;
    }
    if (eventOutput == 'd') {
      this.moveAvatar(1, 0);
      return true;
    }
    if (eventOutput == 'r') {
      this.retreat();
      return true;
    }
    if (eventOutput == 't') {
      this.advance();
      return true;
    }
    return eventOutput;
  }
  moveCamera(dx, dy){
    this.state.cameraMapX += dx;
    this.state.cameraMapY += dy;
    return true;
  }
  moveAvatar(dx, dy) {
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
  makeEntites(num, map, EntityFactory){
    for (let i = 0; i < 3; i++) {
      map.addEntityAtRandomPosition(EntityFactory.create('tree'));
    }
    for (let i = 0; i < num; i++) {
      map.addEntityAtRandomPosition(EntityFactory.create('soldier'));
    }
    if (this.state.level >= 5) {
      for (let i = 0; i < num / 5; i++){
        map.addEntityAtRandomPosition(EntityFactory.create('centaurion'));
      }
    }
    if (this.state.level >= 15) {
      for (let i = 0; i < num / 10; i++){
        map.addEntityAtRandomPosition(EntityFactory.create('general'));
      }
    }
  }
  levelHandler(map, EntityFactory) {
    if (this.state.level <= 3) {
      let num = ROT.RNG.getUniform() * 2 + 3;
      this.makeEntites(num, map, EntityFactory);
    } else if (3 < this.state.level && this.state.level <= 5) {
      let num = ROT.RNG.getUniform() * 5 + 5;
      this.makeEntites(num, map, EntityFactory);
    } else if (5 < this.state.level && this.state.level <= 10) {
      let num = ROT.RNG.getUniform() * 5 + 5;
      console.log('3 ' + num);
      this.makeEntites(num, map, EntityFactory);
    } else if (10 < this.state.level && this.state.level <= 19) {
      let num = ROT.RNG.getUniform() * 10 + 5;
      this.makeEntites(num, map, EntityFactory);
    } else if (this.state.level == 20) {
      let x = map.getXdim() / 2
      let y = map.getYdim() / 2
      map.tileGrid[x][y].name == 'floor';
      map.tileGrid[x + 1][y].name == 'floor';
      map.tileGrid[x - 1][y].name == 'floor';
      map.tileGrid[x][y + 1].name == 'floor';
      map.tileGrid[x][y - 1].name == 'floor';
      map.addEntityAt(EntityFactory.create('king'), x, y);
      map.addEntityAt(EntityFactory.create('royal guard'), x + 1, y);
      map.addEntityAt(EntityFactory.create('royal guard'), x - 1, y);
      map.addEntityAt(EntityFactory.create('royal guard'), x, y + 1);
      map.addEntityAt(EntityFactory.create('royal guard'), x, y - 1);
    } else if (this.state.level >= 20) {
      this.Game.switchMode('win')
    }
  }
  retreat() {
    if (this.state.level == 1) {
      Message.send('you coward!')
      this.Game.switchMode('lose')
    }
    this.state.level = this.state.level*1 - 2;
    DATASTORE.LEVEL = this.state.level;
    this.setupNewLevel();
  }
  advance() {
    if (this.state.level == 20) {
      Message.send('you cannot advance')
    }
    this.setupNewLevel();
  }

  exit(){
    TIME_ENGINE.lock();
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
    this.endHandler = new EndInput(this.Game);
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
    display.drawText(1, 2, "Playmode Controls: wasd to move, k to win, l to lose, r to retreat a level");
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
    let eventOutput = this.persistenceHandler.handleInput(eventType, evt);
    if (eventOutput == "s" || eventOutput == "S") {
      this.handleSave();
      return true;
    }
    if (eventOutput == "l" || eventOutput == "L"){
      this.handleLoad();
      return true;
    }
    return eventOutput;
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
    console.dir(restorationString);
    clearDataStore();
    DATASTORE.ID_SEQ = state.ID_SEQ;
    DATASTORE.LEVEL = state.LEVEL;
    console.log(state.GAME);
    if (!state.GAME.rseed){
      DATASTORE.GAME = JSON.parse(state.GAME);
      console.log(DATASTORE.GAME.playModeState);
      DATASTORE.GAME.playModeState = JSON.parse(DATASTORE.GAME.playModeState);
      console.log(DATASTORE.GAME.playModeState);
    } else {
      DATASTORE.GAME = state.GAME
    }

    for (let mapID in state.MAPS){
      let mapData = JSON.parse(state.MAPS[mapID]);
      DATASTORE.MAPS[mapID] = MapMaker(mapData); //mapData.xdim, mapData.ydim, mapData.setRngState);
      this.Game.modes.play.state.mapID = mapID;
      DATASTORE.MAPS[mapID].build();
    }
    for (let entID in state.ENTITIES){
        DATASTORE.ENTITIES[entID] = JSON.parse(state.ENTITIES[entID]);
        let ent = EntityFactory.create(DATASTORE.ENTITIES[entID].name);

        let entState = JSON.parse(state.ENTITIES[entID])
        if (entState._PlayerStats) {
          ent.state._PlayerStats.strength = entState._PlayerStats.strength;
          ent.state._PlayerStats.intelligence = entState._PlayerStats.intelligence;
          ent.state._PlayerStats.vitality = entState._PlayerStats.vitality;
          ent.state._PlayerStats.agility = entState._PlayerStats.agility;
        }
        if (entState._HitPoints) {
          ent.state._HitPoints.maxHp = entState._HitPoints.maxHp;
          ent.state._HitPoints.curHp = entState._HitPoints.curHp;
        }
        if (entState._TimeTracker) {
          ent.state._TimeTracker.timeTaken = entState._TimeTracker.timeTaken;
        }
        if (entState._MeleeAttacker) {
          ent.state._MeleeAttacker.meleeDamage = entState._MeleeAttacker.meleeDamage;
        }
        if (entState._ExpPlayer) {
          ent.state._ExpPlayer.exp = entState._ExpPlayer.exp;
        }
        if (entState._Levels) {
          ent.state._Levels.level = entState._Levels.level;
        }
        SCHEDULER.remove(state.ENTITIES[entID]);
        DATASTORE.MAPS[Object.keys(DATASTORE.MAPS)[0]].addEntityAt(ent, DATASTORE.ENTITIES[entID].x, DATASTORE.ENTITIES[entID].y);
        delete ent.getMap().state.mapPostoEntityID[ent.getMap().state.entityIDtoMapPos[ent.getID()]];
        delete ent.getMap().state.entityIDtoMapPos[ent.getID()];
        SCHEDULER.remove(ent);
        DATASTORE.ENTITIES[entID] = ent;
        delete DATASTORE.ENTITIES[ent.getID()]
        DATASTORE.ENTITIES[entID].state.id = entID;
        let pos = `${DATASTORE.ENTITIES[entID].state.x},${DATASTORE.ENTITIES[entID].state.y}`;
        ent.getMap().state.mapPostoEntityID[pos] = entID;
        ent.getMap().state.entityIDtoMapPos[ent.getID()] = pos;
        SCHEDULER.add(ent);
        if (ent.name == 'avatar') {
          this.Game.modes.play.state.avatarID = ent.getID();
        }
    }
    console.log('post-load datastore');
    console.dir(DATASTORE);
    this.Game.switchMode('play');
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

export class LevelMode extends UIMode {
  enter(){
    if (!this.levelHandler){
      this.levelHandler = new LevelInput(this.Game);
    }
    TIME_ENGINE.unlock();
    if (this.getAvatar().getSP() == 0){
      Message.send('you have no stat points!')
      this.Game.switchMode('play');
    }
  }
  getAvatar() {
    return DATASTORE.ENTITIES[this.Game.modes.play.state.avatarID];
  }
  handleInput(eventType, evt){
    let eventOutput = this.levelHandler.handleInput(eventType, evt);
    if (eventOutput == '1') {
      this.getAvatar().addStr(1);
      this.getAvatar().addSP(-1);
      Message.send('1 Strength Point Added');
      return true;
    }
    if (eventOutput == '2') {
      this.getAvatar().addInt(1);
      this.getAvatar().addSP(-1);
      Message.send('1 Intelligence Point Added');
      return true;
    }
    if (eventOutput == '3') {
      this.getAvatar().addVit(1);
      this.getAvatar().addSP(-1);
      Message.send('1 Vitality Point Added');
      return true;
    }
    if (eventOutput == '4') {
      this.getAvatar().addAgi(1);
      this.getAvatar().addSP(-1);
      Message.send('1 Agility Point Added');
      return true;
    }
    this.getAvatar().setMaxHp((this.getAvatar().getVit() + (this.getAvatar().getLevel() - 1)));
    this.getAvatar().setHp(this.getAvatar().getMaxHp());
    this.getAvatar().setMeleeDamage(3 + (this.getAvatar().getStr()-10) * 2)
  }
   render(display){
     display.clear();
     display.drawText(1, 1, "Hit esc to exit");
     display.drawText(28, 2, "Stat Points Remaining: " + this.getAvatar().getSP());
     display.drawText(25, 3, "Press 1 to Raise Your Strength");
     display.drawText(23, 4, "Press 2 to Raise Your Intelligence");
     display.drawText(25, 5, "Press 3 to Raise Your Vitality");
     display.drawText(25, 6, "Press 4 to Raise Your Agility");
  }
  renderAvatar(display){
    display.clear();
    display.drawText(0, 0, "Stat Mode");
    display.drawText(0, 2, "Level: " + this.getAvatar().getLevel());
    display.drawText(0, 3, "Strength: " + this.getAvatar().getStr());
    display.drawText(0, 4, "Intelligence: " + this.getAvatar().getInt());
    display.drawText(0, 5, "Vitality: " + this.getAvatar().getVit());
    display.drawText(0, 6, "Agility: " + this.getAvatar().getAgi());
  }
}
