//class for map tiles
import {DisplaySymbol} from 'display_symbol.js'
import {Color} from 'colors.js'

export class Tile extends DisplaySymbol{
  constructor(name, chr, fg, bg){
    super(chr, fg, bg);
    this.name = name;
  }
}

export let TILES = {
  NULLTILE: new Tile('nulltile', ' ')
  WALL: new Tile('wall', '#')
  FLOOR: new Tile('floor', '0')
}
