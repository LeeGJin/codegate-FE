import { useEffect, useState } from 'react'
import { getDepartments, getDistricts } from '../../../../api/meta'
import type { MetaItem } from '../../../../api/meta'

const DATES = ['7/22 (화)', '7/23 (수)', '7/24 (목)', '7/25 (금)']
const TIME_PERIODS = ['오전', '오후', '저녁']

const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]

function SelectHospital() {
  const [departments, setDepartments] = useState<MetaItem[]>([])
  const [seoulDistricts, setSeoulDistricts] = useState<MetaItem[]>([])
  const [department, setDepartment] = useState('')
  const [date, setDate] = useState(DATES[1])
  const [period, setPeriod] = useState(TIME_PERIODS[0])
  const [region, setRegion] = useState(REGIONS[0])
  const [district, setDistrict] = useState('')

  useEffect(() => {
    getDepartments().then((data) => {
      setDepartments(data)
      setDepartment(data[0]?.code ?? '')
    })
    getDistricts().then((data) => {
      setSeoulDistricts(data)
      setDistrict(data[0]?.code ?? '')
    })
  }, [])

  const districts = region === '서울' ? seoulDistricts : []

  function handleRegionChange(value: string) {
    setRegion(value)
    setDistrict(value === '서울' ? (seoulDistricts[0]?.code ?? '') : '')
  }

  return (
    <div className="rounded-[22px] border border-black/[0.04] bg-white p-4 shadow-[0_8px_20px_-14px_rgba(20,35,29,0.3)]">
      <div className="mb-3 flex gap-2.5">
        <label className="flex-1">
          <div className="mb-1.5 text-xs font-semibold text-ink-muted">지역</div>
          <select
            value={region}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <div className="mb-1.5 text-xs font-semibold text-ink-muted">구</div>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={districts.length === 0}
            className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink disabled:text-ink-faint"
          >
            {districts.length > 0 ? (
              districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.label}
                </option>
              ))
            ) : (
              <option value="">구 정보 없음</option>
            )}
          </select>
        </label>
      </div>

      <div className="mb-3 flex gap-2.5">
        <label className="flex-1">
          <div className="mb-1.5 text-xs font-semibold text-ink-muted">진료과목</div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink"
          >
            {departments.map((d) => (
              <option key={d.code} value={d.code}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <div className="mb-1.5 text-xs font-semibold text-ink-muted">날짜</div>
          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink"
          >
            {DATES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {TIME_PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`cursor-pointer rounded-full px-3.5 py-2 text-[13px] font-bold transition-all duration-200 active:scale-[0.95] ${
              period === p
                ? 'bg-primary-deep text-white shadow-[0_6px_14px_-8px_rgba(12,107,80,0.55)]'
                : 'bg-[#f0f5f2] text-ink-soft hover:bg-[#e6ede9]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SelectHospital
