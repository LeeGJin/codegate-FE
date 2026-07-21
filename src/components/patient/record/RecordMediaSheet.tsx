import BottomSheet from '../public/BottomSheet'

interface RecordMediaSheetProps {
  open: boolean
  onClose: () => void
  title: string
  typeLabel: string
  date: string
  hospital: string
  status: 'complete' | 'analyzing'
  isVideo?: boolean
}

function RecordMediaSheet({ open, onClose, title, typeLabel, date, hospital, status, isVideo }: RecordMediaSheetProps) {
  const isComplete = status === 'complete'

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div
        className="relative mb-4 flex h-60 items-center justify-center rounded-[20px] text-[13px] font-bold tracking-wide text-black/35"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,35,29,.05) 0 8px, transparent 8px 16px)',
        }}
      >
        <span>{typeLabel}</span>
        {isVideo && (
          <span className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-black/25 text-white">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.5 4.5l9 5.5-9 5.5v-11z" />
            </svg>
          </span>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs text-ink-muted">
          {date} · {hospital}
        </p>
        <span
          className={`inline-block rounded-xl px-2.5 py-0.5 text-[11px] font-bold ${
            isComplete ? 'bg-primary-bg text-primary-text' : 'bg-[#fdf3df] text-[#c98a1e]'
          }`}
        >
          {isComplete ? '분석 완료' : '분석 중'}
        </span>
      </div>
    </BottomSheet>
  )
}

export default RecordMediaSheet
