export interface VerifyPasswordCreationCodeInput {
  email: string
  code: string
}

export interface VerifyPasswordCreationCodeResponse {
  message: string
  passwordToken: string
}

export interface ConfirmPasswordCreationInput {
  passwordToken: string
  newPassword: string
  confirmPassword: string
}

export interface PasswordCreationMessageResponse {
  message: string
}
