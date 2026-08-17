export const normalizeCpf = (value: string) => value.replace(/\D/g, '')

export const isValidCpf = (value: string) => {
  const cpf = normalizeCpf(value)

  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  const calculateDigit = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split('')
      .reduce(
        (total, digit, index) => total + Number(digit) * (length + 1 - index),
        0
      )
    const remainder = (sum * 10) % 11

    return remainder === 10 ? 0 : remainder
  }

  return (
    calculateDigit(9) === Number(cpf[9]) &&
    calculateDigit(10) === Number(cpf[10])
  )
}
