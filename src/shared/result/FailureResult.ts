import { Result } from './Result';

/**
 * Failure result implementation
 */
export class FailureResult<T, E> extends Result<T, E> {
  constructor(private readonly _error: E) {
    super();
  }

  get isSuccess(): boolean {
    return false;
  }

  get isFailure(): boolean {
    return true;
  }

  get value(): T {
    throw new Error('Cannot access value of failed result');
  }

  get error(): E {
    return this._error;
  }
}
