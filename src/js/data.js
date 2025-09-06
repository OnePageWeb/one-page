import {getWorkspacePrefix} from "@/js/workspcae.js"

export function saveData(key, data) {
    window.localStorage.setItem(getWorkspacePrefix() + key, data)
}

export function saveDataDirect(key, data) {
    window.localStorage.setItem(key, data)
}

export function loadData(key) {
    return window.localStorage.getItem(getWorkspacePrefix() + key)
}

export function loadDataDirect(key) {
    return window.localStorage.getItem(key)
}

export function removeData(key) {
    return window.localStorage.removeItem(getWorkspacePrefix() + key)
}

export function removeDataDirect(key) {
    return window.localStorage.removeItem(key)
}

export function clearData() {
    window.localStorage.clear()
}

export function exportData(data, filename = 'config.json') {
    let jsonStr = data
    if (data === null || data === undefined) {
        return
    }
    if (typeof data === 'object') {
        jsonStr = JSON.stringify(data, null, 2)
    }
    const blob = new Blob([jsonStr], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    // 4. 触发下载
    document.body.appendChild(a)
    a.click()
    // 5. 清理
    setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, 100)
}
