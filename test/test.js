import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import System from 'systemjs';
import '../config.js';

chai.use(sinonChai);

describe('Sanity', () => {
  it('2 + 2 = 4', () => {
    expect(2 + 2).to.equal(4)
  });
});
