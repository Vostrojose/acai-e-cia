export interface HeartbeatDTO {
  codigo: string

  tipo?: 'TV_BOX' | 'ANDROID_TV' | 'TABLET'

  versaoApp?: string

  versaoAndroid?: string

  fabricante?: string

  modelo?: string
}