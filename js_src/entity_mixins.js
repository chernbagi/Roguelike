//defines the various mixins that can be added to an Entity
import {Message} from './message.js';
import {TIME_ENGINE, SCHEDULER} from './timing.js';
import ROT from 'rot-js';


let exampleMixin = {
  META:{
    mixinName: 'ExampleMixin',
    mixinGroupName: 'ExampleMixinGroup',
    stateNameSpace: '_ExampleMixin',
    stateModel: {
      foo: 10
    },
    initialize: function(){
      //do any initialization
    }
  },
  METHODS: {
    method1: function(p){
      //do stuff
      //can access / manipulate this.state.ExampleMixin
    }
  },
  LISTENERS: {
    'evtLabel': function(evtData) {

    }
  }
};

//******************************************

export let PlayerMessage = {
  META:{
    mixinName: 'PlayerMessage',
    mixinGroupName: 'Messager',
    stateModel: {
      timeTaken: 0
    },
  },
  LISTENERS: {
    'wallBlocked': function(evtData) {
      Message.send('can\'t move there because ' + evtData.reason);
    },
    'attacks': function(evtData){
      Message.send(this.getName() + " attacks " + evtData.target.getName());
    },
    'damages': function(evtData){
      Message.send(this.getName() + " deals "+ evtData.damageAmount + " damage to " + evtData.target.getName());
    },
    'kills': function(evtData){
      Message.send(this.getName() + " kills the " + evtData.target.getName());
    },
  }
};

//******************************************

export let TimeTracker = {
  META:{
    mixinName: 'TimeTracker',
    mixinGroupName: 'Tracker',
    stateNameSpace: '_TimeTracker',
    stateModel: {
      timeTaken: 0
    },
  },
  METHODS:{
    getTime: function(){
      return this.state._TimeTracker.timeTaken
    },
    setTime: function(t){
      this.state._TimeTracker.timeTaken = t
    },
    addTime: function(t){
      this.state._TimeTracker.timeTaken += t
    }
  },
  LISTENERS: {
    'turnTaken': function(evtData) {
      this.addTime(evtData.timeUsed);
    }
  }
};

//******************************************

export let WalkerCorporeal = {
  META:{
    mixinName: 'WalkerCorporeal',
    mixinGroupName: 'Walker',
  },
  METHODS:{
    tryWalk: function(dx, dy){
      let newX = this.state.x*1 + dx*1;
      let newY = this.state.y*1 + dy*1;

      let  targetPositionInfo = this.getMap().getTargetPositionInfo(newX, newY);

      if (targetPositionInfo.entity){
        this.raiseMixinEvent('bumpEntity', {actor: this, target: targetPositionInfo.entity});
        this.raiseMixinEvent('spendAction', {spender: this, spent: this.getAllowedActionDuration()});
        return false;
      } else {
        if (targetPositionInfo.tile.isImpassable()) {
          this.raiseMixinEvent('wallBlocked', {reason: 'there\'s something in the way'});
          return false
        } else {
          this.state.x = newX;
          this.state.y = newY;
          this.getMap().updateEntityPosition(this, this.state.x, this.state.y);

          this.raiseMixinEvent('turnTaken', {timeUsed: 1});
          this.raiseMixinEvent('actionDone', {timeUsed: 1});
          this.raiseMixinEvent('spendAction', {spender: this, spent: 1});

          return true;
        }
        this.raiseMixinEvent('wallBlocked', {reason: 'there\'s something in the way'});
        return false;
      }
    }
  }
};

//******************************************

export let HitPoints = {
  META:{
    mixinName: 'HitPoints',
    mixinGroupName: 'HitPoints',
    stateNameSpace: '_HitPoints',
    stateModel: {
      maxHp: 1,
      curHp: 1
    },
    initialize: function(template){
      if(this.getVit){
        this.state._HitPoints.maxHp = (this.getVit() + (this.getLevel() - 1))
      } else{
        this.state._HitPoints.maxHp = template.maxHp;
      }
      this.state._HitPoints.curHp = this.state._HitPoints.maxHp;
    }
  },
  METHODS: {
    gainHp: function (amt){
      this.state._HitPoints.curHp += amt;
      this.state._HitPoints.curHp = Math.min(this.state._HitPoints.maxHp, this.state._HitPoints.curHp);
    },
    loseHp: function (amt){
      this.state._HitPoints.curHp -= amt;
      this.state._HitPoints.curHp = Math.min(this.state._HitPoints.maxHp, this.state._HitPoints.curHp);
    },
    getHp: function (){
      return this.state._HitPoints.curHp;
    },
    setHp: function (amt){
      this.state._HitPoints.curHp = amt;
      this.state._HitPoints.curHp = Math.min(this.state._HitPoints.maxHp, this.state._HitPoints.curHp);
    },
    getMaxHp: function (){
      return this.state._HitPoints.maxHp;
    },
    setMaxHp: function (amt){
      this.state._HitPoints.maxHp = amt;
    }
  },
  LISTENERS: {
    'damaged': function(evtData) {
      if(this.getAgi && this.getAgi() > 10) {
        let dodge = Math.pow(0.97, (this.getAgi()-10));
        let num = ROT.RNG.getUniform();
        if (num > dodge){
          console.log('dodged');
          Message.send('dodged attack')
          return true;
        }
      }
      this.loseHp(evtData.damageAmount);
      evtData.src.raiseMixinEvent('damages',{target: this, damageAmount: evtData.damageAmount});

      if (this.getHp() <= 0) {
        SCHEDULER.remove(this);
        evtData.src.raiseMixinEvent('kills',{target: this});
        if (this.getXP){
          evtData.src.raiseMixinEvent('killedFoe', {target: this})
        }
        this.destroy();
      }
    }
  }
};

//******************************************

export let MeleeAttacker = {
  META:{
    mixinName: 'MeleeAttacker',
    mixinGroupName: 'MeleeAttackerGroup',
    stateNameSpace: '_MeleeAttacker',
    stateModel: {
      meleeDamage: 1
    },
    initialize: function(template){
      if (this.getStr){
        this.state._MeleeAttacker.meleeDamage = (3 + (this.getStr()-10) * 2);
      } else {
        this.state._MeleeAttacker.meleeDamage = template.meleeDamage;
      }
    }
  },
  METHODS: {
    getMeleeDamage: function (){return this.state._MeleeAttacker.meleeDamage;},
    setMeleeDamage: function (amt){this.state._MeleeAttacker.meleeDamage = amt;},
    surroundingAttack: function(){
      let ents = this.findSurroundingEnts();
      if (ents) {
        for (let ent in ents) {
          if (ent.name != 'tree'){
            ent.loseHp(this.getMeleeDamage()/4);
          }
        }
      }
    },
    findSurroundingEnts: function(){
      ents = {}
      for (let i = -1; i <= 1; i++){
        for (let j = -1; j <= 1; j++){
          let tileInfo = this.getMap().getTargetPositionInfo(this.state.x*1 + i, this.state.y*1 + j);
          if (tileInfo.entity && tileInfo.entity != this) {
            ents[tileInfo.entity.getID()] = tileInfo.entity;
          }
        }
      }
      if (ents != {}) {
        return ents
      }
      return false;
    }
  },
  LISTENERS: {
    'bumpEntity': function(evtData) {
      console.log('bumped');
      if (evtData.target.name == 'tree'){
        if (this.getStr){
          if (this.getStr() >= 20) {
            evtData.target.raiseMixinEvent('damaged', {src:this, damageAmount:this.getMeleeDamage()});
            this.raiseMixinEvent('attacks', {actor:this, target:evtData.target})
            this.gainHp(3);
            return true;
          } else {
            this.raiseMixinEvent('wallBlocked', {reason: 'you aren\'t strong enough'});
            return false;
          }
        }
      }
      evtData.target.raiseMixinEvent('damaged', {src:this, damageAmount:this.getMeleeDamage()});
      this.raiseMixinEvent('attacks', {actor:this, target:evtData.target})
    }
  }
};

//******************************************

export let ActorWanderer = {
  META:{
    mixinName: 'ActorWanderer',
    mixinGroupName: 'Wanderer',
    stateNameSpace: '_ActorWanderer',
    stateModel: {
      allowedActionDuration: 3,
      spentActions: 0,
      actingState: false
    },
    initialize: function(template){
      this.state._ActorWanderer.allowedActionDuration = template.allowedActionDuration;
      SCHEDULER.add(this, true);
      console.log('entity added');
    }
  },
  METHODS: {
    getAllowedActionDuration: function(){
      return this.state._ActorWanderer.allowedActionDuration;
    },
    setAllowedActionDuration: function(amt){
      this.state._ActorWanderer.allowedActionDuration = amt;
    },
    getSpentActions: function(){
      return this.state._ActorWanderer.spentActions;
    },
    setSpentActions: function(amt){
      this.state._ActorWanderer.spentActions = amt;
    },
    findNearbyAvatar: function(){
      for (let i = -1; i <= 1; i++){
        for (let j = -1; j <= 1; j++){
          let tileInfo = this.getMap().getTargetPositionInfo(this.state.x*1 + i, this.state.y*1 + j);
          if (tileInfo.entity && tileInfo.entity.state.name == "avatar") {
            console.log('avatar found');
            return [true, i, j];
          }
        }
      }
      return [false];
    },
    findNearbyAlly: function(){
      for (let i = -1; i <= 1; i++){
        for (let j = -1; j <= 1; j++){
          let tileInfo = this.getMap().getTargetPositionInfo(this.state.x*1 + i, this.state.y*1 + j);
          if (tileInfo.entity && tileInfo.entity.state.name != "avatar" && i != 0 && j != 0) {
            return [true, i, j];
          }
        }
      }
      return [false];
    },
    randomMove: function(){
      if (this.getRangedDamage && this.getRangedDamage != 0) {
        let directions = ['w','s','a','d']
        for (direction in directions){
          ent = this.getMap().findClosestEntInLine(ent, direction)
          if (ent.getName() == 'avatar' || ent.getName() == 'tree'){
            this.raiseMixinEvent('rangedAttack', {actor: this, target: ent});
          }
        }
      }
      if (this.getMagicDamage && this.getMagicDamage != 0) {
        let directions = ['w','s','a','d']
        for (direction in directions){
          ent = this.getMap().findClosestEntInLine(ent, direction)
          if (ent.getName() == 'avatar' || ent.getName() == 'tree'){
            this.raiseMixinEvent('magicAttack', {actor: this, target: ent, damageAmount: this.getMagicDamage()});
            this.raiseMixinEvent('usedMag', {manaUsed: 8})
          }
        }
      }
      let avatar = this.findNearbyAvatar();
      let ally = this.findNearbyAlly()
      if (avatar[0]){
        this.tryWalk(avatar[1], avatar[2]);
      } else if (ally[0]){
        this.tryWalk(-ally[1], -ally[2]);
      } else {
        let num = ROT.RNG.getUniform();
        if (num < 0.25) {
          this.tryWalk(1, 0);
        } else if (0.25 <= num < 0.5) {
          this.tryWalk(-1, 0);
        } else if (0.5 <= num < 0.75){
          this.tryWalk(0, 1);
        } else {
          this.tryWalk(0, -1);
        }
      }
    },
    act: function() {
      this.randomMove();
      TIME_ENGINE.lock();
    }
  },
  LISTENERS: {
    'spendAction': function(evtData) {
      evtData.spender.state._ActorWanderer.spentActions += evtData.spent;
      //console.log(evtData.spender.state._ActorWanderer.spentActions);
      if (evtData.spender.state._ActorWanderer.spentActions >= evtData.spender.getAllowedActionDuration()){
        if (this.getMP){
          this.gainMp(1);
        }
        if (TIME_ENGINE._lock){
          TIME_ENGINE.unlock();
        }
        SCHEDULER.next();
      }
    }
  }
};

//******************************************

export let ActorPlayer = {
  META:{
    mixinName: 'ActorPlayer',
    mixinGroupName: 'Player',
    stateNameSpace: '_ActorPlayer',
    stateModel: {
      allowedActionDuration: 5,
      spentActions: 0,
      actingState: false
    },
    initialize: function(){
      SCHEDULER.add(this, true);
      console.log('avatar added');
    }
  },
  METHODS: {
    getAllowedActionDuration: function(){
      return this.state._ActorPlayer.allowedActionDuration;
    },
    setAllowedActionDuration: function(amt){
      this.state._ActorPlayer.allowedActionDuration = amt;
    },
    getSpentActions: function(){
      return this.state._ActorPlayer.spentActions;
    },
    setSpentActions: function(amt){
      this.state._ActorPlayer.spentActions = amt;
    },
    act: function() {
      TIME_ENGINE.lock();
      Message.send('your turn');
      return false;
    }
  },
  LISTENERS: {
    'spendAction': function(evtData) {
      evtData.spender.state._ActorPlayer.spentActions += evtData.spent;
      if (evtData.spender.state._ActorPlayer.spentActions >= evtData.spender.getAllowedActionDuration()){
        evtData.spender.state._ActorPlayer.spentActions = 0;
        this.gainMp(2);
        TIME_ENGINE.unlock();
        SCHEDULER.next();
        Message.send('enemy turn');
      }
    }
  }
};

//******************************************

export let ExpPlayer = {
  META:{
    mixinName: 'ExpPlayer',
    mixinGroupName: 'Exp',
    stateNameSpace: '_ExpPlayer',
    stateModel: {
      exp: 0,
    },
  },
  METHODS: {
    getXP: function() {
      return this.state._ExpPlayer.exp;
    },
    setXP: function(xp) {
      this.state._ExpPlayer.exp = xp;
    },
    addXP: function(xp) {
      this.state._ExpPlayer.exp += xp;
    }
  },
  LISTENERS: {
    'killedFoe': function(evtData) {
      this.addXP(evtData.target.getXP())
      this.checkLeveled();
    }
  }
};

//******************************************

export let ExpEnemy = {
  META:{
    mixinName: 'ExpEnemy',
    mixinGroupName: 'Exp',
    stateNameSpace: '_ExpEnemy',
    stateModel: {
      exp: 1,
    },
    initialize: function(template) {
      this.state._ExpEnemy.exp = template.exp || 1;
    }
  },
  METHODS: {
    getXP: function() {
      return this.state._ExpEnemy.exp;
    },
    setXP(xp) {
      this.state._ExpEnemy.exp = xp;
    }
  },
};

//******************************************
export let Levels = {
  META:{
    mixinName: 'Levels',
    mixinGroupName: 'Level',
    stateNameSpace: '_Levels',
    stateModel: {
      level: 1
    },
  },
  METHODS: {
    getLevel: function(){
      return this.state._Levels.level;
    },
    setLevel: function(level) {
      this.state._Levels.level = level;
    },
    addLevel: function() {
      this.state._Levels.level += 1;
    },
    checkLeveled: function() {
      let requiredXp = 7*(this.getLevel()-1) + 7*this.getLevel();
      if (this.getXP() >= requiredXp){
        this.addLevel();
        Message.send('Level Up');
        this.raiseMixinEvent('levelStats');
        this.checkLeveled();
      }
    }
  },
};

//******************************************

export let PlayerStats = {
  META:{
    mixinName: 'PlayerStats',
    mixinGroupName: 'Stats',
    stateNameSpace: '_PlayerStats',
    stateModel: {
      strength: 10,
      intelligence: 10,
      vitality: 10,
      agility: 10,
      statPoints: 40
    },
    initialize: function(template) {
      this.state._PlayerStats.strength = template.strength || 0;
      this.state._PlayerStats.intelligence = template.intelligence || 0;
      this.state._PlayerStats.vitality = template.vitality || 0;
      this.state._PlayerStats.agility = template.agility || 0;
    }
  },
  METHODS: {
    getStr: function(){
      return this.state._PlayerStats.strength;
    },
    setStr: function(strength){
      this.state._PlayerStats.strength = strength;
    },
    addStr: function(strength){
      this.state._PlayerStats.strength += strength;
    },
    getInt: function(){
      return this.state._PlayerStats.intelligence;
    },
    setInt: function(intelligence){
      this.state._PlayerStats.intelligence = intelligence;
    },
    addInt: function(intelligence){
      this.state._PlayerStats.intelligence += intelligence;
    },
    getVit: function(){
      return this.state._PlayerStats.vitality;
    },
    setVit: function(vitality){
      this.state._PlayerStats.vitality = vitality;
    },
    addVit: function(vitality){
      this.state._PlayerStats.vitality += vitality;
    },
    getAgi: function(){
      return this.state._PlayerStats.agility;
    },
    setAgi: function(agility){
      this.state._PlayerStats.agility = agility;
    },
    addAgi: function(agility){
      this.state._PlayerStats.agility += agility;
    },
    getSP: function(){
      return this.state._PlayerStats.statPoints;
    },
    setSP: function(statPoints){
      this.state._PlayerStats.statPoints = statPoints;
    },
    addSP: function(statPoints){
      this.state._PlayerStats.statPoints += statPoints;
    }
  },
  LISTENERS: {
    'levelStats': function() {
      this.addSP(3);
    }
  }
};

//******************************************

export let ManaPoints = {
  META:{
    mixinName: 'ManaPoints',
    mixinGroupName: 'ManaPoints',
    stateNameSpace: '_ManaPoints',
    stateModel: {
      maxMp: 1,
      curMp: 1
    },
    initialize: function(template){
      if(this.getInt){
        this.state._ManaPoints.maxMp = (this.getInt() + (this.getLevel() - 1))
      } else{
        this.state._ManaPoints.maxMp = template.maxMp;
      }
      this.state._ManaPoints.curMp = template.curMp || this.state._ManaPoints.maxMp;
    }
  },
  METHODS: {
    gainMp: function (amt){
      this.state._ManaPoints.curMp += amt;
      this.state._ManaPoints.curMp = Math.min(this.state._ManaPoints.maxMp, this.state._ManaPoints.curMp);
    },
    loseMp: function (amt){
      this.state._ManaPoints.curMp -= amt;
      this.state._ManaPoints.curMp = Math.min(this.state._ManaPoints.maxMp, this.state._ManaPoints.curMp);
    },
    getMp: function (){
      return this.state._ManaPoints.curMp;
    },
    setMp: function (amt){
      this.state._ManaPoints.curMp = amt;
      this.state._ManaPoints.curMp = Math.min(this.state._ManaPoints.maxMp, this.state._ManaPoints.curMp);
    },
    getMaxMp: function (){
      return this.state._ManaPoints.maxMp;
    },
    setMaxMp: function (amt){
      this.state._ManaPoints.maxMp = amt;
    }
  },
  LISTENERS: {
    'usedMag': function(evtData) {
      if (this.getMp() > evtData.manaUsed) {
        this.loseMp(evtData.manaUsed);
        return true;
      } else {
        Message.send('You do not have enough MP')
        return false;
      }
    }
  }
};

//******************************************

export let RangedAttackerPlayer = {
  META:{
    mixinName: 'RangedAttackerPlayer',
    mixinGroupName: 'RangedAttackerGroup',
    stateNameSpace: '_RangedAttackerPlayer',
    stateModel: {
      rangedDamage: 0,
      magicDamage: 0
    },
    initialize: function(template){
      if (this.getStr){
        this.state._RangedAttackerPlayer.rangedDamage = Math.max((this.getStr()/2+this.getAgi()/2-10) * 2, 0);
        this.state._RangedAttackerPlayer.magicDamage = Math.max((3 + (this.getInt()-10) * 2), 0);
      } else {
        this.state._RangedAttackerPlayer.rangedDamage = template.rangedDamage;
        this.state._RangedAttackerPlayer.magicDamage = template.magicDamage;
      }
    }
  },
  METHODS: {
    getRangedDamage: function (){return this.state._RangedAttackerPlayer.rangedDamage;},
    setRangedDamage: function (amt){this.state._RangedAttackerPlayer.rangedDamage = amt;},

    getMagicDamage: function (){return this.state._RangedAttackerPlayer.rangedDamage;},
    setMagicDamage: function (amt){this.state._RangedAttackerPlayer.rangedDamage = amt;},
  },

  LISTENERS: {
    'rangedAttack': function(evtData) {
      if (evtData.target.name == 'tree'){
        if (this.getStr){
          if ((this.getStr()+this.getAgi())/2 >= 20) {
            evtData.target.raiseMixinEvent('damaged', {src:this, damageAmount:this.getRangedDamage()});
            this.raiseMixinEvent('attacks', {actor:this, target:evtData.target});
            this.raiseMixinEvent('spendAction', {spender: this, spent: this.getAllowedActionDuration()});
            return true;
          } else {
            Message.send('Your attack was not powerful enough to fell the tree');
            this.raiseMixinEvent('spendAction', {spender: this, spent: this.getAllowedActionDuration()});
            return false;
          }
        }
      }
      evtData.target.raiseMixinEvent('damaged', {src:this, damageAmount:this.getRangedDamage()});
      this.raiseMixinEvent('attacks', {actor:this, target:evtData.target});
      this.raiseMixinEvent('spendAction', {spender: this, spent: this.getAllowedActionDuration()});
      return true;
    },
    'magicAttack': function(evtData) {
      if (evtData.target.name == 'tree'){
        evtData.target.raiseMixinEvent('damaged', {src:this, damageAmount: evtData.damageAmount});
        this.raiseMixinEvent('attacks', {actor:this, target:evtData.target});
        Message.send("You have angered the spirits residing in the tree. They retaliate against you.");
        this.loseHp(2);
      }
      evtData.target.raiseMixinEvent('damaged', {src:this, damageAmount: evtData.damageAmount});
      this.raiseMixinEvent('attacks', {actor:this, target:evtData.target})
      this.raiseMixinEvent('spendAction', {spender: this, spent: this.getAllowedActionDuration()});
    }
  }
};

//******************************************

export let RangedAttacks = {
  META:{
    mixinName: 'RangedAttacks',
    mixinGroupName: 'RangedAttacksGroup',
    stateNameSpace: '_RangedAttacks',
  },
  METHODS: {
    bowAttack: function(direction) {
      let ent = this.getMap().findClosestEntInLine(this, direction);
      if (ent){
        this.raiseMixinEvent('rangedAttack', {actor: this, target: ent});
        console.log('bowAttack')
      }
    },
    windAttack: function(direction) {
      let ent = this.getMap().findClosestEntInLine(this, direction);
      if (ent){
        this.raiseMixinEvent('magicAttack', {actor: this, target: ent, damageAmount: this.getMagicDamage()});
      }
      this.raiseMixinEvent('usedMag', {manaUsed: 7})
    },
    fireAttack: function(direction) {
      let ent = this.getMap().findClosestEntInLine(this, direction);
      let ents = this.getMap().findEntsInArea(ent.getX() - 1, ent.getY() - 1, ent.getX() + 1, ent.gety() + 1)
      if (ents){
        for (let entID in ents) {
          this.raiseMixinEvent('magicAttack', {actor: this, target: ents[entID], damageAmount: this.getMagicDamage()/4});
        }
      }
      this.raiseMixinEvent('usedMag', {manaUsed: 15})
    },
    lightningAttack: function(direction) {
      let ent = this.getMap().findClosestEntInLine(this, direction);
      if (ent) {
        this.raiseMixinEvent('magicAttack', {actor: this, target: ent, damageAmount: this.getMagicDamage()});
        let nextEnt = this.getMap().findClosestEnemyEntity(ent);
        if (nextEnt) {
          this.raiseMixinEvent('magicAttack', {actor: this, target: ent, damageAmount: this.getMagicDamage()/2});
          let finalEnt = this.getMap().findClosestEnemyEntity(ent);
          if (finalEnt) {
            this.raiseMixinEvent('magicAttack', {actor: this, target: ent, damageAmount: this.getMagicDamage()/4});
          }
        }
      }
      this.raiseMixinEvent('usedMag', {manaUsed: 25})
    },
  },
};

//******************************************

export let RangedAttackerEnemy = {
  META:{
    mixinName: 'RangedAttackerEnemy',
    mixinGroupName: 'RangedAttackerGroup',
    stateNameSpace: '_RangedAttackerEnemy',
    stateModel: {
      rangedDamage: 0,
      magicDamage: 0
    },
    initialize: function(template){
      if (this.getStr){
        this.state._RangedAttackerEnemy.rangedDamage = Math.max((this.getStr()/2+this.getAgi()/2-10) * 2, 0);
        this.state._RangedAttackerEnemy.magicDamage = Math.max((3 + (this.getInt()-10) * 2), 0);
      } else {
        this.state._RangedAttackerEnemy.rangedDamage = template.rangedDamage || 0;
        this.state._RangedAttackerEnemy.magicDamage = template.magicDamage || 0;
      }
    }
  },
  METHODS: {
    getRangedDamage: function (){return this.state._RangedAttackerEnemy.rangedDamage;},
    setRangedDamage: function (amt){this.state._RangedAttackerEnemy.rangedDamage = amt;},

    getMagicDamage: function (){return this.state._RangedAttackerEnemy.rangedDamage;},
    setMagicDamage: function (amt){this.state._RangedAttackerEnemy.rangedDamage = amt;},
  },

  LISTENERS: {
    'rangedAttack': function(evtData) {
      if (evtData.target.name == 'tree'){
        return false
      }
      evtData.target.raiseMixinEvent('damaged', {src:this, damageAmount:this.getRangedDamage()});
      this.raiseMixinEvent('attacks', {actor:this, target:evtData.target});
      this.raiseMixinEvent('spendAction', {spender: this, spent: this.getAllowedActionDuration()});
      return true;
    },
    'magicAttack': function(evtData) {
      if (evtData.target.name == 'tree'){
        evtData.target.raiseMixinEvent('damaged', {src:this, damageAmount: evtData.damageAmount});
        this.raiseMixinEvent('attacks', {actor:this, target:evtData.target});
        this.loseHp(2);
      }
      evtData.target.raiseMixinEvent('damaged', {src:this, damageAmount: evtData.damageAmount});
      this.raiseMixinEvent('attacks', {actor:this, target:evtData.target});
      this.raiseMixinEvent('spendAction', {spender: this, spent: this.getAllowedActionDuration()});
    }
  }
};
