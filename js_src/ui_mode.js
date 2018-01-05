class UIMode {
  constructor(){
    console.log("created " + this.constructor.name)
  }
  enter(){
    console.log("entered " + this.constructor.name)
  }
  exit(){
    console.log("exited " + this.constructor.name)
  }
  handleInput(eventType, evt){
    console.log("handling " + this.constructor.name)
    console.log(`event type is ${eventType}`)
    console.dir(evt)
    return(true)
  }
   render(display){
    console.log("redering " + this.constructor.name)
    display.drawText(2, 2, "redering " + this.constructor.name)
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
  constructor(){
    super();
  }
  render(display) {
    display.drawText(38, 3, "w to win l to lose")
  }
}

export class WinMode extends UIMode {
  constructor(){
    super();
  }
  render(display) {
    display.drawText(38, 3, "YOU")
    display.drawText(37, 4, "WIN")
  }
}

export class LoseMode extends UIMode {
  constructor(){
    super();
  }
  render(display) {
    display.drawText(38, 3, "YOU")
    display.drawText(37, 4, "LOSE")
  }
}
