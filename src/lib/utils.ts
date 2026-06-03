export function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date(date))
}

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

export function uploadToCloudinary(accept = 'image/*'): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { reject(new Error('No file selected')); return }
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()
        if (data.secure_url) resolve(data.secure_url)
        else reject(new Error('Upload failed'))
      } catch (e) { reject(e) }
    }
    input.click()
  })
}
