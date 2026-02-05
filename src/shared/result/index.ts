import { _setResultImplementations } from './Result';
import { SuccessResult } from './SuccessResult';
import { FailureResult } from './FailureResult';

// Initialize implementations to break circular dependency
_setResultImplementations(
    <T, E>(value: T) => new SuccessResult<T, E>(value),
    <T, E>(error: E) => new FailureResult<T, E>(error)
);

export { Result } from './Result';
export { SuccessResult } from './SuccessResult';
export { FailureResult } from './FailureResult';
