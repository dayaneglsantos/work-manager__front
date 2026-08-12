import {
  ConfirmPasswordResetInput,
  PasswordResetMessageResponse,
  RequestPasswordResetInput,
  VerifyPasswordResetCodeInput,
  VerifyPasswordResetCodeResponse
} from '@/types/passwordResetType'
import { api } from '@/utils/axios'

export const requestPasswordReset = async (
  input: RequestPasswordResetInput
): Promise<PasswordResetMessageResponse> => {
  const { data } = await api.post<PasswordResetMessageResponse>(
    '/password-reset/request',
    input
  )
  return data
}

export const verifyPasswordResetCode = async (
  input: VerifyPasswordResetCodeInput
): Promise<VerifyPasswordResetCodeResponse> => {
  const { data } = await api.post<VerifyPasswordResetCodeResponse>(
    '/password-reset/verify',
    input
  )
  return data
}

export const confirmPasswordReset = async (
  input: ConfirmPasswordResetInput
): Promise<PasswordResetMessageResponse> => {
  const { data } = await api.post<PasswordResetMessageResponse>(
    '/password-reset/confirm',
    input
  )
  return data
}
