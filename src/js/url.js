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