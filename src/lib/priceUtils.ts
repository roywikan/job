export function parseNumericPrice(priceStr: string | undefined | null): number {
  if (!priceStr) return 0;
  const str = priceStr.trim();
  
  // Handle 'jt' / 'juta' e.g. "2.8jt" or "3.5jt"
  const jtMatch = str.match(/([\d\.]+)\s*(?:jt|juta)/i);
  if (jtMatch) {
    const val = parseFloat(jtMatch[1]);
    if (!isNaN(val)) return Math.round(val * 1000000);
  }
  
  // Handle 'rb' / 'ribu' e.g. "150rb"
  const rbMatch = str.match(/([\d\.]+)\s*(?:rb|ribu)/i);
  if (rbMatch) {
    const val = parseFloat(rbMatch[1]);
    if (!isNaN(val)) return Math.round(val * 1000);
  }

  // Handle standard "Rp 1.800.000" or "1800000"
  const digits = str.replace(/[^\d]/g, '');
  if (digits) {
    const parsed = parseInt(digits, 10);
    if (!isNaN(parsed)) return parsed;
  }

  return 0;
}
