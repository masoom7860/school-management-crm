import React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getSessions } from '../../api/sessionsApi'
import { getClasses, getSectionsByClass } from '../../api/classesApi'
import { getStudents, listMarksheets, getExams } from '../../api/marksheetsApi'
import http from '../../api/axiosInstance'
import { getSchoolImages } from '../../api/schoolImageApi'
import CBSEReportCard from '../ReportCards/CBSEReportCard'

function PrintMarksheet() {
  const location = useLocation()
  const navigate = useNavigate()
  const navState = (location && location.state) || {}
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [students, setStudents] = useState([])
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [loading, setLoading] = useState(false)
  const [finding, setFinding] = useState(false)
  const [marksheet, setMarksheet] = useState(null)
  const [marksheets, setMarksheets] = useState([])
  const [exam, setExam] = useState(null)
  const [template, setTemplate] = useState(() => {
    const key = `marksheet_template_${localStorage.getItem('schoolId') || ''}`
    return localStorage.getItem(key) || 'DEFAULT'
  })
  const [selectedIds, setSelectedIds] = useState([])
  const schoolId = localStorage.getItem('schoolId')
  const [school, setSchool] = useState(null)
  const [orgLogoUrl, setOrgLogoUrl] = useState('')
  const [boardLogoUrl, setBoardLogoUrl] = useState('')
  const [studentEntryMap, setStudentEntryMap] = useState(new Map())

  const terms = [
    { value: 'Term1', label: 'Term 1' },
    { value: 'Term2', label: 'Term 2' },
    { value: 'Term3', label: 'Term 3' }
  ]

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const [sessRes, clsRes] = await Promise.all([getSessions(), getClasses()])
        const sessionData = sessRes?.data || sessRes || []
        setSessions(Array.isArray(sessionData) ? sessionData : [])
        setClasses(Array.isArray(clsRes) ? clsRes : [])
      } catch (e) {
        setSessions([])
        setClasses([])
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Seed selections from router state (if navigated from Fill Marksheet)
  const seededRef = useRef(false)
  useEffect(() => {
    if (seededRef.current) return
    if (!navState) return
    const { sessionId, term, classId, sectionId } = navState
    let changed = false
    if (sessionId) { setSelectedSession(sessionId); changed = true }
    if (term) { setSelectedTerm(term); changed = true }
    if (classId) { setSelectedClass(classId); changed = true }
    if (sectionId) { setSelectedSection(sectionId); changed = true }
    if (changed) seededRef.current = true
  }, [navState])

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        if (schoolId) {
          // Prefer registerSchool service (returns { school })
          const res = await http.get(`/registerSchool/get/${schoolId}`)
          const payload = res?.data?.school || res?.data?.data || res?.data || null
          setSchool(payload)
        }
      } catch (e) {
        setSchool(null)
      }
    }
    fetchSchool()
  }, [schoolId])

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        if (!schoolId) { setOrgLogoUrl(''); return }
        const res = await getSchoolImages(schoolId)
        const images = res?.data || []
        const logo = Array.isArray(images) ? images.find(i => i.type === 'organizationLogo') : null
        const board = Array.isArray(images) ? images.find(i => i.type === 'boardLogo') : null
        setOrgLogoUrl(logo?.imageUrl || '')
        setBoardLogoUrl(board?.imageUrl || '')
      } catch (e) {
        setOrgLogoUrl('')
        setBoardLogoUrl('')
      }
    }
    fetchLogo()
  }, [schoolId])

  useEffect(() => {
    if (selectedClass) {
      ;(async () => {
        try {
          setLoading(true)
          const secs = await getSectionsByClass(selectedClass)
          setSections(Array.isArray(secs) ? secs : [])
        } catch (e) {
          setSections([])
        } finally {
          setLoading(false)
        }
      })()
    } else {
      setSections([])
      setSelectedSection('')
    }
  }, [selectedClass])

  // Auto-find once all filters are available
  const autoFindRef = useRef(false)
  useEffect(() => {
    if (!navState?.autoFind) return
    if (autoFindRef.current) return
    if (selectedSession && selectedTerm && selectedClass && selectedSection) {
      autoFindRef.current = true
      handleFind()
    }
  }, [navState, selectedSession, selectedTerm, selectedClass, selectedSection])

  useEffect(() => {
    const fetchStudentsForSelection = async () => {
      if (!selectedClass || !selectedSection) {
        setStudents([])
        return
      }
      try {
        const resp = await getStudents({ classId: selectedClass, sectionId: selectedSection, schoolId })
        const list = resp?.students || resp?.data || resp || []
        setStudents(Array.isArray(list) ? list : [])
      } catch (err) {
        setStudents([])
      }
    }
    fetchStudentsForSelection()
  }, [selectedClass, selectedSection, schoolId])

  const classDoc = useMemo(() => (Array.isArray(classes) ? classes.find(c => c._id === selectedClass) : null), [classes, selectedClass])
  const sessionDoc = useMemo(() => (Array.isArray(sessions) ? sessions.find(s => s._id === selectedSession) : null), [sessions, selectedSession])

  const handleFind = async () => {
    setFinding(true)
    setMarksheet(null)
    setExam(null)
    try {
      const className = classDoc?.className || ''
      const academicYear = sessionDoc?.yearRange || ''
      let examsRes = await getExams({ class: className, term: selectedTerm, sectionId: selectedSection, academicYear, examType: 'General' })
      const exams = examsRes?.data || examsRes || []
      const ex = Array.isArray(exams) ? exams.find(e => {
        const sec = e.sectionId?._id?.toString() || e.sectionId?.toString() || e.sectionId
        return e.term === selectedTerm && e.class === className && sec === selectedSection && (e.academicYear === academicYear)
      }) : null
      setExam(ex || null)
      const paramsWithExam = ex ? { classId: selectedClass, sectionId: selectedSection, session: selectedSession, examId: ex._id || ex.id } : { classId: selectedClass, sectionId: selectedSection, session: selectedSession }
      let listRes = await listMarksheets(paramsWithExam)
      const items = listRes?.data || listRes || []
      const arr = Array.isArray(items) ? items : items?.data || []
      setMarksheets(Array.isArray(arr) ? arr : [])
      const first = Array.isArray(arr) ? arr[0] : null
      setMarksheet(first || null)
    } catch (e) {
      setMarksheet(null)
    } finally {
      setFinding(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const subjects = useMemo(() => Array.isArray(marksheet?.subjects) ? marksheet.subjects : [], [marksheet])
  const msMap = useMemo(() => {
    const m = new Map()
    ;(Array.isArray(marksheets) ? marksheets : []).forEach(ms => {
      const id = ms?.studentId?._id?.toString() || ms?.studentId?.toString()
      if (id) m.set(id, ms)
    })
    return m
  }, [marksheets])
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
  const selectedMarksheets = useMemo(() => (Array.isArray(students) ? students : []).map(s => s._id).filter(id => selectedIds.includes(id)).map(id => msMap.get(id)).filter(Boolean), [students, selectedIds, msMap])
  // Fetch per-student, per-subject part-wise marks (i..v) as entered in Fill Marksheet
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        if (!classDoc?.className || !selectedSection) return
        const secName = (sections.find(s => (s._id || s.id) === selectedSection)?.sectionName || sections.find(s => (s._id || s.id) === selectedSection)?.name || '')
        const pending = []
        const toFetch = []
        const current = new Map(studentEntryMap)
        ;(Array.isArray(selectedMarksheets) ? selectedMarksheets : []).forEach(ms => {
          const sid = ms?.studentId?._id?.toString() || ms?.studentId?.toString()
          if (sid && !current.has(sid)) toFetch.push(sid)
        })
        if (marksheet) {
          const sid0 = marksheet?.studentId?._id?.toString() || marksheet?.studentId?.toString()
          if (sid0 && !current.has(sid0)) toFetch.push(sid0)
        }
        toFetch.forEach((sid) => {
          pending.push(http.get('/api/studentmarks/entrydata', { params: { studentId: sid, className: classDoc.className, section: secName } }).then(res => ({ sid, data: res?.data || null })).catch(() => ({ sid, data: null })))
        })
        if (pending.length === 0) return
        const results = await Promise.all(pending)
        results.forEach(({ sid, data }) => { if (sid) current.set(sid, data) })
        setStudentEntryMap(current)
      } catch (_) { /* ignore */ }
    }
    fetchEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMarksheets, marksheet, classDoc, selectedSection, sections])
  const onToggleAll = (checked) => {
    if (checked) {
      const ids = (Array.isArray(filteredStudents) ? filteredStudents : []).map(s => s._id)
      setSelectedIds(ids)
    } else {
      setSelectedIds([])
    }
  }
  const onToggleOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const [query, setQuery] = useState('')
  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return (Array.isArray(students) ? students : []).filter(s => {
      const name = (s.name || `${s.firstName || ''} ${s.lastName || ''}`).toLowerCase()
      const roll = String(s.rollNumber || s.rollNo || '')
      const scholar = String(s.scholarNumber || '')
      return name.includes(q) || roll.includes(q) || scholar.includes(q)
    })
  }, [students, query])
  const printOne = (sid) => {
    setSelectedIds([sid])
    setTimeout(() => window.print(), 50)
  }


  // Auto-print for a specific student if provided
  const autoPrintRef = useRef(false)
  useEffect(() => {
    if (!navState?.autoFind || !navState?.studentId) return
    if (autoPrintRef.current) return
    if (!finding && msMap.size > 0) {
      const sid = String(navState.studentId)
      if (msMap.has(sid)) {
        autoPrintRef.current = true
        printOne(sid)
      }
    }
  }, [navState, finding, msMap])

  const romanClassToInt = (v) => {
    const map = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10, XI:11, XII:12 }
    return map[v] || null
  }
  const getClassLevel = (name) => {
    const str = String(name || '').trim().toUpperCase()
    const digits = str.match(/\d+/)
    if (digits) return parseInt(digits[0], 10)
    const tokens = str.replace(/CLASS|STD|STANDARD|GRADE|TH|ST|ND|RD|\./g, '').trim()
    const level = romanClassToInt(tokens)
    return level || null
  }
  const SCHOOL_TEMPLATE_MAP = React.useMemo(() => ({
    default: { junior: 'CBSE_JUNIOR', senior: 'CBSE_SENIOR' }
  }), [])
  const effectiveTemplate = React.useMemo(() => {
    if (template === 'CBSE') return 'CBSE_SIMPLE'
    const level = getClassLevel(classDoc?.className)
    const conf = (SCHOOL_TEMPLATE_MAP[schoolId] || SCHOOL_TEMPLATE_MAP.default)
    if (level && level >= 11) return conf.senior
    return conf.junior
  }, [classDoc, SCHOOL_TEMPLATE_MAP, schoolId, template])

  const pdfContainerRef = useRef(null)
  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.body.appendChild(s)
  })
  const ensureHtml2Pdf = async () => {
    if (window.html2pdf) return window.html2pdf
    try {
      const mod = await import('html2pdf.js')
      return mod.default || mod
    } catch (e) {
      await loadScript('https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js')
      return window.html2pdf
    }
  }
  const normalizePdfStyles = (root) => {
    if (!root) return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const toRgb = (val, fallback = '#000') => {
      if (!val) return val
      const s = String(val)
      if (!/(color\(|oklch\(|oklab\()/i.test(s)) return s
      try {
        ctx.fillStyle = s
        const out = ctx.fillStyle
        return out && typeof out === 'string' ? out : fallback
      } catch (_) {
        return fallback
      }
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
    while (walker.nextNode()) {
      const el = walker.currentNode
      const cs = window.getComputedStyle(el)
      // Normalize simple colors
      const colorProps = [
        'color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','outlineColor'
      ]
      colorProps.forEach(p => {
        const v = cs[p]
        if (v && /(color\(|oklch\(|oklab\()/i.test(v)) {
          el.style[p] = toRgb(v, p.includes('background') ? '#ffffff' : '#000000')
        }
      })
      // Drop complex backgrounds with gradients/color() to avoid parser crash
      const bgImg = cs.backgroundImage
      if (bgImg && /(gradient\(|color\(|oklch\(|oklab\()/i.test(bgImg)) {
        el.style.backgroundImage = 'none'
      }
      // Also enforce a solid background for the sheet root blocks
      if (el.classList && el.classList.contains('cbse-sheet')) {
        el.style.backgroundColor = '#ffffff'
      }
    }
  }
  const handleDownloadSelected = async () => {
    if (!selectedMarksheets.length) return
    const html2pdf = await ensureHtml2Pdf()
    const node = pdfContainerRef.current
    if (!node) return
    const prevLeft = node.style.left
    const prevTop = node.style.top
    const prevPos = node.style.position
    const prevOpacity = node.style.opacity
    const prevVisibility = node.style.visibility
    node.style.position = 'fixed'
    node.style.left = '0px'
    node.style.top = '0px'
    node.style.opacity = '0.01'
    node.style.visibility = 'visible'
    // Normalize unsupported CSS color() / oklch() usages for html2canvas
    normalizePdfStyles(node)
    const options = {
      margin: [5, 5, 5, 5],
      filename: `${(classDoc?.className || 'Class').replace(/\s+/g,'_')}_${selectedTerm || 'Term'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3.125, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    }
    await html2pdf().set(options).from(node).save()
    node.style.left = prevLeft
    node.style.top = prevTop
    node.style.position = prevPos
    node.style.opacity = prevOpacity
    node.style.visibility = prevVisibility
  }

  // Build payload for view route
  const buildViewPayload = (msArray) => {
    return {
      marksheets: Array.isArray(msArray) ? msArray : [],
      students,
      sections,
      selectedSection,
      classDoc,
      sessionDoc,
      school,
      orgLogoUrl,
      boardLogoUrl,
      selectedTerm,
      effectiveTemplate,
      studentEntryMapEntries: Array.from(studentEntryMap.entries())
    }
  }
  const handleViewSelected = () => {
    if (!selectedMarksheets.length) return
    const payload = buildViewPayload(selectedMarksheets)
    navigate('/view/marksheet', { state: payload })
  }
  const viewOne = (sid) => {
    const ms = msMap.get(sid)
    if (!ms) return
    const payload = buildViewPayload([ms])
    navigate('/view/marksheet', { state: payload })
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
      // Fallback to aggregated obtained from marksheet when entrydata missing
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
        // Grand totals may be used by the card anyway
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
              <div className="border p-3">Final Result: <span className="font-semibold">{ms?.status || ''}</span></div>
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="avoid-break">
              <div className="border p-3 mb-2">Class Teacher's Remarks:</div>
              <div className="border p-3">Final Result: <span className="font-semibold">{ms?.status || ''}</span></div>
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen w-full">
      <div className="w-full container mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 print:hidden">Print Marksheet</h1>
        <style>{`
          .cbse-sheet { width: 210mm; min-height: 297mm; margin: 12px auto; background: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,.08); border: 1px solid #e5e7eb; box-sizing: border-box; }
          /* Ensure the hidden PDF capture renders to exact content area (A4 minus 5mm margins) */
          .pdf-capture .cbse-sheet { width: 200mm; min-height: 287mm; box-sizing: border-box; }
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
            body * { visibility: hidden !important; }
            #print-root, #print-root * { visibility: visible !important; }
            #print-root { position: absolute; left: 0; top: 0; width: 100%; }
            .cbse-sheet { width: 200mm; height: 287mm; margin: 0 auto; box-shadow: none; border: none; overflow: visible !important; break-inside: avoid; page-break-inside: avoid; transform: none !important; transform-origin: top left; box-sizing: border-box; }
            .cbse-sheet * { break-inside: avoid; page-break-inside: avoid; }
            .print\:hidden { display: none !important; }
            .print\:block { display: block !important; }
            .overflow-hidden { overflow: visible !important; }
            .overflow-x-auto { overflow: visible !important; }
            .cbse-table { width: 100% !important; }
            .cbse-table th, .cbse-table td { white-space: normal !important; word-break: break-word; }
          }
        `}</style>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Session<span className="text-red-500">*</span></label>
              <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={loading}>
                <option value="">Select Session</option>
                {sessions.map(s => (
                  <option key={s._id} value={s._id}>{s.yearRange}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Term<span className="text-red-500">*</span></label>
              <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={loading}>
                <option value="">Select Term</option>
                {terms.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Class<span className="text-red-500">*</span></label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={loading}>
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.className}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Section<span className="text-red-500">*</span></label>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={loading || !selectedClass}>
                <option value="">Select Section</option>
                {sections.map(sec => (
                  <option key={sec._id} value={sec._id}>{sec.sectionName || sec.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Template</label>
              <select value={template} onChange={(e)=>{ setTemplate(e.target.value); localStorage.setItem(`marksheet_template_${schoolId || ''}`, e.target.value) }} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="DEFAULT">Default</option>
                <option value="CBSE">CBSE</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={handleFind} disabled={finding || !selectedSession || !selectedTerm || !selectedClass || !selectedSection} className={`px-6 py-2 rounded-lg font-semibold text-white ${finding ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>Load Marksheets</button>
          </div>
          {selectedClass && selectedSection && students.length === 0 && (
            <p className="mt-3 text-sm text-gray-500">No students found for the selected class and section.</p>
          )}
        </div>
        {students.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-6 print:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-gray-800">Students</div>
              <div className="flex items-center gap-3">
                <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search name/roll/scholar" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.includes(s._id))} onChange={(e) => onToggleAll(e.target.checked)} />
                  Select All
                </label>
                <button disabled={selectedIds.length === 0} onClick={handlePrint} className={`px-4 py-2 rounded-lg font-semibold text-white ${selectedIds.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>Print Selected</button>
                <button disabled={selectedIds.length === 0} onClick={handleViewSelected} className={`px-4 py-2 rounded-lg font-semibold text-white ${selectedIds.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>View Selected</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-3 py-2 border">Select</th>
                    <th className="px-3 py-2 border">Photo</th>
                    <th className="px-3 py-2 border text-left">Name</th>
                    <th className="px-3 py-2 border">Class</th>
                    <th className="px-3 py-2 border">Section</th>
                    <th className="px-3 py-2 border">Roll No</th>
                    <th className="px-3 py-2 border">Status</th>
                    <th className="px-3 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st) => {
                    const sid = st._id
                    const ms = msMap.get(sid)
                    return (
                      <tr key={sid} className="even:bg-gray-50">
                        <td className="px-3 py-2 border text-center">
                          <input type="checkbox" className="h-4 w-4" checked={selectedIds.includes(sid)} onChange={() => onToggleOne(sid)} />
                        </td>
                        <td className="px-3 py-2 border text-center">
                          {st.profilePhoto ? (
                            <img src={absUrl(st.profilePhoto)} alt="" className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded" />
                          )}
                        </td>
                        <td className="px-3 py-2 border font-semibold">{st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim()}</td>
                        <td className="px-3 py-2 border text-center">{classDoc?.className || ''}</td>
                        <td className="px-3 py-2 border text-center">{(sections.find(s => (s._id || s.id) === selectedSection)?.sectionName || sections.find(s => (s._id || s.id) === selectedSection)?.name || '')}</td>
                        <td className="px-3 py-2 border text-center">{st.rollNumber || st.rollNo || '-'}</td>
                        <td className="px-3 py-2 border text-center">{ms ? 'Ready' : 'No Marksheet'}</td>
                        <td className="px-3 py-2 border text-center flex items-center justify-center gap-2">
                          <button onClick={()=>printOne(sid)} className="px-3 py-1 rounded bg-blue-600 text-white text-xs">Print</button>
                          <button onClick={()=>viewOne(sid)} className="px-3 py-1 rounded bg-indigo-600 text-white text-xs">View</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div id="print-root" className="hidden print:block">
          {(() => {
            const list = selectedMarksheets.length ? selectedMarksheets : (marksheet ? [marksheet] : [])
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
        <div ref={pdfContainerRef} className="print:hidden pdf-capture" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          {selectedMarksheets.map((ms, idx) => (
            <div key={`pdf-${ms._id || idx}`} style={{ pageBreakAfter: 'always', width: '210mm', minHeight: '297mm' }}>
              {effectiveTemplate === 'CBSE_SIMPLE' ? renderCBSECard(ms) : (effectiveTemplate === 'CBSE_SENIOR' ? renderCBSESr(ms) : renderCBSEJunior(ms))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PrintMarksheet