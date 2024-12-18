export const oneYearFromNow = () => new Date(
  Date.now() + 365 * 24 * 60 * 60 * 1000 // One Year
)


export const thirtyDaysFromNow = () => new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
)

export const fiveMinuteAgo = () => new Date(
  Date.now() - 5 * 6 * 1000
)

export const fifteenDaysFromNow = () => new Date(
  Date.now() + 15 * 24 * 60 * 60 * 1000
)

export const oneHourFromNow = () => new Date(
  Date.now() + 60 * 60 * 1000
)


export const ONE_DAY_MS = 24 * 60 * 60 * 1000
