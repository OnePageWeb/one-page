<script lang="ts" setup>
import {useI18n} from 'vue-i18n'
import {IndexedDBWrapper} from "@/js/IndexedDBWrapper.js"
import {onMounted, ref} from "vue"
import {ElTag, ElButton} from "element-plus"

const {t} = useI18n()

const db = new IndexedDBWrapper('fileLibrary', 1, [{name: 'files', options: { keyPath: "id", autoIncrement: true }}])
const files = ref([])

onMounted(async () => {
  await db.open()
  await renderFileList()
})

let urls = {}
const renderFileList = async () => {
  // 先销毁
  Object.keys(urls).forEach(key => {
    URL.revokeObjectURL(key)
  })
  urls = {}
  files.value = await db.getAll('files')
  console.log([...files.value])
  files.value.forEach(file => {
    urls[file.id] = URL.createObjectURL(file.file)
  })
}

const fileReceiverRef = ref(null)

const onFileDragOver = (e) => {
  e.preventDefault()
  fileReceiverRef.value.classList.add('onDragged')
}

const onFileDragLeave = (e) => {
  fileReceiverRef.value.classList.remove('onDragged')
}

const onFileDrop = async (e) => {
  e.preventDefault()
  fileReceiverRef.value.classList.remove('onDragged')
  const files = e.dataTransfer.files
  for (const file of files) {
    const record = {
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      created: Date.now()
    };
    await db.add("files", record)
    await renderFileList()
  }
}
</script>

<template>
  <div
      class="fileLibraryContainer"
  >
    <div
        class="filesList"
        @dragover="onFileDragOver"
        @dragleave="onFileDragLeave"
        @drop="onFileDrop"
    >
      <div v-for="file in files" :key="file.id" class="fileItem">
        <img :src="urls[file.id]" alt="">
        <div class="fileNameContainer">
          <el-tag>{{ file.name }}</el-tag>
          <el-button>{{ t('common.delete') }}</el-button>
        </div>
      </div>
    </div>
    <div
        class="fileReceiver"
        ref="fileReceiverRef"/>
  </div>
</template>

<style>
.fileLibraryContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;

  .filesList {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px;

    .fileItem {
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
      padding: 8px;
      border-radius: 8px;

      .fileNameContainer {

      }

      img {
        width: 100%;
        border-radius: 8px;
      }
    }
  }

  .fileReceiver {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;

    &.onDragged {
      background-color: rgba(255, 165, 0, 0.5);
    }
  }
}
</style>