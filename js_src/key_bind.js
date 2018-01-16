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
  handleInput(eventType, evt, moveAvatar){
    console.log(evt);
    if (eventType == 'keyup') {
      if (evt.key == "k") {
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
      if (evt.key == "w") {
        console.dir(this.Game.modes.play);
        moveAvatar(0, -1);
        return true;
      }
      if (evt.key == "s") {
        moveAvatar(0, 1);
        return true;
      }
      if (evt.key == "a") {
        moveAvatar(-1, 0);
        return true;
      }
      if (evt.key == "d") {
        moveAvatar(1, 0);
        return true;
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
  handleInput(eventType, evt, handleSave, handleLoad){
    if (eventType == 'keyup') {
      if (evt.key=="n" || evt.key == "N"){
        this.Game.setupNewGame();
        this.Game.switchMode('play');
        return(true);
      }
      if (evt.key=="s" || evt.key=="S"){
        handleSave();
        return(true);
      }
      if (evt.key== "l" || evt.key=="L"){
        handleLoad();
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
}
