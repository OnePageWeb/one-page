<template>
  <div style="height: 100%; width: 100%; position: relative;">
    <div
      :class="['menu', showMenu ? 'menu-show' : 'menu-hide']"
    >
      <el-tooltip
        :content="$t('common.close')"
        placement="right"
      >
        <el-icon class="hideMenu" @click="showMenu = false">
          <Top/>
        </el-icon>
      </el-tooltip>
      <el-text class="menuTitle" truncated>{{ $t('component.add') }}</el-text>
      <el-button @click="readyComponent.open()" class="btn" :icon="CirclePlus" plain>{{
          $t('component.add')
        }}
      </el-button>
      <el-select class="addItemSelect" :placeholder="$t('component.addItem')" @change="addItemWithEdit">
        <el-popover
          class="box-item"
          v-for="item in itemType"
          :title="item.label"
          :content="item.desc"
          width="300"
          placement="right-start"
        >
          <template #reference>
            <div>
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <div class="addItemIcon" :style="{backgroundColor: item.color}"/>
                {{ item.label }}
              </el-option>
            </div>
          </template>
        </el-popover>
      </el-select>
      <el-text class="menuTitle" truncated>{{ $t('layout.edit') }}</el-text>
      <el-checkbox v-model="enableMove" :label="$t('layout.enableMove')" border/>
      <el-checkbox v-model="enableEdit" :label="$t('layout.enableEdit')" border/>
      <el-text class="menuTitle" truncated>{{ $t('style.title') }}</el-text>
      <el-button @click="editGlobalStyle" class="btn" :icon="Picture" plain>{{ $t('style.global') }}</el-button>
      <el-text class="menuTitle" truncated>{{ $t('config.title') }}</el-text>
      <el-button @click="openLoadConfig" class="btn" :icon="Edit" plain>{{ $t('config.load') }}</el-button>
      <el-button @click="openWorkspaceHolder" class="btn" :icon="Monitor" plain>{{
          $t('workspace.settings')
        }}
      </el-button>
      <el-text class="menuTitle" truncated>{{ $t('lang.title') }}</el-text>
      <el-select class="langSelect" v-model="currentLang">
        <el-option
          v-for="item in langList"
          :key="item"
          :label="t(`lang.${item}`)"
          :value="item"
        />
      </el-select>
    </div>
    <crosshair-background v-if="enableMove"></crosshair-background>
    <div ref="gridContainer" style="height: 100%;width: 100%;overflow-y: auto;scrollbar-width: none">
      <div ref="gridEl" class="grid-stack"></div>
    </div>

    <!-- 配置加载弹窗 -->
    <el-dialog
      :title="$t('config.load')"
      v-model="configLoaderVisible"
      width="50%"
      class="configDialog commonDialog"
      align-center
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="configLoaderHeader">
          <div :id="titleId" :class="titleClass">{{ $t('config.load') }}</div>
          <el-icon style="margin-left: 8px;cursor: pointer;" @click="configLoaderTipVisible = true">
            <InfoFilled/>
          </el-icon>
        </div>
      </template>
      <el-input
        v-model="configData"
        class="globeStyleInput"
        type="textarea"
        resize="none"
        :placeholder="$t('placeholder.configInput')"
        @dragover.prevent
        @drop.prevent="handleFileDrop"
      />

      <!-- 配置提示弹窗 -->
      <el-dialog class="commonDialog" v-model="configLoaderTipVisible" title="Tips" width="50%" align-center>
        <div>
          <div style="font-size:large;font-weight: bold;margin-bottom: 4px">
            {{ $t('text.configTip1') }}
          </div>
          <div style="font-size:large;font-weight: bold;margin-bottom: 4px">
            {{ $t('text.configTip2') }}
          </div>
          <div style="margin-bottom: 4px">{{ $t('text.configTip3') }}
          </div>
          <div style="margin-bottom: 4px">{{ $t('text.configTip4') }}</div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="configLoaderTipVisible = false">{{ $t('common.close') }}</el-button>
          </div>
        </template>
      </el-dialog>
      <template #footer>
        <el-button type="primary" @click="downloadConfig">{{ $t('common.download') }}</el-button>
        <el-popconfirm
          :title="$t('config.loadConfirm')"
          placement="top-end"
          :confirm-button-text="$t('common.confirm')"
          :cancel-button-text="$t('common.cancel')"
          width="300"
          @confirm="loadConfig()"
        >
          <template #reference>
            <el-button type="primary">{{ $t('config.load') }}</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm
          :title="$t('config.clearConfirm')"
          placement="top-end"
          :confirm-button-text="$t('common.confirm')"
          :cancel-button-text="$t('common.cancel')"
          width="240"
          @confirm="clearConfig(true)"
        >
          <template #reference>
            <el-button type="danger">{{ $t('common.clear') }}</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-dialog>

    <!-- 组件样式弹窗 -->
    <el-dialog
      title="组件样式"
      v-model="isEditComponentStyle"
      width="50%"
      class="configDialog commonDialog"
      align-center
    >
      <el-input
        v-model="componentStyle"
        class="globeStyleInput"
        type="textarea"
        resize="none"
        :placeholder="$t('placeholder.styleInput')"
      />
      <template #footer>
        <el-button type="primary" @click="refreshComponentStyle(curComponentId)">{{ $t('common.refresh') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="zoomInDialogVisible"
      class="zoomInDialog"
      width="95%"
      align-center
      :show-close="false"
      @close="onZoomInClose"
    >
      <div id="zoomInElement" class="zoomInElement"></div>
    </el-dialog>

    <readyComponent
      ref="readyComponent"
      @addComponent="addComponent"
    />

    <globalStyle
      ref="globalStyle"
      @load-style="loadStyle"
    />

    <workspaceHolder
      ref="workspaceHolder"
    />

    <name-desc-dialog
      ref="nameDescDialog"
      :title="$t('component.addToModule')"
      :name-text="$t('component.name')"
      :desc-text="$t('component.desc')"
      @save="addModule"
    />

    <div
      :class="['shortcutKeys', {'transparent': !ctrlDown}]"
    >
      <div class="shortcutKeysList">
        <div class="shortcutKeysItem">
          <div class="shortcutKeysItemTitle">Q</div>
          <el-icon>
            <Rank/>
          </el-icon>
          <div class="shortcutKeysItemDesc">{{ $t('shortcut.q') }}</div>
        </div>
        <div class="shortcutKeysItem">
          <div class="shortcutKeysItemTitle">E</div>
          <el-icon>
            <Edit/>
          </el-icon>
          <div class="shortcutKeysItemDesc">{{ $t('shortcut.e') }}</div>
        </div>
        <div class="shortcutKeysItem">
          <div class="shortcutKeysItemTitle">D</div>
          <el-icon>
            <Operation/>
          </el-icon>
          <div class="shortcutKeysItemDesc">{{ $t('shortcut.d') }}</div>
        </div>
        <div class="shortcutKeysItem">
          <div class="shortcutKeysItemTitle">R</div>
          <el-icon>
            <Rank/>
          </el-icon>
          <div class="shortcutKeysItemDesc">{{ $t('shortcut.r') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {createApp, defineComponent, h, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {GridStack} from 'gridstack'
import {
  ElButton,
  ElCheckbox,
  ElDialog,
  ElIcon,
  ElInput,
  ElLoading,
  ElMessage,
  ElOption,
  ElPopconfirm,
  ElPopover,
  ElSelect,
  ElText,
  ElTooltip
} from 'element-plus'
import 'gridstack/dist/gridstack.min.css'
import operateButtons from './items/operateButtons.vue'
import textComponent from './components/TextComponent.vue'
import noteComponent from "./components/NoteComponent.vue"
import searchComponent from './components/SearchComponent.vue'
import iframeComponent from './components/IframeComponent.vue'
import htmlComponent from "./components/HtmlComponent.vue"
import linkComponent from './components/LinkComponent.vue'
import buttonComponent from './components/ButtonComponent.vue'
import functionComponent from './components/FunctionComponent.vue'
import recordComponent from "./components/RecordComponent.vue"
import inputComponent from "@/components/InputComponent.vue"
import ReadyComponent from "@/items/readyComponent.vue"
import {v4} from 'uuid'
import {startsWith} from "@/js/string.js"
import {fetchWithBase, parseBlobJson, reloadWithoutParams} from "@/js/url.js"
import {CirclePlus, Edit, InfoFilled, Monitor, Operation, Picture, Rank, Top} from "@element-plus/icons-vue"
import WorkspaceHolder from "@/items/workspaceHolder.vue"
import {exportData, loadData, removeData, saveData, saveDataDirect,} from "@/js/data.js"
import {setWorkspace} from "@/js/workspcae.js"
import CrosshairBackground from "@/items/crosshairBackground.vue"
import GlobalStyle from "@/items/globalStyle.vue"
import NameDescDialog from "@/items/nameDescDialog.vue"
import i18n from './i18n'
import { changeLanguage, getCurrentLanguage } from "./i18n/utils.js"

import {useI18n} from 'vue-i18n'
const {t} = useI18n()

const currentLang = ref(getCurrentLanguage())
watch(currentLang, (newLang) => {
  changeLanguage(newLang)
})
const langList = [
  'zh',
  'en'
]

const itemType = [
  {
    value: 'text',
    label: t('itemType.text.name'),
    desc: t('itemType.text.desc'),
    color: '#ffffff',
    component: textComponent
  },
  {
    value: 'note',
    label: t('itemType.notes.name'),
    desc: t('itemType.notes.desc'),
    color: '#ff86e7',
    component: noteComponent
  },
  {
    value: 'search',
    label: t('itemType.search.name'),
    desc: t('itemType.search.desc'),
    color: '#000000',
    component: searchComponent
  },
  {
    value: 'iframe',
    label: t('itemType.iframe.name'),
    desc: t('itemType.iframe.desc'),
    color: '#439af8',
    component: iframeComponent
  },
  {
    value: 'html',
    label: t('itemType.html.name'),
    desc: t('itemType.html.desc'),
    color: '#eae25f',
    component: htmlComponent
  },
  {
    value: 'link',
    label: t('itemType.link.name'),
    desc: t('itemType.link.desc'),
    color: '#3fd165',
    component: linkComponent
  },
  {
    value: 'button',
    label: t('itemType.button.name'),
    desc: t('itemType.button.desc'),
    color: '#47c8c8',
    component: buttonComponent
  },
  {
    value: 'input',
    label: t('itemType.input.name'),
    desc: t('itemType.input.desc'),
    color: '#ff5d5d',
    component: inputComponent
  },
  {
    value: 'function',
    label: t('itemType.function.name'),
    desc: t('itemType.function.desc'),
    color: '#272727',
    component: functionComponent
  },
  {
    value: 'record',
    label: t('itemType.record.name'),
    desc: t('itemType.record.desc'),
    color: '#5dffa9',
    component: recordComponent
  },
]
// 菜单是否显示
let showMenu = ref(false)

// 格子高度
let itemHeight = 25
// 总列数
const columns = 48
// GridStack实例
let grid
// 锁定状态
const enableEdit = ref(false)
const enableMove = ref(false)
const ctrl = ref(false)
watch(enableMove, b => {
  if (b) {
    enabledMove()
  } else {
    disabledMove()
  }
})

const gridEl = ref(null)

const ctrlDown = ref(false)

function keyListener(event) {
  if (event.altKey && event.type === 'keydown') {
    ctrlDown.value = true
    if (event.key === 'q') {
      enableMove.value ? disabledMove() : enabledMove()
    } else if (event.key === 'e') {
      enableEdit.value ? disabledEdit() : enabledEdit()
    } else if (event.key === 'd') {
      showMenu.value = !showMenu.value
    } else if (event.key === 'r') {
      window.location.reload()
    }
    event.preventDefault()
  } else {
    ctrlDown.value = false
  }
}

function mouseDown(event) {
  ctrlDown.value = false
}

const globalStyle = ref(null)
// 仅查看模式
const viewMode = ref(false)

// 初始化GridStack
onMounted(async () => {
  // 获取浏览器窗口高度
  const windowHeight = window.innerHeight
  // 按照窗口宽度计算格子高度
  itemHeight = Math.floor(windowHeight / columns)

  // 初始化GridStack
  grid = GridStack.init({
    // 每个格子的高度（px）
    cellHeight: itemHeight,
    // 格子间距
    margin: 0,
    // 允许格子自由浮动
    float: true,
    // 最小行数
    minRow: 2,
    // 始终显示调整手柄
    alwaysShowResizeHandle: false,
    column: columns,
  })

  // 从地址栏尝试获取config参数
  const urlParams = new URLSearchParams(window.location.search)
  // 设定打开的工作区
  const workspace = urlParams.get('workspace')
  if (workspace) {
    setWorkspace(workspace)
  }
  // 初始化配置
  const configUrl = urlParams.get('config')
  if (configUrl) {
    ElMessage.info(t('config.loading'))
    configData.value = configUrl
    if (await loadConfig(false)) {
      reloadWithoutParams('config')
    }
  }

  // 恢复布局
  const layout = loadData('layout')
  if (layout) {
    const parse = JSON.parse(layout)
    for (let el of parse) {
      const componentId = el.id
      // 添加格子
      addItem(el.type, el.x, el.y, el.w, el.h, componentId)

      // 恢复组件样式
      const componentStyle = loadData(componentId + '-style')
      if (componentStyle) {
        loadComponentStyle(componentId, componentStyle)
      }
    }
  } else {
    configData.value = await loadJsonData()
    await loadConfig(true)
  }

  disabledEdit()
  disabledMove()

  // 监听拖拽和调整大小事件
  grid.on('dragstop resizestop', (event, el) => {
    saveLayout()
  })

  // 监听按键
  window.addEventListener('keydown', keyListener)
  window.addEventListener('keyup', keyListener)
  window.addEventListener('mousedown', mouseDown)
})

// 注销按键监听
onUnmounted(() => {
  window.removeEventListener('keydown', keyListener)
  window.removeEventListener('keyup', keyListener)
  window.removeEventListener('mousedown', mouseDown)
})

function editGlobalStyle() {
  globalStyle.value.open()
}

const loadJsonData = async () => {
  try {
    // 使用绝对路径指向 public 文件夹
    return await fetchWithBase('/first-config.json')
  } catch (err) {
    console.error(t('error.load'), err)
  }
}

const elementMap = {}

// 保存布局
function saveLayout() {
  const nodes = grid.engine.nodes; // 获取所有格子节点数据
  const simplifiedLayout = nodes.map(node => ({
    type: node.el?.type,
    id: node.el?.id,
    x: node.x,
    y: node.y,
    w: node.w,
    h: node.h,
  }))
  // 保存布局数据
  saveData('layout', JSON.stringify(simplifiedLayout))
}

// 锁定布局
function enabledEdit() {
  enableEdit.value = true
}

// 开启移动
function enabledMove() {
  grid.enableMove(true)
  grid.enableResize(true)
  enableMove.value = true
}

// 解锁布局
function disabledEdit() {
  enableEdit.value = false
}

// 关闭移动
function disabledMove() {
  grid.enableMove(false)
  grid.enableResize(false)
  enableMove.value = false
}

// 添加空白格子
function createItemComponent(type, componentItem) {
  return {
    props: ['id', 'enableEdit', 'enableMove', 'ctrl'],
    setup(props, {expose}) {
      const componentItemRef = ref(null)
      // 暴露方法给父组件
      expose({
        load(data) {
          componentItemRef.value.load(data)
        },
        save() {
          componentItemRef.value.save()
        },
      })
      return () => h('div', {
        id: props.id + '-container',
        style: {
          height: '100%',
          width: '100%',
          position: 'relative'
        },
      }, [
        h(componentItem, {
          ref: componentItemRef,
          style: {position: 'absolute'},
          id: props.id,
          enableEdit: props.enableEdit,
          enableMove: props.enableMove
        }),
        h(operateButtons, {
          style: {position: 'absolute',},
          id: props.id,
          type: type,
          enableEdit: enableEdit,
          enableMove: enableMove,
          ctrl: props.ctrl,
          onOnDelete: deleteItem,
          onOnStyleEdit: editStyle,
          onZoomIn: zoomIn,
          onExportComponent: exportComponent,
          onCopy: copy,
          onModule: addModuleConfirm,
        }),
      ])
    }
  }
}

const addItemWithEdit = (type) => {
  const id = addItem(type)
  // 保存布局
  saveLayout()
  enabledEdit()
  enabledMove()
  return id
}

const addItem = (type, x, y, w = '4', h = '4', id) => {
  // 创建格子DOM
  const itemEl = document.createElement('div')
  itemEl.className = 'grid-stack-item'
  itemEl.type = type // 自定义类型
  itemEl.id = id || v4().replace('-', '')
  itemEl.setAttribute('gs-w', w)
  itemEl.setAttribute('gs-h', h)
  if (x !== undefined) itemEl.setAttribute('gs-x', x)
  if (y !== undefined) itemEl.setAttribute('gs-y', y)
  // 挂载Vue组件到格子
  const component = itemType.find(item => item.value === type)?.component
  if (!component) {
    ElMessage.error(t('error.noSuchComponent_') + type)
    return
  }
  const app = createApp(createItemComponent(type, component), {
    id: itemEl.id,
    enableEdit: enableEdit,
    enableMove: enableMove,
    ctrl: ctrl
  })
  app.use(i18n)
  elementMap[itemEl.id] = app.mount(itemEl)

  itemEl.element = app
  // 添加到GridStack
  grid.makeWidget(itemEl)
  return itemEl.id
}

function addComponent(data) {
  const id = addItemWithEdit(data.type, data.x, data.y, data.w, data.h, data.id)
  if (id) {
    // 加载组件数据
    const element = elementMap[id]
    if (element) {
      if (data.config) {
        element.load(data.config)
        element.save()
      }
      if (data.style) {
        // 加载组件样式
        loadComponentStyle(id, data.style)
        // 保存组件样式
        saveData(id + '-style', data.style)
      }
    } else {
      ElMessage.error(t('error.noSuchComponent_') + data.type)
    }
  }
}

// 删除格子
function deleteItem(id) {
  nextTick(() => {
    grid.removeWidget(document.getElementById(id.value))
    // 删除本地存储
    removeData(id.value)
    // 保存布局
    saveLayout()
  })
}

// 编辑组件样式
const curComponentId = ref('')
const isEditComponentStyle = ref(false)
const componentStyle = ref('')

function editStyle(id) {
  curComponentId.value = id.value
  // 获取组件样式
  componentStyle.value = loadData(id.value + '-style')
  isEditComponentStyle.value = true
}

function loadStyle(id, styleContent) {
  // 先删除旧的样式
  const oldStyle = document.getElementById(id)
  if (oldStyle) {
    document.head.removeChild(oldStyle)
  }
  const style = document.createElement('style')
  style.id = id
  style.innerHTML = styleContent
  document.head.appendChild(style)
}

function loadComponentStyle(id, styleContent) {
  // 先删除旧的样式
  const oldStyle = document.getElementById(id + '-style')
  if (oldStyle) {
    document.head.removeChild(oldStyle)
  }
  if (!styleContent || styleContent.trim().length === 0) {
    return
  }
  const style = document.createElement('style')
  style.id = id + '-style'
  style.innerHTML = `[id='${id}'] {
    ${styleContent}
  }`
  document.head.appendChild(style)
}

function refreshComponentStyle(id) {
  const idValue = id.value || curComponentId.value
  loadComponentStyle(idValue, componentStyle.value)
  // 保存组件样式
  saveData(idValue + '-style', componentStyle.value)
  isEditComponentStyle.value = false
}

// 放大组件
let zoomInId = null
let zoomApp = null
const zoomInDialogVisible = ref(false)

function createZoomIn(id, componentItem) {
  return defineComponent({
    props: ['enableEdit', 'enableMove'], // 移除id prop
    setup(props) {
      return () => h(componentItem, {
        ref: 'componentItem',
        style: {position: 'absolute'},
        id: id.value + '-container', // 直接使用id.value
        enableEdit: props.enableEdit,
        enableMove: props.enableMove,
      })
    }
  })
}

function zoomIn(id, type) {
  const find = itemType.find(item => item.value === type.value)
  if (!find) {
    ElMessage.error(t('error.noSuchComponent_') + type.value)
    return
  }
  zoomInId = id.value
  // find.component是组件的vue对象
  zoomInDialogVisible.value = true
  nextTick(() => {
    const elementById = document.getElementById('zoomInElement')
    if (elementById) {
      elementById.innerHTML = ''
      if (zoomApp) {
        zoomApp.unmount()
      }
      zoomApp = createApp(createZoomIn(id.value, find.component), {
        id: id.value,
        enableEdit: enableEdit,
        enableMove: enableMove
      })
      zoomApp.use(i18n)
      zoomApp.mount(elementById)
      if (elementById.firstElementChild) {
        elementById.firstElementChild.id = id.value
      }
    }
  })
}

function onZoomInClose() {
  if (zoomApp) {
    zoomApp.unmount()
    zoomApp = null
  }
  // 刷新组件数据
  if (enableEdit) {
    const element = elementMap[zoomInId]
    if (element) {
      element.load()
    }
  }
}

// 复制
function copy(id, type) {
  const componentData = exportComponentData(id, type)
  addComponent(componentData)
}

function exportComponentData(id, type) {
  const idValue = id.value || id
  const componentData = {}
  // 组件配置
  const componentConfig = loadData(idValue)
  if (componentConfig) {
    componentData.config = componentConfig
  }
  // 组件样式
  const componentStyle = loadData(idValue + '-style')
  if (componentStyle) {
    componentData.style = componentStyle
  }
  componentData.type = type.value || type
  return componentData
}

const nameDescDialog = ref(null)
let moduleId = null
let moduleType = null

function addModuleConfirm(id, type) {
  moduleId = id.value
  moduleType = type.value
  nameDescDialog.value.open()
}

function addModule({name, desc}) {
  if (!name) {
    ElMessage.error(t('error.noName'))
    return
  }
  const componentData = exportComponentData(moduleId, moduleType)
  const moduleData = {
    name, desc,
    ...componentData
  }
  saveDataDirect('module-' + name, JSON.stringify(moduleData))
  ElMessage.success(t('success.add'))
  nameDescDialog.value.cancel()
}

// 导出组件
function exportComponent(id, type) {
  const componentData = exportComponentData(id, type)
  exportData(componentData, id.value + '.json')
}

const readyComponent = ref(null)

let configData = ref('')
let configLoaderVisible = ref(false)
let configLoaderTipVisible = ref(false)

// 打开加载配置弹窗
function openLoadConfig() {
  const config = generateConfig()
  configData.value = JSON.stringify(config)
  configLoaderVisible.value = true
}

// 生成配置对象
function generateConfig() {
  // 汇总所有配置为一个json
  let config = {
    globalStyle: globalStyle.value.generateStyleConfig(),
    layout: JSON.parse(loadData('layout')),
    components: []
  }
  // 所有组件
  const nodes = grid.engine.nodes; // 获取所有格子节点数据
  const ids = nodes.map(node => node.el.id)
  for (let id of ids) {
    // 组件样式
    const componentStyle = loadData(id + '-style')
    // 组件数据
    const componentData = loadData(id)
    // 组件类型
    const componentType = document.getElementById(id).type
    config.components.push({
      id: id,
      style: componentStyle,
      data: componentData,
      type: componentType
    })
  }
  return config
}

// 清除旧配置
function clearConfig(reload = false) {
  const nodes = grid.engine.nodes; // 获取所有格子节点数据
  const ids = nodes.map(node => node.el.id)
  for (let id of ids) {
    // 删除组件数据
    removeData(id)
    // 删除组件样式
    removeData(id + '-style')
  }
  removeData('layout')
  globalStyle.value.clearStyle()
  // 刷新页面
  if (reload) {
    window.location.reload()
  }
}

// 加载配置
async function loadConfig(reload = true) {
  if (!configData.value) {
    ElMessage.error(t('error.noConfigContent'))
    return
  }
  // 解析json
  let config = configData.value
  configData.value = ''
  if (typeof config === 'string') {
    const loading = ElLoading.service({
      lock: true,
      text: 'Loading...',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    try {
      if (startsWith(config, 'http')) {
        // 从网络加载
        config = await parseBlobJson(config)
      } else {
        config = JSON.parse(config)
      }
    } catch (error) {
      ElMessage.error(t('error.load'), error)
      return
    } finally {
      setTimeout(() => {
        loading.close()
      }, 500)
    }
  }
  if (!config || typeof config !== 'object') {
    ElMessage.error(t('error.loadFormat'))
    return
  }
  // 校验配置
  if (!config.globalStyle || !config.layout || !config.components) {
    ElMessage.error(t('error.loadFormat'))
    return
  }
  // 清除旧配置
  clearConfig()
  // 加载全局样式
  globalStyle.value.initStyleConfig(config.globalStyle)
  // 加载布局
  saveData('layout', JSON.stringify(config.layout))
  // 加载组件
  for (let component of config.components) {
    if (component.data) {
      saveData(component.id, component.data)
    }
    // 加载组件样式
    if (component.style) {
      saveData(component.id + '-style', component.style)
    }
  }
  // 刷新页面
  if (reload) {
    window.location.reload()
  }
  return true
}

// 下载配置
function downloadConfig() {
  exportData(generateConfig(), 'config.json')
}

// 处理文件拖拽
function handleFileDrop(e) {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (file.type !== 'application/json') {
    ElMessage.error(t('error.uploadJson'))
    return
  }
  const reader = new FileReader()
  reader.readAsText(file, 'utf-8')
  reader.onload = () => {
    configData.value = reader.result
  }
}

// 打开工作区弹窗
const workspaceHolder = ref(null)

function openWorkspaceHolder() {
  workspaceHolder.value.open()
}
</script>

<style>
html {
  scrollbar-width: none;
}

body {
  background-color: #343434;
}

* {
  transition: all 0.3s ease-in-out;
}

/* 菜单样式开始 */
.menu {
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100% - 20px);
  display: flex;
  align-items: center;
  overflow: auto;
  scrollbar-width: none;
  gap: 10px;
  padding: 0 10px;
  z-index: 100;
  background-color: rgba(64, 158, 255, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

  .hideMenu {
    cursor: pointer;
    padding: 4px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 24px;
    color: var(--el-color-primary);

    &:hover {
      animation: upAndDown 0.5s ease-in-out infinite;
    }
  }

  .menuTitle {
    color: #ececec;
    height: 30px;
    line-height: 30px;
    margin-left: 36px;
    border-right: 4px solid orange;
    padding: 0 7px 3px 0;
    min-width: 30px;
  }

  .addItemSelect {

  }

  .langSelect {
    width: 100px;
  }
}

.addItemIcon {
  width: 20px;
  height: 20px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  border-radius: 20px;
}

.el-select-dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.menu-show {
  height: 80px;
  opacity: 1;
}

.menu-hide {
  height: 0;
  opacity: 0;
  border-bottom: unset;

  * {
    margin-top: -80px;
  }
}

/* 菜单样式结束 */

/* 选择器样式 */
.el-select.addItemSelect {
  width: 160px;
}

/* 栅格容器样式 */
.grid-stack {
  min-height: 300px;
  height: 100% !important;
  overflow-x: hidden;
  scrollbar-width: none;
}

.grid-stack-item.ui-resizable-autohide {
}

/* 格子样式 */
.grid-stack-item {
  padding: 10px;
  margin: 1px;
}

textarea {
  resize: none !important;
}

.btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 删除图标样式开始 */
.deleteIcon {
  cursor: pointer;
  pointer-events: auto;
  height: 20px !important;
  width: 20px !important;
  border-radius: 20px;
  padding: 8px !important;
  margin: 8px 8px 8px 16px;
  background-color: #ffb6b6;
  border: 2px solid #ffffff;

  .el-form-item__content {
    width: 20px !important;
    height: 20px !important;
    margin: 0 !important;
    cursor: pointer;
    justify-content: center;
  }

  path {
    fill: #fff;
  }
}

.deleteIcon:hover {
  transform: rotate(180deg);
  border: 2px solid #ff8600;
}

/* 删除图标样式结束 */

/* 表单样式开始 */
.el-form-item__label {
  border-left: 8px solid #ffa217;
  padding-left: 8px !important;
  height: 22px !important;
  line-height: 22px !important;
  margin-bottom: 4px;
}

.el-form-item__label {
  background-color: #eaf5ff;
}

.el-form-item {
  padding: 8px;
  margin-bottom: 0 !important;
}

/* 表单样式结束 */

/* 组件弹窗样式开始 */
.zoomInDialog {
  height: 95%;
  max-height: 95%;
  --el-dialog-padding-primary: 0 !important;
  --el-dialog-border-radius: 0 !important;
  --el-dialog-bg-color: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);

  .el-dialog__body {
    height: 100%;
    color: #272727;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.zoomInElement {
  height: 90%;
  width: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
}

/* 组件弹窗样式结束 */

/* 配置加载器弹窗样式开始 */
.configLoaderHeader {
  display: flex;
  align-items: center;
}

/* 配置加载器弹窗样式结束 */

/* 快捷键样式 */
.shortcutKeys {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  margin: 10px;
  padding: 10px 40px 10px 10px;
  bottom: 0;
  left: 0;
  opacity: 1;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .shortcutKeysList {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-items: center;
    flex-direction: column;
  }

  .shortcutKeysItem {
    font-size: 20px;
    font-weight: bold;
    display: flex;
    align-items: baseline;
    gap: 20px;
    justify-content: flex-start;
    width: 100%;

    .el-icon {
      color: #ffffff;
    }

    .shortcutKeysItemTitle {
      font-size: 32px;
      font-weight: bold;
      width: 32px;
      color: #ffffff;
    }

    .shortcutKeysItemDesc {
      font-size: 24px;
      font-weight: bold;
      color: #e3e3e3;
    }
  }
}

.transparent {
  opacity: 0;
  height: 0;
  padding: 0;

  * {
    opacity: 0;
    height: 0;
    padding: 0;
  }
}
</style>