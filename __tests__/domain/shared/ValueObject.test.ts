import { describe, it, expect } from 'vitest';
import { ValueObject } from '../../../src/domain/shared/ValueObject';

// Concrete implementation for testing
class TestValueObject extends ValueObject {
  constructor(private readonly value: any, private readonly nested?: ValueObject) {
    super();
  }

  protected getEqualityProperties(): any[] {
    return [this.value, this.nested];
  }
}

class ComplexValueObject extends ValueObject {
  constructor(private readonly props: any[]) {
    super();
  }

  protected getEqualityProperties(): any[] {
    return this.props;
  }
}

describe('ValueObject', () => {
  it('should be equal if all properties are equal', () => {
    const vo1 = new TestValueObject('test');
    const vo2 = new TestValueObject('test');

    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should not be equal if properties are different', () => {
    const vo1 = new TestValueObject('test1');
    const vo2 = new TestValueObject('test2');

    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should not be equal if types are different', () => {
    const vo1 = new TestValueObject('test');
    // @ts-ignore
    const vo2 = { getEqualityProperties: () => ['test'] };

    expect(vo1.equals(vo2 as any)).toBe(false);
  });

  it('should handle nested value objects', () => {
    const nested1 = new TestValueObject('nested');
    const nested2 = new TestValueObject('nested');
    const vo1 = new TestValueObject('root', nested1);
    const vo2 = new TestValueObject('root', nested2);

    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should handle different nested value objects', () => {
    const nested1 = new TestValueObject('nested1');
    const nested2 = new TestValueObject('nested2');
    const vo1 = new TestValueObject('root', nested1);
    const vo2 = new TestValueObject('root', nested2);

    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should handle null/undefined', () => {
    const vo1 = new TestValueObject('test');

    expect(vo1.equals(null as any)).toBe(false);
    expect(vo1.equals(undefined as any)).toBe(false);
  });

  it('should handle arrays', () => {
    const vo1 = new ComplexValueObject(['a', 'b']);
    const vo2 = new ComplexValueObject(['a', 'b']);

    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should handle different arrays', () => {
    const vo1 = new ComplexValueObject(['a', 'b']);
    const vo2 = new ComplexValueObject(['a', 'c']);

    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should handle arrays of value objects', () => {
    const vo1 = new ComplexValueObject([new TestValueObject('a'), new TestValueObject('b')]);
    const vo2 = new ComplexValueObject([new TestValueObject('a'), new TestValueObject('b')]);

    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should handle different arrays of value objects', () => {
    const vo1 = new ComplexValueObject([new TestValueObject('a'), new TestValueObject('b')]);
    const vo2 = new ComplexValueObject([new TestValueObject('a'), new TestValueObject('c')]);

    expect(vo1.equals(vo2)).toBe(false);
  });
});
