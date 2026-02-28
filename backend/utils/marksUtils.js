function toNumber(n, def = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : def;
}

function normalizeTerm(termObj) {
  const i = toNumber(termObj?.i, 0);
  const ii = toNumber(termObj?.ii, 0);
  const iii = toNumber(termObj?.iii, 0);
  const iv = toNumber(termObj?.iv, 0);
  const v = toNumber(termObj?.v, 0);
  const max = toNumber(termObj?.max, 0);
  return { i, ii, iii, iv, v, max };
}

function buildSubjectMaxMap(maxMarksDocs) {
  const map = new Map();
  (Array.isArray(maxMarksDocs) ? maxMarksDocs : []).forEach(doc => {
    const subjectKey = String(doc.subject || '').trim().toUpperCase();
    map.set(subjectKey, {
      Term1: normalizeTerm(doc.Term1),
      Term2: normalizeTerm(doc.Term2),
      Term3: normalizeTerm(doc.Term3)
    });
  });
  return map;
}

function validateMarkAgainstMax({ i = 0, ii = 0, iii = 0, iv = 0, v = 0 }, { i: iMax = 0, ii: iiMax = 0, iii: iiiMax = 0, iv: ivMax = 0, v: vMax = 0, max = 0 }) {
  const errors = [];
  if (i > iMax) errors.push(`i (${i}) exceeds max i (${iMax})`);
  if (ii > iiMax) errors.push(`ii (${ii}) exceeds max ii (${iiMax})`);
  if (typeof iiiMax === 'number' && iii > iiiMax) errors.push(`iii (${iii}) exceeds max iii (${iiiMax})`);
  if (typeof ivMax === 'number' && iv > ivMax) errors.push(`iv (${iv}) exceeds max iv (${ivMax})`);
  if (typeof vMax === 'number' && v > vMax) errors.push(`v (${v}) exceeds max v (${vMax})`);
  const sum = i + ii + iii + iv + v;
  if (sum > max) errors.push(`sum (${sum}) exceeds term max (${max})`);
  if (i < 0 || ii < 0 || iii < 0 || iv < 0 || v < 0) errors.push('negative marks not allowed');
  return errors;
}

module.exports = { buildSubjectMaxMap, validateMarkAgainstMax, normalizeTerm };
