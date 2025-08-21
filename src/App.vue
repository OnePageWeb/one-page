<template>
  <div
    :class="['menu', showMenu ? 'menu-show' : 'menu-hide']"
    @mouseleave="showMenu = false"
  >
    <el-select class="addItemSelect" placeholder="添加格子" @change="addItem">
      <el-popover
        class="box-item"
        v-for="item in itemType"
        :title="item.label"
        :content="item.desc"
        width="300"
        placement="right-start"
      >
        <template #reference>
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </template>
      </el-popover>
    </el-select>
    <el-checkbox v-model="enableMove" label="开启移动" border/>
    <el-checkbox v-model="enableEdit" label="开启编辑" border/>
    <el-button @click="editGlobalStyle" class="btn">全局样式</el-button>
    <el-button @click="openLoadConfig" class="btn">加载配置</el-button>
  </div>
  <div ref="gridEl" class="grid-stack"></div>

  <!-- 全局样式弹窗 -->
  <el-dialog
    title="全局样式"
    v-model="isEditGlobalStyle"
    width="50%"
    class="globeStyleDialog commonDialog"
    align-center
  >
    <el-input
      v-model="globalStyle"
      class="globeStyleInput"
      type="textarea"
      resize="none"
      placeholder="请输入全局样式"
    />
    <template #footer>
      <el-button type="primary" @click="refreshGlobalStyle">保存并刷新</el-button>
    </template>
  </el-dialog>

  <!-- 配置加载弹窗 -->
  <el-dialog
    title="加载配置"
    v-model="configLoaderVisible"
    width="50%"
    class="globeStyleDialog commonDialog"
    align-center
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="configLoaderHeader">
        <div :id="titleId" :class="titleClass">加载配置</div>
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
      placeholder="请输入配置URL或拖拽JSON文件到此处"
      @dragover.prevent
      @drop.prevent="handleFileDrop"
    />

    <!-- 配置提示弹窗 -->
    <el-dialog class="commonDialog" v-model="configLoaderTipVisible" title="Tips" width="50%" align-center>
      <div>
        <div style="font-size:large;font-weight: bold;margin-bottom: 4px">
          可以将配置内容粘贴到输入框内，也可以拖拽JSON文件到输入框中。
        </div>
        <div style="font-size:large;font-weight: bold;margin-bottom: 4px">同样支持使用配置下载地址填写于此处自动获取。
        </div>
        <div style="margin-bottom: 4px">注意：由于跨域限制，当配置地址无法使用时，页面或尝试使用<a
          href="https://corsproxy.io">corsproxy.io</a>的代理方式获取。
        </div>
        <div style="margin-bottom: 4px">推荐自建代理服务器。</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="configLoaderTipVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    <template #footer>
      <el-button type="primary" @click="downloadConfig">下载</el-button>
      <el-popconfirm
        title="确定加载以上配置，这会覆盖本地的所有配置？"
        placement="top-start"
        confirm-button-text="确定"
        cancel-button-text="取消"
        @confirm="loadConfig()"
      >
        <template #reference>
          <el-button type="primary">加载</el-button>
        </template>
      </el-popconfirm>
      <el-popconfirm
        title="确定清空并重新加载页面？"
        placement="top-start"
        confirm-button-text="确定"
        cancel-button-text="取消"
        @confirm="clearConfig(true)"
      >
        <template #reference>
          <el-button type="danger">清空</el-button>
        </template>
      </el-popconfirm>
    </template>
  </el-dialog>

  <!-- 组件样式弹窗 -->
  <el-dialog
    title="组件样式"
    v-model="isEditComponentStyle"
    width="50%"
    class="globeStyleDialog commonDialog"
    align-center
  >
    <el-input
      v-model="componentStyle"
      class="globeStyleInput"
      type="textarea"
      resize="none"
      placeholder="请输入样式"
    />
    <template #footer>
      <el-button type="primary" @click="refreshComponentStyle(curComponentId)">刷新</el-button>
    </template>
  </el-dialog>

  <edge-mouse-move
    @onLeftEdge="() => showMenu = !showMenu && !viewMode"
  />
</template>

<script setup>
import {createApp, h, nextTick, onMounted, ref, watch} from 'vue'
import {GridStack} from 'gridstack'
import {
  ElButton,
  ElCheckbox,
  ElDialog,
  ElIcon,
  ElInput,
  ElMessage,
  ElOption,
  ElPopconfirm,
  ElPopover,
  ElSelect
} from 'element-plus'
import 'gridstack/dist/gridstack.min.css'
import operateButtons from './items/operateButtons.vue'
import textComponent from './components/TextComponent.vue'
import searchComponent from './components/SearchComponent.vue'
import iframeComponent from './components/IframeComponent.vue'
import htmlComponent from "./components/HtmlComponent.vue"
import linkComponent from './components/LinkComponent.vue'
import functionComponent from './components/FunctionComponent.vue'
import evalComponent from "./components/EvalComponent.vue"
import {v4} from 'uuid'
import {startsWith} from "@/js/string.js"
import {parseBlobJson} from "@/js/url.js"
import {InfoFilled} from "@element-plus/icons-vue"
import edgeMouseMove from './items/edgeMouseMove.vue'
import {loadData, removeData, saveData} from "@/js/data.js"

const itemType = [
  {
    value: 'text',
    label: '文本格子',
    desc: '用于显示文本内容的格子，允许html标签',
    component: textComponent
  },
  {
    value: 'search',
    label: '搜索栏',
    desc: '搜索引擎输入框，用于搜索指定内容',
    component: searchComponent
  },
  {
    value: 'iframe',
    label: '网址格子',
    desc: '用于嵌入网页地址的格子，不支持跨域',
    component: iframeComponent
  },
  {
    value: 'html',
    label: '网页格子',
    desc: '用于嵌入网页代码的格子',
    component: htmlComponent
  },
  {
    value: 'link',
    label: '快速链接',
    desc: '用于快速跳转的格子，支持自定义链接',
    component: linkComponent
  },
  {
    value: 'function',
    label: '安全函数',
    desc: '用于执行安全函数的格子，支持自定义函数。使用模式下双击格子即可运行',
    component: functionComponent
  }
]
// 菜单是否显示
let showMenu = ref(false)

// 格子高度
let itemHeight = 50
// 总列数
const columns = 24
// GridStack实例
let grid
// 锁定状态
const enableEdit = ref(false)
const enableMove = ref(false)
watch(enableMove, b => {
  if (b) {
    enabledMove()
  } else {
    disabledMove()
  }
})
// 全局样式
let globalStyle = ref(`.grid-stack {
  height: 100% !important;
}
body {
  background: url(https://api.xsot.cn/bing?jump=true)  center/cover;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}`)
// 仅查看模式
let viewMode = ref(false)

// 初始化GridStack
onMounted(async () => {
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
    // 4列
    column: columns,
  })

  // 从地址栏尝试获取config参数
  const urlParams = new URLSearchParams(window.location.search)
  const configUrl = urlParams.get('config')
  if (configUrl) {
    ElMessage.info('正在加载配置...')
    configData.value = configUrl
    if (await loadConfig(false)) {
      ElMessage.success('配置加载完成，编辑模式已关闭')
      viewMode.value = true
      enabledEdit()
    }
  }
  // 是否开启函数格子
  const enableFunction = urlParams.get('enableFunction')
  if (enableFunction) {
    itemType.push({
      value: 'eval',
      label: '危险函数',
      desc: '用于执行自定义函数的格子，支持自定义函数。使用模式下双击格子即可运行',
      component: evalComponent
    })
  }

  // 恢复布局
  const layout = loadData('layout')
  if (layout) {
    const parse = JSON.parse(layout)
    for (let el of parse) {
      const componentId = el.id;
      // 添加格子
      addItem(el.type, el.x, el.y, el.w, el.h, componentId)

      // 恢复组件样式
      const componentStyle = loadData(componentId + '-style')
      if (componentStyle) {
        loadComponentStyle(componentId, componentStyle)
        document.getElementById(componentId + '-container').style.cssText = componentStyle
      }
    }
  } else {
    // 添加初始格子
    addItem('link', 6, 10, 11, 2)
    addItem('search', 6, 8, 11, 2)
  }

  // 恢复样式
  const style = loadData('globalStyle')
  if (style) {
    globalStyle.value = style
    refreshGlobalStyle()
  }

  disabledEdit()
  disabledMove()

  // 监听拖拽和调整大小事件
  grid.on('dragstop resizestop', (event, el) => {
    saveLayout()
  })
})

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
function createItemComponent(componentItem) {
  return {
    components: {
      componentItem: componentItem,
      operateButtons: operateButtons
    },
    props: ['id', 'enableEdit'],
    render() {
      return h('div', {
        id: this.id + '-container',
        style: {
          height: '100%',
          width: '100%',
          position: 'relative'
        }
      }, [
        h(operateButtons, {
          ref: 'operateButtons',
          style: {position: 'absolute'},
          id: this.id,
          enableEdit: enableEdit,
          enableMove: enableMove,
          onOnDelete: deleteItem,
          onOnStyleEdit: editStyle,
        }),
        h(componentItem, {
          ref: 'componentItem',
          style: {position: 'absolute'},
          id: this.id,
          enableEdit: enableEdit,
          enableMove: enableMove
        }),
      ]);
    }
  }
}

const addItem = (type, x = '1', y = '1', w = '4', h = '4', id) => {
  // 创建格子DOM
  const itemEl = document.createElement('div')
  itemEl.className = 'grid-stack-item'
  itemEl.type = type // 自定义类型
  itemEl.id = id || v4().replace('-', '')
  itemEl.setAttribute('gs-w', w)
  itemEl.setAttribute('gs-h', h)
  itemEl.setAttribute('gs-x', x)
  itemEl.setAttribute('gs-y', y)
  // 挂载Vue组件到格子
  let component = itemType.find(item => item.value === type)?.component
  if (!component) {
    ElMessage.error(`未找到对应的组件 - ${type}`)
    return
  }
  const app = createApp(createItemComponent(component), {id: itemEl.id, enableEdit: enableEdit, enableMove: enableMove})
  app.mount(itemEl)
  itemEl.element = app
  // 添加到GridStack
  grid.makeWidget(itemEl)

  // 保存布局
  saveLayout()
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
let curComponentId = ref('')
let isEditComponentStyle = ref(false)
let componentStyle = ref('')

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


// 编辑全局样式
let isEditGlobalStyle = ref(false)

function editGlobalStyle() {
  isEditGlobalStyle.value = true
}

function refreshGlobalStyle() {
  loadStyle('globalStyle', globalStyle.value)
  // 保存全局样式
  saveData('globalStyle', globalStyle.value)
  isEditGlobalStyle.value = false
}

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
    globalStyle: globalStyle.value,
    layout: JSON.parse(loadData('layout')),
    components: []
  }
  // 所有组件
  const nodes = grid.engine.nodes; // 获取所有格子节点数据
  const ids = nodes.map(node => node.el.id)
  for (let id of ids) {
    // 组件样式
    const componentStyle = document.getElementById(id + '-container').style.cssText
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
  removeData('layout')
  removeData('globalStyle')
  const nodes = grid.engine.nodes; // 获取所有格子节点数据
  const ids = nodes.map(node => node.el.id)
  for (let id of ids) {
    // 删除组件数据
    removeData(id)
    // 删除组件样式
    removeData(id + '-style')
  }
  // 刷新页面
  if (reload) {
    window.location.reload()
  }
}

// 加载配置
async function loadConfig(reload = true) {
  if (!configData.value) {
    ElMessage.error('无配置内容')
    return
  }
  // 解析json
  let config
  try {
    if (startsWith(configData.value, 'http')) {
      // 从网络加载
      config = await parseBlobJson(configData.value)
    } else {
      config = JSON.parse(configData.value)
    }
  } catch (error) {
    ElMessage.error('配置文件无法加载')
    return
  }
  if (!config || typeof config !== 'object') {
    ElMessage.error('配置文件格式错误')
    return
  }
  // 校验配置
  if (!config.globalStyle || !config.layout || !config.components) {
    ElMessage.error('配置文件格式错误')
    return
  }
  // 清除旧配置
  clearConfig()
  // 加载全局样式
  saveData('globalStyle', config.globalStyle)
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
  // 1. 将JSON转换为字符串
  const jsonStr = JSON.stringify(generateConfig(), null, 2); // 第三个参数美化格式
  const filename = 'config.json'
  // 2. 创建Blob对象
  const blob = new Blob([jsonStr], {type: 'application/json'});
  // 3. 生成下载链接
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  // 4. 触发下载
  document.body.appendChild(a);
  a.click();
  // 5. 清理
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

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

<style>
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
  gap: 10px;
  padding: 0 10px;
  z-index: 1;
  background-color: rgba(138, 138, 138, 0.5);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.35);

  .el-button + .el-button {
    margin-left: 0;
  }
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

/* 开关样式开始 */
.el-checkbox {
  background-color: white;
  margin-right: unset !important;
  --el-checkbox-checked-text-color: #ff7d00 !important;
  --el-checkbox-checked-bg-color: #ff7d00 !important;

  .el-checkbox__inner {
    border: unset !important;
  }
}

/* 开关样式结束 */

/* 选择器样式 */
.el-select.addItemSelect {
  width: 160px;
}

/* 栅格容器样式 */
.grid-stack {
  min-height: 300px;
  height: 100% !important;
  backdrop-filter: blur(10px);
}

.grid-stack-item.ui-resizable-autohide {
  background: repeating-linear-gradient(
    45deg,
    rgba(150, 150, 150, 0.1),
    rgba(150, 150, 150, 0.1) 40px,
    rgba(255, 255, 255, 0.1) 40px,
    rgba(255, 255, 255, 0.1) 80px
  );
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
  background-color: #ffb6b6 !important;
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
  height: 26px !important;
  line-height: 26px !important;
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

/* 全局样式弹窗样式开始 */
.commonDialog {
  height: calc(80% - 2px);
  max-height: 80%;
  --el-dialog-padding-primary: 0 !important;
  --el-dialog-border-radius: 12px !important;

  .el-dialog__header {
    padding: 12px 16px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background-color: #39c7da;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;

    .el-dialog__title {
      color: white !important;
      font-weight: bold;
    }

    .el-dialog__headerbtn {
      top: unset !important;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: white !important;
      font-size: 24px !important;
    }
  }

  .el-dialog__body {
    height: calc(100% - 128px);
    padding: 16px;
    /* 对其中的第一个子组件设置高度为100% */

    > *:first-child {
      height: 100% !important;
      overflow: auto;
    }
  }

  .el-dialog__footer {
    padding: 8px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    background-color: #ffffff;
    box-shadow: 0 0 8px rgba(154, 154, 154, 0.5);
  }

  .el-textarea__inner, .el-textarea {
    height: 100% !important;
  }
}

/* 全局样式弹窗样式结束 */

/* 配置加载器弹窗样式开始 */
.configLoaderHeader {
  display: flex;
  align-items: center;
}

/* 配置加载器弹窗样式结束 */
</style>