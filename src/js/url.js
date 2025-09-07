export async function parseBlobJson(blobUrl) {
    try {
        const decode = decodeURIComponent(blobUrl)
        let response = await fetch(decode)
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

export function reloadWithoutParams(paramsToRemove) {
    try {
        // 创建URL对象
        const url = new URL(window.location.href)

        // 处理要移除的参数（支持字符串或数组）
        const paramsToRemoveArray = Array.isArray(paramsToRemove)
            ? paramsToRemove
            : [paramsToRemove]

        // 移除指定参数
        paramsToRemoveArray.forEach(param => {
            if (url.searchParams.has(param)) {
                url.searchParams.delete(param);
            }
        })

        // 构建新URL
        const newUrl = url.toString()

        // 只有当URL确实发生变化时才重新加载
        if (newUrl !== window.location.href) {
            window.location.href = newUrl
        } else {
            window.location.reload()
        }
    } catch (error) {
        console.error('Error processing URL:', error)
        // 出错时执行普通重新加载
        window.location.reload()
    }
}

export function changeUrlParams(params) {
    // 当前URL的路径部分
    const path = window.location.pathname;

    // 将参数对象转换为查询字符串
    const queryString = new URLSearchParams(params).toString()

    // 新的URL
    const newUrl = queryString ? `${path}?${queryString}` : path

    history.replaceState({ params }, '', newUrl)
}

export function removeParams(paramToRemove) {
    // 获取当前URL的参数
    const params = new URLSearchParams(window.location.search)

    // 删除指定参数
    params.delete(paramToRemove)

    // 构建新的URL
    const path = window.location.pathname;
    const newUrl = params.toString() ? `${path}?${params.toString()}` : path

    // 更新地址栏
    history.replaceState(null, '', newUrl)
}