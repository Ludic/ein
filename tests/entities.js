import EntityManager from '../src/EntityManager.js'
import BaseEntity from '../src/BaseEntity.js'
import BaseSystem from '../src/BaseSystem.js'

let assert = require('assert');

describe('Entities', function() {
  describe('EntityManager.addEntity()', function() {
    it('should push an entity on EntityManager.entities', function() {
      let ent = new BaseEntity();
      let em = new EntityManager();
      let result = em.addEntity(ent);
      assert.equal(result, ent);
      assert.equal(em.entities.length, 1);
    });
  });

  describe('EntityManager.addEntity()', function() {
    it('should not allow entites to be added with the same _id', function() {
      let ent = new BaseEntity();
      let em = new EntityManager();
      em.addEntity(ent);
      let result = em.addEntity(ent);
      assert.equal(result, false);
      assert.equal(em.entities.length, 1);
    });
  });

  describe('EntityManager.removeEntity() ', function() {
    it('should remove an Entity on EntityManager.entities', function() {
      let ent = new BaseEntity();
      let em = new EntityManager();
      ent = em.addEntity(ent);
      let result = em.removeEntity(ent);
      assert.equal(result, true);
      assert.equal(em.entities.length, 0);
    });
  });

  describe('EntityManager.removeEntity() ', function() {
    it('should fail to remove an Entity not in EntityManager.entities', function() {
      let ent = new BaseEntity();
      let em = new EntityManager();
      let result = em.removeEntity(ent);
      assert.equal(result, false);
      assert.equal(em.entities.length, 0);
    });
  });

  describe('EntityManager.getEntityById() ', function() {
    it('should return an Entity with the _id provided', function() {
      let ent = new BaseEntity();
      let em = new EntityManager();
      ent = em.addEntity(ent);
      let result = em.getEntityById(ent._id);
      assert.equal(result, ent); 
    });
  });

  describe('EntityManager.getEntityById() ', function() {
    it('should return an false if there is no Entity with the id provided', function() {
      let em = new EntityManager();
      let result = em.getEntityById(666);
      assert.equal(result, false); 
    });
  });

  describe('EntityManager.getEntitiesByProps() ', function() {
    it('should return an Array of Entities matching the provided properties', function() {
      let em = new EntityManager();
      let ent1 = new BaseEntity();
      ent1.taco = 1;
      
      let ent2 = new BaseEntity();
      ent2.taco = 2;

      em.addEntity(ent1);
      em.addEntity(ent2);

      let result = em.getEntitiesByProps(["taco"]);
      assert.equal(result.length, 2);
    });
  });

  describe('EntityManager.getEntitiesByProps() ', function() {
    it('should return an Array of Entities matching the provided properties and values', function() {
      let em = new EntityManager();
      let ent1 = new BaseEntity();
      ent1.taco = 1;
      
      let ent2 = new BaseEntity();
      ent2.taco = 2;

      em.addEntity(ent1);
      em.addEntity(ent2);

      let result = em.getEntitiesByProps([{name: 'taco', value: 1}]);
      assert.equal(result.length, 1);
    });
  });


  describe('EntityManager.getEntitiesByClassName() ', function() {
    it('should return an Array of Entities matching the provided class name', function() {
      let em = new EntityManager();
      let ent1 = new BaseEntity();
      let ent2 = new BaseEntity();
      let ent3 = {};
      let className = ent1.constructor.name;
      
      em.addEntity(ent1);
      em.addEntity(ent2);
      em.addEntity(ent3);

      let result = em.getEntitiesByClassName(className);
      assert.equal(result.length, 2);
    });
  });



  
});
