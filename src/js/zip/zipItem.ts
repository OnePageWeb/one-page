import JSZip from 'jszip'

export class ZipItem {

    zip: JSZip

    constructor(initZip: JSZip) {
        this.zip = initZip || new JSZip()
    }

    file(fileName: string, file: File) {
        this.zip.file(fileName, file)
    }

    json(fileName: string, json: object) {
        // 添加JSON数据到ZIP
        if (json && Object.keys(json).length > 0) {
            this.zip.file(fileName, JSON.stringify(json, null, 2))
        }
    }

    folder(folderName: string): ZipItem {
        return new ZipItem(this.zip.folder(folderName))
    }

    async build(fileName: string) {
        // 生成ZIP文件并下载
        await this.zip.generateAsync({type: 'blob'}).then((content: Blob) => {
            const url = URL.createObjectURL(content)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        })
    }
}
