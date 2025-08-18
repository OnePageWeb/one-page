<template>
  <div :class="['menu', showMenu ? 'menu-show' : 'menu-hide']">
    <el-select class="addItemSelect" placeholder="添加格子" @change="addItem">
      <el-option
          v-for="item in itemType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <el-button v-if="!isLock" @click="lock" class="btn">查看模式</el-button>
    <el-button v-if="isLock" @click="unlock" class="btn">编辑模式</el-button>
    <el-button @click="editGlobeStyle" class="btn">全局样式</el-button>
    <el-button @click="openLoadConfig" class="btn">加载配置</el-button>
  </div>
  <div ref="gridEl" class="grid-stack" @dblclick="() => showMenu = !showMenu && !viewMode"></div>

  <!-- 全局样式弹窗 -->
  <el-dialog title="全局样式" v-model="isEditGlobeStyle" width="50%" class="globeStyleDialog">
    <el-input
        v-model="globeStyle"
        class="globeStyleInput"
        type="textarea"
        resize="none"
        placeholder="请输入全局样式"
    />
    <template #footer>
      <el-button type="primary" @click="refreshStyle">刷新</el-button>
    </template>
  </el-dialog>

  <!-- 配置加载弹窗 -->
  <el-dialog title="加载配置" v-model="configLoaderVisible" width="50%" class="globeStyleDialog">
    <template #header="{ close, titleId, titleClass }">
      <div class="configLoaderHeader">
        <div :id="titleId" :class="titleClass">加载配置</div>
        <el-icon style="margin-left: 8px;cursor: pointer;" @click="configLoaderTipVisible = true"><InfoFilled /></el-icon>
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
    <el-dialog v-model="configLoaderTipVisible" title="Tips" width="50%" draggable>
      <div style="font-size:large;font-weight: bold;margin-bottom: 4px">可以将配置内容粘贴到输入框内，也可以拖拽JSON文件到输入框中。</div>
      <div style="font-size:large;font-weight: bold;margin-bottom: 4px">同样支持使用配置下载地址填写于此处自动获取。</div>
      <div style="margin-bottom: 4px">注意：由于跨域限制，当配置地址无法使用时，页面或尝试使用<a href="https://corsproxy.io">corsproxy.io</a>的代理方式获取。</div>
      <div style="margin-bottom: 4px">推荐自建代理服务器。</div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="configLoaderTipVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    <template #footer>
      <el-button type="primary" @click="downloadConfig">下载</el-button>
      <el-button type="primary" @click="loadConfig">加载</el-button>
    </template>
  </el-dialog>

  <!-- 组件样式弹窗 -->
  <el-dialog title="组件样式" v-model="isEditComponentStyle" width="50%" class="globeStyleDialog">
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
</template>

<script setup>
import {createApp, h, nextTick, onMounted, ref} from 'vue'
import {GridStack} from 'gridstack'
import {ElButton, ElDialog, ElIcon, ElInput, ElMessage, ElOption, ElPopover, ElSelect} from 'element-plus'
import 'gridstack/dist/gridstack.min.css'
import operateButtons from './items/operateButtons.vue'
import textComponent from './components/TextComponent.vue'
import searchComponent from './components/SearchComponent.vue'
import iframeComponent from './components/IframeComponent.vue'
import linkComponent from './components/LinkComponent.vue'
import {v4} from 'uuid'
import {startsWith} from "@/js/string.js";
import {parseBlobJson} from "@/js/url.js";
import {InfoFilled} from "@element-plus/icons-vue";

const itemType = [
  {
    value: 'text',
    label: '文本格子',
    component: textComponent
  },
  {
    value: 'search',
    label: '搜索格子',
    component: searchComponent
  },
  {
    value: 'iframe',
    label: '网页格子',
    component: iframeComponent
  },
  {
    value: 'link',
    label: '快速链接',
    component: linkComponent
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
const isLock = ref(false)
// 全局样式
let globeStyle = ref(`.grid-stack {
  min-height: 300px;
}`)
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
    }
  }

  // 恢复布局
  const layout = window.localStorage.getItem('layout')
  if (layout) {
    const parse = JSON.parse(layout)
    for (let el of parse) {
      const componentId = el.id;
      // 添加格子
      addItem(el.type, el.x, el.y, el.w, el.h, componentId)

      // 恢复组件样式
      const componentStyle = window.localStorage.getItem(componentId + '-style')
      if (componentStyle) {
        document.getElementById(componentId + '-container').style.cssText = componentStyle
      }
    }
  } else {
    // 添加初始格子
    addItem('text')
    addItem('search')
  }

  // 恢复样式
  const style = window.localStorage.getItem('globeStyle')
  if (style) {
    globeStyle.value = style
    refreshStyle()
  }

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
  window.localStorage.setItem('layout', JSON.stringify(simplifiedLayout))
}

// 锁定布局
function lock() {
  grid.disable()
  grid.enableMove(false)
  grid.enableResize(false)
  isLock.value = true
}

// 解锁布局
function unlock() {
  grid.enable()
  grid.enableMove(true)
  grid.enableResize(true)
  isLock.value = false
}

// 添加空白格子
function createItemComponent(componentItem) {
  return {
    components: {
      componentItem: componentItem,
      operateButtons: operateButtons
    },
    props: ['id', 'isLock'],
    render() {
      return h('div', {
        id: this.id + '-container',
        style: {
          height: '100%',
          width: '100%',
          position: 'relative'
        }
      }, [
        h(componentItem, {
          ref: 'componentItem',
          style: {position: 'absolute'},
          id: this.id,
          isLock: isLock
        }),
        h(operateButtons, {
          ref: 'operateButtons',
          style: {position: 'absolute'},
          id: this.id,
          isLock: isLock,
          onOnDelete: deleteItem,
          onOnStyleEdit: editStyle,
        }),
      ]);
    }
  }
}

const addItem = (type, x = '1', y = '1', w = '3', h = '2', id) => {
  // 创建格子DOM
  const itemEl = document.createElement('div')
  itemEl.className = 'grid-stack-item'
  itemEl.type = type // 自定义类型
  itemEl.id = id || v4()
  itemEl.setAttribute('gs-w', w)
  itemEl.setAttribute('gs-h', h)
  itemEl.setAttribute('gs-x', x)
  itemEl.setAttribute('gs-y', y)
  // 挂载Vue组件到格子
  let component = itemType.find(item => item.value === type).component
  const app = createApp(createItemComponent(component), {id: itemEl.id, isLock: isLock})
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
    window.localStorage.removeItem(id.value)
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
  componentStyle.value = document.getElementById(id.value + '-container').style.cssText
  isEditComponentStyle.value = true
}

function refreshComponentStyle(id) {
  const idValue = id.value || curComponentId.value
  document.getElementById(idValue + '-container').style.cssText = componentStyle.value
  // 保存组件样式
  window.localStorage.setItem(idValue + '-style', componentStyle.value)
  isEditComponentStyle.value = false
}

// 编辑全局样式
let isEditGlobeStyle = ref(false)

function editGlobeStyle() {
  isEditGlobeStyle.value = true
}

function refreshStyle() {
  // 先删除旧的样式
  const oldStyle = document.getElementById('globeStyle')
  if (oldStyle) {
    document.head.removeChild(oldStyle)
  }
  const style = document.createElement('style')
  style.id = 'globeStyle'
  style.innerHTML = globeStyle.value
  document.head.appendChild(style)
  // 保存全局样式
  window.localStorage.setItem('globeStyle', globeStyle.value)
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
    globeStyle: globeStyle.value,
    layout: JSON.parse(window.localStorage.getItem('layout')),
    components: []
  }
  // 所有组件
  const nodes = grid.engine.nodes; // 获取所有格子节点数据
  const ids = nodes.map(node => node.el.id)
  for (let id of ids) {
    // 组件样式
    const componentStyle = document.getElementById(id + '-container').style.cssText
    // 组件数据
    const componentData = window.localStorage.getItem(id)
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
function clearConfig() {
  window.localStorage.removeItem('layout')
  window.localStorage.removeItem('globeStyle')
  const nodes = grid.engine.nodes; // 获取所有格子节点数据
  const ids = nodes.map(node => node.el.id)
  for (let id of ids) {
    // 删除组件数据
    window.localStorage.removeItem(id)
    // 删除组件样式
    window.localStorage.removeItem(id + '-style')
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
  if (!config.globeStyle || !config.layout || !config.components) {
    ElMessage.error('配置文件格式错误')
    return
  }
  // 清除旧配置
  clearConfig()
  // 加载全局样式
  window.localStorage.setItem('globeStyle', config.globeStyle)
  // 加载布局
  window.localStorage.setItem('layout', JSON.stringify(config.layout))
  // 加载组件
  for (let component of config.components) {
    if (component.data) {
      window.localStorage.setItem(component.id, component.data)
    }
    // 加载组件样式
    if (component.style) {
      window.localStorage.setItem(component.id + '-style', component.style)
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
body {
  margin: 0 !important;
}

* {
  transition: all 0.3s ease-in-out;
}

/* 菜单样式开始 */
.menu {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
}

.menu-show {
  height: 80px;
}

.menu-hide {
  height: 0;
}

/* 对menu-hide中的所有元素添加margin-top */
.menu-hide * {
  margin-top: -80px;
}

.menu .el-button + .el-button {
  margin-left: 0;
}

/* 菜单样式结束 */

/* 选择器样式 */
.el-select.addItemSelect {
  width: 160px;
}

/* 栅格容器样式 */
.grid-stack {
  min-height: 300px;
}

.grid-stack-item.ui-resizable-autohide {
  background: repeating-linear-gradient(
      45deg, /* 45度斜角 */ rgba(150, 150, 150, 0.1), /* 黑色半透明 */ rgba(150, 150, 150, 0.1) 40px, /* 条纹宽度 */ rgba(255, 255, 255, 0.1) 40px, /* 白色半透明 */ rgba(255, 255, 255, 0.1) 80px /* 条纹间距 */
  );
}

/* 格子样式 */
.grid-stack-item {
  padding: 10px;
  margin: 1px;
}

.btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 弹窗样式开始 */
.el-dialog__header {
  border-bottom: 3px solid #e1e1e1;
  margin-bottom: 24px;
}

/* 弹窗样式结束 */

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
}

.deleteIcon:hover {
  transform: rotate(90deg);
}

.deleteIcon .el-form-item__content {
  width: 20px !important;
  height: 20px !important;
  margin: 0 !important;
  cursor: pointer;
  justify-content: center;
}

.deleteIcon path {
  fill: #fff;
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
  background-color: aliceblue;
  padding: 8px;
}

/* 表单样式结束 */

/* 全局样式弹窗样式开始 */
.globeStyleDialog {
  height: 60%;
}

.globeStyleDialog .el-dialog__body {
  height: calc(100% - 110px);
}

.globeStyleDialog .el-textarea__inner, .globeStyleDialog .el-textarea {
  height: 100% !important;
}

/* 全局样式弹窗样式结束 */

/* 配置加载器弹窗样式开始 */
.configLoaderHeader {
  display: flex;
  align-items: center;
}

/* 配置加载器弹窗样式结束 */
</style>