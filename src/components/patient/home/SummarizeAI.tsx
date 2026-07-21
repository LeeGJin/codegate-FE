import { useEffect, useState } from 'react'
import { getMedicalFileOcrResult, listMedicalFiles, type MedicalFileOcrResult } from '../../../api/medicalFiles'
import { useAuth } from '../../../context/AuthContext'

const METRICS: { key: keyof MedicalFileOcrResult; label: string }[] = [
  { key: 'bloodPressureScorePercent', label: '혈압' },
  { key: 'bloodSugarScorePercent', label: '혈당' },
  { key: 'gammaGtpScorePercent', label: '간수치(감마GTP)' },
]

const DEFAULT_MESSAGE = '건강검진결과지를 등록하고\nAI 분석을 받아보세요'

function SummarizeAI() {
  const { token } = useAuth()
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [tone, setTone] = useState<'warning' | 'healthy' | 'default'>('default')

  useEffect(() => {
    if (!token) return

    listMedicalFiles(token)
      .then((files) => {
        const latest = files.filter((f) => f.type === 'CHECKUP_RESULT').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
        return latest ? getMedicalFileOcrResult(token, latest.id) : null
      })
      .then((result) => {
        if (!result || result.status !== 'COMPLETED') return

        const worst = METRICS.map((m) => ({ label: m.label, percent: result[m.key] as number | null }))
          .filter((m): m is { label: string; percent: number } => m.percent !== null)
          .sort((a, b) => b.percent - a.percent)[0]

        if (worst && worst.percent >= 40) {
          setMessage(`${worst.label} 수치를\n확인해 주세요`)
          setTone('warning')
        } else {
          setMessage('검진 수치가 모두 양호해요')
          setTone('healthy')
        }
      })
      .catch(() => {})
  }, [token])

  const lines = message.split('\n')
  const lineNodes = lines.map((line, i) => (
    <span key={line}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ))

  if (tone === 'warning') {
    return (
      <div className="flex items-center gap-4 rounded-[20px] bg-[#fff6e6] px-[22px] py-5 shadow-[0_10px_24px_-14px_rgba(245,200,105,0.45)]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5c869] text-2xl">!</span>
        <p className="text-[17px] leading-snug font-bold text-[#7a5a13]">{lineNodes}</p>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-4 rounded-[20px] px-[22px] py-5 shadow-[0_10px_24px_-14px_rgba(67,199,138,0.35)]"
      style={{ background: 'linear-gradient(135deg, #eafbf3, #ffffff)' }}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#43c78a] text-2xl text-white">
        {tone === 'healthy' ? '✓' : '＋'}
      </span>
      <p className="text-[17px] leading-snug font-bold text-[#1f8a5f]">{lineNodes}</p>
    </div>
  )
}

export default SummarizeAI
