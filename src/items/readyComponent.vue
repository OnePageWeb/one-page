<script setup>
import {ElDialog, ElButton, ElMessage, ElInput} from "element-plus"
import {computed, defineEmits, ref, toRefs} from "vue"

const emit = defineEmits(['addComponent'])

const dialogVisible = ref(false)


defineExpose({
  open() {
    dialogVisible.value = true
  }
})

function addComponent() {
  if (!configData.value) {
    ElMessage.error('请输入配置数据')
    return
  }
  emit('addComponent', JSON.parse(configData.value))
  dialogVisible.value = false
}

const configData = ref('')
// 处理文件拖拽
function handleFileDrop(e) {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (file.type !== 'application/json') {
    ElMessage.error('请上传JSON文件')
    return
  }
  const reader = new FileReader()
  reader.readAsText(file, 'utf-8')
  reader.onload = () => {
    configData.value = reader.result
  }
}
</script>

<template>

  <div>
    <el-dialog
      v-model="dialogVisible"
      class="commonDialog readyComponentDialog"
      title="添加格子"
      align-center
    >
      <div>
        <div class="readyComponents">

        </div>

        <div class="addComponentContainer">
          <el-input
              v-model="configData"
              type="textarea"
              resize="none"
              placeholder="请输入配置数据或拖拽JSON文件到此处"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
              @keydown.enter.ctrl="addComponent"
          />
          <el-button class="addComponent" type="primary" @click="addComponent">添加</el-button>
        </div>
      </div>
    </el-dialog>
  </div>

</template>

<style>
.readyComponentDialog {

  .readyComponents {
    height: 70%;
  }

  .addComponentContainer {
    height: calc(30% - 8px);
    margin-top: 8px;
    position: relative;

    .el-textarea {
      height: 100%;
    }

    .addComponent {
      position: absolute;
      bottom: 4px;
      right: 4px;
    }
  }

  .el-dialog__body {
    height: calc(100% - 80px);
  }
}
</style>