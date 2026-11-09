import * as chai from 'chai';
import * as plugin from 'chai-aria-snapshot';

describe('Package registration', () => {
  it('exposes only the Chai plugin at runtime', () => {
    chai.assert.deepEqual(Object.keys(plugin), ['chaiAriaSnapshot']);
  });

  it('does not register an assertion as an import side effect', () => {
    chai.assert.isFalse('matchAriaSnapshot' in chai.Assertion.prototype);
  });

  it('returns a promise after explicit registration', async () => {
    chai.use(plugin.chaiAriaSnapshot);
    const button = document.createElement('button');
    button.textContent = 'Save';
    document.body.append(button);
    try {
      const assertion = chai.expect(button).to.matchAriaSnapshot(`
        - button "Save"
      `);
      chai.expect(assertion).to.be.instanceOf(Promise);
      await assertion;
    } finally {
      button.remove();
    }
  });
});
