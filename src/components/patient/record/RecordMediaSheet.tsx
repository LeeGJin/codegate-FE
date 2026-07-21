import { useEffect, useMemo, useState } from 'react'
import { getMedicalFileContent } from '../../../api/medicalFiles'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import BottomSheet from '../public/BottomSheet'

interface RecordMediaSheetProps {
  open: boolean
  onClose: () => void
  medicalFileId: number
  title: string
  fileName: string
  typeLabel: string
  meta: string
  contentType: string | null
  statusLabel: string
  statusTone: 'complete' | 'analyzing' | 'failed' | 'uploaded'
  isVideo?: boolean
}

function RecordMediaSheet({
  open,
  onClose,
  medicalFileId,
  title,
  fileName,
  typeLabel,
  meta,
  contentType,
  statusLabel,
  statusTone,
  isVideo,
}: RecordMediaSheetProps) {
  const { token } = useAuth()
  const showToast = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewContentType, setPreviewContentType] = useState<string | null>(contentType)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const badgeClass =
    statusTone === 'complete'
      ? 'bg-primary-bg text-primary-text'
      : statusTone === 'failed'
        ? 'bg-red-50 text-red-500'
        : statusTone === 'uploaded'
          ? 'bg-[#eef2ef] text-ink-soft'
          : 'bg-[#fdf3df] text-[#c98a1e]'

  useEffect(() => {
    if (!open || !token) return

    let cancelled = false
    let objectUrl: string | null = null

    async function loadPreview() {
      setLoadingPreview(true)
      setPreviewUrl(null)
      setPreviewContentType(contentType)

      try {
        const blob = await getMedicalFileContent(token!, medicalFileId)
        if (cancelled) return

        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
        setPreviewContentType(blob.type || contentType)
      } catch (error) {
        if (!cancelled) {
          showToast(error instanceof Error ? error.message : '파일을 불러오지 못했습니다.', 'error')
        }
      } finally {
        if (!cancelled) setLoadingPreview(false)
      }
    }

    void loadPreview()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [contentType, medicalFileId, open, showToast, token])

  const previewKind = useMemo(() => resolvePreviewKind(previewContentType, fileName), [previewContentType, fileName])

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <Preview
        loading={loadingPreview}
        previewUrl={previewUrl}
        previewKind={previewKind}
        typeLabel={typeLabel}
        isVideo={isVideo}
      />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs text-ink-muted">{meta}</p>
        <span className={`inline-block rounded-xl px-2.5 py-0.5 text-[11px] font-bold ${badgeClass}`}>
          {statusLabel}
        </span>
      </div>
    </BottomSheet>
  )
}

function Preview({
  loading,
  previewUrl,
  previewKind,
  typeLabel,
  isVideo,
}: {
  loading: boolean
  previewUrl: string | null
  previewKind: 'image' | 'pdf' | 'video' | 'unsupported'
  typeLabel: string
  isVideo?: boolean
}) {
  if (loading) {
    return <Placeholder typeLabel="파일을 불러오는 중입니다." />
  }

  if (previewUrl && previewKind === 'image') {
    return (
      <div className="mb-4 flex h-60 items-center justify-center overflow-hidden rounded-[20px] bg-black/[0.03]">
        <img src={previewUrl} alt={typeLabel} className="max-h-full max-w-full object-contain" />
      </div>
    )
  }

  if (previewUrl && previewKind === 'pdf') {
    return <iframe src={previewUrl} title={typeLabel} className="mb-4 h-60 w-full rounded-[20px] border-0 bg-white" />
  }

  if (previewUrl && previewKind === 'video') {
    return <video src={previewUrl} controls className="mb-4 h-60 w-full rounded-[20px] bg-black" />
  }

  return (
    <Placeholder
      typeLabel={typeLabel}
      isVideo={isVideo}
      description="브라우저 미리보기를 지원하지 않는 파일 형식입니다."
    />
  )
}

function Placeholder({ typeLabel, isVideo, description }: { typeLabel: string; isVideo?: boolean; description?: string }) {
  return (
    <div
      className="relative mb-4 flex h-60 flex-col items-center justify-center rounded-[20px] px-6 text-center text-[13px] font-bold tracking-wide text-black/35"
      style={{
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,35,29,.05) 0 8px, transparent 8px 16px)',
      }}
    >
      <span>{typeLabel}</span>
      {description && <span className="mt-2 text-xs font-semibold tracking-normal text-ink-muted">{description}</span>}
      {isVideo && (
        <span className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-black/25 text-white">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.5 4.5l9 5.5-9 5.5v-11z" />
          </svg>
        </span>
      )}
    </div>
  )
}

function resolvePreviewKind(contentType: string | null, fileName: string): 'image' | 'pdf' | 'video' | 'unsupported' {
  const normalizedContentType = (contentType ?? '').toLowerCase()
  const normalizedName = fileName.toLowerCase()

  if (normalizedContentType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(normalizedName)) return 'image'
  if (normalizedContentType === 'application/pdf' || normalizedName.endsWith('.pdf')) return 'pdf'
  if (normalizedContentType.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(normalizedName)) return 'video'
  return 'unsupported'
}

export default RecordMediaSheet
