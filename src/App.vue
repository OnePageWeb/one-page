<template>
  <div>
    <button @click="addItem('text')" class="btn">添加文本格子</button>
    <button @click="addItem('search')" class="btn">添加搜索格子</button>
    <button v-if="!isLock" @click="lock" class="btn">锁定</button>
    <button v-if="isLock" @click="unlock" class="btn">解锁</button>
    <button @click="deleteItem" class="btn">删除格子</button>
    <div ref="gridEl" class="grid-stack"></div>
  </div>
</template>

<script setup>
import {createApp, h, nextTick, onMounted, ref} from 'vue'
import {GridStack} from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import deleteButton from './items/DeleteButton.vue'
import textComponent from './components/TextComponent.vue'
import searchComponent from './components/SearchComponent.vue'
import {v4} from 'uuid'

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
    addItem(el.text)
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
        h(deleteButton, {
          ref: 'deleteButton',
          style: {position: 'absolute', 'z-index': 1000},
          id: this.id,
          isLock: isLock,
          onOnDelete: deleteItem
        }),
        h(componentItem, {
          ref: 'componentItem',
          style: {position: 'absolute', 'z-index': 1},
          id: this.id,
          isLock: isLock
        }),
      ]);
    }
  }
}
const addItem = (type, x = '1', y = '1', w = '2', h = '2', id) => {
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
  let component = textComponent
  if (type === 'search') {
    component = searchComponent
  }
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
    // saveLayout()
  })
}
</script>

<style>
/* 栅格容器样式 */
.grid-stack {
  background: #f5f5f5;
  border: 1px dashed #ddd;
  min-height: 300px;
  margin-top: 10px;
}

/* 格子样式 */
.grid-stack-item {
  padding: 10px;
  margin: 1px;
}

/* 可拖拽样式 */
.grid-stack-item.ui-resizable-autohide::before {
  content: ""; /* 必须设置 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg, /* 45度斜角 */
    rgba(150, 150, 150, 0.1), /* 黑色半透明 */
    rgba(150, 150, 150, 0.1) 40px, /* 条纹宽度 */
    rgba(255, 255, 255, 0.1) 40px, /* 白色半透明 */
    rgba(255, 255, 255, 0.1) 80px /* 条纹间距 */
  );
  z-index: 1; /* 确保蒙层在内容上方 */
}

/* 拖拽手柄样式 */
.grid-stack-item .ui-resizable-handle {
  background: #1890ff;
  width: 12px;
  height: 12px;
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