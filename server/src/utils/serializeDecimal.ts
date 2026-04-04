export function serializeDecimal(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal)
  }

  // ✅ NÃO mexer em Date
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {}

    for (const key in obj) {
      const value = obj[key]

      // ✅ tratar Decimal
      if (
        value &&
        typeof value === 'object' &&
        value.constructor &&
        value.constructor.name === 'Decimal'
      ) {
        newObj[key] = Number(value)
      }
      // ✅ tratar Date corretamente
      else if (value instanceof Date) {
        newObj[key] = value.toISOString()
      }
      else {
        newObj[key] = serializeDecimal(value)
      }
    }

    return newObj
  }

  return obj
}