//class for map tiles
import {DisplaySymbol} from './display_symbol.js';
// import {Color} from './colors.js';

// class Tile extends DisplaySymbol {
//   constructor(name, chr, fg, bg){
//     super(chr, fg, bg);
//     this.name = name;
//   }
// }

class Tile extends DisplaySymbol{
  constructor(template){
    super(template);
    this.name = name;
  }
  isA(name) {
    return this.chr == '.';
  }
}

export let TILES = {
  NULLTILE: new Tile({name: 'nulltile', chr: ' '}),
  WALL: new Tile({name: 'wall', chr: '#'}),
  FLOOR: new Tile({name: 'floor', chr: '.'})
}
