import {ElMessage} from "element-plus"

export async function parseBlobJson(blobUrl) {
    try {
        let response = await fetch(blobUrl)
        // 处理跨域错误
        if (response.status === 403) {
            // 尝试代理服务器
            response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(blobUrl))
        }
        if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('解析失败:', error)
        // 尝试代理服务器
        try {
            const response = await fetch('https://corsproxy.io/?' + encodeURIComponent(blobUrl))
            if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`)
            return await response.json()
        } catch (error) {
            console.error('代理服务器解析失败:', error)
            return null
        }
    }
}

// 获取完整的URL路径
const getFullUrl = (path) => {
    // 确保路径以斜杠开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    // 合并 base URL 和路径
    return `${import.meta.env.BASE_URL}${normalizedPath}`.replace(/\/\//g, '/')
}

// 封装fetch函数
export const fetchWithBase = async (path, options = {}) => {
    const fullUrl = getFullUrl(path)

    try {
        const response = await fetch(fullUrl, options)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return await response.json()
    } catch (error) {
        console.error('Fetch error:', error)
        throw new Error(`Failed to fetch ${path}: ${error.message}`)
    }
}