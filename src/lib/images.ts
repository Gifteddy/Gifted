export const img = (n: number) => `/me/${n}.jpg`

export const preload = (src: string) => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  document.head.appendChild(link)
}
