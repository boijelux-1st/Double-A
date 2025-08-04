export const otpCodes: {
  email: string
  code: string
  expires: number
}[] = []

export const storeOTPCode = (email: string, code: string) => {
  otpCodes.push({
    email,
    code,
    expires: Date.now() + 5 * 60 * 1000,
  })
}

export const getOTPCode = (email: string) =>
  otpCodes.find((entry) => entry.email === email)

export const deleteOTPCode = (email: string) => {
  const index = otpCodes.findIndex((entry) => entry.email === email)
  if (index !== -1) otpCodes.splice(index, 1)
}
