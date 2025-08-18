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
    <el-button v-if="!isLock" @click="lock" class="btn">锁定</el-button>
    <el-button v-if="isLock" @click="unlock" class="btn">解锁</el-button>
    <el-button @click="editGlobeStyle" class="btn">全局样式</el-button>
    <el-button @click="openLoadConfig" class="btn">加载配置</el-button>
  </div>
  <div ref="gridEl" class="grid-stack" @dblclick="() => showMenu = !showMenu"></div>

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
    <el-input
      v-model="configData"
      class="globeStyleInput"
      type="textarea"
      resize="none"
      placeholder="请输入配置URL"
    />
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
import {ElButton, ElDialog, ElInput, ElMessage, ElOption, ElSelect} from 'element-plus'
import 'gridstack/dist/gridstack.min.css'
import operateButtons from './items/operateButtons.vue'
import textComponent from './components/TextComponent.vue'
import searchComponent from './components/SearchComponent.vue'
import iframeComponent from './components/IframeComponent.vue'
import linkComponent from './components/LinkComponent.vue'
import {v4} from 'uuid'
import {startsWith} from './js/string.js'
import {parseBlobJson} from './js/url.js'

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
  background-color: #f5f5f5;
}`)

// 初始化GridStack
onMounted(() => {
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
async function loadConfig() {
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
    ElMessage.error('配置文件格式错误')
    return
  }
  if (!config || typeof config !== 'object') {
    ElMessage.error('配置文件格式错误')
    return
  }
  // 清除旧配置
  clearConfig()
  console.log('config', config)
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
  window.location.reload()
}
// 下载配置
function downloadConfig() {
  // 1. 将JSON转换为字符串
  const jsonStr = JSON.stringify(generateConfig(), null, 2); // 第三个参数美化格式
  const filename = 'config.json'
  // 2. 创建Blob对象
  const blob = new Blob([jsonStr], { type: 'application/json' });
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
</script>

<style>
body {
  margin: 0 !important;
}

.menu {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  transition: height 0.3s ease;
}

.menu-show {
  height: 80px;
}

.menu-hide {
  height: 0;
}

/* 选择器样式 */
.el-select.addItemSelect {
  width: 160px;
}

/* 栅格容器样式 */
.grid-stack {
  background: #f5f5f5;
  border: 1px dashed #ddd;
  min-height: 300px;
}

.grid-stack-item.ui-resizable-autohide {
  border: 1px dashed #dcdcdc;
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

.globeStyleDialog {
  height: 60%;
}
.globeStyleDialog .el-dialog__body {
  height: calc(100% - 90px);
}
.globeStyleDialog .el-textarea__inner, .globeStyleDialog .el-textarea {
  height: 100% !important;
}
</style>