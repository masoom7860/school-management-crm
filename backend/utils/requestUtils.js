function is24Hex(v) {
  return typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
}

function getSchoolIdFromReq(req) {
  const tokenId = req?.decodedToken?.schoolId;
  const headerId = req?.header && req.header('School-ID');
  const q = req?.query?.schoolId || req?.body?.schoolId;
  const cand = tokenId || headerId || q || null;
  return is24Hex(cand) ? cand : null;
}

function isValidTerm(term) {
  return term === 'Term1' || term === 'Term2' || term === 'Term3';
}

module.exports = { getSchoolIdFromReq, isValidTerm };
