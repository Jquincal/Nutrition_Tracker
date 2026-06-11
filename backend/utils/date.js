export function getTimeZone(value) {
  const timeZone = String(value || 'UTC');
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return timeZone;
  } catch {
    return 'UTC';
  }
}

export const dayRangeSql = (column = 'logged_at') =>
  `${column} >= ($2::date AT TIME ZONE $3) AND ${column} < (($2::date + 1) AT TIME ZONE $3)`;
