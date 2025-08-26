<script setup>
import {defineEmits, ref, toRefs, watch} from 'vue'
import {Close, Coordinate, CopyDocument, Download, Picture, ZoomIn} from "@element-plus/icons-vue"
import {ElIcon, ElPopconfirm, ElTooltip} from "element-plus"

const emit = defineEmits(['onDelete', 'onStyleEdit', 'zoomIn', 'exportComponent', 'copy'])
const props = defineProps({
  id: String,
  type: String,
  enableEdit: Object,
  enableMove: Object,
  ctrl: Object
})
const {id, type, enableEdit, enableMove, ctrl} = toRefs(props)

function deleteItem() {
  setTimeout(() => emit('onDelete', id), 300)
}

function editStyle() {
  emit('onStyleEdit', id)
}

function copy() {
  emit('copy', id, type)
}

function zoomIn() {
  emit('zoomIn', id, type)
}

function exportComponent() {
  emit('exportComponent', id, type)
}

const operatorContainer = ref(null)
</script>

<template>
  <div
    v-show="enableEdit || enableMove || ctrl"
    ref="operatorContainer"
    :class="['operatorContainer', {'visible': enableEdit || enableMove || ctrl}]"
  >
    <el-popconfirm
      v-if="enableEdit || ctrl"
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
      v-if="enableEdit || ctrl"
      effect="light"
      content="编辑组件样式"
      placement="bottom-start"
    >
      <el-icon class="editStyle" @click="editStyle">
        <Picture/>
      </el-icon>
    </el-tooltip>

    <el-tooltip
      effect="light"
      content="放大组件"
      placement="bottom-start"
    >
      <el-icon class="zoomIn" @click="zoomIn">
        <ZoomIn/>
      </el-icon>
    </el-tooltip>

    <el-tooltip
      v-if="enableMove || ctrl"
      effect="light"
      content="复制"
      placement="bottom-start"
    >
      <el-icon class="copy" @click="copy">
        <CopyDocument/>
      </el-icon>
    </el-tooltip>

    <el-tooltip
      v-if="enableEdit || ctrl"
      effect="light"
      content="导出组件数据"
      placement="bottom-start"
    >
      <el-icon class="exportComponent" @click="exportComponent">
        <Download/>
      </el-icon>
    </el-tooltip>

    <el-tooltip
      v-if="enableMove || ctrl"
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
  backdrop-filter: blur(4px);
  border-radius: 8px;
  transition: opacity 1s ease-in-out;
  animation: bgChange 1s infinite alternate;

  .deleteItem, .editStyle, .dragHandle, .zoomIn, .exportComponent, .copy {
    top: 0;
    cursor: pointer;
    width: 20px;
    pointer-events: auto;
    color: white;

    &:hover {
      scale: 1.6;
    }
  }

  .deleteItem {
    svg {
      background-color: #ff5050;
    }
  }

  .el-icon svg {
    height: unset !important;
    width: unset !important;
    border-radius: 48px;
    padding: 4px;
  }

  .zoomIn {
    cursor: zoom-in;

    svg {
      background-color: #42c87a;
    }
  }

  .copy {
    svg {
      background-color: #dfa946;
    }
  }

  .exportComponent {
    svg {
      background-color: #4671df;
    }
  }

  .editStyle {
    svg {
      background-color: #46a9df;
    }
  }

  .dragHandle {
    cursor: move;

    svg {
      background-color: #1d9333;
    }
  }
}

.visible {
  opacity: 1;
}

@keyframes bgChange {
  0% {
    background: rgba(255, 255, 255, 0.1);
  }
  100% {
    background: rgba(211, 211, 211, 0.1);
  }
}
</style>