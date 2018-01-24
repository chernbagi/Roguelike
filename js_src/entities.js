import {Factory} from './factory.js';
import {Entity} from './entity.js';

export let EntityFactory = new Factory(Entity, 'ENTITIES');

EntityFactory.learn({
  name: 'avatar',
  chr:'@',
  fg: '#eb4',
  mixinNames: ['TimeTracker', 'WalkerCorporeal', 'PlayerMessage', 'HitPoints', 'MeleeAttacker', 'ActorPlayer', 'Levels', 'ExpPlayer', 'PlayerStats'],
  maxHp: 10,
  meleeDamage: 3,
});

EntityFactory.learn({
  name: 'tree',
  chr:'T',
  fg: '#006400',
  mixinNames: ['HitPoints'],
  maxHp: 3,
});

EntityFactory.learn({
  name: 'soldier',
  chr:'S',
  fg: '#eb4',
  mixinNames: ['WalkerCorporeal', 'HitPoints', 'MeleeAttacker', 'ActorWanderer', 'PlayerMessage', 'ExpEnemy'],
  maxHp: 5,
  meleeDamage: 1,
  exp: 1
});

EntityFactory.learn({
  name: 'centaurion',
  chr:'C',
  fg: '#eb4',
  mixinNames: ['WalkerCorporeal', 'HitPoints', 'MeleeAttacker', 'ActorWanderer', 'PlayerMessage', 'ExpEnemy'],
  maxHp: 25,
  meleeDamage: 5,
  exp: 10,
});

EntityFactory.learn({
  name: 'general',
  chr:'G',
  fg: '#eb4',
  mixinNames: ['WalkerCorporeal', 'HitPoints', 'MeleeAttacker', 'ActorWanderer', 'PlayerMessage', 'ExpEnemy'],
  maxHp: 100,
  meleeDamage: 20,
  exp: 50
});

EntityFactory.learn({
  name: 'royal guard',
  chr:'R',
  fg: '#eb4',
  mixinNames: ['WalkerCorporeal', 'HitPoints', 'MeleeAttacker', 'ActorWanderer', 'PlayerMessage', 'ExpEnemy'],
  maxHp: 50,
  meleeDamage: 25,
  exp: 200
});

EntityFactory.learn({
  name: 'king',
  chr:'K',
  fg: '#eb4',
  mixinNames: ['WalkerCorporeal', 'HitPoints', 'MeleeAttacker', 'ActorWanderer', 'PlayerMessage'],
  maxHp: 1,
  meleeDamage: 1,
});
