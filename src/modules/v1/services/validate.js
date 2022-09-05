const isNull = (data) => {
  let rs = false
  forEach(data, (value, key) => {
    if (data[key] == undefined) rs = true
    if (typeof value == "object" && value.length == 0) rs = true
  })
  return rs
}
const hasNullInArray = (arr) => {
  let rs = false
  forEach(arr, (value, key) => {
    if (value == undefined) rs = true
  })
  return rs
}
const isDuplicateArr = (arr) => {
  let rs = false
  map(arr, function (o, i) {
    let eq = find(arr, function (e, ind) {
      if (i > ind) {
        return isEqual(e, o)
      }
    })
    console.log(eq)
    if (eq) rs = true
  })
  return rs
}

module.exports = validate = {
  isNull,
  hasNullInArray,
  isDuplicateArr,
}
