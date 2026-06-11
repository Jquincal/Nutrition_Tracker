const timeZoneAliases = {
  'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
  'America/Catamarca': 'America/Argentina/Catamarca',
  'America/Cordoba': 'America/Argentina/Cordoba',
  'America/Jujuy': 'America/Argentina/Jujuy',
  'America/Mendoza': 'America/Argentina/Mendoza',
};

export function getTimeZone(value) {
  const requestedTimeZone = String(value || 'UTC');
  const timeZone = timeZoneAliases[requestedTimeZone] || requestedTimeZone;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return timeZone;
  } catch {
    return 'UTC';
  }
}

export const dayRangeSql = (column = 'logged_at') =>
  `${column} >= ($2::date AT TIME ZONE $3) AND ${column} < (($2::date + 1) AT TIME ZONE $3)`;
