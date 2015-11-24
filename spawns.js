require('source');
require('room');
var settings = require('settings');
var bodyCosts = require('body-costs');

Spawn.prototype.buildHarvester = function() {
  var closestSource = this.pos.findClosestByRange(FIND_SOURCES);
  var sourceId;
  if (closestSource && closestSource.needsHarvesters()) {
    sourceId = closestSource.id;
  } else {
    this.room.find(FIND_SOURCES).forEach(function(source) {
      if (!sourceId && source.needsHarvesters()) {
        sourceId = source.id;
      }
    });
  }

  if (sourceId) {
    var body = [MOVE, WORK, WORK, CARRY];
    var cost = bodyCosts.calculateCosts(body);
    while (cost <= this.availableEnergy()) {
      if (body.length < 7 && cost <= this.availableEnergy() - 100) {
        body.push(WORK);
      } else {
        body.push(CARRY);
      }
      cost = bodyCosts.calculateCosts(body);
    }
    if (cost > this.availableEnergy()) {
      body.pop();
      cost = bodyCosts.calculateCosts(body);
    }
    this.createCreep(body, undefined, {role: 'harvester', source: sourceId});
  }
};

Spawn.prototype.buildMailman = function() {
  var body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
  var cost = bodyCosts.calculateCosts(body);
  while (cost < this.availableEnergy()) {
    body.push(MOVE);
    body.push(CARRY);
    cost = bodyCosts.calculateCosts(body);
  }

  if (cost > this.availableEnergy()) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }

  this.createCreep(body, undefined, {role: 'mailman'});
};

Spawn.prototype.buildCourier = function() {
  var body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
  var cost = bodyCosts.calculateCosts(body);
  while (cost < this.availableEnergy()) {
    body.push(MOVE);
    body.push(CARRY);
    cost = bodyCosts.calculateCosts(body);
  }

  if (cost > this.availableEnergy()) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }

  this.createCreep(body, undefined, {role: 'courier'});
};

Spawn.prototype.buildBuilder = function() {
  var body = [MOVE, WORK, WORK, CARRY];
  var cost = bodyCosts.calculateCosts(body);

  while (cost < this.availableEnergy()) {
    if (this.room.controller.pos.freeEdges() > 2) {
      body.push(CARRY);
    }

    body.push(WORK);
    body.push(WORK);
    cost = bodyCosts.calculateCosts(body);
  }

  while (cost > this.availableEnergy()) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }

  this.createCreep(body, undefined, {role: 'builder'});
};

Spawn.prototype.buildDefender = function() {
  this.createCreep([TOUGH, TOUGH, TOUGH, TOUGH, MOVE, ATTACK, MOVE, ATTACK], undefined, {role: 'defender'});
};

Spawn.prototype.buildHealer = function() {
  this.createCreep([MOVE, HEAL], undefined, {role: 'healer'});
};

Spawn.prototype.buildWaller = function() {
  var body = [MOVE, MOVE, WORK, CARRY];
  var cost = bodyCosts.calculateCosts(body);

  while (cost < this.availableEnergy()) {
    body.push(MOVE);
    body.push(CARRY);
    body.push(WORK);
    cost = bodyCosts.calculateCosts(body);
  }

  while (cost > this.availableEnergy()) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }
  this.createCreep(body, undefined, {role: 'waller'});
};

Spawn.prototype.work = function() {
  var harvesterCount = this.room.harvesterCount();
  var courierCount = this.room.courierCount();
  if (this.availableEnergy() >= 300 && harvesterCount < 1) {
    this.buildHarvester();
  } else if (this.availableEnergy() >= 300 && courierCount < 1) {
    this.buildCourier();
  } else if (this.availableEnergy() === this.maxEnergy()) {
    var builderCount = this.room.builderCount();
    var workerCount = this.room.workerCount();
    var mailmanCount = this.room.mailmanCount();
    var wallerCount = this.room.wallerCount();

    if (settings.courierToWorkerRatio > courierCount / workerCount) {
      this.buildCourier();
    } else if (this.room.needsHarvesters()) {
      this.buildHarvester();
    } else if (builderCount < this.room.controller.pos.freeEdges()) {
      this.buildBuilder();
    } else if (mailmanCount < 2) {
      this.buildMailman();
    //} else if (this.room.hasOutdatedCreeps()) {
      //this.retireOldCreep();
    } else if (wallerCount < 1) {
      this.buildWaller();
    } else {
      this.extend();
    }
  } else {
    this.extend();
  }

  this.room.setupFlags();
};

Spawn.prototype.retireOldCreep = function() {
  var self = this;
  var outdatedCreeps = this.room.getOutdatedCreeps();

  if (outdatedCreeps.length) {
    outdatedCreeps[0].suicide();
  }
};

Spawn.prototype.maxEnergy = function() {
  var extensions = this.room.getExtensions();
  return this.energyCapacity + (extensions.length * (extensions.length ? extensions[0].energyCapacity : 0));
};

Spawn.prototype.availableEnergy = function() {
  var extensions = this.room.getExtensions();
  var availableEnergy = this.energy;
  extensions.forEach(function(extension) {
    availableEnergy += extension.energy;
  });
  return availableEnergy;
};

Spawn.prototype.extend = function() {
  if (this.room.canBuildExtension()) {
    this.room.createConstructionSite(this.pos.x - 1, this.pos.y - 1, STRUCTURE_EXTENSION);
  }
};
