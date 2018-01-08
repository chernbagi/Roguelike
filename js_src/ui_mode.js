import {Message} from './message.js';

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
  render(display) {
    display.clear();
    display.drawText(38, 3, "w to win l to lose")
    Message.send("hit escape to create new, load, or save game")
  }
  handleInput(eventType, evt){
    console.log(evt)
    if (eventType == 'keyup' && evt.key == "w") {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('win');
      return true;
    }
    if (eventType == 'keyup' && evt.key == "l") {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('lose');
      return true;
    }
    if (eventType == 'keyup' && evt.key == "c") {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('cache');
      return true;
    }
    if (eventType == 'keyup' && evt.key == "Escape") {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('persistence');
      return true;
    }
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
  render(display){
    display.clear();
    display.drawText(30, 3, "N for new game");
    display.drawText(30, 4, "S to save game");
    display.drawText(30, 5, "L to load game");
  }
  handleInput(eventType, evt){
    if (eventType == 'keyup') {
      if (evt.key=="n"){
        console.log("new game")
        this.Game.switchMode('play')
      }
      if (evt.key=="s"){
        console.log("save game")
      }
      if (evt.key== "l"){
        console.log("load game")
      }
      if (evt.key == "Escape") {
        this.Game.switchMode('play')
      }
    }
  }
}
