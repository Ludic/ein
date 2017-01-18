import EntityManager from '../src/EntityManager.js'
import BaseEntity from '../src/BaseEntity.js'
import BaseSystem from '../src/BaseSystem.js'


var assert = require('assert');

describe('Systems', function() {
  describe('EntityManager.addSystem()', function() {
    it('should push a system on EntityManager.systems', function() {
      let sys = new BaseSystem();
      let em = new EntityManager();
      let result = em.addSystem(sys);
      assert.equal(result, sys);
      assert.equal(em.systems.length, 1);
    });
  });

  describe('EntityManager.addSystem()', function() {
    it('should not allow systems to be added with the same _id', function() {
      let sys = new BaseSystem();
      let em = new EntityManager();
      em.addSystem(sys);
      let result = em.addSystem(sys);
      assert.equal(result, false);
      assert.equal(em.systems.length, 1);
    });
  });

  describe('EntityManager.removeSystem() ', function() {
    it('should remove a System from EntityManager.systems', function() {
      let sys = new BaseSystem();
      let em = new EntityManager();
      sys = em.addSystem(sys);
      let result = em.removeSystem(sys);
      assert.equal(result, true);
      assert.equal(em.entities.length, 0);
    });
  });

  describe('EntityManager.removeSystem() ', function() {
    it('should fail to remove a System not in EntityManager.systems', function() {
      let sys = new BaseSystem();
      let em = new EntityManager();
      let result = em.removeSystem(sys);
      assert.equal(result, false);
      assert.equal(em.systems.length, 0);
    });
  });

  describe('EntityManager.getSystemById() ', function() {
    it('should return a System with the _id provided', function() {
      let sys = new BaseSystem();
      let em = new EntityManager();
      sys = em.addSystem(sys);
      let result = em.getSystemById(sys._id);
      assert.equal(result, sys); 
    });
  });

  describe('EntityManager.getSystemById() ', function() {
    it('should return an false if there is no System with the id provided', function() {
      let em = new EntityManager();
      let result = em.getSystemById(666);
      assert.equal(result, false); 
    });
  });

});
