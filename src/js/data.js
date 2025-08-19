export function saveData(key, data) {
    if (key === 'acc2cf77-a4a6-4f67-ad4b-89ea1d7c0482') {
        console.log('data', data)
    }
    window.localStorage.setItem(key, data)
}

export function loadData(key) {
    if (key === 'acc2cf77-a4a6-4f67-ad4b-89ea1d7c0482') {
        console.log('loadData')
    }
    return window.localStorage.getItem(key)
}

export function removeData(key) {
    return window.localStorage.removeItem(key)
}