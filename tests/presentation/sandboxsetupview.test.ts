// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import SandboxSetupView from '@/presentation/sandboxsetupview';

describe('SandboxSetupView', () => {
  it('clamps block types to max supported value', () => {
    const view = new SandboxSetupView();
    document.body.appendChild(view.container);

    const blockTypesInput = view.container.querySelector('#sandbox-block-types') as HTMLInputElement;
    blockTypesInput.value = '999';

    expect(view.getConfig().numBlockTypes).toBe(10);

    document.body.removeChild(view.container);
  });
});
