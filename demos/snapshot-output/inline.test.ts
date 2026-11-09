import * as chai from 'chai';
import { chaiAriaSnapshot } from 'chai-aria-snapshot';

chai.use(chaiAriaSnapshot);

describe('Inline ARIA snapshot diff demo (intentionally fails)', () => {
  it('shows the actual and expected accessible names in the runner diff', async () => {
    const button = document.createElement('button');
    button.textContent = 'Save';
    document.body.append(button);

    try {
      // Let the assertion reject so the runner can render its diff.
      await chai.expect(button).to.matchAriaSnapshot(
        `
          - button "Delete"
        `,
        { timeout: 0 },
      );
    } finally {
      button.remove();
    }
  });
});
