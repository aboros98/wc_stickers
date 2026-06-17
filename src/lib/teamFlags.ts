// Maps each team's Panini 3-letter code to an ISO-3166 flag code (flagcdn.com).
// England/Scotland use GB subdivisions. FWC (specials) has no flag.

const ISO: Record<string, string> = {
  ALG: 'dz',
  ARG: 'ar',
  AUS: 'au',
  AUT: 'at',
  BEL: 'be',
  BIH: 'ba',
  BRA: 'br',
  CAN: 'ca',
  CPV: 'cv',
  COL: 'co',
  COD: 'cd',
  CRO: 'hr',
  CUW: 'cw',
  CZE: 'cz',
  ECU: 'ec',
  EGY: 'eg',
  ENG: 'gb-eng',
  FRA: 'fr',
  GER: 'de',
  GHA: 'gh',
  HAI: 'ht',
  IRN: 'ir',
  IRQ: 'iq',
  CIV: 'ci',
  JPN: 'jp',
  JOR: 'jo',
  KOR: 'kr',
  MEX: 'mx',
  MAR: 'ma',
  NED: 'nl',
  NZL: 'nz',
  NOR: 'no',
  PAN: 'pa',
  PAR: 'py',
  POR: 'pt',
  QAT: 'qa',
  KSA: 'sa',
  SCO: 'gb-sct',
  SEN: 'sn',
  RSA: 'za',
  ESP: 'es',
  SWE: 'se',
  SUI: 'ch',
  TUN: 'tn',
  TUR: 'tr',
  URU: 'uy',
  USA: 'us',
  UZB: 'uz',
}

/** Returns a flag PNG URL for a team code, or null for specials (FWC). */
export function flagUrl(code: string, width: 40 | 80 | 160 = 160): string | null {
  const iso = ISO[code]
  if (!iso) return null
  return `https://flagcdn.com/w${width}/${iso}.png`
}
