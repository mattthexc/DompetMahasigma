import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDynamicEmoji(val: string, defaultIcon: string = '📦'): string {
  if (!val) return defaultIcon;
  const lower = val.toLowerCase();
  
  if (lower.match(/makan|minum|food|jajan|kafe|kopi|cemilan|sarapan|rokok|boba|snack/)) return '🍔';
  else if (lower.match(/transport|gojek|grab|bensin|parkir|mobil|motor|kereta|bus|tol|pesawat|tiket/)) return '🚗';
  else if (lower.match(/sekolah|kuliah|buku|tugas|spp|ukt|pendidikan|fotokopi|print|les|kursus/)) return '📚';
  else if (lower.match(/kos|rumah|listrik|air|wifi|kontrakan|internet|kuota|pulsa|asuransi|pajak|cicilan/)) return '🏠';
  else if (lower.match(/belanja|baju|skincare|shopping|pakaian|sepatu|tas|makeup|salon/)) return '🛍️';
  else if (lower.match(/main|game|nonton|hiburan|pacar|kencan|healing|liburan|bioskop|konser/)) return '🎮';
  else if (lower.match(/sakit|obat|rs|dokter|kesehatan|vitamin|gym|olahraga|bpjs/)) return '💊';
  else if (lower.match(/tabung|invest|saham|crypto|emas|reksadana|deposit/)) return '📈';
  else if (lower.match(/hp|laptop|servis|elektronik|gadget|kabel|charger/)) return '💻';
  else if (lower.match(/amal|sedekah|zakat|infaq|donasi|sumbangan/)) return '🤲';
  else if (lower.match(/kucing|anjing|pet|makanan kucing|peliharaan|vet/)) return '🐾';
  else if (lower.match(/bayi|anak|susu|popok|pampers|mainan/)) return '👶';
  else if (lower.match(/nikah|kawin|resepsi|wedding/)) return '💍';
  else if (lower.match(/haji|umroh/)) return '🕋';
  else if (lower.match(/kendaraan/)) return '🚘';
  
  return defaultIcon;
}
