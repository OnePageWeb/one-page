export class IndexedDBWrapper {

  constructor(dbName, version, stores = []) {
    this.dbName = dbName
    this.version = version
    this.stores = stores
    this.db = null
  }

  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        this.stores.forEach(store => {
          if (!db.objectStoreNames.contains(store.name)) {
            db.createObjectStore(store.name, store.options || { autoIncrement: true })
          }
        })
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onerror = (event) => {
        reject(event.target.error)
      }
    })
  }

  async add(storeName, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readwrite")
      const store = tx.objectStore(storeName)
      const request = store.add(value)

      request.onsuccess = () => resolve(request.result)
      request.onerror = (e) => reject(e.target.error)
    })
  }

  async put(storeName, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readwrite")
      const store = tx.objectStore(storeName)
      const request = store.put(value)

      request.onsuccess = () => resolve(request.result)
      request.onerror = (e) => reject(e.target.error)
    })
  }

  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readonly")
      const store = tx.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = (e) => reject(e.target.error)
    })
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readonly")
      const store = tx.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = (e) => reject(e.target.error)
    })
  }

  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readwrite")
      const store = tx.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = (e) => reject(e.target.error)
    })
  }

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readwrite")
      const store = tx.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = (e) => reject(e.target.error)
    })
  }
}
