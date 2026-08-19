import {
  ConfirmPasswordCreationInput,
  PasswordCreationMessageResponse,
  VerifyPasswordCreationCodeInput,
  VerifyPasswordCreationCodeResponse
} from '@/types/passwordCreationType'
import { api } from '@/utils/axios'

export const verifyPasswordCreationCode = async (
  input: VerifyPasswordCreationCodeInput
): Promise<VerifyPasswordCreationCodeResponse> => {
  const { data } = await api.post<VerifyPasswordCreationCodeResponse>(
    '/password-creation/verify',
    input
  )
  return data
}

export const confirmPasswordCreation = async (
  input: ConfirmPasswordCreationInput
): Promise<PasswordCreationMessageResponse> => {
  const { data } = await api.post<PasswordCreationMessageResponse>(
    '/password-creation/confirm',
    input
  )
  return data
}
