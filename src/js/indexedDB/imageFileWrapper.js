import {IndexedDBWrapper} from "@/js/indexedDB/indexedDBWrapper.js"
import {v4} from "uuid"

const db = new IndexedDBWrapper('imageLibrary', 1, [{name: 'files', options: {keyPath: "id"}}])
await db.open()

let fileMap = {}

// 初始化
const files = await db.getAll('files')
files.forEach(file => {
  fileMap[file.id] = {
    id: file.id,
    name: file.name,
    type: file.type,
    size: file.size,
    created: file.created,
    url: URL.createObjectURL(file.file)
  }
})

const refreshUrlMap = async () => {
  // 先销毁
  Object.values(fileMap).forEach(file => {
    URL.revokeObjectURL(file.url)
  })
  fileMap = {}
  const files = await db.getAll('files')
  files.forEach(file => {
    fileMap[file.id] = {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      created: file.created,
      url: URL.createObjectURL(file.file)
    }
  })
}

export const addImage = async (file) => {
  const record = {
    id: file.id || v4(),
    name: file.name,
    type: file.type,
    size: file.size,
    file: file,
    created: Date.now()
  }
  await db.add("files", record)
  file.id = record.id
  fileMap[file.id] = {
    id: file.id,
    name: file.name,
    type: file.type,
    size: file.size,
    created: file.created,
    url: URL.createObjectURL(file)
  }
}

export const addImageFile = async (file) => {
  const record = {
    id: file.id || v4(),
    name: file.name,
    type: file.type,
    size: file.size,
    file: file.file,
    created: Date.now()
  }
  await db.add("files", record)
  file.id = record.id
  fileMap[file.id] = {
    id: file.id,
    name: file.name,
    type: file.type,
    size: file.size,
    created: file.created,
    url: URL.createObjectURL(file.file)
  }
}

export const removeImage = async (id) => {
  await db.delete('files', id)
  const file = fileMap[id]
  delete fileMap[id]
  URL.revokeObjectURL(file.url)
}

export const generateUrlKey = (id) => {
  const file = fileMap[id]
  if (file) {
    return `@img{${id}}`
  }
  return ''
}

export const tryReplace = (content) => {
  const pattern = /@img\{(.*?)}/g
  const map = getFileMap()
  // 用 replace + 回调，逐个替换
  return content.replace(pattern, (match, id) => {
    return map[id]?.url || match
  })
}

export const getFile = async (id) => {
  const data = await db.get('files', id)
  if (data) {
    console.log('getFile', id, data)
    return data.file
  }
  return null
}

export const getFileMap = () => {
  return fileMap
}