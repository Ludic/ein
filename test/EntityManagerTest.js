import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import em from '../src/EntityManager.js';
import BaseSystem from '../src/BaseSystem.js';
import BaseEntity from '../src/BaseEntity.js';

chai.use(sinonChai);

describe('addEntity', () => {
  it('adds entity to entities', () => {
    let ent = new BaseEntity();
    em.addEntity(ent);
    expect(em.entities.length).to.equal(1);

  });

  it('gives uid to entity', () => {
    let ent = new BaseEntity();
    em.addEntity(ent);
    expect(ent._id).to.equal(1);
  });
});

describe('sendEvent', () => {
  it('it registers an event', () => {
    let testEvent = function(e, arg){
      expect(e).to.equal("TEST_EVENT");
      expect(arg).to.equal(1);
    }
    em.listenFor("TEST_EVENT", testEvent, true);
    em.notify("TEST_EVENT", 1);

  });
});


