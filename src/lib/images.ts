export const CLOUDINARY_BASE = 'https://res.cloudinary.com/dr4fjf3a1/image/upload'

export const images = {
  logo: `${CLOUDINARY_BASE}/f_auto,q_auto/v1781723693/logo_u7assw.png`,
  logoSmall: `${CLOUDINARY_BASE}/f_auto,q_auto,w_28,h_28,c_fit/v1781723693/logo_u7assw.png`,
  logoFavicon: `${CLOUDINARY_BASE}/f_auto,q_auto,w_32,h_32,c_fit/v1781723693/logo_u7assw.png`,
  logoTouch: `${CLOUDINARY_BASE}/f_auto,q_auto,w_180,h_180,c_fit/v1781723693/logo_u7assw.png`,
  hero: `${CLOUDINARY_BASE}/f_auto,q_auto/v1781724436/heo_avdylx.png`,
}

export const img = (n: number) => `/me/${n}.jpg`

export const preload = (src: string) => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  document.head.appendChild(link)
}
