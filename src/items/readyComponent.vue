<script setup>
import {ElButton, ElDialog, ElIcon, ElInput, ElLoading, ElMessage, ElPopconfirm} from "element-plus"
import {defineEmits, onMounted, ref} from "vue"
import {fetchWithBase} from "@/js/url.js"
import {Close} from "@element-plus/icons-vue"

const emit = defineEmits(['addComponent'])

const dialogVisible = ref(false)

defineExpose({
  open() {
    loadModuleComponents()
    dialogVisible.value = true
  }
})

const components = ref({})
const loadConfigFiles = async () => {
  const files = import.meta.glob('/public/configs/components/*.json')

  const prefix = import.meta.env.BASE_URL === '/one/' ? '' : '/public'
  for (const path in files) {
    try {
      const file = await files[path]()
      components.value[file.name] = { desc: file.desc, path: path.replace('/public', prefix) }
    } catch (error) {
      console.error('加载文件失败:', path, error)
    }
  }
}

const moduleComponents = ref({})
const loadModuleComponents = async () => {
  // 遍历localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('module-')) {
      const module = JSON.parse(localStorage.getItem(key))
      moduleComponents.value[module.name] = module
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
    }, 200)
  }
}

async function addModuleComponent(name) {
  const module = moduleComponents.value[name]
  if (!module) {
    ElMessage.error('组件不存在')
    return
  }
  emit('addComponent', module)
}

function deleteItem(name) {
  delete moduleComponents.value[name]
  localStorage.removeItem('module-' + name)
  ElMessage.success('删除成功')
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
          <div
            v-for="name of Object.keys(components)"
            class="componentItem"
            @click="addComponent(name)"
          >
            <div class="componentName">{{ name }}</div>
            <div class="componentDesc">{{ components[name].desc }}</div>
          </div>
        </div>
        <div class="moduleComponents">
          <div
            v-for="name of Object.keys(moduleComponents)"
            class="componentItem"
            @click="addModuleComponent(name)"
          >
            <div class="componentName">{{ name }}</div>
            <div class="componentDesc">{{ moduleComponents[name].desc }}</div>
            <el-popconfirm
              class="deleteItem"
              title="确定删除此组件"
              placement="top-start"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="deleteItem(name)"
            >
              <template #reference>
                <el-icon class="deleteItem">
                  <Close/>
                </el-icon>
              </template>
            </el-popconfirm>
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
          <el-button class="addComponent" type="primary" @click="addComponent(null)">添加</el-button>
        </div>
      </div>
    </el-dialog>
  </div>

</template>

<style>
.readyComponentDialog {

  .readyComponents, .moduleComponents {
    height: 35%;
    overflow: auto;
  }

  .componentItem {
    display: flex;
    justify-content: space-between;;
    align-items: center;
    padding: 8px;
    float: left;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 8px;
    background: white;
    background-size: 200%;
    cursor: pointer;

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
      margin-left: 8px;
    }

    .deleteItem {
      color: #ff4d4f;
      font-size: 14px;
      cursor: pointer;
      margin-left: 8px;

      &:hover {
        color: white;
        transform: rotate(180deg);
        scale: 1.2;
      }
    }

    &:hover {
      color: white;
      background: #404040;
      border: 1px solid #454545;

      .componentDesc {
        font-size: 14px;
        color: #c6c6c6;
        margin-left: 8px;
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
    max-height: calc(100% - 80px) !important;
  }
}
</style>