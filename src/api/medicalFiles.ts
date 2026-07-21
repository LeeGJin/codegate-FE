const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export type MedicalFileType = 'CHECKUP_RESULT' | 'OPINION_LETTER' | 'CT' | 'MRI' | 'XRAY'
export type MedicalFileStatus = 'UPLOADED' | 'OCR_PENDING' | 'OCR_PROCESSING' | 'OCR_COMPLETED' | 'OCR_FAILED'
export type MedicalFileOcrStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: { code: string; message: string; details?: Record<string, unknown> } | null
}

export class MedicalFileApiError extends Error {
  code: string
  details?: Record<string, unknown>

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.code = code
    this.details = details
  }
}

export interface MedicalFile {
  id: number
  type: MedicalFileType
  status: MedicalFileStatus
  originalFileName: string
  contentType: string | null
  fileSize: number
  createdAt: string
}

export interface MedicalFileOcrResult {
  medicalFileId: number
  status: MedicalFileOcrStatus
  extractedText: string | null
  summary: string | null
  recommendedFood: string | null
  recommendedExercise: string | null
  bloodPressureScorePercent: number | null
  bloodSugarScorePercent: number | null
  gammaGtpScorePercent: number | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export function listMedicalFiles(token: string): Promise<MedicalFile[]> {
  return request<MedicalFile[]>('/api/v1/patient/medical-files', {
    headers: authHeaders(token),
  })
}

export function uploadMedicalFile(token: string, type: MedicalFileType, file: File): Promise<MedicalFile> {
  const formData = new FormData()
  formData.append('type', type)
  formData.append('file', file)

  return request<MedicalFile>('/api/v1/patient/medical-files', {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  })
}

export function getMedicalFileOcrResult(token: string, medicalFileId: string | number): Promise<MedicalFileOcrResult> {
  return request<MedicalFileOcrResult>(`/api/v1/patient/medical-files/${medicalFileId}/ocr-result`, {
    headers: authHeaders(token),
  })
}

export async function getMedicalFileContent(token: string, medicalFileId: string | number): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/api/v1/patient/medical-files/${medicalFileId}/content`, {
    headers: authHeaders(token),
  })

  if (res.ok) {
    return res.blob()
  }

  const body = await parseBody<never>(res)
  if (isApiResponse(body)) {
    throw new MedicalFileApiError(
      body.error?.code ?? 'API_ERROR',
      body.error?.message ?? '파일을 불러오지 못했습니다.',
      body.error?.details,
    )
  }

  throw new MedicalFileApiError('HTTP_ERROR', `${res.status} ${res.statusText}`)
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init)
  const body = await parseBody<T>(res)

  if (!res.ok && !isApiResponse(body)) {
    throw new MedicalFileApiError('HTTP_ERROR', `${res.status} ${res.statusText}`)
  }

  if (!isApiResponse(body)) {
    throw new MedicalFileApiError('INVALID_RESPONSE', '서버 응답 형식이 올바르지 않습니다.')
  }

  if (!body.success || body.data === null) {
    throw new MedicalFileApiError(
      body.error?.code ?? 'API_ERROR',
      body.error?.message ?? '요청 처리에 실패했습니다.',
      body.error?.details,
    )
  }

  return body.data
}

async function parseBody<T>(res: Response): Promise<ApiResponse<T> | null> {
  const text = await res.text()
  if (!text) return null

  try {
    return JSON.parse(text) as ApiResponse<T>
  } catch {
    return null
  }
}

function isApiResponse<T>(body: ApiResponse<T> | null): body is ApiResponse<T> {
  return (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    typeof (body as { success: unknown }).success === 'boolean'
  )
}
