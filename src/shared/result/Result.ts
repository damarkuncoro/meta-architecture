/**
 * Result pattern for handling operations that might fail
 * Provides type-safe error handling without exceptions
 */
export abstract class Result<T, E = Error> {
  /**
   * Check if result is successful
   */
  abstract get isSuccess(): boolean;

  /**
   * Check if result is failed
   */
  abstract get isFailure(): boolean;

  /**
   * Get the success value (throws if failed)
   */
  abstract get value(): T;

  /**
   * Get the error value (throws if successful)
   */
  abstract get error(): E;

  /**
   * Create a successful result
   */
  static success<T, E = Error>(value: T): Result<T, E> {
    return createSuccess(value);
  }

  /**
   * Create a failed result
   */
  static failure<T, E = Error>(error: E): Result<T, E> {
    return createFailure(error);
  }

  /**
   * Get the success value or a default
   */
  getOrDefault(defaultValue: T): T {
    return this.isSuccess ? this.value : defaultValue;
  }

  /**
   * Get the success value or throw the error
   */
  getOrThrow(): T {
    if (this.isFailure) {
      if (this.error instanceof Error) {
        throw this.error;
      }
      throw new Error(String(this.error));
    }
    return this.value;
  }

  /**
   * Transform successful result
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isSuccess
      ? Result.success(fn(this.value))
      : Result.failure(this.error);
  }

  /**
   * Transform failed result
   */
  mapError<F>(fn: (error: E) => F): Result<T, F> {
    return this.isFailure
      ? Result.failure(fn(this.error))
      : Result.success(this.value);
  }

  /**
   * Chain operations
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.isSuccess
      ? fn(this.value)
      : Result.failure(this.error);
  }
}

// Internal factory functions to break circular dependency
let createSuccess: <T, E>(value: T) => Result<T, E> = () => {
    throw new Error("Result implementations not initialized. Import from 'src/shared/result' instead of directly.");
};

let createFailure: <T, E>(error: E) => Result<T, E> = () => {
    throw new Error("Result implementations not initialized. Import from 'src/shared/result' instead of directly.");
};

/**
 * Internal function to set implementations
 * @internal
 */
export function _setResultImplementations(
    successFactory: <T, E>(value: T) => Result<T, E>,
    failureFactory: <T, E>(error: E) => Result<T, E>
) {
    createSuccess = successFactory;
    createFailure = failureFactory;
}
