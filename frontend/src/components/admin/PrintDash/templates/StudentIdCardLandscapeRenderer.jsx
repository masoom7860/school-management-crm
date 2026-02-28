import React from 'react';

const mmToPx = (mm = 0) => mm * 3.7795275591;
const ptToPx = (pt = 0) => pt * (96 / 72);

const splitIntoLines = (value) => {
    if (!value) return [];
    const str = typeof value === 'string' ? value : String(value);
    return str
        .split(/\r?\n/)
        .flatMap((segment) => segment.split(/\s*,\s*/))
        .map((line) => line.trim())
        .filter(Boolean);
};

// Function to handle long names (Auto-scaling font)
const getDynamicFontSize = (text, baseSize) => {
    if (!text) return `${baseSize}pt`;
    if (text.length > 25) return `${baseSize * 0.7}pt`;
    if (text.length > 18) return `${baseSize * 0.85}pt`;
    return `${baseSize}pt`;
};

export const DEFAULT_STUDENT_ID_LANDSCAPE_TEMPLATE = {
    version: '1.5',
    card: {
        widthMM: 86,
        heightMM: 54,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderColor: '#C41E3A',
        borderWidthMM: 0.5,
    },
    palette: {
        primary: '#C41E3A',
        accent: '#F8B9C7',
        textPrimary: '#1F2937',
        textSecondary: '#52606D',
    },
    header: {
        heightRatio: 0.32,
        background: '#C41E3A',
        text: {
            nameFontSizePt: 13,
            addressFontSizePt: 8,
        }
    },
    photo: {
        diameterPx: 75,
        borderWidthMM: 0.5,
        borderColor: '#000000',
    },
    infoFields: [
        { key: 'classSection', label: 'Class' },
        { key: 'scholarNumber', label: 'Scholar No.' },
        { key: 'dateOfBirth', label: 'D.O.B' },
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'fatherName', label: "Father's Name" },
    ]
};

const StudentIdCardLandscapeRenderer = ({
    template,
    student,
    school,
    assets,
}) => {
    const config = template || DEFAULT_STUDENT_ID_LANDSCAPE_TEMPLATE;
    const primary = config.palette?.primary || '#C41E3A';
    const accent = config.palette?.accent || '#F8B9C7';

    // Dynamic values for scaling
    const studentName = student?.fullName || 'STUDENT NAME';
    const schoolName = school?.schoolName || 'ZOSTO PUBLIC SCHOOL';

    return (
        <div
            style={{
                width: `${config.card.widthMM}mm`,
                height: `${config.card.heightMM}mm`,
                backgroundColor: '#FFFFFF',
                borderRadius: `${config.card.borderRadius}px`,
                border: `${mmToPx(config.card.borderWidthMM)}px solid ${primary}`,
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'sans-serif',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* HEADER */}
            <div style={{
                height: '30%',
                background: primary,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 10px',
                color: 'white',
            }}>
                <div style={{
                    position: 'absolute',
                    left: '12px',
                    width: '40px',
                    height: '40px',
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid white'
                }}>
                    {assets?.logoUrl ? (
                        <img src={assets.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ fontSize: '7px', color: primary, fontWeight: 900 }}>LOGO</div>
                    )}
                </div>

                <div style={{ textAlign: 'center', maxWidth: '70%', marginLeft: '40px' }}>
                    <div style={{
                        fontSize: getDynamicFontSize(schoolName, 13), // Auto-adjust School Name
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {schoolName}
                    </div>
                    <div style={{
                        fontSize: '7pt',
                        opacity: 0.9,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflow: 'visible'
                    }}>
                        {school?.address || 'Lucknow, Uttar Pradesh'}
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div style={{ display: 'flex', flex: 1, padding: '5px 5px 0' }}> {/* Top padding kam kar di */}
                <div style={{ width: '30%', display: 'flex', alignItems: 'flex-start', paddingTop: '5px' }}> {/* Photo ko bhi upar align kiya */}
                    <div style={{
                        width: `${config.photo.diameterPx}px`,
                        height: `${config.photo.diameterPx}px`,
                        borderRadius: '50%',
                        border: `${mmToPx(config.photo.borderWidthMM)}px solid #000`,
                        overflow: 'hidden'
                    }}>
                        <img src={student?.photoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>

                {/* Yahan 'justifyContent' ko 'center' se badal kar 'flex-start' kar diya aur margin-top add kiya */}
                <div style={{ width: '70%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '5px' }}>
                    <div style={{
                        textAlign: 'center',
                        fontSize: getDynamicFontSize(studentName, 10),
                        fontWeight: 800,
                        color: primary,
                        marginBottom: '5px', // Margin thoda kam kiya space bachane ke liye
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginRight: '3rem'
                    }}>
                        {studentName}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '2px 8px', // Gap thoda tight kiya
                        paddingLeft: '15px'
                    }}>
                        {config.infoFields.map(field => {
                            const rawValue = student?.[field.key];
                            if (!rawValue) {
                                return (
                                    <div key={field.key} style={{ fontSize: '6.5pt', lineHeight: 1.3 }}>
                                        <span style={{ color: '#52606D', fontWeight: 700, fontSize: '5.5pt', textTransform: 'uppercase' }}>
                                            {field.label}:
                                        </span>
                                        <div style={{ color: '#1F2937', fontWeight: 700 }}>---
                                        </div>
                                    </div>
                                );
                            }
                            const isMultiline = field.multiline || field.key === 'address';
                            const valueLines = isMultiline ? splitIntoLines(rawValue) : [rawValue];
                            return (
                                <div key={field.key} style={{ fontSize: '6.5pt', lineHeight: 1.3 }}>
                                    <span style={{ color: '#52606D', fontWeight: 700, fontSize: '5.5pt', textTransform: 'uppercase' }}>
                                        {field.label}:
                                    </span>
                                    <div
                                        style={{
                                            color: '#1F2937',
                                            fontWeight: 700,
                                            whiteSpace: isMultiline ? 'normal' : 'nowrap',
                                            wordBreak: 'break-word',
                                            overflow: isMultiline ? 'visible' : 'hidden',
                                            textOverflow: isMultiline ? 'clip' : 'ellipsis'
                                        }}
                                    >
                                        {valueLines.map((line, idx) => (
                                            <span key={`${field.key}-${idx}`} style={{ display: 'block' }}>
                                                {line}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 15px 8px'
            }}>
                <div style={{ color: primary, fontSize: '8pt', fontWeight: 800 }}>
                    Contact: {student?.contactNumber || '9345782439'}
                </div>

                <div style={{
                    background: 'rgba(248, 185, 199, 0.25)',
                    border: `1px solid ${accent}`,
                    padding: '1px 8px',
                    borderRadius: '4px',
                    fontSize: '6pt',
                    fontWeight: 800,
                    color: primary
                }}>
                    Principal
                </div>
            </div>
        </div>
    );
};

export default StudentIdCardLandscapeRenderer;