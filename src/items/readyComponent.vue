<script setup>
import {ElDialog, ElButton, ElMessage, ElInput, ElLoading} from "element-plus"
import {computed, defineEmits, onMounted, ref, toRefs} from "vue"
import {fetchWithBase} from "@/js/url.js"

const emit = defineEmits(['addComponent'])

const dialogVisible = ref(false)

defineExpose({
  open() {
    dialogVisible.value = true
  }
})

const components = ref({})
const loadConfigFiles = async () => {
  const files = import.meta.glob('/public/configs/components/*.json')

  const prefix = process.env.NODE_ENV === 'production' ? '' : '/public'
  for (const path in files) {
    try {
      const file = await files[path]()
      components.value[file.name] = { desc: file.desc, path: path.replace('/public', prefix) }
    } catch (error) {
      console.error('加载文件失败:', path, error)
    }
  }
}

onMounted(() => {
  loadConfigFiles()
})

async function addComponent(name) {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    if (name) {
      const component = components.value[name]
      if (!component) {
        ElMessage.error('组件不存在')
        return
      }
      // 加载path对应的组件
      const config = await fetchWithBase(component.path)
      emit('addComponent', config)
      dialogVisible.value = false
      return
    }
    if (!configData.value) {
      ElMessage.error('请输入配置数据')
      return
    }
    emit('addComponent', JSON.parse(configData.value))
    dialogVisible.value = false
  } finally {
    setTimeout(() => {
      loading.close()
    }, 500)
  }
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
          <div v-for="name of Object.keys(components)" class="componentItem">
            <div class="componentName">{{ name }}</div>
            <div class="componentDesc">{{ components[name].desc }}</div>
            <el-button class="addComponent" type="primary" @click="addComponent(name)">添加</el-button>
          </div>
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

  .componentItem {
    display: flex;
    justify-content: space-between;;
    align-items: center;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 8px;
    background: rgba(150, 150, 150, 0.3);
    background-size: 200%;

    * {
      transition: all 0.5s ease-in-out;
    }

    .componentName {
      font-size: 16px;
      font-weight: bold;
    }

    .componentDesc {
      font-size: 14px;
      color: #666;
    }

    .addComponent {
      opacity: 0;
    }

    &:hover {
      background: white;

      .componentName {
        font-size: 18px;
      }

      .componentDesc {
        font-size: 16px;
        color: #454545;
      }

      .addComponent {
        opacity: 1;
      }
    }
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
    height: calc(100% - 80px) !important;
  }
}
</style>