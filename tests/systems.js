import Engine from '../src/Engine.js'
import BaseEntity from '../src/BaseEntity.js'
import BaseSystem from '../src/BaseSystem.js'


var assert = require('assert');

describe('Systems', function() {
  describe('Engine.addSystem()', function() {
    it('should push a system on Engine.systems', function() {
      let sys = new BaseSystem();
      let em = new Engine();
      let result = em.addSystem(sys);
      assert.equal(result, sys);
      assert.equal(em.systems.length, 1);
    });
  });

  describe('Engine.addSystem()', function() {
    it('should not allow systems to be added with the same _id', function() {
      let sys = new BaseSystem();
      let em = new Engine();
      em.addSystem(sys);
      let result = em.addSystem(sys);
      assert.equal(result, false);
      assert.equal(em.systems.length, 1);
    });
  });

  describe('Engine.removeSystem() ', function() {
    it('should remove a System from Engine.systems', function() {
      let sys = new BaseSystem();
      let em = new Engine();
      sys = em.addSystem(sys);
      let result = em.removeSystem(sys);
      assert.equal(result, true);
      assert.equal(em.entities.length, 0);
    });
  });

  describe('Engine.removeSystem() ', function() {
    it('should fail to remove a System not in Engine.systems', function() {
      let sys = new BaseSystem();
      let em = new Engine();
      let result = em.removeSystem(sys);
      assert.equal(result, false);
      assert.equal(em.systems.length, 0);
    });
  });

  describe('Engine.getSystemById() ', function() {
    it('should return a System with the _id provided', function() {
      let sys = new BaseSystem();
      let em = new Engine();
      sys = em.addSystem(sys);
      let result = em.getSystemById(sys._id);
      assert.equal(result, sys); 
    });
  });

  describe('Engine.getSystemById() ', function() {
    it('should return an false if there is no System with the id provided', function() {
      let em = new Engine();
      let result = em.getSystemById(666);
      assert.equal(result, false); 
    });
  });

});
