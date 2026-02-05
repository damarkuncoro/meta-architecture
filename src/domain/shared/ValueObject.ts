/**
 * Base class for all Value Objects in the domain
 * Value Objects are immutable and compared by value, not identity
 */
export abstract class ValueObject {
  /**
   * Abstract method to get all properties for equality comparison
   * Subclasses must implement this to return all properties that define equality
   */
  protected abstract getEqualityProperties(): any[];

  /**
   * Check equality with another Value Object
   * Two Value Objects are equal if they have the same values for all properties
   */
  equals(other: ValueObject): boolean {
    if (!other || !(other instanceof this.constructor)) {
      return false;
    }

    const thisProps = this.getEqualityProperties();
    const otherProps = other.getEqualityProperties();

    if (thisProps.length !== otherProps.length) {
      return false;
    }

    return thisProps.every((prop, index) => {
      const otherProp = otherProps[index];

      // Handle nested Value Objects recursively
      if (prop instanceof ValueObject && otherProp instanceof ValueObject) {
        return prop.equals(otherProp);
      }

      // Handle arrays recursively
      if (Array.isArray(prop) && Array.isArray(otherProp)) {
        if (prop.length !== otherProp.length) return false;
        return prop.every((item, i) => {
          if (item instanceof ValueObject && otherProp[i] instanceof ValueObject) {
            return item.equals(otherProp[i]);
          }
          return item === otherProp[i];
        });
      }

      // Primitive comparison
      return prop === otherProp;
    });
  }

  /**
   * Get string representation for debugging
   */
  toString(): string {
    return `${this.constructor.name}(${JSON.stringify(this.getEqualityProperties())})`;
  }
}