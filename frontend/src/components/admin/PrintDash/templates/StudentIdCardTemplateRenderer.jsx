import React, { useMemo } from 'react';

const mmToPx = (mm) => (mm || 0) * 3.7795275591;

const buildSchoolAddress = (school) => {
  if (!school) return '';
  if (school.address) return school.address;
  const parts = [school.city, school.state, school.country].filter(Boolean);
  return parts.join(', ');
};

const ensureUppercase = (value, shouldUppercase) => {
  if (!value) return '';
  const str = typeof value === 'string' ? value : String(value);
  return shouldUppercase ? str.toUpperCase() : str;
};

const splitIntoLines = (value) => {
  if (!value) return [];
  const str = typeof value === 'string' ? value : String(value);
  return str
    .split(/\r?\n/)
    .flatMap((segment) => segment.split(/\s*,\s*/))
    .map((line) => line.trim())
    .filter(Boolean);
};

const StudentIdCardTemplateRenderer = ({
  template,
  student,
  school,
  assets,
  backgroundColor,
}) => {
  const config = template || {};
  const cardCfg = config.card || {};
  const palette = config.palette || {};
  const headerCfg = config.header || {};
  const infoFields = Array.isArray(config.infoFields) ? config.infoFields : [];

  const cardWidthMM = cardCfg.widthMM || 54;
  const cardHeightMM = cardCfg.heightMM || 86;
  const borderRadiusPx = mmToPx(cardCfg.borderRadius || 5);
  const borderWidthPx = mmToPx(cardCfg.borderWidthMM || 0.35);
  const cardWidthPx = mmToPx(cardWidthMM);
  const cardHeightPx = mmToPx(cardHeightMM);
  
  const headerHeightPx = cardHeightPx * (headerCfg.heightRatio || 0.48);
  
  const schoolName = school?.schoolName || school?.name || 'NAME';
  const schoolAddress = buildSchoolAddress(school);

  const selectedBg = backgroundColor || cardCfg.backgroundColor || palette.background || '#FFFFFF';
  const primaryColor = palette.primary || '#BF102A';
  const secondaryColor = palette.secondary || '#FCE4EA';
  const headerTextColor = headerCfg.text?.color || '#FFFFFF';

  const photoMeasurements = useMemo(() => {
    const base = cardWidthPx * (config.photo?.widthRatio || 0.35);
    return { widthPx: base, heightPx: base };
  }, [config.photo, cardWidthPx]);

  const renderFieldValue = (field) => {
    const raw = student?.[field.key];
    const value = ensureUppercase(raw, field.uppercaseValue);
    return value || '';
  };

  const contactNumber = student?.mobile || school?.phone || '';

  return (
    <div className="print-card" style={{ width: `${cardWidthMM}mm`, height: `${cardHeightMM}mm`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: selectedBg,
          borderRadius: borderRadiusPx,
          border: `${borderWidthPx}px solid ${cardCfg.borderColor || primaryColor}`,
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* HEADER SECTION */}
        <div
          style={{
            position: 'relative',
            height: headerHeightPx,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: headerTextColor,
            zIndex: 1,
            paddingTop: '12px'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: headerCfg.background || primaryColor,
              borderRadius: `0 0 50% 50%`,
              zIndex: -1,
            }}
          />
          
          {/* LOGO */}
          <div style={{
              width: cardWidthPx * 0.22,
              height: cardWidthPx * 0.22,
              background: '#FFFFFF',
              borderRadius: '50%',
              border: `${mmToPx(0.5)}px solid #FFFFFF`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: '5px'
          }}>
              {assets?.logoUrl ? <img src={assets.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{color:'#000', fontSize:'7px'}}>LOGO</div>}
          </div>

          <div style={{ padding: '0 5px', textAlign: 'center' }}>
            <div style={{ fontSize: headerCfg.text?.nameFontSizePt || 9.8, fontWeight: 700, textTransform: 'uppercase' }}>
                {schoolName}
            </div>
            {headerCfg.text?.showAddress && schoolAddress && (
              <div style={{ fontSize: headerCfg.text?.addressFontSizePt || 6.2, opacity: 0.9 }}>
                {schoolAddress}
              </div>
            )}
          </div>
        </div>

        {/* PHOTO SECTION */}
        <div style={{ 
          position: 'relative', 
          marginTop: `-${photoMeasurements.heightPx * 0.45}px`, 
          zIndex: 2, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%' 
        }}>
            <div style={{
              width: photoMeasurements.widthPx + 6,
              height: photoMeasurements.heightPx + 6,
              borderRadius: '50%',
              background: '#FFFFFF',
              border: `${mmToPx(0.3)}px solid #11182720`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ width: photoMeasurements.widthPx, height: photoMeasurements.heightPx, borderRadius: '50%', overflow: 'hidden', background: '#F1F5F9' }}>
                {student?.photoUrl ? <img src={student.photoUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : null}
              </div>
            </div>

            {/* Session Badge */}
            {student?.validTill && (
              <div style={{ 
                position: 'absolute', 
                right: '4px',
                background: primaryColor, 
                color: '#FFF',
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontSize: '7px', 
                fontWeight: 700,
              }}>
                {student.validTill}
              </div>
            )}
        </div>

        {/* INFO SECTION */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `0 ${cardWidthPx * 0.08}px` }}>
          <div style={{
            marginTop: '8px',
            background: '#FFFFFF',
            padding: '4px 15px',
            borderRadius: '20px',
            fontSize: config.nameSection?.fontSizePt || 9.5,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textTransform: 'uppercase',
            border: `1px solid ${secondaryColor}`
          }}>
            {student?.fullName || 'STUDENT NAME'}
          </div>

          <div style={{ width: '100%', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {infoFields.map((field) => {
              const value = renderFieldValue(field);
              if (!value) return null;
              const isMultiline = field.multiline;
              const valueLines = isMultiline ? splitIntoLines(value) : [value];
              return (
                <div
                  key={field.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMultiline ? 'flex-start' : 'center',
                    borderBottom: `1px solid ${secondaryColor}`,
                    paddingBottom: '2px',
                    fontSize: config.infoSection?.fontSizePt || 8.2,
                    gap: '8px',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{field.label}</span>
                  <span
                    style={{
                      color: '#111827',
                      fontWeight: 600,
                      textAlign: isMultiline ? 'right' : 'left',
                      whiteSpace: isMultiline ? 'normal' : 'nowrap',
                      wordBreak: 'break-word',
                      overflow: isMultiline ? 'visible' : 'hidden',
                      textOverflow: isMultiline ? 'clip' : 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {valueLines.map((line, idx) => (
                      <span key={`${field.key}-${idx}`} style={{ display: 'block' }}>
                        {line}
                      </span>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER - BOTTOM STICKY */}
        <div style={{ 
            marginTop: 'auto', 
            padding: '5px 0', 
            textAlign: 'center', 
            width: '100%',
            backgroundColor: 'transparent' // Background color change karna ho toh yahan kar sakte ho
        }}>
            {contactNumber && (
              <div style={{ fontSize: '8.5px', fontWeight: 800, color: primaryColor, textTransform: 'uppercase' }}>
                CONTACT: {contactNumber}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudentIdCardTemplateRenderer;