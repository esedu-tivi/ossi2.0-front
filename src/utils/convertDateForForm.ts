export const convertDateForForm = (dateToConvert: Date) => {
  const rawMonth = dateToConvert.getMonth() + 1
  const rawDate = dateToConvert.getDate()
  const month = rawMonth < 10 ? `0${rawMonth}` : rawMonth.toString()
  const date = rawDate < 10 ? `0${rawDate}` : rawDate.toString()
  return `${dateToConvert.getFullYear()}-${month}-${date}`
}
