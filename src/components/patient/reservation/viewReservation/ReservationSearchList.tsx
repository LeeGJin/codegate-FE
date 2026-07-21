import { useNavigate } from 'react-router-dom'
import type { PatientReservation, ReservationStatus } from '../../../../api/reservations'

const STATUS_STYLE: Record<ReservationStatus, string> = {
  REQUESTED: 'bg-[#fdf3df] text-[#c98a1e]',
  APPROVED: 'bg-primary-bg text-primary-text',
  REJECTED: 'bg-black/[0.05] text-ink-faint',
  PATIENT_CANCELED: 'bg-black/[0.05] text-ink-faint',
  HOSPITAL_CANCELED: 'bg-black/[0.05] text-ink-faint',
}

function StatusBadge({ status, statusLabel }: { status: ReservationStatus; statusLabel: string }) {
  return (
    <span className={`inline-block rounded-xl px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[status]}`}>
      {statusLabel}
    </span>
  )
}

function ReservationSearchList({ reservations }: { reservations: PatientReservation[] }) {
  const navigate = useNavigate()

  if (reservations.length === 0) {
    return <p className="py-12 text-center text-sm text-ink-faint">예약 내역이 없어요</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {reservations.map((r) => (
        <button
          key={r.reservationId}
          type="button"
          onClick={() => navigate(`/reservation/${r.reservationId}`)}
          className="flex w-full cursor-pointer items-center gap-3.5 rounded-[22px] border border-black/[0.04] bg-white p-4 text-left shadow-[0_8px_20px_-14px_rgba(20,35,29,0.3)] transition-shadow duration-200 active:scale-[0.99]"
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] text-center font-mono text-[10px] font-semibold text-black/40"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,35,29,.05) 0 8px, transparent 8px 16px)' }}
          >
            병원
          </span>
          <div className="flex-1">
            <p className="text-base font-extrabold text-ink">
              {r.hospitalName} · {r.department}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {r.date} {r.startTime}
            </p>
            <div className="mt-1.5">
              <StatusBadge status={r.status} statusLabel={r.statusLabel} />
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default ReservationSearchList
