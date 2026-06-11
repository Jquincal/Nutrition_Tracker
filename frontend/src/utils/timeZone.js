const timeZoneAliases = {
  'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
  'America/Catamarca': 'America/Argentina/Catamarca',
  'America/Cordoba': 'America/Argentina/Cordoba',
  'America/Jujuy': 'America/Argentina/Jujuy',
  'America/Mendoza': 'America/Argentina/Mendoza',
}

export const normalizeTimeZone = (timeZone) => timeZoneAliases[timeZone] || timeZone || 'UTC'

export const browserTimeZone = () => normalizeTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
