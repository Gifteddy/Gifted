export function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date(date))
}

function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloudName) throw new Error('Cloudinary cloud name is not configured (VITE_CLOUDINARY_CLOUD_NAME)')
  if (!uploadPreset) throw new Error('Cloudinary upload preset is not configured (VITE_CLOUDINARY_UPLOAD_PRESET)')
  return { cloudName, uploadPreset }
}

export function uploadToCloudinary(accept = 'image/*'): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { reject(new Error('No file selected')); return }
      try {
        const url = await uploadFileToCloudinary(file)
        resolve(url)
      } catch (e) { reject(e) }
    }
    input.click()
  })
}

function getCloudinaryUploadUrl(cloudName: string, mimeType: string): string {
  if (mimeType.startsWith('image/')) return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  if (mimeType.startsWith('video/')) return `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
  return `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`
}

export async function uploadFileToCloudinary(
  file: File,
  folder?: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const { cloudName, uploadPreset } = getCloudinaryConfig()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  if (folder) formData.append('folder', folder)

  const url = getCloudinaryUploadUrl(cloudName, file.type)

  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            if (!data.secure_url) reject(new Error('Cloudinary did not return a file URL'))
            resolve(data.secure_url as string)
          } else {
            reject(new Error(data.error?.message || `Upload failed (HTTP ${xhr.status})`))
          }
        } catch {
          reject(new Error('Invalid response from Cloudinary'))
        }
      }
      xhr.onerror = () => reject(new Error('Network error - could not reach Cloudinary. Check your connection.'))
      xhr.ontimeout = () => reject(new Error('Upload timed out. Try a smaller file or check your connection.'))
      xhr.timeout = 600000
      xhr.send(formData)
    })
  }

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `Upload failed (HTTP ${res.status})`)
  if (!data.secure_url) throw new Error('Cloudinary did not return a file URL')
  return data.secure_url as string
}
