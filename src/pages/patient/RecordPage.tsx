import { useCallback, useEffect, useMemo, useState } from 'react'
import { listMedicalFiles, uploadMedicalFile, type MedicalFile, type MedicalFileType } from '../../api/medicalFiles'
import VideoUpload from '../../components/patient/record/video/VideoUpload'
import VideoList from '../../components/patient/record/video/VideoList'
import TextUpload from '../../components/patient/record/text/textUpload'
import TextList from '../../components/patient/record/text/textList'
import NavBar from '../../components/patient/public/NavBar'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

function RecordPage() {
  const [tab, setTab] = useState<'video' | 'photo'>('video')
  const [records, setRecords] = useState<MedicalFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { token } = useAuth()
  const showToast = useToast()

  const refreshRecords = useCallback(async () => {
    if (!token) return

    setLoading(true)
    try {
      setRecords(await listMedicalFiles(token))
    } catch (error) {
      showToast(error instanceof Error ? error.message : '등록 자료를 불러오지 못했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast, token])

  useEffect(() => {
    void refreshRecords()
  }, [refreshRecords])

  const videoRecords = useMemo(() => records.filter((record) => record.type !== 'CHECKUP_RESULT'), [records])
  const textRecords = useMemo(() => records.filter((record) => record.type === 'CHECKUP_RESULT'), [records])

  async function handleUpload(type: MedicalFileType, file: File) {
    if (!token) {
      showToast('로그인이 필요합니다.', 'error')
      return
    }

    if (type === 'CHECKUP_RESULT' && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('건강검진결과지는 PDF 파일만 업로드할 수 있습니다.', 'error')
      return
    }

    setUploading(true)
    try {
      await uploadMedicalFile(token, type, file)
      showToast(type === 'CHECKUP_RESULT' ? '업로드했습니다. AI 분석을 시작합니다.' : '업로드했습니다.', 'success')
      await refreshRecords()
    } catch (error) {
      showToast(error instanceof Error ? error.message : '업로드에 실패했습니다.', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-app-bg">
      <main className="flex-1 px-5.5 pt-1 pb-[104px]">
        <h1 className="px-0.5 py-3 text-[22px] font-extrabold text-ink">검사자료</h1>

        <div className="mb-4 flex rounded-[13px] bg-[#e2ebe6] p-1">
          <button
            type="button"
            onClick={() => setTab('video')}
            className={`flex-1 cursor-pointer rounded-[10px] py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
              tab === 'video' ? 'bg-white text-ink shadow-[0_4px_10px_-4px_rgba(20,35,29,0.18)]' : 'text-ink-muted'
            }`}
          >
            영상 (MRI·CT·소견서)
          </button>
          <button
            type="button"
            onClick={() => setTab('photo')}
            className={`flex-1 cursor-pointer rounded-[10px] py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
              tab === 'photo' ? 'bg-white text-ink shadow-[0_4px_10px_-4px_rgba(20,35,29,0.18)]' : 'text-ink-muted'
            }`}
          >
            사진 (건강검진결과지)
          </button>
        </div>

        {tab === 'video' ? (
          <>
            <VideoUpload uploading={uploading} onUpload={handleUpload} />
            <VideoList records={videoRecords} loading={loading} />
          </>
        ) : (
          <>
            <TextUpload uploading={uploading} onUpload={(file) => handleUpload('CHECKUP_RESULT', file)} />
            <TextList records={textRecords} loading={loading} />
          </>
        )}
      </main>

      <NavBar />
    </div>
  )
}

export default RecordPage
