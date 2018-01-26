import {Factory} from './factory.js';
import {Entity} from './entity.js';

export let EntityFactory = new Factory(Entity, 'ENTITIES');

EntityFactory.learn({
  name: 'avatar',
  chr:'@',
  fg: '#eb4',
  mixinNames: ['TimeTracker', 'WalkerCorporeal', 'PlayerMessage', 'HitPoints', 'MeleeAttacker', 'ActorPlayer', 'Levels', 'ExpPlayer', 'PlayerStats', 'ManaPoints', 'RangedAttackerPlayer', 'RangedAttacks'],
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
  mixinNames: ['WalkerCorporeal', 'HitPoints', 'MeleeAttacker', 'ActorWanderer', 'ExpEnemy'],
  maxHp: 7,
  meleeDamage: 1,
  exp: 1,
  allowedActionDuration: 1
});

EntityFactory.learn({
  name: 'centaurion',
  chr:'C',
  fg: '#eb4',
  mixinNames: ['WalkerCorporeal', 'HitPoints', 'MeleeAttacker', 'ActorWanderer', 'ExpEnemy', 'RangedAttackerEnemy'],
  maxHp: 25,
  meleeDamage: 5,
  exp: 7,
  rangedDamage: 3,
  allowedActionDuration: 2
});

EntityFactory.learn({
  name: 'general',
  chr:'G',
  fg: '#eb4',
  mixinNames: ['WalkerCorporeal', 'HitPoints', 'MeleeAttacker', 'ActorWanderer', 'ExpEnemy', 'RangedAttackerEnemy'],
  maxHp: 100,
  meleeDamage: 20,
  exp: 15,
  rangedDamage: 12,
  allowedActionDuration: 3,
});

EntityFactory.learn({
  name: 'royal guard',
  chr:'R',
  fg: '#eb4',
  mixinNames: ['WalkerCorporeal', 'HitPoints', 'MeleeAttacker', 'ActorWanderer', 'ExpEnemy', 'RangedAttackerEnemy'],
  maxHp: 50,
  meleeDamage: 25,
  rangedDamage: 15,
  exp: 50,
  allowedActionDuration: 5,
});

EntityFactory.learn({
  name: 'king',
  chr:'K',
  fg: '#eb4',
  mixinNames: ['WalkerCorporeal', 'HitPoints', 'MeleeAttacker', 'ActorWanderer', 'RangedAttackerEnemy'],
  maxHp: 1,
  meleeDamage: 1,
  magicDamage: 100,
  curMp: 2,
  allowedActionDuration: 1,
});
