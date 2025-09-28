<script setup>
import {useI18n} from 'vue-i18n'
import {getFileMap, addImage, removeImage, generateUrlKey} from "@/js/indexedDB/imageFileWrapper.js"
import {onMounted, ref, shallowRef} from "vue"
import {ElButton, ElEmpty, ElPopconfirm, ElText} from "element-plus"
import {success, warning} from "@/js/message"

const {t} = useI18n()

const files = shallowRef([])

onMounted(async () => {
  await renderFileList()
})

const renderFileList = async () => {
  const fileMap = await getFileMap()
  const temp = []
  Object.keys(fileMap).forEach(key => {
    temp.push(fileMap[key])
  })
  files.value = temp
}

const copyFileUrl = (file) => {
  const url = generateUrlKey(file.id)
  // 复制url到剪切板
  navigator.clipboard.writeText(url)
  success(t('success.copy') + ' - ' + url)
}

const preview = (file) => {
  window.open(file.url)
}

const deleteFile = async (file) => {
  await removeImage(file.id)
  files.value = files.value.filter(f => f.id !== file.id)
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
  const transferFiles = e.dataTransfer.files
  for (const file of transferFiles) {
    // 仅允许图片格式
    if (file.type?.indexOf('image') > -1) {
      await addImage(file)
    } else {
      warning(t('error.onlyUploadImageFile') + ' - ' + file.name)
    }
  }
  await renderFileList()
}
</script>

<template>
  <div
      class="imageLibraryContainer"
      @dragover="onFileDragOver"
      @dragleave="onFileDragLeave"
      @drop="onFileDrop">
    <el-text style="margin: 16px;width: 100%">{{ t('imageLibrary.desc') }}</el-text>
    <div
        class="filesList"
        v-if="files.length > 0"
    >
      <div v-for="file in files" :key="file.id" class="fileItem">
        <img :src="file.url" alt="" @click="copyFileUrl(file)">
        <div class="fileNameContainer">
          <el-text truncated>{{ file.name }}</el-text>
          <div class="buttonContainer">
            <el-button @click="preview(file)">{{ t('imageLibrary.preview') }}</el-button>
            <el-popconfirm
                :title="t('imageLibrary.deleteConfirm')"
                :confirm-button-text="t('common.confirm')"
                :cancel-button-text="t('common.cancel')"
                width="300"
                @confirm="deleteFile(file)"
            >
              <template #reference>
                <el-button>{{ t('common.delete') }}</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-else style="z-index: 1" description="No file"/>
    <div
        class="fileReceiver"
        ref="fileReceiverRef"/>
  </div>
</template>

<style>
.imageLibraryContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;

  .filesList {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 4px;
    z-index: 1;

    .fileItem {
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.5);
      padding: 16px;
      border-radius: 8px;

      .fileNameContainer {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .el-text {
          width: calc(100% - 16px);
          margin: 8px;
          align-items: center;
        }

        .buttonContainer {
          display: flex;
          margin-top: 8px;
          align-items: flex-end;
        }
      }

      img {
        width: 100%;
        border-radius: 8px;
        cursor: copy;

        &:hover {
          box-shadow: 0 0 16px rgba(0, 0, 0, 0.8);
        }
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
    z-index: 2;

    &.onDragged {
      background-color: rgba(255, 165, 0, 0.3);
      backdrop-filter: blur(4px);
    }
  }
}
</style>