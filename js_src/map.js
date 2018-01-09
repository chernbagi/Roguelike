import {TILES} from './tile.js';
import {init2DArray} from './util.js'
import ROT from 'rot-js';


export class Map {
  constructor(xdim, ydim){
    this.xdim = xdim || 1;
    this.ydim = ydim || 1;
    //this.tileGrid = init2DArray(this.xdim, this.ydim, TILES.NULLTILE);
    this.tileGrid = TILE_GRID_GENERATOR['basicCaves'](xdim, ydim)
  }
  render(display, cameraX, cameraY){
    let cx = 0;
    let cy = 0;
    for(let xi=0;xi<this.xdim;xi++){
      for(let yi=0;yi<this.ydim;yi++){
        this.tileGrid[xi][yi].render(display, cx, cy);
        cy++;
      }
      cy = 0;
      cx++;
    }
  }
}

let TILE_GRID_GENERATOR = {
  basicCaves: function(xdim, ydim) {
    let tg = init2DArray(xdim, ydim, TILES.NULLTILE);
    let gen = new ROT.Map.Cellular(xdim, ydim, {connected: true});
    gen.randomize(.5);
    for (var i = 3; i > 0; i--){
      gen.create();
    }
    gen.connect(function(x, y, isWall){
      tg[x][y] = (isWall || x==0 || y==0 || x==xdim-1 || y==ydim-1) ? TILES.WALL : TILES.FLOOR;
    });
    return tg;
  }
}
