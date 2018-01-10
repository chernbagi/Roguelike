import {TILES} from './tile.js';
import {init2DArray, uniqueID} from './util.js'
import ROT from 'rot-js';
import {DATASTORE} from './datastore.js'


class Map {
  constructor(xdim, ydim, mapType){
    this.state = {};
    this.state.xdim = xdim || 1;
    this.state.ydim = ydim || 1;
    //this.tileGrid = init2DArray(this.xdim, this.ydim, TILES.NULLTILE);
    this.state.mapType = mapType || 'basic caves'
    this.state.setupRngState = ROT.RNG.getState();
    this.state.id = uniqueID('map-' + this.state.mapType);
  }

  build () {
    this.tileGrid = TILE_GRID_GENERATOR['basicCaves'](this.state.xdim, this.state.ydim, this.state.setupRngState);
  }

  getID() {return this.state.id;}
  setID(newID) {this.state.id = newID;}

  getXdim() {return this.state.xdim;}
  setXdim(newXdim) {this.state.xdim = newXdim;}

  getYdim() {return this.state.ydim;}
  setYdim(newID) {this.state.ydim = newYdim;}

  getMapType() {return this.state.mapType;}
  setMapType(newMaptypee) {this.state.mapType = newMaptypee;}

  getRngState() {return this.state.setupRngState;}
  setRngState(newRngState) {this.state.setupRngState = newRngState;}

  render(display, cameraX, cameraY){
    let cx = 0;
    let cy = 0;
    let xstart = cameraX - Math.trunc(display.getOptions().width / 2);
    let xend = xstart + display.getOptions().width;
    let ystart = cameraY - Math.trunc(display.getOptions().height / 2);
    let yend = ystart + display.getOptions().height;
    for(let xi=xstart;xi<xend;xi++){
      for(let yi=ystart;yi<yend;yi++){
        this.getTile(xi, yi).render(display, cx, cy);
        cy++;
      }
      cy = 0;
      cx++;
    }
  }

  toJSON() {
    return JSON.stringify(this.state);
  }

  getTile(mapx, mapy){
    if (mapx < 0 || mapx > this.state.xdim - 1 || mapy < 0 || mapy > this.state.ydim - 1){
      return TILES.NULLTILE;
    }
    return this.tileGrid[mapx][mapy];
  }

}

let TILE_GRID_GENERATOR = {
  basicCaves: function(xdim, ydim, rngState) {
    let tg = init2DArray(xdim, ydim, TILES.NULLTILE);
    let gen = new ROT.Map.Cellular(xdim, ydim, {connected: true});
    let origRngState = ROT.RNG.getState();
    ROT.RNG.setState(rngState);
    gen.randomize(.5);
    for (var i = 3; i > 0; i--){
      gen.create();
    }
    gen.connect(function(x, y, isWall){
      tg[x][y] = (isWall || x==0 || y==0 || x==xdim-1 || y==ydim-1) ? TILES.WALL : TILES.FLOOR;
    });
    ROT.RNG.setState(origRngState)
    return tg;
  }
}

export function MapMaker(mapData) {
  let m = new Map(mapData.xdim, mapData.ydim, mapData.mapType);
  if (mapData.id) {
    m.setID(mapData.id);
  }
  if (mapData.setupRngState) {
    m.setID(mapData.setupRngState);
  }

  DATASTORE.MAPS[m.getID()] = m;
  return m;
}
