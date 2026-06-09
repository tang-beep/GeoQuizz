export const COUNTRY_COUNTS = {
  world: [10, 20, 50, 100, 200],
  europe: [10, 20, 44],
  asia: [10, 20, 49],
  northAmerica: [10, 22],
  southAmerica: [13],
  africa: [10, 20, 55],
  oceania: [10, 17]
}

export function getCountryOptions(
  continent?: string | null
): number[] {
  if (!continent) {
    return COUNTRY_COUNTS.world
  }

  return (
    COUNTRY_COUNTS[
      continent as keyof typeof COUNTRY_COUNTS
    ] ?? COUNTRY_COUNTS.world
  )
}

export function isAllCountriesMode(
  countriesCount: number,
  continent?: string | null
) {
  const options =
    getCountryOptions(continent)

  return (
    countriesCount ===
    options[options.length - 1]
  )
}

export function getCountryCountLabel(
  countriesCount: number,
  continent?: string | null
) {
  return isAllCountriesMode(
    countriesCount,
    continent
  )
    ? 'Tous'
    : countriesCount.toString()
}