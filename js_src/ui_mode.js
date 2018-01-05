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
  handleInput(){
    console.log("handling " + this.constructor.name)
  }
  render(display){
    console.log("redering " + this.constructor.name)
    display.drawText(2, 2, "redering " + this.constructor.name)
  }
}

export class StartupMode extends UIMode {
  constructor(){
    super();
  }
}
