import { LitElement, html, nothing } from 'lit';

export class EmailField extends LitElement {
  static override properties = {
    value: { state: true },
    showError: { state: true },
  };

  declare private value: string;
  declare private showError: boolean;

  constructor() {
    super();
    this.value = '';
    this.showError = false;
  }

  async validate(value: string): Promise<void> {
    this.value = value;
    await new Promise<void>((resolve) => setTimeout(resolve, 20));
    this.showError = !value.includes('@');
  }

  override render() {
    return html`
      <label for="email">Email</label>
      <input
        id="email"
        .value=${this.value}
        aria-describedby="hint"
        aria-invalid=${String(this.showError)}
      />
      <p id="hint">Use your work email.</p>
      ${
        this.showError
          ? html`<p role="alert">Enter a valid email.</p>`
          : nothing
      }
    `;
  }
}

customElements.define('snapshot-test-email-field', EmailField);
