// Deadline time-zone handling.
//
// Admins enter deadlines as Arizona wall-clock time. Arizona (America/Phoenix)
// does NOT observe daylight saving time, so it is a fixed UTC-7 offset all year.
// We convert the entered wall-clock time to an absolute UTC instant before it is
// stored, and every viewer sees that instant rendered in their own local zone.

export const ARIZONA_TZ = 'America/Phoenix'

// Fixed year-round offset for America/Phoenix. Do NOT use PST/UTC-8 here — that
// would be wrong for the ~8 months a year the rest of Mountain Time is on DST.
const ARIZONA_UTC_OFFSET = '-07:00'

/**
 * Convert a `<input type="datetime-local">` value (e.g. "2026-09-10T18:00"),
 * interpreted as Arizona wall-clock time, into a UTC ISO timestamp suitable for
 * storing in a `timestamptz` column.
 */
export function arizonaLocalToUtcIso(local: string): string {
  if (!local) return ''
  // datetime-local gives "YYYY-MM-DDTHH:mm" (or with seconds); pin the Arizona offset.
  const withSeconds = local.length === 16 ? `${local}:00` : local
  const date = new Date(`${withSeconds}${ARIZONA_UTC_OFFSET}`)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

/**
 * Convert a stored UTC timestamp into a `<input type="datetime-local">` value
 * expressed in Arizona wall-clock time, so the admin edits the same numbers they
 * originally entered regardless of the browser's own time zone.
 */
export function utcIsoToArizonaLocal(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ARIZONA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  const hour = get('hour') === '24' ? '00' : get('hour')
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`
}

/**
 * Render a stored UTC timestamp in the viewer's own local time zone. Every user
 * sees the same real-world moment, labelled with their zone abbreviation.
 */
export function formatDeadlineLocal(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

/** Render a stored UTC timestamp explicitly in Arizona time (for the admin view). */
export function formatDeadlineArizona(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', {
    timeZone: ARIZONA_TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
