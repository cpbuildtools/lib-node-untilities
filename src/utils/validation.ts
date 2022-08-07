export interface ValidationResult {
  failed: boolean;
  errors: ValidationFailure[];
}

export interface ValidationFailure {
  field: string;
  rule: string;
  message: string;
}

export class ValidationError extends Error {
  constructor(public readonly errors: ValidationFailure[], message: string = "Validation Failed.") {
    super(message);
  }
}
