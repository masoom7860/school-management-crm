import { useMemo } from 'react';

const mmToPx = (mm) => (mm || 0) * 3.7795275591;
const ptToPx = (pt) => (pt || 0) * (96 / 72);
const toPxValue = (value, fallbackPx) => {
  if (typeof value === 'number') return `${value}px`;
  if (typeof value === 'string') return value;
  return `${fallbackPx}px`;
};

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

const getPhotoBoxDimensions = (photoCfg, cardWidthPx, cardHeightPx) => {
  const widthPx = cardWidthPx * (photoCfg?.widthRatio || 0.36);
  if (photoCfg?.heightRatio) {
    return { widthPx, heightPx: cardHeightPx * photoCfg.heightRatio };
  }

  const aspectRatio = photoCfg?.aspectRatio || 1;
  if (!aspectRatio || aspectRatio === 1) {
    return { widthPx, heightPx: widthPx };
  }

  return { widthPx, heightPx: widthPx / aspectRatio };
};

const getPhotoBorderRadius = (shape, widthPx, heightPx) => {
  if (shape === 'circle') return '50%';
  if (shape === 'rounded') {
    const radius = Math.min(widthPx, heightPx) * 0.25;
    return `${radius}px`;
  }
  return '8px';
};

const EmployeeIdCardTemplateRenderer = ({
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

  const cardWidthMM = cardCfg.widthMM || 54;
  const cardHeightMM = cardCfg.heightMM || 86;
  const borderRadiusPx = mmToPx(cardCfg.borderRadius || 5);
  const borderWidthPx = mmToPx(cardCfg.borderWidthMM || 0.35);
  const cardWidthPx = mmToPx(cardWidthMM);
  const cardHeightPx = mmToPx(cardHeightMM);

  const headerHeightPx = cardHeightPx * (headerCfg.heightRatio || 0.46);
  const { widthPx: photoWidthPx, heightPx: photoHeightPx } = useMemo(
    () => getPhotoBoxDimensions(photoCfg, cardWidthPx, cardHeightPx),
    [photoCfg, cardWidthPx, cardHeightPx]
  );

  const photoBorderRadius = useMemo(
    () => getPhotoBorderRadius(photoCfg.shape, photoWidthPx, photoHeightPx),
    [photoCfg.shape, photoWidthPx, photoHeightPx]
  );

  const schoolName = (school?.schoolName || school?.name || 'ZOSTO PUBLIC INTER COLLEGE').toString().toUpperCase();
  const schoolAddress = buildSchoolAddress(school) || 'Lucknow UP';

  const selectedBg = backgroundColor || cardCfg.backgroundColor || palette.background || '#FFFFFF';
  const primaryColor = palette.primary || '#1D4ED8';
  const secondaryColor = palette.secondary || '#DBEAFE';
  const headerTextColor = headerCfg.text?.color || '#FFFFFF';
  const headerBackground = headerCfg.background || primaryColor;
  const accentBackground = headerCfg.swoosh?.color || primaryColor;
  const showAccent = headerCfg.swoosh?.showAccent !== false && (headerCfg.swoosh?.opacity ?? 0) > 0;
  const logoSize = cardWidthPx * (headerCfg.logo?.sizeRatio || 0.22);
  const logoBorderWidth = mmToPx(headerCfg.logo?.borderWidthMM || 0.6);
  const nameBorderColor = nameCfg.borderColor || secondaryColor || '#DBEAFE';
  const infoDividerColor = infoCfg.dividerColor || secondaryColor || '#DBEAFE';
  const infoRowGap = Math.min(infoCfg.rowGapPx ?? 6, 5);
  const infoFontSize = ptToPx(infoCfg.fontSizePt || 8.2) / 1.333;
  const labelFontSize = ptToPx(infoCfg.labelFontSizePt || infoCfg.fontSizePt || 8) / 1.333;
  const footerBackground = footerCfg.background || 'transparent';
  const contactColor = footerCfg.contactColor || palette.contactColor || primaryColor;
  const showSignature = footerCfg.showSignature !== false;
  const showMohar = footerCfg.showMohar !== false;
  const signatureBorderColor = footerCfg.signatureBorderColor || `rgba(29,78,216,0.24)`;
  const signatureTextColor = footerCfg.signatureTextColor || palette.textPrimary || '#1E3A8A';
  const backgroundImageOpacity = config.options?.backgroundImageOpacity ?? 0.15;
  const signatureBoxBackground = footerCfg.signatureBackground || footerCfg.signatureBoxBackground || '#EEF2FF';
  const signatureBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3px 8px',
    borderRadius: footerCfg.signatureBorderRadius || 10,
    background: signatureBoxBackground,
    border: `1px solid ${signatureBorderColor}`,
    maxWidth: '82px',
  };
  const signaturePlaceholderStyle = {
    fontSize: '7px',
    fontWeight: 600,
    color: signatureTextColor,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
  const signatureLabelStyle = {
    fontSize: '8px',
    fontWeight: 600,
    color: signatureTextColor,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  };
  const moharWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    minHeight: '28px',
    marginTop: '-6px',
  };
  const moharImageStyle = {
    maxWidth: '80px',
    maxHeight: '46px',
    objectFit: 'contain',
  };
  const moharPlaceholderStyle = {
    fontSize: '7px',
    fontWeight: 600,
    color: signatureTextColor,
    textTransform: 'uppercase',
    letterSpacing: '0.45px',
    textAlign: 'center',
    lineHeight: 1.3,
  };
  const moharLabelStyle = {
    fontSize: '8px',
    fontWeight: 600,
    color: signatureTextColor,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    textAlign: 'center',
    marginTop: '-4px',
  };
  const overlapRatio = photoCfg.overlapRatio ?? 0.5;
  const overlapMultiplier = photoCfg.overlapOffsetMultiplier ?? 0.48;
  const minimumHeaderGapPx = photoCfg.minimumHeaderGapPx ?? 4;
  const rawOverlapOffset = photoHeightPx * overlapRatio * overlapMultiplier;
  const overlapOffset = Math.max(rawOverlapOffset - minimumHeaderGapPx, 0);

  const renderFieldValue = (field) => {
    const raw = entity?.[field.key];
    const value = ensureUppercase(raw, field.uppercaseValue);
    return value || '';
  };

  const contactNumber = entity?.contactNumber || school?.phone || '';
  const nameValue = entity?.fullName || entity?.name || 'STAFF NAME';

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
          borderRadius: borderRadiusPx,
          border: `${borderWidthPx}px solid ${cardCfg.borderColor || primaryColor}`,
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {assets?.backgroundUrl && (
          <img
            src={assets.backgroundUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: config.options?.backgroundImageOpacity ?? 0.15 }}
          />
        )}

        {/* HEADER */}
        <div
          style={{
            position: 'relative',
            height: headerHeightPx,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: headerTextColor,
            zIndex: 1,
            marginTop: toPxValue(headerCfg.marginTopPx, -8),
            paddingTop: toPxValue(headerCfg.paddingTopPx, 2),
            paddingBottom: toPxValue(headerCfg.paddingBottomPx, 2),
            gap: '1.5px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: headerBackground,
              borderRadius: headerCfg.borderRadius || '0 0 50% 50%',
              zIndex: -1,
            }}
          />

          {showAccent && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: accentBackground,
                opacity: headerCfg.swoosh?.opacity ?? 0.85,
                clipPath: headerCfg.swoosh?.clipPath || 'ellipse(95% 65% at 50% 15%)',
                zIndex: -1,
              }}
            />
          )}

          <div
            style={{
              width: logoSize,
              height: logoSize,
              background: headerCfg.logo?.background || '#FFFFFF',
              borderRadius: headerCfg.logo?.shape === 'rounded' ? headerCfg.logo?.borderRadius || '16px' : '50%',
              border: `${logoBorderWidth}px solid ${headerCfg.logo?.borderColor || '#FFFFFF'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: headerCfg.logo?.shadow || '0 2px 10px rgba(0,0,0,0.18)',
              marginBottom: '6px',
            }}
          >
            {assets?.logoUrl ? (
              <img
                src={assets.logoUrl}
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ color: primaryColor, fontSize: '7px', fontWeight: 700 }}>LOGO</div>
            )}
          </div>

          <div style={{ padding: '0 6px', textAlign: 'center', lineHeight: 1.02 }}>
            {headerCfg.text?.showSchoolName !== false && (
              <div
                style={{
                  fontSize: ptToPx(headerCfg.text?.nameFontSizePt || 10) / 1.333,
                  fontWeight: 700,
                  textTransform: headerCfg.text?.uppercase !== false ? 'uppercase' : 'none',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.02,
                }}
              >
                {schoolName}
              </div>
            )}
            {headerCfg.text?.showAddress && schoolAddress && (
              <div
                style={{
                  fontSize: ptToPx(headerCfg.text?.addressFontSizePt || 6.5) / 1.333,
                  opacity: 0.92,
                  whiteSpace: 'nowrap',
                  maxWidth: '160px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.02,
                }}
              >
                {schoolAddress}
              </div>
            )}
          </div>
        </div>

        {/* PHOTO */}
        <div
          style={{
            position: 'relative',
            marginTop: `-${overlapOffset}px`,
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            paddingBottom: '10px',
          }}
        >
          <div
            style={{
              width: photoWidthPx + mmToPx(0.6),
              height: photoHeightPx + mmToPx(0.6),
              borderRadius: photoCfg.shape === 'circle' ? '50%' : photoBorderRadius,
              background: photoCfg.frameColor || '#FFFFFF',
              border: `${mmToPx(photoCfg.frameWidthMM || 0.5)}px solid ${photoCfg.frameColor || '#FFFFFF'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: photoCfg.shadow || '0 4px 14px rgba(0,0,0,0.18)',
            }}
          >
            <div
              style={{
                width: photoWidthPx,
                height: photoHeightPx,
                borderRadius: photoCfg.shape === 'circle' ? '50%' : photoBorderRadius,
                overflow: 'hidden',
                background: entity?.photoUrl ? 'transparent' : (photoCfg.placeholderColor || 'transparent'),
                border: photoCfg.accentBorderWidthMM
                  ? `${mmToPx(photoCfg.accentBorderWidthMM)}px solid ${photoCfg.accentBorderColor || '#11182720'}`
                  : 'none',
              }}
            >
              {entity?.photoUrl ? (
                <img
                  src={entity.photoUrl}
                  alt={nameValue}
                  style={{ width: '100%', height: '100%', objectFit: photoCfg.objectFit || 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.style.background = '#E5E7EB';
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: `0 ${cardWidthPx * 0.08}px`,
            gap: '2px',
            marginTop: '-2px',
          }}
        >
          <div
            style={{
              background: nameCfg.background || '#FFFFFF',
              padding: `${mmToPx(nameCfg.paddingMM || 1)}px ${mmToPx(nameCfg.paddingMM || 1.6)}px`,
              borderRadius: nameCfg.borderRadius || 14,
              fontSize: ptToPx(nameCfg.fontSizePt || 10) / 1.333,
              fontWeight: nameCfg.fontWeight || 700,
              textTransform: nameCfg.uppercase === false ? 'none' : 'uppercase',
              boxShadow: nameCfg.shadow || '0 2px 10px rgba(0,0,0,0.08)',
              textAlign: nameCfg.textAlign || 'center',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              border: `1px solid ${nameBorderColor}`,
            }}
          >
            {nameValue}
          </div>

          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: infoRowGap,
            }}
          >
            {infoFields.map((field) => {
              const value = renderFieldValue(field);
              if (!value) return null;
              const isMultiline = field.multiline || field.key === 'address';
              const valueLines = isMultiline ? splitIntoLines(value) : [value];
              return (
                <div
                  key={field.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMultiline ? 'flex-start' : 'center',
                    borderBottom: infoCfg.showDividers !== false ? `1px solid ${infoDividerColor}` : 'none',
                    paddingBottom: infoCfg.showDividers !== false ? '1px' : 0,
                    fontSize: infoFontSize,
                    fontWeight: 600,
                    color: palette.textPrimary || '#1F2937',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: infoCfg.labelColor || '#374151',
                      textTransform: 'uppercase',
                      marginRight: '12px',
                      fontSize: labelFontSize,
                      lineHeight: 1.09,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {field.label}
                  </span>
                  <span
                    style={{
                      color: infoCfg.valueColor || '#1F2937',
                      textAlign: isMultiline ? 'left' : 'right',
                      flex: 1,
                      lineHeight: 1.4,
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

        {/* FOOTER */}
        <div
          style={{
            marginTop: 'auto',
            padding: '4px 10px',
            width: '100%',
            backgroundColor: footerBackground,
            color: footerCfg.textColor || palette.textPrimary || '#1F2937',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '4px',
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {contactNumber && (
              <div
                style={{
                  fontSize: ptToPx(footerCfg.contactFontSizePt || 8.2) / 1.333,
                  fontWeight: 800,
                  color: contactColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                {footerCfg.contactPrefix || 'Contact:'} {contactNumber}
              </div>
            )}
          </div>

          {(showSignature || showMohar) && (
            <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                {showMohar && (
                  <div style={moharWrapperStyle}>
                    {assets?.moharUrl ? (
                      <img
                        src={assets.moharUrl}
                        alt="School Seal"
                        style={moharImageStyle}
                      />
                    ) : (
                      <span style={moharPlaceholderStyle}>{footerCfg.moharLabel || 'School Seal'}</span>
                    )}
                  </div>
                )}

                {showSignature && (
                  <>
                    {/* <div style={signatureBadgeStyle}>
                      {assets?.signatureUrl ? (
                        <img
                          src={assets.signatureUrl}
                          alt="Signature"
                          style={{ maxHeight: '24px', maxWidth: '70px', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={signaturePlaceholderStyle}>Principal Sign</span>
                      )}
                    </div> */}
                    <span style={{ ...signatureLabelStyle, marginTop: '-6px' }}>
                      {footerCfg.signatureLabel || 'Authorised Signatory'}
                    </span>
                  </>
                )}

                {!showSignature && showMohar && (
                  <span style={moharLabelStyle}>{footerCfg.moharLabel || 'Principal'}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeIdCardTemplateRenderer;
