export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationPayload {
  email: string;
  password: string;
}

export interface RegistrationValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export interface RegistrationViewModel {
  form: {
    email: string;
  };
  errors: RegistrationValidationErrors;
  successMessage?: string;
}
