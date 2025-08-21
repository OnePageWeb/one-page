<script setup>
import {defineEmits, ref, toRefs} from 'vue'
import {Close, Coordinate, Picture} from "@element-plus/icons-vue"
import {ElIcon, ElPopconfirm, ElTooltip} from "element-plus"

const emit = defineEmits(['onDelete', 'onStyleEdit'])
const props = defineProps({
  id: String,
  enableEdit: Object,
  enableMove: Object,
})
const {id, enableEdit, enableMove} = toRefs(props)

function deleteItem() {
  setTimeout(() => emit('onDelete', id), 300)
}

function editStyle() {
  emit('onStyleEdit', id)
}

const operatorContainer = ref(null)

let timer = null
function onMouseEnter() {
  // 重新计时
  if (timer) {
    clearTimeout(timer)
  }
  operatorContainer.value.style.opacity = 1
}

function onMouseLeave() {
  // 重新计时
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    operatorContainer.value.style.opacity = 0
  }, 800)
}
</script>

<template>
  <div
    v-show="enableEdit || enableMove"
    ref="operatorContainer"
    class="operatorContainer"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <el-popconfirm
      v-if="enableEdit"
      class="deleteItem"
      title="确定删除此组件"
      placement="top-start"
      confirm-button-text="确定"
      cancel-button-text="取消"
      @confirm="deleteItem"
    >
      <template #reference>
        <el-icon class="deleteItem">
          <Close/>
        </el-icon>
      </template>
    </el-popconfirm>

    <el-tooltip
      v-if="enableEdit"
      class="editStyle"
      effect="light"
      content="编辑组件样式"
      placement="bottom-start"
    >
      <el-icon class="editStyle" @click="editStyle">
        <Picture/>
      </el-icon>
    </el-tooltip>

    <el-tooltip
      v-if="enableMove"
      class="dragHandle"
      effect="light"
      content="拖动组件，按住组件边框也可以进行拖动"
      placement="bottom-start"
    >
      <el-icon class="dragHandle">
        <Coordinate/>
      </el-icon>
    </el-tooltip>
  </div>
</template>

<style scoped>
.operatorContainer {
  height: calc(100% + 28px);
  width: calc(100% + 16px);
  opacity: 0;
  top: -20px;
  left: -8px;
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
}

.deleteItem, .editStyle, .dragHandle {
  top: 0;
  cursor: pointer;
  width: 20px;
  pointer-events: auto;
}

.deleteItem {

  :deep(path) {
    fill: #ffc9c9;
  }
}

.el-icon svg {
  height: unset !important;
  width: unset !important;
  border-radius: 48px;
  background-color: #ff5050;
  padding: 4px;
}

.editStyle {
  :deep(path) {
    fill: #ffc9c9;
  }
}

.dragHandle {
  cursor: move;

  svg {
    background-color: #1d9333;
  }

  :deep(path) {
    fill: #ffffff;
  }

}
</style>