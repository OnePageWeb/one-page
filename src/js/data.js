export function saveData(key, data) {
    window.localStorage.setItem(key, data)
}

export function loadData(key) {
    return window.localStorage.getItem(key)
}

export function removeData(key) {
    return window.localStorage.removeItem(key)
}