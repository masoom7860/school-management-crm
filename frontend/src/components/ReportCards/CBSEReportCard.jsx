export default function CBSEReportCard({ school = {}, student = {}, marks = {} }) {
  const safe = (v) => (v ? v : "_________");
  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
  const FRONT_ORIGIN = typeof window !== 'undefined' ? window.location.origin : ''
  const getFilesBase = () => {
    if (/^https?:\/\//i.test(API_BASE)) {
      return API_BASE.replace(/\/?api\/?$/, '')
    }
    return FRONT_ORIGIN
  }
  const absUrl = (url) => {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) return url
    const base = getFilesBase()
    const clean = url.startsWith('/') ? url.slice(1) : url
    return `${base}/${clean}`
  }
  const fmtDate = (val) => {
    if (!val) return ''
    try {
      const d = new Date(val)
      if (!Number.isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yyyy = d.getFullYear()
        return `${dd}/${mm}/${yyyy}`
      }
      const m = String(val).match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (m) return `${m[3]}/${m[2]}/${m[1]}`
      return String(val)
    } catch (_) {
      return String(val)
    }
  }

  const gradeFromPercent = (p) => {
    if (p >= 91) return 'A1'
    if (p >= 81) return 'A2'
    if (p >= 71) return 'B1'
    if (p >= 61) return 'B2'
    if (p >= 51) return 'C1'
    if (p >= 41) return 'C2'
    if (p >= 33) return 'D'
    if (p > 0) return 'E'
    return ''
  }
  const termGrade = (obt, max) => {
    const o = Number(obt || 0)
    const m = Number(max || 0)
    const pct = m > 0 ? (o / m) * 100 : 0
    return gradeFromPercent(pct)
  }
  const dispPart = (val, max, hasTerm) => {
    if (!hasTerm) return (val === 0 ? 0 : (val || ''))
    const v = Number(val || 0)
    return v > 0 ? String(v) : ''
  }
  const t1MaxHeader = Number(((Array.isArray(marks?.subjects) && marks.subjects[0]?.Term1?.max) || marks?.subjects?.[0]?.term1Max || 40))
  const t2MaxHeader = Number(((Array.isArray(marks?.subjects) && marks.subjects[0]?.Term2?.max) || marks?.subjects?.[0]?.term2Max || 60))
  const t1iH = Number(marks?.subjects?.[0]?.Term1?.iMax ?? 10)
  const t1iiH = Number(marks?.subjects?.[0]?.Term1?.iiMax ?? 5)
  const t1iiiH = Number(marks?.subjects?.[0]?.Term1?.iiiMax ?? 5)
  const t1ExamH = Number(marks?.subjects?.[0]?.Term1 ? (Number(marks.subjects[0].Term1.ivMax || 0) + Number(marks.subjects[0].Term1.vMax || 0)) : 80)
  const t1MarksH = Number(marks?.subjects?.[0]?.Term1?.max ?? (t1iH + t1iiH + t1iiiH + t1ExamH))
  const t2iH = Number(marks?.subjects?.[0]?.Term2?.iMax ?? 10)
  const t2iiH = Number(marks?.subjects?.[0]?.Term2?.iiMax ?? 5)
  const t2iiiH = Number(marks?.subjects?.[0]?.Term2?.iiiMax ?? 5)
  const t2ExamH = Number(marks?.subjects?.[0]?.Term2 ? (Number(marks.subjects[0].Term2.ivMax || 0) + Number(marks.subjects[0].Term2.vMax || 0)) : 80)
  const t2MarksH = Number(marks?.subjects?.[0]?.Term2?.max ?? (t2iH + t2iiH + t2iiiH + t2ExamH))
  const subjectsArr = Array.isArray(marks?.subjects) ? marks.subjects : []
  const t1SumObt = subjectsArr.reduce((a, s) => {
    const sum = s?.Term1
      ? (Number(s.Term1.i || 0) + Number(s.Term1.ii || 0) + Number(s.Term1.iii || 0) + Number(s.Term1.iv || 0) + Number(s.Term1.v || 0))
      : (Number(s.pt1 || 0) + Number(s.nb1 || 0) + Number(s.se1 || 0) + Number(s.half || 0))
    return a + sum
  }, 0)
  const t1SumMax = subjectsArr.reduce((a, s) => a + Number((s.term1Max ?? s?.Term1?.max) || 0), 0)
  const t2SumObt = subjectsArr.reduce((a, s) => {
    const sum = s?.Term2
      ? (Number(s.Term2.i || 0) + Number(s.Term2.ii || 0) + Number(s.Term2.iii || 0) + Number(s.Term2.iv || 0) + Number(s.Term2.v || 0))
      : (Number(s.pt2 || 0) + Number(s.nb2 || 0) + Number(s.se2 || 0) + Number(s.annual || 0))
    return a + sum
  }, 0)
  const t2SumMax = subjectsArr.reduce((a, s) => a + Number((s.term2Max ?? s?.Term2?.max) || 0), 0)
  const grandSumObt = t1SumObt + t2SumObt
  const grandSumMax = t1SumMax + t2SumMax
  // Column-wise sums and maxima for Percent row
  const t1PTSum = subjectsArr.reduce((a, s) => a + Number((s.pt1 ?? s?.Term1?.i) || 0), 0)
  const t1PTMaxSum = subjectsArr.reduce((a, s) => a + (s?.Term1 ? Number((s.Term1?.iMax ?? t1iH) || 0) : 0), 0)
  const t1NBSum = subjectsArr.reduce((a, s) => a + Number((s.nb1 ?? s?.Term1?.ii) || 0), 0)
  const t1NBMaxSum = subjectsArr.reduce((a, s) => a + (s?.Term1 ? Number((s.Term1?.iiMax ?? t1iiH) || 0) : 0), 0)
  const t1SESum = subjectsArr.reduce((a, s) => a + Number((s.se1 ?? s?.Term1?.iii) || 0), 0)
  const t1SEMaxSum = subjectsArr.reduce((a, s) => a + (s?.Term1 ? Number((s.Term1?.iiiMax ?? t1iiiH) || 0) : 0), 0)
  const t1ExamSum = subjectsArr.reduce((a, s) => { const hv = (s.half != null) ? Number(s.half || 0) : (Number(s?.Term1?.iv || 0) + Number(s?.Term1?.v || 0)); return a + hv }, 0)
  const t1ExamMaxSum = subjectsArr.reduce((a, s) => a + (s?.Term1 ? (Number(s.Term1?.ivMax || 0) + Number(s.Term1?.vMax || 0) || t1ExamH) : 0), 0)
  const t2PTSum = subjectsArr.reduce((a, s) => a + Number((s.pt2 ?? s?.Term2?.i) || 0), 0)
  const t2PTMaxSum = subjectsArr.reduce((a, s) => a + (s?.Term2 ? Number((s.Term2?.iMax ?? t2iH) || 0) : 0), 0)
  const t2NBSum = subjectsArr.reduce((a, s) => a + Number((s.nb2 ?? s?.Term2?.ii) || 0), 0)
  const t2NBMaxSum = subjectsArr.reduce((a, s) => a + (s?.Term2 ? Number((s.Term2?.iiMax ?? t2iiH) || 0) : 0), 0)
  const t2SESum = subjectsArr.reduce((a, s) => a + Number((s.se2 ?? s?.Term2?.iii) || 0), 0)
  const t2SEMaxSum = subjectsArr.reduce((a, s) => a + (s?.Term2 ? Number((s.Term2?.iiiMax ?? t2iiiH) || 0) : 0), 0)
  const t2ExamSum = subjectsArr.reduce((a, s) => { const an = (s.annual != null) ? Number(s.annual || 0) : (Number(s?.Term2?.iv || 0) + Number(s?.Term2?.v || 0)); return a + an }, 0)
  const t2ExamMaxSum = subjectsArr.reduce((a, s) => a + (s?.Term2 ? (Number(s.Term2?.ivMax || 0) + Number(s.Term2?.vMax || 0) || t2ExamH) : 0), 0)
  const pct = (o, m) => {
    const M = Number(m || 0)
    if (M <= 0) return ''
    const O = Number(o || 0)
    const p = Math.round((O / M) * 1000) / 10
    return `${p}%`
  }
  return (
    <div className="w-full bg-white p-4 border border-gray-300 shadow-lg max-w-5xl mx-auto text-[12px] leading-tight">

      {/* Header */}
      <div className="border-b border-gray-400 pb-2">
        <div className="grid grid-cols-3 items-center gap-3">
          <div className="flex justify-start">
            <div className="flex flex-col items-start">
              {(school.logoUrl || school.logo || school.logoURL) && (
                <img src={absUrl(school.logoUrl || school.logo || school.logoURL)} alt="school logo" className="h-16 w-16 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              )}
              {school.schoolCode ? (
                <div className="text- xs text-gray-700 mt-1">School Code: {school.schoolCode}</div>
              ) : null}
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-[20px] font-bold text-black">{safe(school.name)}</h1>
            <p className="text-gray-700">{safe(school.address)}</p>
            <div className="mt-1 text-gray-700">
              {school.phone ? (
                <span>{safe(school.phone)}</span>
              ) : null}

              {/* A simple space/separator */}
              {school.phone && school.email ? ' ' : null}

              {school.email ? (
                <span>{safe(school.email)}</span>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end items-center flex-col">
            {school.boardLogoUrl && (
              <>
                <img src={absUrl(school.boardLogoUrl)} alt="board logo" className="h-16 w-16 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                {school.affiliationNo ? (
                  <div className="text-xs text-gray-700 mt-1">Affiliation No: {safe(school.affiliationNo)}</div>
                ) : null}
              </>
            )}
          </div>
        </div>
        <div className="text-center mt-3">
          <div className="text-[18px] font-semibold uppercase bg-gray-800 text-white py-1">
            PROGRESS REPORT (Session : {safe(school.session)})
          </div>
          <h2 className="text-[15px] font-semibold py-2">Class : {safe(student.class)}{student.section ? ` - Section : ${safe(student.section)}` : ''}</h2>
        </div>
      </div>

      {/* Student Profile */}
      <div className="border border-gray-400 mt-2 bg-gray-50">
        <table className="w-full text-[11px]">
          <tbody>
            <tr>
              <td className="border px-2 py-1 w-1/5">SR. NO</td>
              <td className="border px-2 py-1 w-2/5">{safe(student.rollNumber || student.rollNo || student.scholarNumber)}</td>
              <td className="border px-2 py-1 w-1/5">Student Name</td>
              <td className="border px-2 py-1 w-2/5">{safe(student.name)}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">Father's Name</td>
              <td className="border px-2 py-1">{safe(student.fatherName)}</td>
              <td className="border px-2 py-1">Mother's Name</td>
              <td className="border px-2 py-1">{safe(student.motherName)}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">DOB</td>
              <td className="border px-2 py-1">{safe(fmtDate(student.dob))}</td>
              <td className="border px-2 py-1">Class/Section</td>
              <td className="border px-2 py-1">{safe(student.section ? `${student.class} / ${student.section}` : student.class)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Scholastic Area */}
      {/* <h2 className="font-bold text-[18px] mt-6">Part-1: </h2> */}

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-400 text-center mt-2 text-[11px] table-fixed leading-tight">
          <colgroup>
            <col style={{ width: '4%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead className="bg-gray-100 font-semibold">
            <tr>
              <th colSpan="2" className="border px-1 py-1 whitespace-normal break-words">Scholastic Area</th>
              <th colSpan="6" className="border px-1 py-1 whitespace-normal break-words">Term-1 ({t1MarksH} marks)</th>
              <th colSpan="6" className="border px-1 py-1 whitespace-normal break-words">Term-2 ({t2MarksH} marks)</th>
              <th rowSpan="2" className="border px-1 py-1 whitespace-normal break-words">Grand Total ({t1MarksH + t2MarksH})</th>
            </tr>
            <tr>
              <th className="border px-1 py-1 whitespace-normal break-words">S. No.</th>
              <th className="border px-1 py-1 text-left whitespace-normal break-words">Subject</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Per. Test ({t1iH})</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Notebook ({t1iiH})</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Sub. Enrichment ({t1iiiH})</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Half Yearly ({t1ExamH})</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Marks Obt. ({t1MarksH})</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Grade</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Per. Test ({t2iH})</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Notebook ({t2iiH})</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Sub. Enrichment ({t2iiiH})</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Annual ({t2ExamH})</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Marks Obt. ({t2MarksH})</th>
              <th className="border px-1 py-1 whitespace-normal break-words">Grade</th>
            </tr>
          </thead>

          <tbody>
            {(marks?.subjects || []).map((s, i) => {
              const t1PT = Number((s.pt1 ?? (s.Term1?.i)) || 0)
              const t1NB = Number((s.nb1 ?? (s.Term1?.ii)) || 0)
              const t1SE = Number((s.se1 ?? (s.Term1?.iii)) || 0)
              const t1iv = Number(s.Term1?.iv || 0)
              const t1v = Number(s.Term1?.v || 0)
              const t1Exam = (s.half != null) ? Number(s.half || 0) : (t1iv + t1v)
              const t1Total = s.Term1 ? (Number(s.Term1?.i || 0) + Number(s.Term1?.ii || 0) + Number(s.Term1?.iii || 0) + Number(s.Term1?.iv || 0) + Number(s.Term1?.v || 0)) : (t1PT + t1NB + t1SE + t1Exam)
              const t1Max = s?.Term1
                ? Number(((s.term1Max ?? s.Term1?.max ?? (
                  Number(s.Term1?.iMax || 0) + Number(s.Term1?.iiMax || 0) + Number(s.Term1?.iiiMax || 0) + Number(s.Term1?.ivMax || 0) + Number(s.Term1?.vMax || 0)
                ))) || t1MarksH)
                : Number(s.term1Max ?? t1MarksH)
              const t1Grade = termGrade(t1Total, t1Max)

              const t2PT = Number((s.pt2 ?? (s.Term2?.i)) || 0)
              const t2NB = Number((s.nb2 ?? (s.Term2?.ii)) || 0)
              const t2SE = Number((s.se2 ?? (s.Term2?.iii)) || 0)
              const t2iv = Number(s.Term2?.iv || 0)
              const t2v = Number(s.Term2?.v || 0)
              const t2Exam = (s.annual != null) ? Number(s.annual || 0) : (t2iv + t2v)
              const t2Total = s.Term2 ? (Number(s.Term2?.i || 0) + Number(s.Term2?.ii || 0) + Number(s.Term2?.iii || 0) + Number(s.Term2?.iv || 0) + Number(s.Term2?.v || 0)) : (t2PT + t2NB + t2SE + t2Exam)
              const t2Max = s?.Term2
                ? Number(((s.term2Max ?? s.Term2?.max ?? (
                  Number(s.Term2?.iMax || 0) + Number(s.Term2?.iiMax || 0) + Number(s.Term2?.iiiMax || 0) + Number(s.Term2?.ivMax || 0) + Number(s.Term2?.vMax || 0)
                ))) || t2MarksH)
                : Number(s.term2Max ?? t2MarksH)
              const t2Grade = termGrade(t2Total, t2Max)
              const grand = t1Total + t2Total
              return (
                <tr key={i}>
                  <td className="border px-1 py-1 whitespace-normal break-words">{i + 1}</td>
                  <td className="border px-1 py-1 text-left font-medium whitespace-normal break-words">{s.name}</td>
                  <td className="border px-1 py-1 whitespace-normal break-words">{dispPart(t1PT, s.Term1?.iMax, !!s.Term1)}</td>
                  <td className="border px-1 py-1 whitespace-normal break-words">{dispPart(t1NB, s.Term1?.iiMax, !!s.Term1)}</td>
                  <td className="border px-1 py-1 whitespace-normal break-words">{dispPart(t1SE, s.Term1?.iiiMax, !!s.Term1)}</td>
                  <td className="border px-1 py-1 whitespace-normal break-words">{dispPart(t1Exam, (Number(s.Term1?.ivMax || 0) + Number(s.Term1?.vMax || 0)), !!s.Term1)}</td>
                  <td className="border px-1 py-1 font-semibold whitespace-normal break-words">{t1Total || ''}</td>
                  <td className="border px-1 py-1 whitespace-normal break-words">{t1Grade}</td>
                  <td className="border px-1 py-1 whitespace-normal break-words">{dispPart(t2PT, s.Term2?.iMax, !!s.Term2)}</td>
                  <td className="border px-1 py-1 whitespace-normal break-words">{dispPart(t2NB, s.Term2?.iiMax, !!s.Term2)}</td>
                  <td className="border px-1 py-1 whitespace-normal break-words">{dispPart(t2SE, s.Term2?.iiiMax, !!s.Term2)}</td>
                  <td className="border px-1 py-1 whitespace-normal break-words">{dispPart(t2Exam, (Number(s.Term2?.iv || 0) + Number(s.Term2?.v || 0)), !!s.Term2)}</td>
                  <td className="border px-1 py-1 font-semibold whitespace-normal break-words">{t2Total || ''}</td>
                  <td className="border px-1 py-1 whitespace-normal break-words">{t2Grade}</td>
                  <td className="border px-1 py-1 font-bold whitespace-normal break-words">{grand || ''}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="border px-1 py-1 text-right whitespace-normal break-words" colSpan="2">Total</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{(marks?.subjects || []).reduce((a, s) => a + Number((s.pt1 ?? s?.Term1?.i) || 0), 0)}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{(marks?.subjects || []).reduce((a, s) => a + Number((s.nb1 ?? s?.Term1?.ii) || 0), 0) || ''}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{(marks?.subjects || []).reduce((a, s) => a + Number((s.se1 ?? s?.Term1?.iii) || 0), 0) || ''}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{(marks?.subjects || []).reduce((a, s) => { const hv = (s.half != null ? Number(s.half || 0) : (Number(s?.Term1?.iv || 0) + Number(s?.Term1?.v || 0))); return a + hv }, 0)}</td>
              <td className="border px-1 py-1 font-semibold whitespace-normal break-words">{t1SumObt || ''}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">-</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{(marks?.subjects || []).reduce((a, s) => a + Number((s.pt2 ?? s?.Term2?.i) || 0), 0)}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{(marks?.subjects || []).reduce((a, s) => a + Number((s.nb2 ?? s?.Term2?.ii) || 0), 0) || ''}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{(marks?.subjects || []).reduce((a, s) => a + Number((s.se2 ?? s?.Term2?.iii) || 0), 0) || ''}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{(marks?.subjects || []).reduce((a, s) => { const an = (s.annual != null ? Number(s.annual || 0) : (Number(s?.Term2?.iv || 0) + Number(s?.Term2?.v || 0))); return a + an }, 0)}</td>
              <td className="border px-1 py-1 font-semibold whitespace-normal break-words">{t2SumObt || ''}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">-</td>
              <td className="border px-1 py-1 font-bold whitespace-normal break-words">{grandSumObt || ''}</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="border px-1 py-1 text-right whitespace-normal break-words" colSpan="2">Percent</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{pct(t1PTSum, t1PTMaxSum)}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{pct(t1NBSum, t1NBMaxSum)}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{pct(t1SESum, t1SEMaxSum)}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{pct(t1ExamSum, t1ExamMaxSum)}</td>
              <td className="border px-1 py-1 font-semibold whitespace-normal break-words">{pct(t1SumObt, t1SumMax)}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">-</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{pct(t2PTSum, t2PTMaxSum)}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{pct(t2NBSum, t2NBMaxSum)}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{pct(t2SESum, t2SEMaxSum)}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">{pct(t2ExamSum, t2ExamMaxSum)}</td>
              <td className="border px-1 py-1 font-semibold whitespace-normal break-words">{pct(t2SumObt, t2SumMax)}</td>
              <td className="border px-1 py-1 whitespace-normal break-words">-</td>
              <td className="border px-1 py-1 font-bold whitespace-normal break-words">{pct(grandSumObt, grandSumMax)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Co-Scholastic Activities */}
      {/* <h2 className="font-bold text-[18px] mt-6">Part-2: Co-Scholastic Activities</h2>

      <table className="w-full border border-gray-400 text-center mt-2 text-[13px]">
        <thead className="bg-blue-100 font-semibold">
          <tr>
            <th className="border py-1">Activities</th>
            <th className="border py-1">TERM-1 Grade</th>
            <th className="border py-1">TERM-2 Grade</th>
          </tr>
        </thead>

        <tbody>
          {(marks?.activities || []).map((a, i) => (
            <tr key={i}>
              <td className="border py-1">{a.activity}</td>
              <td className="border py-1">{a.term1_grade || a.grade || ''}</td>
              <td className="border py-1">{a.term2_grade || ''}</td>
            </tr>
          ))}
        </tbody>
      </table> */}

      {/* Attendance */}
      <h2 className="font-bold text-[16px] mt-4">Attendance</h2>
      <table className="w-full border border-gray-400 text-left mt-2 text-[12px]">
        <tbody>
          <tr>
            <td className="border px-2 py-1 font-medium">Attendance Term 1</td>
            <td className="border px-2 py-1">{safe((() => {
              const s = String(marks.attendance_term1 || marks.attendance || '').trim()
              if (s.includes('/')) return s
              const pres = (marks.present_term1 ?? '').toString()
              const open = (marks.openDays_term1 ?? '').toString()
              return pres && open ? `${pres}/${open}` : s
            })())}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-medium">Attendance Term 2</td>
            <td className="border px-2 py-1">{safe((() => {
              const s = String(marks.attendance_term2 || '').trim()
              if (s.includes('/')) return s
              const pres = (marks.present_term2 ?? '').toString()
              const open = (marks.openDays_term2 ?? '').toString()
              return pres && open ? `${pres}/${open}` : s
            })())}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-medium">Total Attendance</td>
            <td className="border px-2 py-1">{safe((() => {
              const parse = (v) => { const [a, b] = String(v || '').split('/'); return [Number(a || 0), Number(b || 0)] }
              const [p1, o1] = parse(marks.attendance_term1 || `${marks.present_term1 || ''}/${marks.openDays_term1 || ''}`)
              const [p2, o2] = parse(marks.attendance_term2 || `${marks.present_term2 || ''}/${marks.openDays_term2 || ''}`)
              const P = (Number(p1 || 0) + Number(p2 || 0))
              const O = (Number(o1 || 0) + Number(o2 || 0))
              return O > 0 ? `${P}/${O}` : (P > 0 ? String(P) : '')
            })())}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-medium">Attendance %</td>
            <td className="border px-2 py-1">{safe((() => {
              const parse = (v) => { const [a, b] = String(v || '').split('/'); return [Number(a || 0), Number(b || 0)] }
              const [p1, o1] = parse(marks.attendance_term1 || `${marks.present_term1 || ''}/${marks.openDays_term1 || ''}`)
              const [p2, o2] = parse(marks.attendance_term2 || `${marks.present_term2 || ''}/${marks.openDays_term2 || ''}`)
              const P = (Number(p1 || 0) + Number(p2 || 0))
              const O = (Number(o1 || 0) + Number(o2 || 0))
              if (O <= 0) return ''
              const pr = Math.round((P / O) * 1000) / 10
              return `${pr}%`
            })())}</td>
          </tr>
        </tbody>
      </table>

      {/* Remarks */}
      <div className="mt-2">
        Final Result: {safe(marks.final_result || marks.status)}
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-4 text-center mt-4 text-xs">
        <div>
          <p className="border-t border-gray-500 pt-2">Name of Class Teacher</p>
        </div>
        <div>
          <p className="border-t border-gray-500 pt-2">Signature of Class Teacher</p>
        </div>
        <div>
          <p className="border-t border-gray-500 pt-2">Sign of Principal</p>
        </div>
        <div>
          <p className="border-t border-gray-500 pt-2">Signature of Checker</p>
        </div>
      </div>

      {/* Grading System */}
      <h2 className="font-bold text-[16px] mt-4">Grading System</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <table className="w-full border border-gray-400 text-center mt-2 text-[11px]">
          <thead className="bg-gray-200 font-semibold">
            <tr>
              <th className="border py-1">S.NO.</th>
              <th className="border py-1">Grade</th>
              <th className="border py-1">Marks Range</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border">1</td><td className="border">A1</td><td className="border">91–100</td></tr>
            <tr><td className="border">2</td><td className="border">A2</td><td className="border">81–90</td></tr>
            <tr><td className="border">3</td><td className="border">B1</td><td className="border">71–80</td></tr>
            <tr><td className="border">4</td><td className="border">B2</td><td className="border">61–70</td></tr>
            <tr><td className="border">5</td><td className="border">C1</td><td className="border">51–60</td></tr>
            <tr><td className="border">6</td><td className="border">C2</td><td className="border">41–50</td></tr>
            <tr><td className="border">7</td><td className="border">D</td><td className="border">33–40</td></tr>
            <tr><td className="border">8</td><td className="border">E</td><td className="border">32 & Below</td></tr>
          </tbody>
        </table>
        <table className="w-full border border-gray-400 text-center mt-2 text-[13px]">
          <thead className="bg-gray-200 font-semibold">
            <tr>
              <th className="border py-1">Grade</th>
              <th className="border py-1">Point</th>
              <th className="border py-1">Grade Achievements</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border font-bold">A</td><td className="border">3</td><td className="border">Outstanding</td></tr>
            <tr><td className="border font-bold">B</td><td className="border">2</td><td className="border">Very good</td></tr>
            <tr><td className="border font-bold">C</td><td className="border">1</td><td className="border">Fair</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

