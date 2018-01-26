import {Message} from './message.js';
import {MapMaker} from './map.js';
import {DisplaySymbol} from'./display_symbol.js';
import {DATASTORE, clearDataStore} from './datastore.js';
import {EntityFactory} from './entities.js';
import {StartupInput, PlayInput, EndInput, HCInput, PersistenceInput, LevelInput, StoryInput, ControlInput, AimInput} from './key_bind.js';
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
    if (!this.playHandler){
      this.playHandler = new PlayInput(this.Game);
    }
    TIME_ENGINE.unlock();
    if (!this.Game.timer.hasStarted()){
      this.Game.timer.start();
    } else {
      this.Game.timer.restart();
    }
  }

  toJSON() {
    return JSON.stringify(this.state);
  }
  restoreFromState(stateDataString){
    this.state = JSON.parse(stateDataString);
  }

  setupNewGame() {
    SCHEDULER.clear();
    this.state.level = 0;
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
    if (!this.Game.timer.getRemainingTime()){
      this.endGame();
      return true;
    }
    if (!this.getAvatar()){
      this.endGame();
      return true;
    }
    this.score = this.getAvatar().getScore();
    display.drawText(0, 0, "AVATAR");
    display.drawText(0, 2, "Time: " + this.Game.timer.getRemainingTime() + " days");
    display.drawText(0, 3, "Location: " + this.getAvatar().getX() + ", " + this.getAvatar().getY());
    display.drawText(0, 4, "Max HP: " + this.getAvatar().getMaxHp());
    display.drawText(0, 5, "Current HP: " + this.getAvatar().getHp());
    display.drawText(0, 6, "Max MP: " + this.getAvatar().getMaxMp());
    display.drawText(0, 7, "Current MP: " + this.getAvatar().getMp());
    display.drawText(0, 8, "Melee Damage: " + this.getAvatar().getMeleeDamage());
    display.drawText(0, 9, "Ranged Damage: " + this.getAvatar().getRangedDamage());
    display.drawText(0, 10, "Magic Damage: " + this.getAvatar().getMagicDamage());
    display.drawText(0, 11, "Level: " + this.getAvatar().getLevel());
    display.drawText(0, 12, "Stat Points: " + this.getAvatar().getSP());
    display.drawText(0, 13, "Strength: " + this.getAvatar().getStr());
    display.drawText(0, 14, "Intelligence: " + this.getAvatar().getInt());
    display.drawText(0, 15, "Vitality: " + this.getAvatar().getVit());
    display.drawText(0, 16, "Agility: " + this.getAvatar().getAgi());
    display.drawText(0, 17, "Soldiers Killed: "+ this.getAvatar().getKillCount()['soldier']);
    display.drawText(0, 18, "Centaurions Killed: " + this.getAvatar().getKillCount()['centaurion']);
    display.drawText(0, 19, "Generals Killed: " + this.getAvatar().getKillCount()['general']);
    display.drawText(0, 20, "Royal Guards Killed: " + this.getAvatar().getKillCount()['royal guard']);
    display.drawText(0, 21, "Score: " + this.getAvatar().getScore());
  }
  endGame(){
    if (this.getAvatar()) {
      if (this.getAvatar.endGame()) {
        this.Game.switchMode('win');
      } else {
        this.Game.switchMode('lose');
      }
    } else {
      if (this.score > 500){
        this.Game.switchMode('win');
      } else {
        this.Game.switchMode('lose');
      }
    }

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
    if (eventOutput == 'z') {
      this.Game.switchMode('aim');
      return true;
    }
    if (eventOutput == 'x') {
      this.getAvatar().surroundingAttack();
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
      let x = map.getXdim() / 2;
      let y = map.getYdim() / 2;
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
      this.endGame();
      return true;
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
    this.Game.timer.pause()
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
    display.drawText(35, 0, "Help Mode:");
    display.drawText(0, 2, "Use wsad to move. To challange a higher level before all enemies on the current");
    display.drawText(0, 3, "level have been defeated, press t. To escape to a lower level, press r.");
    display.drawText(0, 4, "To execute a melee attack, merely bump into an enemy. To execute a ranged");
    display.drawText(0, 5, "attack, press z and choose your attack. To attack all enemies in your");
    display.drawText(0, 6, "immediate surroundings, press x.");
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
    DATASTORE.TIME = state.TIME;
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
        if (entState._ManaPoints) {
          ent.state._ManaPoints.maxHp = entState._ManaPoints.maxHp;
          ent.state._ManaPoints.curHp = entState._ManaPoints.curHp;
        }
        if (entState._TimeTracker) {
          ent.state._TimeTracker.timeTaken = entState._TimeTracker.timeTaken;
        }
        if (entState._RangedAttackerEnemy) {
          ent.state._RangedAttackerEnemy.rangedDamage = entState._RangedAttackerEnemy.rangedDamage;
          ent.state._RangedAttackerEnemy.magicDamage = entState._RangedAttackerEnemy.magicDamage;
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
      this.getAvatar().setMeleeDamage(3 + (this.getAvatar().getStr()-10) * 2);
      this.getAvatar().setRangedDamage((this.getAvatar().getStr()/2+this.getAvatar().getAgi())/2-10);
      this.getAvatar().addSP(-1);
      Message.send('1 Strength Point Added');
      return true;
    }
    if (eventOutput == '2') {
      this.getAvatar().addInt(1);
      this.getAvatar().setMaxMp((this.getAvatar().getInt() + (this.getAvatar().getLevel() - 1)))
      this.getAvatar().setMp(this.getAvatar().getMaxMp())
      this.getAvatar().setMagicDamage(3 + (this.getAvatar().getInt()-10) * 2)
      this.getAvatar().addSP(-1);
      Message.send('1 Intelligence Point Added');
      return true;
    }
    if (eventOutput == '3') {
      this.getAvatar().addVit(1);
      this.getAvatar().setMaxHp((this.getAvatar().getVit() + (this.getAvatar().getLevel() - 1)));
      this.getAvatar().setHp(this.getAvatar().getMaxHp());
      this.getAvatar().addSP(-1);
      Message.send('1 Vitality Point Added');
      return true;
    }
    if (eventOutput == '4') {
      this.getAvatar().addAgi(1);
      this.getAvatar().addSP(-1);
      this.getAvatar().setRangedDamage((this.getAvatar().getStr()/2+this.getAvatar().getAgi())/2-10);
      Message.send('1 Agility Point Added');
      return true;
    }

  }

   render(display){
     display.clear();
     display.drawText(1, 1, "Hit esc to exit");
     display.drawText(28, 2, "Stat Points Remaining: " + this.getAvatar().getSP());
     display.drawText(25, 3, "Press 1 to Raise Your Strength");
     display.drawText(23, 4, "Press 2 to Raise Your Intelligence");
     display.drawText(25, 5, "Press 3 to Raise Your Vitality");
     display.drawText(25, 6, "Press 4 to Raise Your Agility");
     if (this.getAvatar().getSP() == 0){
       this.Game.switchMode('play')
       return true;
     }
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
export class StoryMode extends UIMode {
  enter() {
    if (!this.storyHandler){
      this.storyHandler = new StoryInput(this.Game);
    }
  }
  render(display) {
    display.clear();
    display.drawText(0, 0, "Your nation is at war with a neighboring country. You are the last hero your");
    display.drawText(0, 1, "nation has. The enemy army vastly outnumbers your own. In an act of desperation,");
    display.drawText(0, 2, "your king has sent you to launch a preemtive strike against the opposing nation");
    display.drawText(0, 3, "to allow for the tiniest chance of victory in this great war for survival.");
    display.drawText(0, 5, "The enemy army marches unforgivingly towards your own camp. You must cripple");
    display.drawText(0, 6, "the enemy quickly, before they have a chance to reach your nation\'s army and");
    display.drawText(0, 7, "destroy them. You have ten days to complete your task.");
    display.drawText(0, 9, "Oh great hero, last hope of your nation, sally forth and strike a blow that will");
    display.drawText(0, 10, "not only save your people, but also be recorded in the annals of history for all");
    display.drawText(0, 11, "to wonder at!");
    display.drawText(28, 15, "Press any key to continue");

  }
  handleInput(eventType, evt){
    return this.storyHandler.handleInput(eventType, evt);
  }
}

export class ControlMode extends UIMode {
  enter() {
    if (!this.controlHandler){
      this.controlHandler = new ControlInput(this.Game);
    }
  }
  render(display) {
    display.clear();
    display.drawText(0, 0, "Use wsad to move. To challange a higher level before all enemies on the current");
    display.drawText(0, 1, "level have been defeated, press t. To escape to a lower level, press r.");
    display.drawText(0, 2, "To execute a melee attack, merely bump into an enemy. To execute a ranged");
    display.drawText(0, 3, "attack, press z and choose your attack. To attack all enemies in your");
    display.drawText(0, 4, "immediate surroundings, press x.");
    display.drawText(0, 6, "You will start with 40 stat points to be distributed amongst 4 stats, strength,");
    display.drawText(0, 7, "intelligence, vitality, and agility. Strength controls your melee attack");
    display.drawText(0, 8, "power, intelligence your mana for special attacks and special attack");
    display.drawText(0, 9, "power, vitality your health, and agility your movement speed and");
    display.drawText(0, 10, "dodging ability.");
    display.drawText(28, 15, "Press any key to continue");
  }
  handleInput(eventType, evt){
    return this.controlHandler.handleInput(eventType, evt);
  }
}

export class AimMode extends UIMode{
  enter() {
    if (!this.aimHandler){
      this.aimHandler = new AimInput(this.Game);
    }
    Message.send("Entered Aim Mode. Select your Attack")
  }
  getAvatar() {
    return DATASTORE.ENTITIES[this.Game.modes.play.state.avatarID];
  }
  handleInput(eventType, evt){
    let secondaryOutput = false;
    let eventOutput = this.aimHandler.handleInput(eventType, evt);
    if (eventOutput == '1' || eventOutput == '2' || eventOutput == '3' || eventOutput == '4'){
      this.choice = eventOutput;
    }
    if (eventType == 'keyup') {
      Message.send("Choose a direction to aim your attack with wsad");
      if (evt.key == 'w' || evt.key == 's' || evt.key == 'a' || evt.key == 'd'){
        secondaryOutput = evt.key;
      }
    }
    if (this.choice == '1') {
      console.log(secondaryOutput)
      if (secondaryOutput != false){
        console.log(secondaryOutput)
        this.getAvatar().bowAttack(secondaryOutput);
        this.Game.switchMode('play');
      }
      return true;
    }
    if (this.choice == '2') {
      if (secondaryOutput != false){
        this.getAvatar().windAttack(secondaryOutput);
        this.Game.switchMode('play');
      }
      return true;
    }
    if (this.choice == '3') {
      if (secondaryOutput != false){
        this.getAvatar().fireAttack(secondaryOutput);
        this.Game.switchMode('play');
      }
      return true;
    }
    if (this.choice == '4') {
      if (secondaryOutput != false){
        this.getAvatar().lightningAttack(secondaryOutput);
        this.Game.switchMode('play');
      }
      return true;
    }
    return eventOutput;
  }
  render (display) {
    display.drawText(19, 0, "AIM MODE: SELECT FROM THE FOLLOWING ATTACKS");
    display.drawText(13, 1, "1: Bow  2: Wind Blade  3: Inferno  4: Chain Lightning")
    display.drawText(28, 2, "Press escape to exit");
  }
  renderAvatar(display){
    display.clear();
    display.drawText(0, 0, "AVATAR");
    display.drawText(0, 2, "Time: " + this.Game.timer.getRemainingTime() + " days");
    display.drawText(0, 3, "Location: " + this.getAvatar().getX() + ", " + this.getAvatar().getY());
    display.drawText(0, 4, "Max HP: " + this.getAvatar().getMaxHp());
    display.drawText(0, 5, "Current HP: " + this.getAvatar().getHp());
    display.drawText(0, 6, "Max MP: " + this.getAvatar().getMaxMp());
    display.drawText(0, 7, "Current MP: " + this.getAvatar().getMp());
    display.drawText(0, 8, "Melee Damage: " + this.getAvatar().getMeleeDamage());
    display.drawText(0, 9, "Ranged Damage: " + this.getAvatar().getRangedDamage());
    display.drawText(0, 10, "Magic Damage: " + this.getAvatar().getMagicDamage());
    display.drawText(0, 11, "Level: " + this.getAvatar().getLevel());
    display.drawText(0, 12, "Stat Points: " + this.getAvatar().getSP());
    display.drawText(0, 13, "Strength: " + this.getAvatar().getStr());
    display.drawText(0, 14, "Intelligence: " + this.getAvatar().getInt());
    display.drawText(0, 15, "Vitality: " + this.getAvatar().getVit());
    display.drawText(0, 16, "Agility: " + this.getAvatar().getAgi());
    display.drawText(0, 17, "Soldiers Killed: "+ this.getAvatar().getKillCount()['soldier']);
    display.drawText(0, 18, "Centaurions Killed: " + this.getAvatar().getKillCount()['centaurion']);
    display.drawText(0, 19, "Generals Killed: " + this.getAvatar().getKillCount()['general']);
    display.drawText(0, 20, "Royal Guards Killed: " + this.getAvatar().getKillCount()['royal guard']);
    display.drawText(0, 21, "Score: " + this.getAvatar().getScore());
  }
}
