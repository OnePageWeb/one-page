export async function parseBlobJson(blobUrl) {
  try {
    const response = await fetch(blobUrl)
    if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`)
    return await response.json();
  } catch (error) {
    console.error('解析失败:', error)
    return {}
  }
}