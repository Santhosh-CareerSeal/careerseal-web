// Creates a cropped image blob from the source image + crop area
export default function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = imageSrc
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const outputSize = 400
      canvas.width = outputSize
      canvas.height = outputSize
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, outputSize, outputSize
      )
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Canvas is empty')); return }
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
        resolve({ file, url: URL.createObjectURL(blob) })
      }, 'image/jpeg', 0.9)
    }
    image.onerror = reject
  })
}
