import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CBSEReportCard from '../ReportCards/CBSEReportCard'

function CBSEReportCardView() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location && location.state) || {}

  const {
    marksheets = [],
    students = [],
    sections = [],
    selectedSection = '',
    classDoc = null,
    sessionDoc = null,
    school = null,
    orgLogoUrl = '',
    boardLogoUrl = '',
    selectedTerm = '',
    effectiveTemplate = 'CBSE_SIMPLE',
    studentEntryMapEntries = []
  } = state

  const studentEntryMap = useMemo(() => new Map(Array.isArray(studentEntryMapEntries) ? studentEntryMapEntries : []), [studentEntryMapEntries])

  const absUrl = (p) => {
    if (!p) return ''
    if (/^https?:\/\//i.test(p)) return p
    const base = import.meta.env.VITE_API_BASE_URL || ''
    return `${base}${p.startsWith('/') ? '' : '/'}${p}`
  }
  const nf = (n) => {
    const num = Number(n || 0)
    if (!Number.isFinite(num)) return ''
    const val = Math.round(num * 100) / 100
    const s = val.toFixed(2)
    return s.endsWith('.00') ? s.slice(0, -3) : s
  }

  const renderCBSECard = (ms) => {
    const sid = ms?.studentId?._id?.toString() || ms?.studentId?.toString() || ''
    const sDoc = (Array.isArray(students) ? students : []).find(s => (s?._id || s?.id)?.toString() === sid)

    const student = {
      name: ms?.studentId?.name || `${ms?.studentId?.firstName || ''} ${ms?.studentId?.lastName || ''}`.trim() || sDoc?.name || `${sDoc?.firstName || ''} ${sDoc?.lastName || ''}`.trim(),
      class: classDoc?.className || '',
      section: (sections.find(s => (s._id || s.id) === selectedSection)?.sectionName || sections.find(s => (s._id || s.id) === selectedSection)?.name || ''),
      dob: ms?.studentId?.dob || ms?.studentId?.dateOfBirth || sDoc?.dob || sDoc?.dateOfBirth || '',
      fatherName: ms?.studentId?.fatherName || ms?.studentId?.father || ms?.studentId?.parentId?.father?.name || ms?.studentId?.parent?.fatherName || ms?.studentId?.parent?.father?.name || ms?.studentId?.parentData?.father?.name || sDoc?.fatherName || sDoc?.father || sDoc?.parentId?.father?.name || sDoc?.parent?.fatherName || sDoc?.parent?.father?.name || sDoc?.parentData?.father?.name || '',
      motherName: ms?.studentId?.motherName || ms?.studentId?.mother || ms?.studentId?.parentId?.mother?.name || ms?.studentId?.parent?.motherName || ms?.studentId?.parent?.mother?.name || ms?.studentId?.parentData?.mother?.name || sDoc?.motherName || sDoc?.mother || sDoc?.parentId?.mother?.name || sDoc?.parent?.motherName || sDoc?.parent?.mother?.name || sDoc?.parentData?.mother?.name || '',
      address: ms?.studentId?.residentialAddress || ms?.studentId?.permanentAddress || ms?.studentId?.addressLine || ms?.studentId?.address1 || ms?.studentId?.address || sDoc?.residentialAddress || sDoc?.permanentAddress || sDoc?.addressLine || sDoc?.address1 || sDoc?.address || '',
      photo: ms?.studentId?.profilePhoto || ms?.studentId?.photoUrl || ms?.studentId?.photo || ms?.studentId?.imageUrl || sDoc?.profilePhoto || sDoc?.photoUrl || sDoc?.photo || sDoc?.imageUrl || ''
    }

    const schoolProps = {
      affiliationNo: (
        school?.affiliationNo ||
        school?.affiliation ||
        school?.affiliationNumber ||
        school?.affilation ||
        school?.affilationNo ||
        school?.affilationNumber ||
        school?.boardAffiliationNo ||
        school?.boardAffiliationNumber ||
        school?.adminDetails?.affiliationNo ||
        school?.adminDetails?.affiliation ||
        school?.adminDetails?.affiliationNumber ||
        school?.adminDetails?.affilationNo ||
        ''
      ),
      name: school?.name || school?.schoolName || '',
      address: school?.address || school?.location || [school?.city, school?.state, school?.postalCode || school?.pincode].filter(Boolean).join(', ') || '',
      phone: school?.phone || school?.phoneNumber || school?.contactNumber || school?.contactNo || school?.alternatePhone || '',
      email: school?.email || school?.contactEmail || school?.emailId || school?.officialEmail || school?.adminDetails?.email || '',
      website: school?.website || school?.adminDetails?.website || '',
      session: sessionDoc?.yearRange || '',
      logoUrl: school?.logoUrl || school?.logo || (school?.assets?.logo || '') || orgLogoUrl,
      schoolCode: school?.schoolCode || school?.code || '',
      boardLogoUrl: boardLogoUrl
    }

    const entry = studentEntryMap.get(sid) || null
    const entryByName = new Map(
      (Array.isArray(entry?.subjects) ? entry.subjects : []).map(x => [String(x.subject || '').trim().toUpperCase(), x])
    )

    const subjects = (Array.isArray(ms?.subjects) ? ms.subjects : []).map((s) => {
      const name = s?.subjectName || s?.name || ''
      const key = String(name).trim().toUpperCase()
      const e = entryByName.get(key) || null
      const obt = e?.obtainedMarks || null
      const mm = e?.maxMarks || null
      const t1o = Number(obt?.Term1?.i || 0) + Number(obt?.Term1?.ii || 0) + Number(obt?.Term1?.iii || 0) + Number(obt?.Term1?.iv || 0) + Number(obt?.Term1?.v || 0) || Number(s?.Term1?.obtained || 0)
      const t2o = Number(obt?.Term2?.i || 0) + Number(obt?.Term2?.ii || 0) + Number(obt?.Term2?.iii || 0) + Number(obt?.Term2?.iv || 0) + Number(obt?.Term2?.v || 0) || Number(s?.Term2?.obtained || 0)
      return {
        name,
        Term1: {
          i: Number(obt?.Term1?.i || 0),
          ii: Number(obt?.Term1?.ii || 0),
          iii: Number(obt?.Term1?.iii || 0),
          iv: Number(obt?.Term1?.iv || 0),
          v: Number(obt?.Term1?.v || 0),
          max: Number(mm?.Term1?.max || s?.Term1?.max || 0),
          iMax: Number(mm?.Term1?.i || 0),
          iiMax: Number(mm?.Term1?.ii || 0),
          iiiMax: Number(mm?.Term1?.iii || 0),
          ivMax: Number(mm?.Term1?.iv || 0),
          vMax: Number(mm?.Term1?.v || 0)
        },
        Term2: {
          i: Number(obt?.Term2?.i || 0),
          ii: Number(obt?.Term2?.ii || 0),
          iii: Number(obt?.Term2?.iii || 0),
          iv: Number(obt?.Term2?.iv || 0),
          v: Number(obt?.Term2?.v || 0),
          max: Number(mm?.Term2?.max || 0 || s?.Term2?.max || 0),
          iMax: Number(mm?.Term2?.i || 0),
          iiMax: Number(mm?.Term2?.ii || 0),
          iiiMax: Number(mm?.Term2?.iii || 0),
          ivMax: Number(mm?.Term2?.iv || 0),
          vMax: Number(mm?.Term2?.v || 0)
        },
        marksObtained: (t1o + t2o)
      }
    })

    const activities = Array.isArray(ms?.activities) ? ms.activities : []
    const att1 = entry?.attendance?.Term1
    const att2 = entry?.attendance?.Term2
    const od1 = entry?.openDays?.term1OpenDays
    const od2 = entry?.openDays?.term2OpenDays

    const marksProps = {
      subjects,
      activities,
      attendance_term1: (att1 != null && od1 != null) ? `${att1}/${od1}` : (ms?.attendance?.total || ms?.attendance || ''),
      attendance_term2: (att2 != null && od2 != null) ? `${att2}/${od2}` : '',
      openDays_term1: od1,
      openDays_term2: od2,
      present_term1: att1,
      present_term2: att2,
      remarks: ms?.remarks || '',
      final_result: ms?.status || ''
    }

    return (
      <div className="cbse-sheet relative">
        <div className="p-4">
          <CBSEReportCard school={schoolProps} student={student} marks={marksProps} />
        </div>
      </div>
    )
  }

  const renderCBSEJunior = (ms) => {
    const subs = Array.isArray(ms?.subjects) ? ms.subjects : []
    return (
      <div className="cbse-sheet relative">
        {school?.assets?.backgroundFrame && (
          <img src={absUrl(school.assets.backgroundFrame)} alt="bg" className="pointer-events-none select-none opacity-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4" onError={(e)=>{e.currentTarget.style.display='none'}} />
        )}
        <div className="border-b">
          {school?.assets?.headerImage ? (
            <img src={absUrl(school?.assets?.headerImage)} alt="" className="w-full h-24 object-cover" onError={(e)=>{e.currentTarget.style.display='none'}} />
          ) : (
            <div className="px-6 py-3 text-center">
              <div className="text-2xl font-bold">{school?.name || ''}</div>
              <div className="text-xs text-gray-600">{school?.address || ''}</div>
            </div>
          )}
          <div className="px-6 py-3 text-center">
            <div className="text-xl font-bold">Progress Report</div>
            <div className="text-sm text-gray-600">Session: {sessionDoc?.yearRange || ''}</div>
            <div className="text-[10px] text-gray-500 tracking-wide">INTERNET GENERATED COPY</div>
          </div>
        </div>
        <div className="p-4">
          <table className="w-full text-xs mb-3">
            <tbody>
              <tr>
                <td className="border px-2 py-1 w-1/2">Student Name: <span className="font-semibold">{ms?.studentId?.name || `${ms?.studentId?.firstName || ''} ${ms?.studentId?.lastName || ''}`.trim()}</span></td>
                <td className="border px-2 py-1 w-1/2">Roll No: <span className="font-semibold">{ms?.studentId?.rollNumber || ms?.studentId?.rollNo || '-'}</span></td>
                <td className="border px-2 py-1 align-middle text-center" rowSpan="2" style={{ width: 96 }}>
                  {ms?.studentId?.profilePhoto ? (
                    <img src={absUrl(ms.studentId.profilePhoto)} alt="photo" className="h-20 w-20 object-cover inline-block" onError={(e)=>{e.currentTarget.style.display='none'}} />
                  ) : (
                    <div className="h-20 w-20 bg-gray-100 inline-block" />)
                  }
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Class/Section: <span className="font-semibold">{classDoc?.className || ''} / {(sections.find(s => (s._id || s.id) === selectedSection)?.sectionName || sections.find(s => (s._id || s.id) === selectedSection)?.name || '')}</span></td>
                <td className="border px-2 py-1">Exam: <span className="font-semibold">{ms?.examId?.examName || ms?.examId?.title || selectedTerm}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-6 pb-4">
          <table className="cbse-table text-xs">
            <thead>
              <tr>
                <th rowSpan="2">S.No</th>
                <th rowSpan="2" className="text-left">Subject</th>
                <th colSpan="2">Term 1</th>
                <th colSpan="2">Term 2</th>
                <th colSpan="2">Term 3</th>
                <th rowSpan="2">Grand Total</th>
                <th rowSpan="2">Grade</th>
              </tr>
              <tr>
                <th>Max</th>
                <th>Obt</th>
                <th>Max</th>
                <th>Obt</th>
                <th>Max</th>
                <th>Obt</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s, i) => {
                const t1m = s.Term1?.max || 0
                const t1o = s.Term1?.obtained || 0
                const t2m = s.Term2?.max || 0
                const t2o = s.Term2?.obtained || 0
                const t3m = s.Term3?.max || 0
                const t3o = s.Term3?.obtained || 0
                const gtM = s.totalMaxMarks ?? (t1m + t2m + t3m)
                const gtO = s.marksObtained ?? (t1o + t2o + t3o)
                return (
                  <tr key={s.subjectId}>
                    <td className="text-center">{i + 1}</td>
                    <td className="font-semibold text-left">{s.subjectName}</td>
                    <td className="text-center">{t1m}</td>
                    <td className="text-center">{nf(t1o)}</td>
                    <td className="text-center">{t2m}</td>
                    <td className="text-center">{nf(t2o)}</td>
                    <td className="text-center">{t3m}</td>
                    <td className="text-center">{nf(t3o)}</td>
                    <td className="text-center font-semibold">{nf(gtO)}/{gtM}</td>
                    <td className="text-center">{s.grade || ''}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" className="text-right font-bold">Totals</td>
                <td className="text-center font-semibold">{subs.reduce((a,s)=>a+(s.Term1?.max||0),0)}</td>
                <td className="text-center font-semibold">{nf(subs.reduce((a,s)=>a+(s.Term1?.obtained||0),0))}</td>
                <td className="text-center font-semibold">{subs.reduce((a,s)=>a+(s.Term2?.max||0),0)}</td>
                <td className="text-center font-semibold">{nf(subs.reduce((a,s)=>a+(s.Term2?.obtained||0),0))}</td>
                <td className="text-center font-semibold">{subs.reduce((a,s)=>a+(s.Term3?.max||0),0)}</td>
                <td className="text-center font-semibold">{nf(subs.reduce((a,s)=>a+(s.Term3?.obtained||0),0))}</td>
                <td className="text-center font-bold">{nf(ms?.totalObtained || 0)}/{ms?.totalMaxMarks || 0}</td>
                <td className="text-center font-bold">{ms?.grade || ''}</td>
              </tr>
            </tfoot>
          </table>
          <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
            <div className="signature-box">Signature of Class Teacher</div>
            <div className="signature-box">Signature of Checker</div>
            <div className="signature-box">Sign. of Principal</div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="avoid-break">
              <div className="border p-3 mb-2">Class Teacher's Remarks:</div>
              <div className="border p-3">Final Result: <span className="font-semibold">{marksheets?.[0]?.status || ''}</span></div>
            </div>
            <div className="avoid-break">
              <table className="w-full text-[11px]">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">S.No</th>
                    <th className="border px-2 py-1">Grade</th>
                    <th className="border px-2 py-1">Marks Range</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1','A1','91-100'],
                    ['2','A2','81-90'],
                    ['3','B1','71-80'],
                    ['4','B2','61-70'],
                    ['5','C1','51-60'],
                    ['6','C2','41-50'],
                    ['7','D','33-40'],
                    ['8','E','32 & Below']
                  ].map((r)=> (
                    <tr key={r[0]}>
                      <td className="border px-2 py-1 text-center">{r[0]}</td>
                      <td className="border px-2 py-1 text-center">{r[1]}</td>
                      <td className="border px-2 py-1 text-center">{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-[10px] text-gray-500 mt-2">Note: In case of any discrepancy, school's record will be final.</div>
          {school?.assets?.footerImage && (
            <div className="mt-3">
              <img src={absUrl(school.assets.footerImage)} alt="footer" className="w-full h-14 object-cover" onError={(e)=>{e.currentTarget.style.display='none'}} />
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderCBSESr = (ms) => {
    const subs = Array.isArray(ms?.subjects) ? ms.subjects : []
    return (
      <div className="cbse-sheet relative">
        {school?.assets?.backgroundFrame && (
          <img src={absUrl(school.assets.backgroundFrame)} alt="bg" className="pointer-events-none select-none opacity-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4" onError={(e)=>{e.currentTarget.style.display='none'}} />
        )}
        <div className="cbse-header border-b">
          <div className="flex items-center justify-between p-4">
            <div className="w-24 h-24 flex items-center justify-center">
              {school?.logoUrl && <img src={absUrl(school.logoUrl)} alt="logo" className="max-h-20 object-contain" onError={(e)=>{e.currentTarget.style.display='none'}} />}
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold uppercase">{school?.name || ''}</h1>
              <div className="subtitle">{school?.address || ''}</div>
            </div>
            <div className="w-24 h-24 flex items-center justify-center">
              {school?.assets?.stampImage && <img src={absUrl(school.assets.stampImage)} alt="stamp" className="max-h-20 object-contain opacity-80" onError={(e)=>{e.currentTarget.style.display='none'}} />}
            </div>
          </div>
          <div className="text-center bg-gray-100 py-2 font-semibold tracking-wide">
            Progress Report {sessionDoc?.yearRange || ''}
            <div className="text-[10px] text-gray-500 font-normal">INTERNET GENERATED COPY</div>
          </div>
        </div>

        <div className="p-4">
          <table className="w-full text-xs mb-3">
            <tbody>
              <tr>
                <td className="border px-2 py-1 w-1/2">Student Name: <span className="font-semibold">{ms?.studentId?.name || `${ms?.studentId?.firstName || ''} ${ms?.studentId?.lastName || ''}`.trim()}</span></td>
                <td className="border px-2 py-1 w-1/2">Roll No: <span className="font-semibold">{ms?.studentId?.rollNumber || ms?.studentId?.rollNo || '-'}</span></td>
                <td className="border px-2 py-1 align-middle text-center" rowSpan="2" style={{ width: 96 }}>
                  {ms?.studentId?.profilePhoto ? (
                    <img src={absUrl(ms.studentId.profilePhoto)} alt="photo" className="h-20 w-20 object-cover inline-block" />
                  ) : (
                    <div className="h-20 w-20 bg-gray-100 inline-block" />)
                  }
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Class/Section: <span className="font-semibold">{classDoc?.className || ''} / {(sections.find(s => (s._id || s.id) === selectedSection)?.sectionName || sections.find(s => (s._id || s.id) === selectedSection)?.name || '')}</span></td>
                <td className="border px-2 py-1">Exam: <span className="font-semibold">{ms?.examId?.examName || ms?.examId?.title || selectedTerm}</span></td>
              </tr>
            </tbody>
          </table>

          <table className="cbse-table text-xs">
            <thead>
              <tr>
                <th>S.No</th>
                <th className="text-left">Subject</th>
                <th>Half Yearly</th>
                <th>Annual</th>
                <th>Aggregate</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s, i) => {
                const t1m = s.Term1?.max || 0
                const t1o = s.Term1?.obtained || 0
                const t2m = s.Term2?.max || 0
                const t2o = s.Term2?.obtained || 0
                const aggM = (s.totalMaxMarks ?? (t1m + t2m + (s.Term3?.max || 0)))
                const aggO = (s.marksObtained ?? (t1o + t2o + (s.Term3?.obtained || 0)))
                return (
                  <tr key={s.subjectId}>
                    <td className="text-center">{i + 1}</td>
                    <td className="font-semibold text-left">{s.subjectName}</td>
                    <td className="text-center">{nf(t1o)}/{t1m}</td>
                    <td className="text-center">{nf(t2o)}/{t2m}</td>
                    <td className="text-center">{nf(aggO)}/{aggM}</td>
                    <td className="text-center">{s.grade || ''}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-right font-bold">Total</td>
                <td className="text-center font-bold">{nf(ms?.totalObtained || 0)}/{ms?.totalMaxMarks || 0}</td>
                <td className="text-center font-bold">{ms?.grade || ''}</td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
            <div className="signature-box">Signature of Class Teacher</div>
            <div className="signature-box">Class Teacher's Remarks</div>
            <div className="signature-box flex flex-col">
              {school?.assets?.signaturePrincipal && (
                <img src={absUrl(school.assets.signaturePrincipal)} alt="principal sign" className="h-10 object-contain" />
              )}
              <span>Sign. of Principal</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!Array.isArray(marksheets) || marksheets.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen w-full">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white shadow rounded p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Marksheet View</h1>
              <button onClick={()=>navigate(-1)} className="px-4 py-2 rounded bg-gray-700 text-white text-sm">Back</button>
            </div>
            <div className="text-gray-600">No marksheet data to view.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen w-full">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h1 className="text-2xl font-bold text-gray-800">Marksheet View</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>navigate(-1)} className="px-4 py-2 rounded bg-gray-700 text-white text-sm">Back</button>
            <button onClick={()=>window.print()} className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm">Print</button>
          </div>
        </div>
        <style>{`
          .cbse-sheet { width: 210mm; min-height: 297mm; margin: 12px auto; background: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,.08); border: 1px solid #e5e7eb; box-sizing: border-box; }
          .cbse-header h1 { font-size: 20px; font-weight: 700; }
          .cbse-header .subtitle { font-size: 11px; color: #4b5563; }
          .cbse-table { width: 100%; border-collapse: collapse; }
          .cbse-table th, .cbse-table td { border: 1px solid #d1d5db; padding: 6px 8px; }
          .cbse-table thead th { background: #f3f4f6; color: #111827; font-weight: 700; }
          .signature-box { height: 60px; border: 1px solid #d1d5db; display: flex; align-items: center; justify-content: center; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          .cbse-sheet .overflow-x-auto { overflow: visible; }
          .cbse-sheet .max-w-5xl { max-width: none; }
          @media print {
            @page { size: A4; margin: 5mm; }
            html, body { background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print\\:hidden { display: none !important; }
            .cbse-sheet { width: 200mm; height: 287mm; margin: 0 auto; box-shadow: none; border: none; overflow: hidden; break-inside: avoid; page-break-inside: avoid; transform: none !important; transform-origin: top left; box-sizing: border-box; }
            .cbse-sheet * { break-inside: avoid; page-break-inside: avoid; }
          }
        `}</style>

        <div id="view-root">
          {(() => {
            const list = marksheets
            return list.map((ms, idx) => (
              <div
                key={ms._id || idx}
                className="bg-white rounded-lg overflow-hidden"
                style={{ pageBreakAfter: idx === list.length - 1 ? 'auto' : 'always' }}
              >
                {effectiveTemplate === 'CBSE_SIMPLE' ? renderCBSECard(ms) : (effectiveTemplate === 'CBSE_SENIOR' ? renderCBSESr(ms) : renderCBSEJunior(ms))}
              </div>
            ))
          })()}
        </div>
      </div>
    </div>
  )
}

export default CBSEReportCardView
