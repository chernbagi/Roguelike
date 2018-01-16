//base class that defines all entities (creatures etc.) in the GAME
import {MixableSymbol} from './mixable_symbol.js';
import {uniqueID} from './util.js';
import {DATASTORE} from './datastore.js';

export class Entity extends MixableSymbol {
  constructor(template){
    super(template);
    this.name = template.name;
    if (! this.state){this.state = {};}
    this.state.x = 0;
    this.state.y = 0;
    this.state.setupMapID = 0;
    this.state.id = uniqueID();
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

  moveBy(dx, dy) {
    let newX = this.state.x*1 + dx*1;
    let newY = this.state.y*1 + dy*1;

    if (this.getMap().isPositionOpen(newX, newY)) {
      this.state.x = newX;
      this.state.y = newY;
      this.getMap().updateEntityPosition(this, this.state.x, this.state.y)
      return true;
    }
    return false;
  }

  toJSON() {
    return JSON.stringify(this.state);
  }
  fromJSON(s) {
    this.state = JSON.parse(s);
  }
}
