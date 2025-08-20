<script setup>
import {defineEmits, toRefs} from 'vue'
import {Close, Coordinate, Picture} from "@element-plus/icons-vue"
import {ElIcon, ElPopconfirm, ElTooltip} from "element-plus"

const emit = defineEmits(['onDelete', 'onStyleEdit'])
const props = defineProps({
  id: String,
  enableEdit: Object
})
const {id, enableEdit} = toRefs(props)

function deleteItem() {
  setTimeout(() => emit('onDelete', id), 300)
}

function editStyle() {
  emit('onStyleEdit', id)
}
</script>

<template>
  <div v-show="enableEdit" class="container">
    <el-popconfirm
      class="deleteItem"
      title="确定删除此组件"
      placement="top-start"
      confirm-button-text="确定"
      cancel-button-text="取消"
      @confirm="deleteItem"
    >
      <template #reference>
        <div>
          <el-tooltip
            class="deleteItem"
            effect="light"
            content="删除组件"
            placement="bottom-start"
          >
            <el-icon class="deleteItem">
              <Close/>
            </el-icon>
          </el-tooltip>
        </div>
      </template>
    </el-popconfirm>

    <el-tooltip
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
      v-if="false"
      class="dragHandle"
      effect="light"
      content="拖动组件"
      placement="bottom-start"
    >
      <el-icon class="dragHandle">
        <Coordinate/>
      </el-icon>
    </el-tooltip>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  opacity: 0.4;
  pointer-events: none;
}

.container:hover {
  opacity: 1;
}

.deleteItem, .editStyle, .dragHandle {
  position: absolute;
  top: 0;
  cursor: pointer;
  width: 20px;
  pointer-events: auto;
}

.deleteItem {
  right: 0;

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
  right: 24px;

  :deep(path) {
    fill: #ffc9c9;
  }
}

.dragHandle {
  right: 48px;
  cursor: move;

  svg {
    background-color: #1d9333;
  }

  :deep(path) {
    fill: #ffffff;
  }

}
</style>