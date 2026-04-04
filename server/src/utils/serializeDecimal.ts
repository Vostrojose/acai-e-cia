export function serializeDecimal(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal)
  }

  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {}

    for (const key in obj) {
      const value = obj[key]

      if (
        value &&
        typeof value === 'object' &&
        value.constructor &&
        value.constructor.name === 'Decimal'
      ) {
        newObj[key] = Number(value)
      } else {
        newObj[key] = serializeDecimal(value)
      }
    }

    return newObj
  }

  return obj
}