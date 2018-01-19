import {DATASTORE} from './datastore.js'
import ROT from 'rot-js';

export function init2DArray(xdim, ydim, initialValue){
  let a = []
  for(let x=0; x < xdim; x++){
    a.push([]);
    for (let y = 0; y < ydim; y++){
      a[x].push(initialValue);
    }
  }
  return a;
}
let randCharSource = '1234567890abcdefghijklmnopqrstuvwxyz'.split('');
export function uniqueID(tag) {
  let id = ''
  for (let i = 0; i < 4; i++){
    id = id + randCharSource.random();
  }
  id = `${tag ? tag + ' - ': ''}${DATASTORE.ID_SEQ} - ${id}`; // DATASTORE.ID_SEQ + '-' + id;
  DATASTORE.ID_SEQ++;
  return id;
}

export function randomBinary() {
  let num = ROT.RNG.getUniform()
  if (num <= 0.5) {return 0;} else {return 1;}
}
