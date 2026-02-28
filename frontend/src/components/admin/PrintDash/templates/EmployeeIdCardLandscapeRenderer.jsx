import React from 'react';

const mmToPx = (mm = 0) => mm * 3.7795275591;

const ensureUppercase = (value, shouldUppercase = true) => {
  if (!value && value !== 0) return '';
  const str = typeof value === 'string' ? value : String(value);
  return shouldUppercase ? str.toUpperCase() : str;
};

const splitIntoLines = (value) => {
  if (!value && value !== 0) return [];
  const str = typeof value === 'string' ? value : String(value);
  return str
    .split(/\r?\n/)
    .flatMap((segment) => segment.split(/\s*,\s*/))
    .map((line) => line.trim())
    .filter(Boolean);
};

const buildSchoolAddress = (school) => {
  if (!school) return '';
  if (school.address) return school.address;
  const parts = [school.city, school.state, school.country].filter(Boolean);
  return parts.join(', ');
};

const getPhotoDiameter = (photoCfg, cardWidthMM, cardHeightMM) => {
  if (photoCfg?.diameterPx) return photoCfg.diameterPx;
  if (photoCfg?.diameterRatio) {
    return mmToPx(cardWidthMM) * photoCfg.diameterRatio;
  }
  return mmToPx(Math.min(cardWidthMM, cardHeightMM) * 0.35);
};

const EmployeeIdCardLandscapeRenderer = ({
  template,
  entity,
  school,
  assets,
  backgroundColor,
}) => {
  const config = template || {};
  const cardCfg = config.card || {};
  const palette = config.palette || {};
  const headerCfg = config.header || {};
  const photoCfg = config.photo || {};
  const nameCfg = config.nameSection || {};
  const infoCfg = config.infoSection || {};
  const footerCfg = config.footer || {};
  const infoFields = Array.isArray(config.infoFields) ? config.infoFields : [];

  const cardWidthMM = cardCfg.widthMM || 86;
  const cardHeightMM = cardCfg.heightMM || 54;
  const borderRadius = cardCfg.borderRadius ?? 6;
  const borderWidth = mmToPx(cardCfg.borderWidthMM ?? 0.45);

  const selectedBg = backgroundColor || cardCfg.backgroundColor || palette.background || '#FFFFFF';
  const primaryColor = palette.primary || '#1D4ED8';
  const accentColor = palette.accent || '#BFDBFE';
  const textPrimary = palette.textPrimary || '#1F2937';
  const backgroundImageOpacity = config.options?.backgroundImageOpacity ?? 0.15;

  const schoolNameRaw = school?.schoolName || school?.name || 'ZOSTO PUBLIC SCHOOL';
  const headerUppercase = headerCfg.text?.uppercase !== false;
  const schoolAddress = headerCfg.text?.showAddress === false ? '' : (school?.address || buildSchoolAddress(school));

  const logoSize = mmToPx(cardWidthMM) * (headerCfg.logo?.sizeRatio || 0.18);
  const logoBorder = mmToPx(headerCfg.logo?.borderWidthMM || 0.4);
  const photoDiameter = getPhotoDiameter(photoCfg, cardWidthMM, cardHeightMM);

  const nameValue = ensureUppercase(entity?.fullName || entity?.name || 'STAFF NAME', nameCfg.uppercase !== false);
  const contactNumber = entity?.contactNumber || entity?.mobile || entity?.phone || school?.phone || '';

  const renderFieldValue = (field) => {
    const raw = entity?.[field.key];
    const value = ensureUppercase(raw, field.uppercaseValue);
    return value || '';
  };

  const showMohar = footerCfg.showMohar !== false;
  const showSignature = footerCfg.showSignature !== false;
  const contactColor = footerCfg.contactColor || palette.contactColor || primaryColor;

  return (
    <div
      className="print-card"
      style={{
        width: `${cardWidthMM}mm`,
        height: `${cardHeightMM}mm`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: selectedBg,
          borderRadius: `${borderRadius}px`,
          border: `${borderWidth}px solid ${cardCfg.borderColor || primaryColor}`,
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {assets?.backgroundUrl && (
          <img
            src={assets.backgroundUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: backgroundImageOpacity }}
          />
        )}

        <div
          style={{
            position: 'relative',
            height: `${(headerCfg.heightRatio || 0.32) * 100}%`,
            background: headerCfg.background || primaryColor,
            color: headerCfg.text?.color || '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '6px 14px',
            zIndex: 1,
          }}
        >
          {headerCfg.curve && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: headerCfg.curve.color || accentColor,
                opacity: headerCfg.curve.opacity ?? 1,
                transform: `translateY(${headerCfg.curve.offset ?? -0.4}%)`,
                clipPath: 'ellipse(120% 70% at 50% 5%)',
                zIndex: -1,
              }}
            />
          )}

          <div
            style={{
              width: logoSize,
              height: logoSize,
              background: headerCfg.logo?.background || '#FFFFFF',
              borderRadius: headerCfg.logo?.shape === 'rounded' ? '12px' : '50%',
              border: `${logoBorder}px solid ${headerCfg.logo?.borderColor || '#FFFFFF'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: headerCfg.logo?.shadow || '0 3px 10px rgba(0,0,0,0.18)',
            }}
          >
            {assets?.logoUrl ? (
              <img src={assets.logoUrl} alt="School Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '8px', fontWeight: 800, color: primaryColor }}>LOGO</span>
            )}
          </div>

          <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
            {headerCfg.text?.showSchoolName !== false && (
              <div
                style={{
                  fontSize: `${headerCfg.text?.nameFontSizePt || 11}pt`,
                  fontWeight: 800,
                  textTransform: headerUppercase ? 'uppercase' : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {ensureUppercase(schoolNameRaw, headerUppercase)}
              </div>
            )}
            {schoolAddress && (
              <div
                style={{
                  fontSize: `${headerCfg.text?.addressFontSizePt || 7}pt`,
                  opacity: 0.9,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflow: 'visible',
                }}
              >
                {schoolAddress}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            padding: '10px 14px 8px',
            gap: '14px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div style={{ width: photoDiameter, display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: photoDiameter,
                height: photoDiameter,
                borderRadius: '50%',
                border: `${mmToPx(photoCfg.borderWidthMM ?? 0.65)}px solid ${photoCfg.borderColor || '#FFFFFF'}`,
                overflow: 'hidden',
                background: entity?.photoUrl ? 'transparent' : (photoCfg.placeholderColor || '#E5E7EB'),
                boxShadow: photoCfg.shadow || '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              {entity?.photoUrl ? (
                <img
                  src={entity.photoUrl}
                  alt={nameValue}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.style.background = '#E5E7EB';
                  }}
                />
              ) : null}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div
              style={{
                alignSelf: 'flex-start',
                background: nameCfg.background || 'rgba(255,255,255,0.92)',
                color: nameCfg.textColor || primaryColor,
                borderRadius: `${nameCfg.borderRadius ?? 8}px`,
                padding: '4px 14px',
                fontSize: `${nameCfg.fontSizePt || 11}pt`,
                fontWeight: nameCfg.fontWeight || 800,
                textTransform: nameCfg.uppercase === false ? 'none' : 'uppercase',
                letterSpacing: nameCfg.letterSpacing ? `${nameCfg.letterSpacing}px` : '0.6px',
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                marginBottom: '10px',
              }}
            >
              {nameValue}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: infoCfg.columns || 'repeat(2, minmax(0, 1fr))',
                gap: `${infoCfg.rowGapPx ?? 6}px ${infoCfg.columnGapPx ?? 18}px`,
                fontSize: `${infoCfg.fontSizePt || 8.2}pt`,
                color: infoCfg.valueColor || textPrimary,
              }}
            >
              {infoFields.map((field) => {
                const value = renderFieldValue(field);
                if (!value) return null;
                const isMultiline = field.multiline || field.key === 'address';
                const valueLines = isMultiline ? splitIntoLines(value) : [value];
                return (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: infoCfg.labelColor || '#6B7280',
                        textTransform: 'uppercase',
                        fontSize: `${infoCfg.labelFontSizePt || infoCfg.fontSizePt || 7}pt`,
                        lineHeight: 1.05,
                      }}
                    >
                      {field.label}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        whiteSpace: isMultiline ? 'normal' : 'nowrap',
                        wordBreak: 'break-word',
                        overflow: isMultiline ? 'visible' : 'hidden',
                        textOverflow: isMultiline ? 'clip' : 'ellipsis',
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
        </div>

        {/* Sabse niche wala footer section */}
        <div
          style={{
            position: 'absolute', // Isse footer border ke upar nahi chadhega
            bottom: '8px',       // Niche se thoda upar
            left: '18px',
            right: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end', // Items ko niche se align karega
            zIndex: 10,
          }}
        >
          {/* Contact Number */}
          <div
            style={{
              fontSize: `${footerCfg.contactFontSizePt || 8}pt`,
              fontWeight: 800,
              color: contactColor,
              textTransform: 'uppercase',
              paddingBottom: '5px' // Text ko line se thoda upar rakhne ke liye
            }}
          >
            {footerCfg.contactPrefix || 'Contact:'} {contactNumber || '---'}
          </div>

          {/* Mohar over Principal Section */}
          {showMohar && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '70px',
              }}
            >
              {assets?.moharUrl && (
                <img
                  src={assets.moharUrl}
                  alt="Mohar"
                  style={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'contain',
                    // zIndex: 11,
                    transform: 'rotate(-5deg)',
                  }}
                />
              )}
              <span
                style={{
                  fontSize: `${footerCfg.moharBadgeFontSizePt || 7}pt`,
                  fontWeight: 800,
                  color: contactColor,
                  textTransform: 'uppercase',
                  borderTop: `1px solid ${contactColor}`, // Signature line
                  paddingTop: '2px',
                  width: '100%',
                  textAlign: 'center',
                  zIndex: 9,
                }}
              >
                {footerCfg.moharLabel || 'Principal'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeIdCardLandscapeRenderer;
