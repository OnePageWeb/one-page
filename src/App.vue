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
    <button v-if="!isLock" @click="lock" class="btn">锁定</button>
    <button v-if="isLock" @click="unlock" class="btn">解锁</button>
  </div>
  <div ref="gridEl" class="grid-stack" @dblclick="() => showMenu = !showMenu"></div>
</template>

<script setup>
import {createApp, h, nextTick, onMounted, ref} from 'vue'
import {GridStack} from 'gridstack'
import {ElOption, ElSelect} from 'element-plus'
import 'gridstack/dist/gridstack.min.css'
import deleteButton from './items/DeleteButton.vue'
import textComponent from './components/TextComponent.vue'
import searchComponent from './components/SearchComponent.vue'
import iframeComponent from './components/IframeComponent.vue'
import linkComponent from './components/LinkComponent.vue'
import {v4} from 'uuid'

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
      // 添加格子
      addItem(el.type, el.x, el.y, el.w, el.h, el.id)
    }
  } else {
    // 添加初始格子
    addItem('text')
    addItem('search')
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
      deleteButton: deleteButton
    },
    props: ['id', 'isLock'],
    render() {
      return h('div', {
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
        h(deleteButton, {
          ref: 'deleteButton',
          style: {position: 'absolute'},
          id: this.id,
          isLock: isLock,
          onOnDelete: deleteItem
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
</style>