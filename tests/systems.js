import Engine from '../src/Engine.js'
import BaseEntity from '../src/BaseEntity.js'
import BaseSystem from '../src/BaseSystem.js'


var assert = require('assert');

describe('Systems', function() {
  describe('Engine.addSystem()', function() {
    it('should push a system on Engine.systems', function() {
      let sys = new BaseSystem();
      let engine = new Engine();
      let result = engine.addSystem(sys);
      assert.equal(result, sys);
      assert.equal(engine.systems.length, 1);
    });
  });

  describe('Engine.addSystem()', function() {
    it('should not allow systems to be added with the same _id', function() {
      let sys = new BaseSystem();
      let engine = new Engine();
      engine.addSystem(sys);
      let result = engine.addSystem(sys);
      assert.equal(result, false);
      assert.equal(engine.systems.length, 1);
    });
  });

  describe('Engine.removeSystem() ', function() {
    it('should remove a System from Engine.systems', function() {
      let sys = new BaseSystem();
      let engine = new Engine();
      sys = engine.addSystem(sys);
      let result = engine.removeSystem(sys);
      assert.equal(result, true);
      assert.equal(engine.entities.length, 0);
    });
  });

  describe('Engine.removeSystem() ', function() {
    it('should fail to remove a System not in Engine.systems', function() {
      let sys = new BaseSystem();
      let engine = new Engine();
      let result = engine.removeSystem(sys);
      assert.equal(result, false);
      assert.equal(engine.systems.length, 0);
    });
  });

  describe('Engine.getSystemById() ', function() {
    it('should return a System with the _id provided', function() {
      let sys = new BaseSystem();
      let engine = new Engine();
      sys = engine.addSystem(sys);
      let result = engine.getSystemById(sys._id);
      assert.equal(result, sys); 
    });
  });

  describe('Engine.getSystemById() ', function() {
    it('should return an false if there is no System with the id provided', function() {
      let engine = new Engine();
      let result = engine.getSystemById(666);
      assert.equal(result, false); 
    });
  });


  describe('BaseSystem.onEntityAdded()', function() {
    it('should notify the system when a new Entity is added to the Engine', function() {
      let engine = new Engine()

      let ent1 = new BaseEntity()
      ent1.health = 5

      let sys = new BaseSystem()
      sys.entityQuery = {props: ['health']}
      sys.onEntityAdded = function(entity){
        assert.equal(entity, ent1);
      }

      engine.addSystem(sys)
      engine.addEntity(ent1)
    });
  });


  describe('BaseSystem.onSystemAdded()', function() {
    it('should notify the system when it has been added to the Engine, with all of the entities that match the Systems entityQuery', function() {
      let engine = new Engine()

      let ent1 = new BaseEntity()
      ent1.health = 5

      let sys = new BaseSystem()
      sys.entityQuery = {props: ['health']}
      sys.onSystemAdded = function(engine, entities){
        assert.equal(entities[0], ent1);
      }

      engine.addEntity(ent1)
      engine.addSystem(sys)
    });
  });
});
