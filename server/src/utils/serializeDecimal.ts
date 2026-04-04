import { Decimal } from '@prisma/client/runtime/library'

export function serializeDecimal(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal)
  }

  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {}

    for (const key in obj) {
      const value = obj[key]

      // ✅ CORREÇÃO REAL
      if (value instanceof Decimal) {
        newObj[key] = Number(value)
      } 
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