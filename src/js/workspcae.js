import {loadDataDirect, saveDataDirect} from "@/js/data.js"

let nowWorkspace = ''
export const DEFAULT_WORKSPACE = 'default'
export const TEMP_WORKSPACE = 'temp'

export function getWorkspacePrefix(workspace) {
    if (!workspace) {
        workspace = nowWorkspace
    }
    if (!workspace || workspace === '' || workspace === DEFAULT_WORKSPACE) {
        return ''
    }
    return workspace + '-'
}

export function initWorkspace() {
    nowWorkspace = window.localStorage.getItem('nowWorkspace')
    const tempFlag = loadDataDirect(TEMP_WORKSPACE)
    if (tempFlag === null || tempFlag === undefined) {
        // 不存在在尝试删除
        deleteWorkspace(TEMP_WORKSPACE)
    }
}

export function setWorkspace(workspace) {
    if (!workspace || workspace === '' || workspace === DEFAULT_WORKSPACE) {
        nowWorkspace = DEFAULT_WORKSPACE
    } else if (nowWorkspace === workspace) {
        return
    } else {
        saveDataDirect('lastWorkspace', nowWorkspace)
        nowWorkspace = workspace
    }
    if (workspace.toLowerCase() === TEMP_WORKSPACE) {
        saveDataDirect(TEMP_WORKSPACE, nowWorkspace)
    }
    const ws= listWorkspace()
    if (ws === null) {
        window.localStorage.setItem('workspace', JSON.stringify([nowWorkspace]))
    } else {
        const wsList = ws
        if (!wsList.includes(nowWorkspace)) {
            wsList.push(nowWorkspace)
            window.localStorage.setItem('workspace', JSON.stringify(wsList))
        }
    }
    window.localStorage.setItem('nowWorkspace', nowWorkspace)
}

export function listWorkspace() {
    const ws = window.localStorage.getItem('workspace')
    if (!ws) {
        return [DEFAULT_WORKSPACE]
    }
    const parse = JSON.parse(ws)
    if (!parse.includes(DEFAULT_WORKSPACE)) {
        parse.push(DEFAULT_WORKSPACE)
    }
    return parse
}

export function getNowWorkspace() {
    return nowWorkspace ? nowWorkspace : DEFAULT_WORKSPACE
}

export function clearWorkspace(workspace = nowWorkspace) {
    // 删除存储
    const workspacePrefix = getWorkspacePrefix(workspace)
    const needDeleteKeys = []
    for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key.startsWith(workspacePrefix)) {
            needDeleteKeys.push(key)
        }
    }
    // 删除存储
    needDeleteKeys.forEach(key => {
        window.localStorage.removeItem(key)
    })
}

export function deleteWorkspace(workspace) {
    clearWorkspace(workspace)
    // 删除工作空间
    const wsList = listWorkspace()
    if (wsList?.includes(workspace)) {
        wsList.splice(wsList.indexOf(workspace), 1)
        window.localStorage.setItem('workspace', JSON.stringify(wsList))
    }
    // 切换当前工作区
    if (workspace === getNowWorkspace()) {
        const last = loadDataDirect('lastWorkspace')
        if (wsList.includes(last)) {
            setWorkspace(last)
        } else {
            setWorkspace(DEFAULT_WORKSPACE)
        }
    }
}
