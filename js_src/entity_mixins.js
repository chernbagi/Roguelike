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
        this.raiseMixinEvent('spendAction', {spender: this, spent: 5});
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
      this.state._HitPoints.maxHp = template.maxHp;
      this.state._HitPoints.curHp = template.maxHp;
    }
  },
  METHODS: {
    gainHp: function (amt){
      this.state._HitPoints.curHp += amt;
      this.state._HitPoints.curHp - Math.min(this.state._HitPoints.maxHp, this.state._HitPoints.curHp);
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
      this.loseHp(evtData.damageAmount);
      evtData.src.raiseMixinEvent('damages',{target: this, damageAmount: evtData.damageAmount});
      console.log('ploop');
      console.log(this.getHp());
      if (this.getHp() <= 0) {
        console.log('ploop');
        SCHEDULER.remove(this);
        evtData.src.raiseMixinEvent('kills',{target: this});
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
      this.state._MeleeAttacker.meleeDamage = template.meleeDamage || 1;
    }
  },
  METHODS: {
    getMeleeDamage: function (){return this.state._MeleeAttacker.meleeDamage;},
    setMeleeDamage: function (amt){this.state._MeleeAttacker.meleeDamage = amt;}
  },
  LISTENERS: {
    'bumpEntity': function(evtData) {
      console.log('bumped');
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
    initialize: function(){
      SCHEDULER.add(this, true);
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
    findNearbyAvatar(){
      for (let i = -1; i <= 1; i++){
        for (let j = -1; j <= 1; j++){
          console.dir(this);
          let tileInfo = this.getMap().getTargetPositionInfo(this.state.x*1 + i, this.state.y*1 + j);
          if (tileInfo.entity && tileInfo.entity.state.name == "avatar") {
            console.log('avatar found');
            return [true, i, j];
          }
        }
      }
      return [false];
    },
    findNearbyAlly(){
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
      console.log('enemy turn');
      Message.send('enemy turn');
      this.randomMove();
    }
  },
  LISTENERS: {
    'spendAction': function(evtData) {
      evtData.spender.state._ActorWanderer.spentActions += evtData.spent;
      if (evtData.spender.state._ActorWanderer.spentActions >= evtData.spender.getAllowedActionDuration()){
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
        SCHEDULER.next();
        if(TIME_ENGINE._lock == 2) {
          TIME_ENGINE.unlock();
        }
      }
    }
  }
};

//******************************************
