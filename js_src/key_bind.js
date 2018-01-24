// //key binding for input handling
import {DATASTORE} from './datastore.js'

class keyBinder {
  constructor(Game){
    this.Game = Game;
  }
}
export class StartupInput extends keyBinder {
  handleInput(eventType, evt) {
    if (eventType == 'keyup') {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('persistence');
      return true;
    }
  }
}
export class PlayInput extends keyBinder{
  handleInput(eventType, evt){
    if (eventType == 'keyup') {
      if (evt.key == "k") {
        this.Game.switchMode('win');
        return true;
      }
      if (evt.key == "l") {
        this.Game.switchMode('level');
        return true;
      }
      if (evt.key == "c") {
        this.Game.switchMode('cache');
        return true;
      }
      if (evt.key == "Escape") {
        this.Game.switchMode('persistence');
        return true;
      }
      if (evt.key == "w" || evt.key == "s" || evt.key == "a" || evt.key == "d" || evt.key == "r" || evt.key == 't') {
        return evt.key;
      }
    }
  }
}

export class EndInput extends keyBinder {
  handleInput(eventType, evt) {
    if (eventType == 'keyup' && evt.key == "r") {
      this.Game.switchMode('startup');
      return true;
    }
  }
}

export class HCInput extends keyBinder {
  handleInput(eventType, evt) {
    if (eventType == 'keyup' && evt.key == "Escape") {
      this.Game.switchMode('play');
      return true;
    }
  }
}

export class PersistenceInput extends keyBinder {
  handleInput(eventType, evt){
    if (eventType == 'keyup') {
      if (evt.key=="n" || evt.key == "N"){
        this.Game.setupNewGame();
        this.Game.switchMode('play');
        return(true);
      }
      if (evt.key=="s" || evt.key=="S" || evt.key== "l" || evt.key=="L"){
        return evt.key;
      }
      if (evt.key == "Escape") {
        this.Game.switchMode('play');
        return(true);
      }
      return false;
    }
  }
}
export class LevelInput extends keyBinder{
  handleInput(eventType, evt){
    if (eventType == 'keyup') {
      if(evt.key == "Escape") {
        this.Game.switchMode('play');
        return true;
      }
      if (evt.key == "1" || evt.key == "2" || evt.key == "3" || evt.key == "4") {
        return evt.key;
      }
    }
  }
}
