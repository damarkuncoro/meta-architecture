import { describe, it, expect } from 'vitest';

describe('Architecture Setup', () => {
  it('should have a working test environment', () => {
    expect(true).toBe(true);
  });

  it('should have the correct package name', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../package.json');
    expect(pkg.name).toBe('@damarkuncoro/meta-architecture');
  });
});
