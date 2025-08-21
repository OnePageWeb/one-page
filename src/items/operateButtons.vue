<script setup>
import {defineEmits, ref, toRefs} from 'vue'
import {Close, Coordinate, Picture, ZoomIn} from "@element-plus/icons-vue"
import {ElIcon, ElPopconfirm, ElTooltip} from "element-plus"

const emit = defineEmits(['onDelete', 'onStyleEdit', 'zoomIn'])
const props = defineProps({
  id: String,
  type: String,
  enableEdit: Object,
  enableMove: Object,
})
const {id, type, enableEdit, enableMove} = toRefs(props)

function deleteItem() {
  setTimeout(() => emit('onDelete', id), 300)
}

function editStyle() {
  emit('onStyleEdit', id)
}

function zoomIn() {
  emit('zoomIn', id, type)
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
        class="zoomIn"
        effect="light"
        content="放大组件"
        placement="bottom-start"
    >
      <el-icon class="zoomIn" @click="zoomIn">
        <ZoomIn />
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
  backdrop-filter: blur(4px);
  border-radius: 8px;
  background: repeating-linear-gradient(
    45deg,
    rgba(150, 150, 150, 0.1),
    rgba(150, 150, 150, 0.1) 40px,
    rgba(255, 255, 255, 0.1) 40px,
    rgba(255, 255, 255, 0.1) 80px
  );
  transition: opacity 0.5s ease-in-out;
  animation: bgChange 1s infinite alternate;

  .deleteItem, .editStyle, .dragHandle, .zoomIn {
    top: 0;
    cursor: pointer;
    width: 20px;
    pointer-events: auto;
    color: white;

    &:hover {
      scale: 1.5;
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

@keyframes bgChange {
  0% {
    background: rgba(255, 255, 255, 0.5);
  }
  100% {
    background: rgba(211, 211, 211, 0.5);
  }
}
</style>