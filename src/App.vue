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
      <el-button @click="readyComponentRef.open()" class="btn" :icon="CirclePlus" plain>{{
          $t('component.add')
        }}
      </el-button>
      <el-select class="addItemSelect" :placeholder="$t('component.addItem')" @change="addItemWithEdit">
        <el-popover
            class="box-item"
            v-for="item in components"
            width="400"
            placement="right-start"
            popper-class="componentItemPopover"
            :show-after="200"
            :hide-after="10"
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
          <div>
            <div class="componentName">{{ item.label }}</div>
            <div class="componentDesc">{{ item.desc }}</div>
            <el-image :src="item.img"/>
          </div>
        </el-popover>
      </el-select>
      <el-text class="menuTitle" truncated>{{ $t('layout.edit') }}</el-text>
      <el-button @click="openGridStackConfig" class="btn" :icon="Grid" plain>{{
          $t('config.gridstack.title')
        }}
      </el-button>
      <div class="modeContainer">
        <el-checkbox v-model="enableMove" class="modeItem" :label="$t('layout.enableMove')" border/>
        <el-checkbox v-model="enableEdit" class="modeItem" :label="$t('layout.enableEdit')" border/>
      </div>
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
    <common-dialog
        :title="$t('config.load')"
        :visible="configLoaderVisible"
        class="globeConfigDialog"
        @closed="configLoaderVisible = false"
    >
      <template #title="{ close, titleId, titleClass }">
        <div class="configLoaderHeader">
          <div :id="titleId" :class="titleClass">{{ $t('config.load') }}</div>
          <el-icon style="margin-left: 8px;cursor: pointer;" @click="configLoaderTipVisible = true">
            <InfoFilled/>
          </el-icon>
        </div>
      </template>

      <div
          @dragover.prevent
          @drop.prevent="handleConfigFileDrop">
        <el-tooltip
            effect="light"
            :content="t('config.lockUrl')"
            placement="top-start"
            :show-after="300"
            :hide-after="10"
            :enterable="false"
        >
          <div class="syncConfigContainer">
            <el-switch
                v-model="configUrlLock"
                @change="saveUrlLock"
                inline-prompt
                :active-text="$t('config.lock')"
                :inactive-text="$t('config.unlock')"
            />
            <el-input v-model="configUrl" @change="saveUrl" :placeholder="$t('config.configUrl')"/>
            <el-button @click="loadConfigFromUrl" type="primary">{{ $t('common.sync') }}</el-button>
          </div>
        </el-tooltip>
        <el-input
            v-model="configData"
            class="globeConfigInput"
            type="textarea"
            resize="none"
            :placeholder="$t('placeholder.configInput')"
        />
      </div>

      <!-- 配置提示弹窗 -->
      <common-dialog v-model="configLoaderTipVisible" title="Tips" width="80%" align-center>
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
      </common-dialog>
      <template #footer>
        <el-tooltip
            :content="$t('config.transfer')"
            placement="top"
            width="240"
            effect="dark"
        >
          <el-icon
              class="transfer"
              draggable="true"
              @dragstart.stop="onConfigTransferStart"
          >
            <Promotion/>
          </el-icon>
        </el-tooltip>
        <el-button type="primary" @click="downloadConfig">{{ $t('common.download') }}</el-button>
        <el-popconfirm
            :title="$t('config.loadConfirm')"
            placement="top-end"
            :confirm-button-text="$t('common.confirm')"
            :cancel-button-text="$t('common.cancel')"
            width="300"
            @confirm="loadConfig(configData)"
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
    </common-dialog>

    <!-- 组件样式弹窗 -->
    <common-dialog
        :title="$t('style.component')"
        :visible="isEditComponentStyle"
        @opened="onComponentStyleOpened"
        @closed="isEditComponentStyle = false"
    >
      <css-editor
          class="globeStyleInput"
          ref="componentStyleRef"
          :init-content="componentStyle"
          :placeholder="$t('placeholder.styleInput')"
          @update="value => componentStyle = value"
      />
      <template #footer>
        <el-button type="primary" @click="refreshComponentStyle(curComponentId)">{{ $t('common.refresh') }}</el-button>
      </template>
    </common-dialog>

    <!-- 组件放大弹窗 -->
    <el-dialog
        v-model="zoomInDialogVisible"
        class="zoomInDialog"
        width="95%"
        align-center
        :show-close="false"
        :close-on-press-escape="false"
        @close="onZoomInClose"
    >
      <div id="zoomInElement" class="zoomInElement"></div>
    </el-dialog>

    <!-- 组件库 -->
    <readyComponent ref="readyComponentRef" @addComponent="addComponent"/>

    <!-- 组件库 -->
    <grid-stack-config ref="gridStackConfigRef"/>

    <!-- 全局样式弹窗 -->
    <globalStyle
        ref="globalStyle"
        @load-style="loadStyle"
    />

    <!-- 工作区配置弹窗 -->
    <workspaceHolder
        ref="workspaceHolder"
    />

    <!-- 名称与描述输入框 -->
    <name-desc-dialog
        ref="nameDescDialog"
        :title="$t('component.addToModule')"
        :name-text="$t('component.name')"
        :desc-text="$t('component.desc')"
        @save="addModule"
    />

    <!-- 版本信息 -->
    <version-info style="z-index: 25;"/>

    <!-- 拖动数据进入弹窗 -->
    <dragInCover
        ref="dragInCover"
        style="z-index: 30;"
        :active="everyDrag"
        @onDragIn="onDragIn"
    />

    <!-- 快捷键提示 -->
    <div :class="['shortcutKeys', {'shortcutKeysHidden': !ctrlDown}]">
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
            <RefreshRight/>
          </el-icon>
          <div class="shortcutKeysItemDesc">{{ $t('shortcut.r') }}</div>
        </div>
        <div class="shortcutKeysItem">
          <div class="shortcutKeysItemTitle">F</div>
          <el-icon>
            <UploadFilled/>
          </el-icon>
          <div class="shortcutKeysItemDesc">{{ $t('shortcut.f') }}</div>
        </div>
        <div class="shortcutKeysItem">
          <div class="shortcutKeysItemTitle">~</div>
          <el-icon>
            <View/>
          </el-icon>
          <div class="shortcutKeysItemDesc">{{ $t('shortcut.~') }}</div>
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
  ElImage,
  ElInput,
  ElLoading,
  ElMessageBox,
  ElOption,
  ElPopconfirm,
  ElPopover,
  ElSelect,
  ElSwitch,
  ElText,
  ElTooltip,
} from 'element-plus'
import 'gridstack/dist/gridstack.min.css'
import operateButtons from './items/operateButtons.vue'
import ReadyComponent from "@/items/readyComponent.vue"
import {v4} from 'uuid'
import {startsWith} from "@/js/string.js"
import {fetchWithBase, parseBlobJson, reloadWithoutParams, removeParams} from "@/js/url.js"
import {
  CirclePlus,
  Edit,
  Grid,
  InfoFilled,
  Monitor,
  Operation,
  Picture,
  Promotion,
  Rank,
  RefreshRight,
  Top,
  UploadFilled,
  View,
} from "@element-plus/icons-vue"
import WorkspaceHolder from "@/items/workspaceHolder.vue"
import {
  exportData,
  loadData,
  loadDataDirect,
  removeData,
  removeDataDirect,
  saveData,
  saveDataDirect,
} from "@/js/data.js"
import {setWorkspace, TEMP_WORKSPACE} from "@/js/workspcae.js"
import CrosshairBackground from "@/items/crosshairBackground.vue"
import GlobalStyle from "@/items/globalStyle.vue"
import NameDescDialog from "@/items/nameDescDialog.vue"
import i18n from './i18n'
import {changeLanguage, getCurrentLanguage} from "./i18n/utils.js"
import {itemType} from "@/js/components.js"
import versionInfo from '@/items/versionInfo.vue'

import {useI18n} from 'vue-i18n'
import CssEditor from "@/items/cssEditor.vue"
import DragInCover from "@/items/DragInCover.vue"
import CommonDialog from "@/items/commonDialog.vue"
import {error, info, success} from "@/js/message.js"
import GridStackConfig from "@/items/gridStackConfig.vue"

const {t} = useI18n()

const currentLang = ref(getCurrentLanguage())
watch(currentLang, (newLang) => {
  changeLanguage(newLang)
})
const langList = [
  'zh',
  'en'
]

const components = ref([])
for (let item of itemType) {
  item.label = t('itemType.' + item.value + '.name')
  item.desc = t('itemType.' + item.value + '.desc')
  item.img = '/one/imgs/components/' + item.value + '.png'
}
components.value = itemType

// 菜单是否显示
let showMenu = ref(false)

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
    if (event.key === 'q' || event.key === 'Q') {
      enableMove.value ? disabledMove() : enabledMove()
    } else if (event.key === 'e' || event.key === 'E') {
      enableEdit.value ? disabledEdit() : enabledEdit()
    } else if (event.key === 'd' || event.key === 'D') {
      showMenu.value = !showMenu.value
    } else if (event.key === 'r' || event.key === 'R') {
      window.location.reload()
    } else if (event.key === 'F' || event.key === 'f') {
      everyDrag.value = !everyDrag.value
    } else if (event.key === '~' || event.key === '`') {
      disabledEdit()
      disabledMove()
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

const parseUrlParams = async (urlParams) => {
  // 设定打开的工作区
  const workspace = urlParams.get('workspace')
  if (workspace) {
    setWorkspace(workspace)
  }
  removeParams('workspace')

  const initParam = (key, defaultValue) => {
    let value = urlParams.get(key)
    if (value === null || value === undefined) {
      value = loadData(key) || defaultValue
    }
    saveData(key, value)
    return value
  }

  // 初始化布局参数
  initParam('cellW', 48)
  removeParams('cellW')
  initParam('cellH', '50%c')
  removeParams('cellH')

  // 初始化配置
  const urlLock = urlParams.get('lock')
  if (urlLock === 'true') {
    configUrlLock.value = true
  } else {
    configUrlLock.value = (loadData('lock') === 'true')
  }
  saveUrlLock()
}

const setGridStackWidth = (width) => {
  nextTick(() => {
    gridEl.value.style.width = width
  })
}
// 初始化GridStack
onMounted(async () => {

  // 从地址栏尝试获取config参数
  const urlParams = new URLSearchParams(window.location.search)
  await parseUrlParams(urlParams)
  // 跳过刷新后的url同步
  removeDataDirect('skipReload')

  const cellSize = gridStackConfigRef.value.calcCellSize()
  setGridStackWidth(cellSize.totalWidth)

  // 初始化GridStack
  grid = GridStack.init({
    // 每个格子的高度（px）
    cellHeight: cellSize.cellH,
    // 格子间距
    margin: 0,
    // 允许格子自由浮动
    float: true,
    // 最小行数
    minRow: 2,
    // 始终显示调整手柄
    alwaysShowResizeHandle: false,
    column: cellSize.columns,
  })

  // 移除config参数
  removeParams('lock')
  configUrl.value = loadData('configUrl')
  // 不存在同步值时，从url参数加载
  if (!configUrlLock.value || !configUrl.value) {
    const configParam = urlParams.get('config')
    if (configParam) {
      info(t('config.loading'))
      configUrl.value = decodeURIComponent(configParam)
      if (!loadDataDirect('skipReload')) {
        await loadConfig(configUrl.value, false)
        reloadWithoutParams('config')
      }
    }
  } else if (configUrlLock.value && !loadDataDirect('skipReload')) {
    info(t('config.loading'))
    await loadConfig(configUrl.value, false)
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

    // 加载配置时删除临时工作区标记
    if (loadDataDirect(TEMP_WORKSPACE)) {
      // 存在则删除
      removeDataDirect(TEMP_WORKSPACE)
    }
  } else {
    // 首次加载
    configData.value = await loadJsonData()
    await loadConfig(configData.value, true)
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

// 编辑全局样式
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

const gridStackConfigRef = ref(null)

const openGridStackConfig = () => {
  gridStackConfigRef.value.open()
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
          transferData: exportComponentData(props.id, type),
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

const addItemWithEdit = (type, x, y, w = '4', h = '4', id) => {
  const nowId = addItem(type, x, y, w, h, id)
  // 保存布局
  saveLayout()
  enabledEdit()
  enabledMove()
  return nowId
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
    error(t('error.noSuchComponent_') + type)
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

const readyComponentRef = ref(null)

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
      error(t('error.noSuchComponent_') + data.type)
    }
  }
}

// 删除格子
function deleteItem(id) {
  nextTick(() => {
    // 卸载Vue组件
    const elementById = document.getElementById(id.value)
    elementById.element.unmount(elementById)
    // 删除DOM元素
    grid.removeWidget(elementById)
    // 删除本地存储
    removeData(id.value)
    // 保存布局
    saveLayout()
  })
}

// 编辑组件样式
const curComponentId = ref('')
const isEditComponentStyle = ref(false)
const componentStyleRef = ref(null)
const componentStyle = ref('')

function editStyle(id) {
  curComponentId.value = id.value
  isEditComponentStyle.value = true
}

function onComponentStyleOpened() {
  // 获取组件样式
  componentStyle.value = loadData(curComponentId.value + '-style')
  componentStyleRef.value.load(componentStyle.value)
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
    error(t('error.noSuchComponent_') + type.value)
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
  // 找到组件大小
  for (let node of grid.engine.nodes) {
    if (node.el.id === idValue) {
      componentData.w = node.w
      componentData.h = node.h
    }
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
    error(t('error.noName'))
    return
  }
  const componentData = exportComponentData(moduleId, moduleType)
  const moduleData = {
    name, desc,
    ...componentData
  }
  saveDataDirect('module-' + name, JSON.stringify(moduleData))
  success(t('success.add'))
  nameDescDialog.value.cancel()
}

// 导出组件
function exportComponent(id, type) {
  const componentData = exportComponentData(id, type)
  exportData(componentData, id.value + '.json')
}

const configData = ref('')
const configUrlLock = ref(false)
const configUrl = ref('')
const configLoaderVisible = ref(false)
const configLoaderTipVisible = ref(false)

function saveUrlLock() {
  saveData('lock', configUrlLock.value)
}

function saveUrl() {
  if (configUrl.value) {
    saveData('configUrl', configUrl.value)
  } else {
    removeData('configUrl')
  }
}

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
    configLock: configUrlLock.value,
    configUrl: configUrl.value,
    cellW: loadData('cellW') || '48',
    cellH: loadData('cellH') || '50%c',
    components: []
  }
  // 所有组件
  const nodes = grid.engine.nodes // 获取所有格子节点数据
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
  // 删除配置URL
  removeData('configUrl')
  // 删除配置URL锁定
  removeData('lock')
  removeData('cellH')
  removeData('cellW')
  globalStyle.value.clearStyle()
  // 刷新页面
  if (reload) {
    window.location.reload()
  }
}

async function loadConfigFromUrl() {
  if (!configUrl.value) {
    error(t('error.noConfigUrl'))
    return
  }
  await loadConfig(configUrl.value)
}

// 加载配置
async function loadConfig(config = configData.value, reload = true) {
  if (!config) {
    error(t('error.noConfigContent'))
    return
  }
  // 解析json
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
      error(t('error.load'), error)
      return
    } finally {
      setTimeout(() => {
        loading.close()
      }, 500)
    }
  }
  if (!config || typeof config !== 'object') {
    error(t('error.loadFormat'))
    return
  }
  // 校验配置
  if (!config.globalStyle || !config.layout || !config.components) {
    error(t('error.loadFormat'))
    return
  }
  // 保留配置锁
  configUrlLock.value = config.configLock || (loadData('lock') === 'true')
  configUrl.value = config.configUrl || loadData('configUrl') || ''
  // 清除旧配置
  clearConfig()
  // 加载全局样式
  globalStyle.value.initStyleConfig(config.globalStyle)
  // 加载布局
  saveData('layout', JSON.stringify(config.layout))
  saveUrlLock()
  saveUrl()
  // 加载布局配置
  saveData('cellW', config.cellW || '48')
  saveData('cellH', config.cellH || '50%c')
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
  // 跳过刷新后的url同步
  saveDataDirect('skipReload', true)
  return true
}

// 下载配置
function downloadConfig() {
  exportData(generateConfig(), 'config.json')
}

// 处理文件拖拽
function handleConfigFileDrop(e) {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (!file || file.type !== 'application/json') {
    error(t('error.uploadJson'))
    return
  }
  const reader = new FileReader()
  reader.readAsText(file, 'utf-8')
  reader.onload = () => {
    configData.value = reader.result
  }
}

// 处理文件拖拽
const everyDrag = ref(false)

function onDragIn(data) {
  // 判断data是否是json对象
  if (typeof data === 'object') {
    if (data.type) {
      // 组件配置
      addComponent(data)
    } else if (data.globalStyle || data.layout) {
      // 全局样式或布局
      ElMessageBox.confirm(
          t('config.transferReceive.desc'),
          t('config.transferReceive.title'),
          {
            distinguishCancelAndClose: true,
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
          }
      ).then(() => {
        loadConfig(data)
      })
    } else {
      error(t('error.unknownContent'))
    }
  } else {
    error(t('error.unknownContent'))
  }
}

// 全局配置拖拽导出
function onConfigTransferStart(e) {
  e.stopPropagation()
  const transferData = generateConfig()
  e.dataTransfer.setData('text/plain', JSON.stringify(transferData))
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
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

  .hideMenu {
    cursor: pointer;
    padding: 4px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 24px;

    &:hover {
      animation: upAndDown 0.5s ease-in-out infinite;
    }
  }

  .modeContainer {
    .modeItem {
      &:first-child {
        border-radius: 8px 0 0 8px;
      }

      &:last-child {
        border-radius: 0 8px 8px 0;
      }
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

.componentItemPopover {
  pointer-events: none;

  .componentName {
    font-weight: bold;
    font-size: 22px;
  }

  .componentDesc {
    font-size: 18px;
    margin: 4px 0;
  }

  .el-image {
    width: 100%;
  }
}

/* 选择器样式 */
.el-select.addItemSelect {
  width: 160px;
}

/* 栅格容器样式 */
.grid-stack {
  min-height: 100%;
  z-index: 5;
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
.globeConfigDialog {
  .configLoaderHeader {
    color: white;
    display: flex;
    align-items: center;
  }

  .syncConfigContainer {
    display: flex;
    gap: 8px;

    .el-switch {
      .el-switch__core {
        height: calc(100% - 2px);
        background: #494949;
        padding: 0 4px;
        border: none;
      }

      &.is-checked {
        .el-switch__core {
          background: #3a8091;
        }
      }
    }
  }

  .globeConfigInput {
    height: calc(100% - 84px) !important;
    padding-top: 24px;
    margin-top: 24px;
    border-top: 2px dotted rgba(255, 255, 255, 0.6);

    .el-textarea__inner {
      height: calc(100% - 4px);
      width: calc(100% - 4px);
      border-radius: 24px;
      border: 2px solid rgba(255, 255, 255);
    }
  }
}

/* 快捷键样式 */
.shortcutKeys {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  width: calc(20% - 56px);
  bottom: 5%;
  left: 40%;
  opacity: 1;
  padding: 24px;
  border-radius: 24px;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.5);
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: all 0.3s ease-in-out;
  pointer-events: none;
  border: 4px solid rgba(255, 255, 255, 0.6);

  * {
    user-select: none;
    pointer-events: none;
  }

  .shortcutKeysList {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-items: center;
    flex-direction: column;
  }

  .shortcutKeysItem {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 20px;
    justify-content: flex-start;
    width: 100%;

    .el-icon {
      color: #ffffff;
      height: 2vw;
      width: 2vw;

      svg {
        height: 100%;
        width: 100%;
      }
    }

    .shortcutKeysItemTitle {
      font-size: 3vw;
      font-weight: bold;
      width: 3vw;
      color: #ffffff;
    }

    .shortcutKeysItemDesc {
      font-size: 1.5vw;
      font-weight: bold;
      color: #e3e3e3;
    }
  }
}

.shortcutKeysHidden {
  opacity: 0;
  padding: 0;
  bottom: 0;

  * {
    opacity: 0;
    padding: 0;
  }
}
</style>