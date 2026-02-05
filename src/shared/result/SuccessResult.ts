import { Result } from './Result';

/**
 * Success result implementation
 */
export class SuccessResult<T, E> extends Result<T, E> {
  constructor(private readonly _value: T) {
    super();
  }

  get isSuccess(): boolean {
    return true;
  }

  get isFailure(): boolean {
    return false;
  }

  get value(): T {
    return this._value;
  }

  get error(): E {
    throw new Error('Cannot access error of successful result');
  }
}
