import { api } from '../api/client'

interface ApiResponse<T> {
  success: boolean
  data: T
  error: { code: string; message: string } | null
}

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

async function unwrap<T>(res: Promise<ApiResponse<T>>): Promise<T> {
  const body = await res
  if (!body.success) throw new ApiError(body.error!.code, body.error!.message)
  return body.data
}

export interface LoginResult {
  token: string
  role: string
  userId: string
}

export interface SignupPayload {
  code: string
  redirectUri: string
  name: string
  gender: 'male' | 'female'
  birthDate: string
  residentRegistrationNumber: string
}

export function getKakaoLoginUrl(redirectUri: string, state?: string): Promise<string> {
  const params = new URLSearchParams({ redirectUri, ...(state ? { state } : {}) })
  return unwrap<{ loginUrl: string }>(api(`/api/v1/auth/kakao/login-url?${params}`)).then(
    (data) => data.loginUrl,
  )
}

export function kakaoLogin(code: string, redirectUri: string): Promise<LoginResult> {
  return unwrap<LoginResult>(
    api('/api/v1/auth/patients/kakao/login', {
      method: 'POST',
      body: JSON.stringify({ code, redirectUri }),
    }),
  )
}

export function kakaoSignup(payload: SignupPayload): Promise<LoginResult> {
  return unwrap<LoginResult>(
    api('/api/v1/auth/patients/kakao/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  )
}
