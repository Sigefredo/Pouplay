// Brazilian national public holidays 2025–2027
const HOLIDAYS = new Set([
  '2025-01-01','2025-04-18','2025-04-21','2025-05-01','2025-06-19',
  '2025-09-07','2025-10-12','2025-11-02','2025-11-15','2025-11-20','2025-12-25',
  '2026-01-01','2026-02-16','2026-02-17','2026-04-03','2026-04-21',
  '2026-05-01','2026-06-04','2026-09-07','2026-10-12','2026-11-02',
  '2026-11-15','2026-11-20','2026-12-25',
  '2027-01-01','2027-02-15','2027-02-16','2027-03-26','2027-04-21',
  '2027-05-01','2027-05-24','2027-09-07','2027-10-12','2027-11-02',
  '2027-11-15','2027-11-20','2027-12-25',
])

function isBusinessDay(d: Date): boolean {
  const w = d.getDay()
  if (w === 0 || w === 6) return false
  return !HOLIDAYS.has(d.toISOString().slice(0, 10))
}

export function addBusinessDays(from: Date, count: number): Date {
  const d = new Date(from)
  let added = 0
  while (added < count) {
    d.setDate(d.getDate() + 1)
    if (isBusinessDay(d)) added++
  }
  return d
}

/** Business days from today until target (inclusive).
 *  -1 = already expired, 0 = expires today, 1+ = days left. */
export function businessDaysUntil(target: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const t = new Date(target)
  t.setHours(0, 0, 0, 0)
  if (t < today) return -1
  if (t.getTime() === today.getTime()) return 0
  let count = 0
  const cursor = new Date(today)
  while (cursor < t) {
    cursor.setDate(cursor.getDate() + 1)
    if (isBusinessDay(cursor)) count++
  }
  return count
}

/** Expiry date = confirmedAt + 5 business days. */
export function depositExpiresAt(confirmedAt: string): Date {
  return addBusinessDays(new Date(confirmedAt), 5)
}
