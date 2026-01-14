export const convertDateToString = (dateToConvert: Date | string): string => {
  if (typeof dateToConvert === "string") {
    return convertDateToString(new Date(dateToConvert))
  }
  return dateToConvert.toLocaleDateString("fi-FI")
}
