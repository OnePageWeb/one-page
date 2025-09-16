<script setup>
import {ElButton, ElIcon, ElImage, ElInput, ElLoading, ElPopconfirm, ElPopover} from "element-plus"
import {computed, defineEmits, onMounted, ref} from "vue"
import {fetchWithBase} from "@/js/url.js"
import {Close, Search} from "@element-plus/icons-vue"
import {useI18n} from "vue-i18n"
import commonDialog from "@/items/commonDialog.vue"
import {error, success} from "@/js/message.js"

const {t} = useI18n()

const emit = defineEmits(['addComponent'])

const dialogVisible = ref(false)

defineExpose({
  open() {
    loadModuleComponents()
    filterName.value = ''
    dialogVisible.value = true
  }
})

const components = ref({})
const filterComponents = computed(() => {
  return filterComponentName(filterName.value, components.value)
})
const loadConfigFiles = async () => {
  const files = import.meta.glob('/public/configs/components/*.json')

  for (const path in files) {
    try {
      const file = await files[path]()
      components.value[file.name] = {desc: file.desc, path: path.replace('/public', '')}
    } catch (error) {
      console.error(t('error.load'), path, error)
    }
  }
}

const filterComponentName = (name, components) => {
  if (!filterName.value) {
    return components
  }
  const filter = filterName.value.toLowerCase()
  const result = {}
  for (const name in components) {
    if (name.toLowerCase().includes(filter) || components[name].desc?.includes(filter)) {
      result[name] = components[name]
    }
  }
  return result
}

const moduleComponents = ref({})
const filterModuleComponents = computed(() => {
  return filterComponentName(filterName.value, moduleComponents.value)
})
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

const filterName = ref('')

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
        error(t('error.componentNotExist'))
        return
      }
      // 加载path对应的组件
      const config = await fetchWithBase(component.path)
      emit('addComponent', config)
      dialogVisible.value = false
      return
    }
    if (!configData.value) {
      error(t('error.noConfigContent'))
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
    error(t('error.componentNotExist'))
    return
  }
  emit('addComponent', module)
}

function deleteItem(name) {
  delete moduleComponents.value[name]
  localStorage.removeItem('module-' + name)
  success(t('success.delete'))
}

const configData = ref('')

// 处理文件拖拽
function handleFileDrop(e) {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (file.type !== 'application/json') {
    error(t('error.uploadJson'))
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
  <common-dialog
      class="readyComponentDialog"
      :title="t('component.add')"
      :visible="dialogVisible"
      @closed="dialogVisible = false"
  >
    <div>
      <el-input
          v-model="filterName"
          class="filterName"
          resize="none"
          :placeholder="t('placeholder.componentFilter')"
      >
        <template #prepend>
          <el-icon>
            <Search/>
          </el-icon>
        </template>
      </el-input>
      <div class="readyComponents">

        <el-popover
            class="box-item"
            v-for="name of Object.keys(filterComponents)"
            width="300"
            placement="bottom"
            popper-class="componentItem"
            :show-after="200"
            :hide-after="10"
        >
          <template #reference>
            <div
                class="componentItem"
                @click="addComponent(name)"
            >
              <div class="componentName">{{ name }}</div>
              <div class="componentDesc">{{ components[name].desc }}</div>
            </div>
          </template>
          <el-image :src="'./imgs/ready/' + name + '.png'"/>
        </el-popover>
        <div class="componentAreaName">{{ t('component.defined') }}</div>
      </div>
      <div class="moduleComponents">
        <div
            v-for="name of Object.keys(filterModuleComponents)"
            class="componentItem"
            @click="addModuleComponent(name)"
        >
          <div class="componentName">{{ name }}</div>
          <div class="componentDesc">{{ moduleComponents[name].desc }}</div>
          <el-popconfirm
              class="deleteItem"
              :title="t('component.delete.title')"
              placement="top-start"
              :confirm-button-text="t('common.confirm')"
              :cancel-button-text="t('common.cancel')"
              @confirm="deleteItem(name)"
          >
            <template #reference>
              <el-icon class="deleteItem" @click.prevent.stop>
                <Close/>
              </el-icon>
            </template>
          </el-popconfirm>
        </div>
        <div class="componentAreaName">{{ t('component.custom') }}</div>
      </div>

      <div class="addComponentContainer">
        <el-input
            v-model="configData"
            type="textarea"
            resize="none"
            :placeholder="t('placeholder.componentInput')"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
            @keydown.enter.ctrl="addComponent"
        />
        <el-button class="addComponent" type="primary" @click="addComponent(null)">{{ t('common.add') }}</el-button>
      </div>
    </div>
  </common-dialog>
</template>

<style>
.readyComponentDialog {

  .filterName {
    width: 100%;
    height: 40px;
    font-size: 16px;
    font-weight: bold;
    padding: 0 8px;
  }

  .readyComponents, .moduleComponents {
    min-height: 10vh;
    max-height: 25vh;
    overflow: auto;
    position: relative;
  }

  .componentAreaName {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    font-size: 4vw;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: -1;
    color: rgba(221, 221, 221, 0.1);
    user-select: none;
  }

  .readyComponents {
    border-bottom: 2px dashed;
  }

  .componentItem {
    display: flex;
    justify-content: space-between;;
    align-items: center;
    padding: 8px 16px;
    float: left;
    border: 2px solid #ffffff;
    border-radius: 24px;
    margin: 8px;
    background: rgba(255, 255, 255, 0.8);
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
      border: 2px solid #454545;

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