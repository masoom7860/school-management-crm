import { useEffect, useMemo, useState } from 'react';
import { getSchoolImages } from '../../../api/schoolImageApi';
import axiosInstance from '../../../api/axiosInstance';
import { getIdCardTemplate } from '../../../api/idCardTemplateApi';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import StudentIdCardTemplateRenderer from './templates/StudentIdCardTemplateRenderer';
import StudentIdCardLandscapeRenderer from './templates/StudentIdCardLandscapeRenderer';
import EmployeeIdCardTemplateRenderer from './templates/EmployeeIdCardTemplateRenderer';
import EmployeeIdCardLandscapeRenderer from './templates/EmployeeIdCardLandscapeRenderer';
import TeacherIdCardTemplateRenderer from './templates/TeacherIdCardTemplateRenderer';
import TeacherIdCardLandscapeRenderer from './templates/TeacherIdCardLandscapeRenderer';
import DEFAULT_STUDENT_ID_TEMPLATE from './templates/defaultStudentIdCardTemplate';
import DEFAULT_STUDENT_ID_LANDSCAPE_TEMPLATE from './templates/defaultStudentIdCardLandscapeTemplate';
import DEFAULT_STAFF_ID_TEMPLATE from './templates/defaultStaffIdCardTemplate';
import DEFAULT_STAFF_ID_LANDSCAPE_TEMPLATE from './templates/defaultStaffIdCardLandscapeTemplate';
import DEFAULT_TEACHER_ID_TEMPLATE from './templates/defaultTeacherIdCardTemplate';
import DEFAULT_TEACHER_ID_LANDSCAPE_TEMPLATE from './templates/defaultTeacherIdCardLandscapeTemplate';

const normalizeAssetPath = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value
    .replace(/\\+/g, '/')
    .replace(/^\.\//, '')
    .replace(/^public\//i, '')
    .replace(/\/+/g, '/');
};

const getStoredSchoolLogoPath = () => {
  if (typeof window === 'undefined') return '';
  const stored = window.localStorage?.getItem('schoolLogo');
  if (!stored) return '';
  if (/^https?:\/\//i.test(stored)) return stored;
  const normalized = normalizeAssetPath(stored);
  if (!normalized) return '';
  if (normalized.startsWith('/')) return normalized;
  if (normalized.startsWith('uploads/')) return normalized;
  return `uploads/schools/${normalized}`;
};

const nameFallback = (item) => {
  if (!item) return '';
  if (item.name) return item.name;
  const first = item.firstName || '';
  const last = item.lastName || '';
  return `${first} ${last}`.trim();
};

const formatDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const mergeStudentTemplate = (incoming, baseTemplate = DEFAULT_STUDENT_ID_TEMPLATE) => {
  const base = baseTemplate;
  if (!incoming) return base;
  const safe = (obj) => (obj && typeof obj === 'object' ? obj : {});
  const baseLeftInfo = Array.isArray(base.leftInfoFields) ? base.leftInfoFields : [];
  const incomingLeftInfo = Array.isArray(incoming?.leftInfoFields) ? incoming.leftInfoFields : [];
  return {
    ...base,
    ...incoming,
    card: { ...base.card, ...safe(incoming.card) },
    palette: { ...base.palette, ...safe(incoming.palette) },
    header: {
      ...base.header,
      ...safe(incoming.header),
      logo: { ...safe(base.header?.logo), ...safe(incoming.header?.logo) },
      text: { ...safe(base.header?.text), ...safe(incoming.header?.text) },
      accentCurve: { ...safe(base.header?.accentCurve), ...safe(incoming.header?.accentCurve) },
    },
    photo: { ...base.photo, ...safe(incoming.photo) },
    nameSection: { ...base.nameSection, ...safe(incoming.nameSection) },
    footer: { ...base.footer, ...safe(incoming.footer) },
    layout: { ...safe(base.layout), ...safe(incoming.layout) },
    options: { ...base.options, ...safe(incoming.options) },
    infoFields: Array.isArray(incoming.infoFields) && incoming.infoFields.length ? incoming.infoFields : base.infoFields,
    leftInfoFields: incomingLeftInfo.length ? incomingLeftInfo : baseLeftInfo,
  };
};

const mergeTemplate = (incoming, baseTemplate) => {
  const base = baseTemplate || {};
  const safe = (obj) => (obj && typeof obj === 'object' ? obj : {});
  return {
    ...base,
    ...safe(incoming),
    card: { ...safe(base.card), ...safe(incoming?.card) },
    palette: { ...safe(base.palette), ...safe(incoming?.palette) },
    header: {
      ...safe(base.header),
      ...safe(incoming?.header),
      logo: { ...safe(base.header?.logo), ...safe(incoming?.header?.logo) },
      text: { ...safe(base.header?.text), ...safe(incoming?.header?.text) },
      curve: { ...safe(base.header?.curve), ...safe(incoming?.header?.curve) },
      swoosh: { ...safe(base.header?.swoosh), ...safe(incoming?.header?.swoosh) },
    },
    photo: { ...safe(base.photo), ...safe(incoming?.photo) },
    nameSection: { ...safe(base.nameSection), ...safe(incoming?.nameSection) },
    infoSection: { ...safe(base.infoSection), ...safe(incoming?.infoSection) },
    footer: { ...safe(base.footer), ...safe(incoming?.footer) },
    options: { ...safe(base.options), ...safe(incoming?.options) },
    infoFields: Array.isArray(incoming?.infoFields) && incoming.infoFields.length ? incoming.infoFields : base.infoFields,
  };
};

const buildStudentCardData = (student, sessionLabel = '') => {
  if (!student) return {};
  const className = student.classId?.className || student.className || '';
  const sectionName = student.sectionId?.name || student.section || student.sectionName || '';
  const father = (student.parentId?.father?.name || student.fatherName || student.father || '').toString().toUpperCase();
  const mother = (student.parentId?.mother?.name || student.motherName || student.mother || '').toString().toUpperCase();
  const address = (student.residentialAddress || student.permanentAddress || student.address || '').toString().toUpperCase();
  const mobile = student.parentPhone || student.phone || student.mobile || student.parent?.phone || '';
  const code = student.scholarNumber || student.applicationNumber || student.admissionNo || student.admissionNumber || student.enrollmentNumber || student.rollNumber || '';
  const dobStr = formatDate(student.dob);
  return {
    fullName: nameFallback(student) || 'STUDENT NAME',
    fatherName: father,
    motherName: mother,
    classSection: sectionName ? `${className} - ${sectionName}` : className,
    scholarNumber: code,
    address,
    mobile,
    contactNumber: mobile,
    validTill: sessionLabel,
    bloodGroup: (student.bloodGroup || student.blood || student.bloodG || '').toString().toUpperCase(),
    dateOfBirth: dobStr,
    rollNumber: student.rollNumber || student.roll || '',
    photoUrl: resolveAssetUrl(student.profilePhoto || student.photoUrl || student.photo),
  };
};

// Baseline display dimensions used for scaling
const TYPE_DIMENSIONS = {
  staffCard: { width: 336, height: 212 },
  studentCard: { width: 336, height: 212 },
  teacherCard: { width: 336, height: 212 },
};
const DEFAULT_CARD_DIMS = { width: 336, height: 212 };
const BASELINE_WIDTH = 336; // reference width for scaling text/spacing

const Card = ({ item, type, bgUrl, logoUrl, moharUrl, schoolInfo, sessionLabel, dims, cardClassName = '', template, landscapeTemplate, backgroundColor, iCardType }) => {
  const effectiveDims = dims || (type === 'staff' ? TYPE_DIMENSIONS.staffCard : type === 'teacher' ? TYPE_DIMENSIONS.teacherCard : TYPE_DIMENSIONS.studentCard);
  const scale = (effectiveDims.width || BASELINE_WIDTH) / BASELINE_WIDTH;
  const sv = (n) => Math.round(n * scale);
  const code = item.scholarNumber || item.applicationNumber || item.admissionNo || item.admissionNumber || item.enrollmentNumber || item.rollNumber || '';

  const resolveEmployeePhotoPath = () => {
    const candidates = [item.photoUrl, item.photo, item.profilePhoto];
    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== 'string') continue;
      if (/^https?:\/\//i.test(candidate)) return candidate;
      if (candidate.startsWith('/uploads/')) return candidate.slice(1);
      if (candidate.startsWith('uploads/')) return candidate;
    }
    if (item.photo && typeof item.photo === 'string') {
      const folder = type === 'teacher' ? 'teachers' : 'staff';
      return `uploads/${folder}/${item.photo}`;
    }
    return '';
  };

  if (type === 'staff' || type === 'teacher') {
    const entity = {
      ...item,
      fullName: nameFallback(item) || (type === 'staff' ? 'STAFF NAME' : 'TEACHER NAME'),
      designation: (item.designation || item.designationName || (type === 'staff' ? 'Staff' : 'Teacher')).toString().toUpperCase(),
      department: (item.department || item.departmentName || '').toString().toUpperCase(),
      employeeId: item.employeeId || item.employeeCode || item.empId || item.staffId || item.staffCode || item.teacherId || item.teacherCode || code,
      mobile: item.phone || item.mobile || item.contactNumber || '',
      email: item.email || item.workEmail || item.personalEmail || '',
      bloodGroup: (item.bloodGroup || item.blood || item.bloodG || item.bloodType || '').toString().toUpperCase(),
      contactNumber: item.phone || item.mobile || item.contactNumber || schoolInfo?.phone || '',
      photoUrl: resolveAssetUrl(resolveEmployeePhotoPath()),
    };

    const assets = {
      logoUrl,
      moharUrl,
      backgroundUrl: bgUrl,
      signatureUrl: schoolInfo?.principalSignature || schoolInfo?.signaturePrincipal || ''
        ? resolveAssetUrl(schoolInfo.principalSignature || schoolInfo.signaturePrincipal)
        : '',
    };

    if (iCardType === 'I-Card 2') {
      const Renderer = type === 'teacher' ? TeacherIdCardLandscapeRenderer : EmployeeIdCardLandscapeRenderer;
      return (
        <Renderer
          key={entity.employeeId || entity.fullName}
          template={landscapeTemplate}
          entity={entity}
          school={schoolInfo}
          assets={assets}
          backgroundColor={backgroundColor}
        />
      );
    }

    const PortraitRenderer = type === 'teacher' ? TeacherIdCardTemplateRenderer : EmployeeIdCardTemplateRenderer;
    return (
      <PortraitRenderer
        key={entity.employeeId || entity.fullName}
        template={template}
        entity={entity}
        school={schoolInfo}
        assets={assets}
        backgroundColor={backgroundColor}
      />
    );
  }

  // student
  const className = item.classId?.className || item.className || '';
  const sectionName = item.sectionId?.name || item.section || item.sectionName || '';
  const father = (item.parentId?.father?.name || item.fatherName || item.father || item.parent?.fatherName || '').toString().toUpperCase();
  const mother = (item.motherName || item.mother || item.parent?.motherName || '').toString().toUpperCase();
  const addressLine = (item.residentialAddress || item.permanentAddress || item.address || '').toString().toUpperCase();
  const mobile = item.parentPhone || item.phone || item.mobile || item.parent?.phone || '';
  const dobStr = formatDate(item.dob);
  return (
    <div
      className={`border rounded-lg shadow-sm overflow-hidden flex flex-col items-center justify-center relative ${bgUrl ? '' : 'bg-white'} ${cardClassName}`}
      style={{
        width: `${effectiveDims.width}px`,
        height: `${effectiveDims.height}px`,
        padding: `${sv(16)}px ${sv(12)}px`,
        boxSizing: 'border-box',
      }}
    >
      {bgUrl && (
        <img
          src={resolveAssetUrl(bgUrl)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ zIndex: 0 }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
      {/* Avatar in centered oval shape */}
      <div className="flex flex-col items-center relative z-10 w-full mb-2">
        <div
          className="relative flex items-center justify-center shadow-sm overflow-hidden"
          style={{
            width: `${sv(150)}px`,
            height: `${sv(185)}px`,
            // boxShadow: '0 0 0 2px rgba(0,0,0,0.1)',
            // backgroundColor: 'black',
            marginTop: `${sv(90)}px`,
            marginRight: `${sv(12)}px`,
            borderRadius: `${sv(75)}px / ${sv(93)}px`,
          }}
        >
          <img
            src={resolveAssetUrl(item.profilePhoto)}
            alt={nameFallback(item)}
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: 'cover',
              clipPath: `ellipse(${sv(81)}px ${sv(87.5)}px at 50% 50%)`,
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.style.backgroundColor = '#f3f4f6';
            }}
          />
        </div>

        {/* Name pill */}
        <div
          className="text-black font-bold uppercase text-center overflow-hidden text-ellipsis whitespace-nowrap rounded-md mt-2 max-w-[90%]"
          style={{
            fontSize: `${sv(22)}px`,
            padding: `${sv(3)}px ${sv(10)}px`,
            borderRadius: `${sv(6)}px`,
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          {nameFallback(item)}
        </div>
      </div>

      {/* Details section */}
      <div
        className="relative z-10 text-center w-full"
        style={{
          fontSize: `${sv(16)}px`,
          lineHeight: 1.3,
        }}
      >
        {father && (
          <div className="mb-1">
            <span className="font-semibold">Father's Name</span>
            <span className="mx-1">:</span>
            <span className="font-medium">{father}</span>
          </div>
        )}
        <div className="mb-1">
          <span className="font-semibold">Class</span>
          <span className="mx-1">:</span>
          <span className="font-medium">{className}{sectionName ? `-${sectionName}` : ''}</span>
        </div>
        {code && (
          <div className="mb-1">
            <span className="font-semibold">Sr.No.</span>
            <span className="mx-1">:</span>
            <span className="font-medium">{code}</span>
          </div>
        )}
        {addressLine && (
          <div className="mb-1">
            <span className="font-semibold">Address</span>
            <span className="mx-1">:</span>
            <span className="font-medium">{addressLine}</span>
          </div>
        )}
        {mobile && (
          <div className="mb-1">
            <span className="font-semibold">Mobile</span>
            <span className="mx-1">:</span>
            <span className="font-medium">{mobile}</span>
          </div>
        )}
        {sessionLabel && (
          <div className="mb-1">
            <span className="font-semibold">Valid</span>
            <span className="mx-1">:</span>
            <span className="font-medium">{sessionLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PrintPreview = ({ title, items = [], type = 'student', sessionLabel = '', iCardType = '', onClose, displayMode = 'modal', hideHeaderLogo = false }) => {
  const [logoUrl, setLogoUrl] = useState('');
  const [cardBgUrl, setCardBgUrl] = useState('');
  const [moharUrl, setMoharUrl] = useState('');
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [cardDims, setCardDims] = useState(type === 'staff' || type === 'teacher' ? TYPE_DIMENSIONS.staffCard : TYPE_DIMENSIONS.studentCard);
  const [studentTemplate, setStudentTemplate] = useState(DEFAULT_STUDENT_ID_TEMPLATE);
  const [studentBgColor, setStudentBgColor] = useState(DEFAULT_STUDENT_ID_TEMPLATE.card.backgroundColor);
  const [studentLandscapeTemplate, setStudentLandscapeTemplate] = useState(DEFAULT_STUDENT_ID_LANDSCAPE_TEMPLATE);
  const [studentLandscapeBgColor, setStudentLandscapeBgColor] = useState(DEFAULT_STUDENT_ID_LANDSCAPE_TEMPLATE.card.backgroundColor);
  const [staffTemplate, setStaffTemplate] = useState(DEFAULT_STAFF_ID_TEMPLATE);
  const [staffBgColor, setStaffBgColor] = useState(DEFAULT_STAFF_ID_TEMPLATE.card.backgroundColor);
  const [staffLandscapeTemplate, setStaffLandscapeTemplate] = useState(DEFAULT_STAFF_ID_LANDSCAPE_TEMPLATE);
  const [staffLandscapeBgColor, setStaffLandscapeBgColor] = useState(DEFAULT_STAFF_ID_LANDSCAPE_TEMPLATE.card.backgroundColor);
  const [teacherTemplate, setTeacherTemplate] = useState(DEFAULT_TEACHER_ID_TEMPLATE);
  const [teacherBgColor, setTeacherBgColor] = useState(DEFAULT_TEACHER_ID_TEMPLATE.card.backgroundColor);
  const [teacherLandscapeTemplate, setTeacherLandscapeTemplate] = useState(DEFAULT_TEACHER_ID_LANDSCAPE_TEMPLATE);
  const [teacherLandscapeBgColor, setTeacherLandscapeBgColor] = useState(DEFAULT_TEACHER_ID_LANDSCAPE_TEMPLATE.card.backgroundColor);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const schoolId = localStorage.getItem('schoolId');
        if (!schoolId) return;
        const templateKey = type === 'student' ? 'student' : type === 'staff' ? 'staff' : type === 'teacher' ? 'teacher' : null;
        const landscapeTemplateKey = type === 'student' ? 'student_landscape' : type === 'staff' ? 'staff_landscape' : type === 'teacher' ? 'teacher_landscape' : null;
        const portraitTemplatePromise = templateKey ? getIdCardTemplate(templateKey) : Promise.resolve(null);
        const landscapeTemplatePromise = landscapeTemplateKey ? getIdCardTemplate(landscapeTemplateKey) : Promise.resolve(null);
        const [imagesRes, schoolRes, portraitTemplateRes, landscapeTemplateRes] = await Promise.all([
          getSchoolImages(schoolId).catch(() => null),
          axiosInstance.get(`/registerSchool/get/${schoolId}`).catch(() => null),
          portraitTemplatePromise,
          landscapeTemplatePromise,
        ]);
        const images = imagesRes?.data || [];
        const logo = images.find((i) => i.type === 'organizationLogo');
        const bgType = type === 'staff' || type === 'teacher' ? 'staffCard' : 'studentCard';
        const bg = images.find((i) => i.type === bgType);
        const bgSrc = bg ? resolveAssetUrl(normalizeAssetPath(bg.imageUrl)) : '';
        setCardBgUrl(bgSrc);

        // Debug logging for teacher cards
        if (type === 'teacher') {
          console.log('Teacher card - looking for staff template:', bgType);
          console.log('Available image types:', images.map(img => img.type));
          console.log('Found staff template:', !!bg);
        }
        // Dynamically compute card display size based on background image ratio
        if (bgSrc) {
          const img = new Image();
          img.onload = () => {
            const nw = img.naturalWidth || BASELINE_WIDTH;
            const nh = img.naturalHeight || TYPE_DIMENSIONS[bgType].height;
            const scale = nw > BASELINE_WIDTH ? (BASELINE_WIDTH / nw) : 1;
            setCardDims({ width: Math.round(nw * scale), height: Math.round(nh * scale) });
          };
          img.onerror = () => {
            console.error('Failed to load background image:', bgSrc);
            setCardDims(TYPE_DIMENSIONS[bgType] || DEFAULT_CARD_DIMS);
          };
          img.src = bgSrc;
        } else {
          setCardDims(TYPE_DIMENSIONS[bgType] || DEFAULT_CARD_DIMS);
        }
        const mohar = images.find((i) => i.type === 'mohar');
        setMoharUrl(mohar ? resolveAssetUrl(normalizeAssetPath(mohar.imageUrl)) : '');
        if (process.env.NODE_ENV === 'development') {
          console.debug('PrintPreview::loadImages school response', schoolRes?.data);
        }
        const schoolPayload = schoolRes?.data?.school || schoolRes?.data?.data || schoolRes?.data || null;
        setSchoolInfo(schoolPayload);

        // Determine logo source priority: school profile logo (register), organizationLogo upload, then stored fallback
        let resolvedLogoUrl = '';
        const schoolLogoPath = normalizeAssetPath(schoolPayload?.logoUrl);
        if (schoolLogoPath) {
          resolvedLogoUrl = resolveAssetUrl(schoolLogoPath);
        }
        if (!resolvedLogoUrl && logo?.imageUrl) {
          resolvedLogoUrl = resolveAssetUrl(normalizeAssetPath(logo.imageUrl));
        }
        if (!resolvedLogoUrl) {
          const storedLogoPath = getStoredSchoolLogoPath();
          if (storedLogoPath) {
            resolvedLogoUrl = resolveAssetUrl(storedLogoPath);
          }
        }
        setLogoUrl(resolvedLogoUrl);
        if (type === 'student') {
          const mergedPortraitTemplate = mergeStudentTemplate(portraitTemplateRes, DEFAULT_STUDENT_ID_TEMPLATE);
          setStudentTemplate(mergedPortraitTemplate);
          const portraitBgColor = portraitTemplateRes?.card?.backgroundColor || mergedPortraitTemplate.card?.backgroundColor || DEFAULT_STUDENT_ID_TEMPLATE.card.backgroundColor;
          setStudentBgColor(portraitBgColor);

          const mergedLandscapeTemplate = mergeStudentTemplate(landscapeTemplateRes, DEFAULT_STUDENT_ID_LANDSCAPE_TEMPLATE);
          setStudentLandscapeTemplate(mergedLandscapeTemplate);
          const landscapeBgColor = landscapeTemplateRes?.card?.backgroundColor || mergedLandscapeTemplate.card?.backgroundColor || DEFAULT_STUDENT_ID_LANDSCAPE_TEMPLATE.card.backgroundColor;
          setStudentLandscapeBgColor(landscapeBgColor);
        } else {
          setStudentTemplate(DEFAULT_STUDENT_ID_TEMPLATE);
          setStudentBgColor(DEFAULT_STUDENT_ID_TEMPLATE.card.backgroundColor);
          setStudentLandscapeTemplate(DEFAULT_STUDENT_ID_LANDSCAPE_TEMPLATE);
          setStudentLandscapeBgColor(DEFAULT_STUDENT_ID_LANDSCAPE_TEMPLATE.card.backgroundColor);
        }

        if (type === 'staff') {
          const mergedStaffTemplate = mergeTemplate(portraitTemplateRes, DEFAULT_STAFF_ID_TEMPLATE);
          setStaffTemplate(mergedStaffTemplate);
          setStaffBgColor(
            portraitTemplateRes?.card?.backgroundColor ||
              mergedStaffTemplate?.card?.backgroundColor ||
              DEFAULT_STAFF_ID_TEMPLATE.card.backgroundColor
          );

          const mergedStaffLandscape = mergeTemplate(landscapeTemplateRes, DEFAULT_STAFF_ID_LANDSCAPE_TEMPLATE);
          setStaffLandscapeTemplate(mergedStaffLandscape);
          setStaffLandscapeBgColor(
            landscapeTemplateRes?.card?.backgroundColor ||
              mergedStaffLandscape?.card?.backgroundColor ||
              DEFAULT_STAFF_ID_LANDSCAPE_TEMPLATE.card.backgroundColor
          );
        } else {
          setStaffTemplate(DEFAULT_STAFF_ID_TEMPLATE);
          setStaffBgColor(DEFAULT_STAFF_ID_TEMPLATE.card.backgroundColor);
          setStaffLandscapeTemplate(DEFAULT_STAFF_ID_LANDSCAPE_TEMPLATE);
          setStaffLandscapeBgColor(DEFAULT_STAFF_ID_LANDSCAPE_TEMPLATE.card.backgroundColor);
        }

        if (type === 'teacher') {
          const mergedTeacherTemplate = mergeTemplate(portraitTemplateRes, DEFAULT_TEACHER_ID_TEMPLATE);
          setTeacherTemplate(mergedTeacherTemplate);
          setTeacherBgColor(
            portraitTemplateRes?.card?.backgroundColor ||
              mergedTeacherTemplate?.card?.backgroundColor ||
              DEFAULT_TEACHER_ID_TEMPLATE.card.backgroundColor
          );

          const mergedTeacherLandscape = mergeTemplate(landscapeTemplateRes, DEFAULT_TEACHER_ID_LANDSCAPE_TEMPLATE);
          setTeacherLandscapeTemplate(mergedTeacherLandscape);
          setTeacherLandscapeBgColor(
            landscapeTemplateRes?.card?.backgroundColor ||
              mergedTeacherLandscape?.card?.backgroundColor ||
              DEFAULT_TEACHER_ID_LANDSCAPE_TEMPLATE.card.backgroundColor
          );
        } else {
          setTeacherTemplate(DEFAULT_TEACHER_ID_TEMPLATE);
          setTeacherBgColor(DEFAULT_TEACHER_ID_TEMPLATE.card.backgroundColor);
          setTeacherLandscapeTemplate(DEFAULT_TEACHER_ID_LANDSCAPE_TEMPLATE);
          setTeacherLandscapeBgColor(DEFAULT_TEACHER_ID_LANDSCAPE_TEMPLATE.card.backgroundColor);
        }
      } catch (e) {
        console.error('Failed to fetch school images for PrintPreview:', e);
      }
    };
    loadImages();
  }, [type]);
  const handlePrint = () => {
    window.print();
  };

  const printStyles = `
        @page {
          size: auto;
          margin: 12mm;
        }
        @media print {
          body * { visibility: hidden; }
          #print-container, #print-container * { visibility: visible; }
          #print-container { position: absolute; left: 0; top: 0; right: 0; }
          .no-print { display: none !important; }
          /* Two cards per row for print */
          .print-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            justify-items: center;
            max-width: 100%;
            margin: 0 auto;
          }
          /* Ensure cards fit properly on page */
          .print-card {
            max-width: 100%;
            box-sizing: border-box;
          }
        }
      `;

  const preparedStudents = useMemo(() => {
    if (type !== 'student') return [];
    return items.map((it) => ({ raw: it, mapped: buildStudentCardData(it, sessionLabel) }));
  }, [items, sessionLabel, type]);

  const gridContent = (
    <div className="p-4 sm:p-6 lg:p-8">
      {items.length === 0 ? (
        <div className="text-center text-sm text-gray-500">No records to show</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-6 place-items-center print-grid">
          {type === 'student'
            ? preparedStudents.map(({ raw, mapped }) => {
                const key = raw._id || raw.id;
                const assets = {
                  logoUrl,
                  moharUrl,
                  backgroundUrl: null,
                };
                if (iCardType === 'I-Card 2') {
                  return (
                    <StudentIdCardLandscapeRenderer
                      key={key}
                      template={studentLandscapeTemplate}
                      student={{ ...mapped, raw }}
                      school={schoolInfo}
                      assets={assets}
                      backgroundColor={studentLandscapeTemplate?.card?.backgroundColor || studentLandscapeBgColor}
                    />
                  );
                }
                return (
                  <StudentIdCardTemplateRenderer
                    key={key}
                    template={studentTemplate}
                    student={{ ...mapped, raw }}
                    school={schoolInfo}
                    assets={assets}
                    backgroundColor={studentTemplate?.card?.backgroundColor || studentBgColor}
                  />
                );
              })
            : items.map((it) => (
                <Card
                  key={it._id || it.id}
                  item={it}
                  type={type}
                  bgUrl={null}
                  logoUrl={logoUrl}
                  moharUrl={moharUrl}
                  schoolInfo={schoolInfo}
                  sessionLabel={sessionLabel}
                  dims={cardDims}
                  className="print-card"
                  template={type === 'staff' ? staffTemplate : type === 'teacher' ? teacherTemplate : undefined}
                  landscapeTemplate={type === 'staff' ? staffLandscapeTemplate : type === 'teacher' ? teacherLandscapeTemplate : undefined}
                  backgroundColor={
                    type === 'staff'
                      ? iCardType === 'I-Card 2' ? staffLandscapeBgColor : staffBgColor
                      : type === 'teacher'
                        ? iCardType === 'I-Card 2' ? teacherLandscapeBgColor : teacherBgColor
                        : undefined
                  }
                  iCardType={iCardType}
                />
              ))}
        </div>
      )}
    </div>
  );

  if (displayMode === 'page') {
    return (
      <div className="min-h-screen bg-gray-50">
        <style>{printStyles}</style>
        <div className="w-full">
          <div className="no-print sticky top-0 z-10 bg-white border-b">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                {logoUrl && !hideHeaderLogo && (
                  <img src={logoUrl} alt="School Logo" className="w-10 h-10 object-contain flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-lg font-medium truncate">{title}</div>
                  <div className="text-xs text-gray-600 truncate">Session: {sessionLabel || 'N/A'} • Type: {iCardType || 'Default'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Print</button>
                <button onClick={onClose} className="px-4 py-2 border rounded">Back</button>
              </div>
            </div>
          </div>
          <div id="print-container" className="bg-white pt-4">
            {gridContent}
          </div>
        </div>
      </div>
    );
  }

  // default modal mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-[1000] flex items-center justify-center p-4">
      <style>{printStyles}</style>
      <div id="print-container" className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b no-print">
          <div className="flex items-center gap-3">
            {logoUrl && !hideHeaderLogo && (
              <img src={logoUrl} alt="School Logo" className="w-10 h-10 object-contain" />
            )}
            <div>
              <div className="text-lg font-medium">{title}</div>
              <div className="text-xs text-gray-600">Session: {sessionLabel || 'N/A'} • Type: {iCardType || 'Default'}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Print</button>
            <button onClick={onClose} className="px-4 py-2 border rounded">Close</button>
          </div>
        </div>
        {gridContent}
      </div>
    </div>
  );
};

export default PrintPreview;
