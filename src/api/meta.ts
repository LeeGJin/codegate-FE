import { api } from './client'

export interface MetaItem {
  code: string
  label: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error: string | null
}

export function getDistricts() {
  return api<ApiResponse<MetaItem[]>>('/api/v1/meta/districts').then((res) => res.data)
}

export function getDepartments() {
  return api<ApiResponse<MetaItem[]>>('/api/v1/meta/departments').then((res) => res.data)
}