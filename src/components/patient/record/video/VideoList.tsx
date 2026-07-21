import { useState } from 'react'
import type { MedicalFile, MedicalFileStatus, MedicalFileType } from '../../../../api/medicalFiles'
import RecordMediaSheet from '../RecordMediaSheet'

interface VideoListProps {
  records: MedicalFile[]
  loading?: boolean
}

type StatusTone = 'complete' | 'analyzing' | 'failed' | 'uploaded'

const TYPE_LABELS: Record<MedicalFileType, string> = {
  CHECKUP_RESULT: '검진 결과지',
  OPINION_LETTER: '소견서',
  CT: 'CT',
  MRI: 'MRI',
  XRAY: 'X-Ray',
}

function statusMeta(status: MedicalFileStatus): { label: string; tone: StatusTone } {
  switch (status) {
    case 'OCR_COMPLETED':
      return { label: '분석 완료', tone: 'complete' }
    case 'OCR_PENDING':
    case 'OCR_PROCESSING':
      return { label: '분석 중', tone: 'analyzing' }
    case 'OCR_FAILED':
      return { label: '분석 실패', tone: 'failed' }
    case 'UPLOADED':
    default:
      return { label: '업로드 완료', tone: 'uploaded' }
  }
}

function StatusBadge({ status }: { status: MedicalFileStatus }) {
  const meta = statusMeta(status)
  const className =
    meta.tone === 'complete'
      ? 'bg-primary-bg text-primary-text'
      : meta.tone === 'failed'
        ? 'bg-red-50 text-red-500'
        : meta.tone === 'uploaded'
          ? 'bg-[#eef2ef] text-ink-soft'
          : 'bg-[#fdf3df] text-[#c98a1e]'

  return <span className={`inline-block rounded-xl px-2.5 py-0.5 text-[11px] font-bold ${className}`}>{meta.label}</span>
}

function VideoList({ records, loading = false }: VideoListProps) {
  const [selected, setSelected] = useState<MedicalFile | null>(null)

  return (
    <div>
      <p className="mb-3 px-0.5 text-[13px] font-bold text-ink-soft">등록된 자료 {records.length}건</p>
      {loading ? (
        <p className="rounded-[18px] bg-white p-5 text-center text-sm font-semibold text-ink-muted">자료를 불러오는 중입니다.</p>
      ) : records.length === 0 ? (
        <p className="rounded-[18px] bg-white p-5 text-center text-sm font-semibold text-ink-muted">아직 등록된 영상 자료가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((r) => {
            const label = TYPE_LABELS[r.type]
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r)}
                className="flex cursor-pointer items-center gap-3.5 rounded-[22px] border border-black/[0.04] bg-white p-3.5 text-left shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)] transition-all duration-200 hover:shadow-[0_14px_28px_-16px_rgba(20,35,29,0.4)] active:scale-[0.99]"
              >
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[13px] text-center font-mono text-[10px] leading-tight font-semibold text-black/40"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(135deg, rgba(20,35,29,.05) 0 8px, transparent 8px 16px)',
                  }}
                >
                  {label}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink">{displayName(r.originalFileName)}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{recordMeta(r)}</p>
                  <div className="mt-1.5">
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <RecordMediaSheet
          open
          onClose={() => setSelected(null)}
          medicalFileId={selected.id}
          title={displayName(selected.originalFileName)}
          fileName={selected.originalFileName}
          typeLabel={TYPE_LABELS[selected.type]}
          meta={recordMeta(selected)}
          contentType={selected.contentType}
          statusLabel={statusMeta(selected.status).label}
          statusTone={statusMeta(selected.status).tone}
          isVideo={selected.type !== 'OPINION_LETTER'}
        />
      )}
    </div>
  )
}

function displayName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '')
}

function recordMeta(record: MedicalFile) {
  return `${formatDate(record.createdAt)} · ${formatFileSize(record.fileSize)}`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}GB`
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${bytes}B`
}

export default VideoList
