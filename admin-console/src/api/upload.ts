/**
 * 文件上传 API
 */

/**
 * 上传合同文件
 */
export const uploadContractFile = (file: File): Promise<{
  url: string
  fileName: string
  fileSize: number
}> => {
  // return request.upload('/upload/contract', formData)
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟文件上传
      const mockUrl = `https://example.com/uploads/contracts/${Date.now()}_${file.name}`
      resolve({
        url: mockUrl,
        fileName: file.name,
        fileSize: file.size
      })
    }, 1000) // 模拟上传延迟
  })
}

/**
 * 上传图片文件
 */
export const uploadImageFile = (file: File): Promise<{
  url: string
  fileName: string
  fileSize: number
}> => {
  // return request.upload('/upload/image', formData)
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUrl = `https://example.com/uploads/images/${Date.now()}_${file.name}`
      resolve({
        url: mockUrl,
        fileName: file.name,
        fileSize: file.size
      })
    }, 800)
  })
}
