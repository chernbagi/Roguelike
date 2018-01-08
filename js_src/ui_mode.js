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
    display.drawText(30, 6, "Hit any key to begin");
    display.drawText(35, 3, "Welcome to");
    display.drawText(38, 4, "WEED");
    display.drawText(37, 5, "STRIKE");
  }
  handleInput(eventType, evt){
    if (eventType == 'keyup') {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('play');
      return true;
    }
  }
}

export class PlayMode extends UIMode {
  render(display) {
    display.drawText(38, 3, "w to win l to lose")
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
  }
}

export class WinMode extends UIMode {
  render(display) {
    display.drawText(38, 3, "YOU")
    display.drawText(37, 4, "WIN")
  }
}

export class LoseMode extends UIMode {
  render(display) {
    display.drawText(38, 3, "YOU");
    display.drawText(37, 4, "LOSE");
  }
}

export class CacheMode extends UIMode {
  render(display){
    display.drawText(1, 1, "Hit esc to exit");
    display.drawText(2, 1, Message.cache)
  }
  handleInput(eventType, evt){
    if (eventType == 'keyup' && evt.key == "esc") {
      console.dir(this);
      console.log(this.Game);
      this.Game.switchMode('play');
      return true;
    }
  }
}
