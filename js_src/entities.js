import {Factory} from './factory.js';
import {Entity} from './entity.js';

export let EntityFactory = new Factory(Entity, 'ENTITIES');

EntityFactory.learn({
  name: 'avatar',
  chr:'@',
  fg: '#eb4',
  mixinNames: ['TimeTracker', 'WalkerCorporeal', 'PlayerMessage', 'HitPoints'],
  maxHp: 10
});

EntityFactory.learn({
  name: 'tree',
  chr:'T',
  fg: '#006400',
});
