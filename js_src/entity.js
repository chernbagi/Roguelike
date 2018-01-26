//base class that defines all entities (creatures etc.) in the GAME
import {MixableSymbol} from './mixable_symbol.js';
import {uniqueID} from './util.js';
import {DATASTORE} from './datastore.js';
import {SCHEDULER} from './timing.js';


export class Entity extends MixableSymbol {
  constructor(template){
    super(template);
    this.name = template.name;
    if (! this.state){this.state = {};}
    this.state.x = 0;
    this.state.y = 0;
    this.state.setupMapID = 0;
    this.state.id = uniqueID();
    this.state.killCount = {
      'soldier': 0,
      'centaurion': 0,
      'general': 0,
      'royal guard': 0,
      'king': 0
    }
  }

  getID() {return this.state.id;}
  setID(newID) {this.state.id = newID;}

  getName() {return this.state.name;}
  setName(newName) {this.state.name = newName;}

  getX() {return this.state.x;}
  setX(newX) {this.state.x = newX;}

  getY() {return this.state.y;}
  setY(newY) {this.state.y = newY;}

  getPos() {return `${this.state.x},${this.state.y}`}

  getMapID() {return this.state.setupMapID;}
  setMapID(newMapID) {this.state.setupMapID = newMapID;}

  getMap(){
    return DATASTORE.MAPS[this.state.setupMapID];
  }
  getAvatar(){
    for (let entID in DATASTORE.ENTITIES) {
      if (DATASTORE.ENTITIES[entID].getName() == 'avatar'){
        return DATASTORE.ENTITIES[entID];
      }
    }
  }
  getKillCount() {
    if (this.state.killCount){
      return this.state.killCount;
    }
    return false;
  }
  getScore() {
    let soldierCount = this.getKillCount()['soldier'];
    let centaurionCount = this.getKillCount()['centaurion'];
    let generalCount = this.getKillCount()['general'];
    let royalGuardCount = this.getKillCount()['royal guard'];
    let kingCount = this.getKillCount()['king'];
    let score = soldierCount * 1 + centaurionCount * 5 + generalCount * 25 + royalGuardCount * 25 + kingCount * 500;
    return score;
  }
  endGame() {
    let score = this.getScore();
    if (score >= 500) {
      return true;
    } else {
      return false;
    }
  }
  destroy(){
    if (this.getName() != 'avatar' && this.getName() != 'tree') {
      this.getAvatar().getKillCount()[this.getName()] = this.getAvatar().getKillCount()[this.getName()]*1 + 1;
    }
    if (this.getName() == 'avatar') {
      this.endGame();
    }
    this.getMap().extractEntity(this);
    SCHEDULER.remove(this);
    delete DATASTORE.ENTITIES[this.getID()];
    this.getMap().nextLevel();
  }

  toJSON() {
    return JSON.stringify(this.state);
  }
  fromJSON(s) {
    this.state = JSON.parse(s);
  }
}
