export interface PasswordResetMessageResponse {
  message: string
}

export interface RequestPasswordResetInput {
  email: string
}

export interface VerifyPasswordResetCodeInput {
  email: string
  code: string
}

export interface VerifyPasswordResetCodeResponse
  extends PasswordResetMessageResponse {
  resetToken: string
}

export interface ConfirmPasswordResetInput {
  resetToken: string
  newPassword: string
  confirmPassword: string
}
