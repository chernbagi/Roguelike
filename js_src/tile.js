//class for map tiles
import {DisplaySymbol} from './display_symbol.js';
// import {Color} from './colors.js';

// class Tile extends DisplaySymbol {
//   constructor(name, chr, fg, bg){
//     super(chr, fg, bg);
//     this.name = name;
//   }
// }

class Tile {
  constructor(name, chr, fg, bg){
    this.sym = new DisplaySymbol(chr, fg, bg);
    this.name = name;
  }
  render(disp,x,y) {
    this.sym.render(disp,x,y);
  }
}

export let TILES = {
  NULLTILE: new Tile('nulltile', '#'),
  WALL: new Tile('wall', '#'),
  FLOOR: new Tile('floor', '.')
}
