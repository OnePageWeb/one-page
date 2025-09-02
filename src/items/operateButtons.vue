<script setup>
import {defineEmits, ref, toRefs} from 'vue'
import {Close, Connection, CopyDocument, Download, Picture, Rank, ZoomIn} from "@element-plus/icons-vue"
import {ElIcon, ElPopconfirm, ElTooltip} from "element-plus"

const emit = defineEmits(['onDelete', 'onStyleEdit', 'zoomIn', 'exportComponent', 'copy', 'module'])
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

function module() {
  emit('module', id, type)
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
    <div class="buttonContainer">

      <el-tooltip
          v-if="enableMove || ctrl"
          effect="light"
          content="拖动组件，按住组件边框也可以进行拖动"
          placement="top-start"
          :show-after="300"
      >
        <el-icon class="dragHandle">
          <Rank/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="enableEdit || ctrl"
          effect="light"
          content="导出此组件数据"
          placement="top-start"
          :show-after="300"
      >
        <el-icon class="exportComponent" @click="exportComponent">
          <Download/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="enableMove || ctrl"
          effect="light"
          content="模板"
          placement="top-start"
          :show-after="300"
      >
        <el-icon class="module" @click="module">
          <Connection/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="enableMove || ctrl"
          effect="light"
          content="复制此组件"
          placement="top-start"
          :show-after="300"
      >
        <el-icon class="copy" @click="copy">
          <CopyDocument/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          effect="light"
          content="放大此组件"
          placement="top-start"
          :show-after="300"
      >
        <el-icon class="zoomIn" @click="zoomIn">
          <ZoomIn/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="enableEdit || ctrl"
          effect="light"
          content="编辑此组件样式"
          placement="top-start"
          :show-after="300"
      >
        <el-icon class="editStyle" @click="editStyle">
          <Picture/>
        </el-icon>
      </el-tooltip>
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
    </div>
  </div>
</template>

<style scoped>
.operatorContainer {
  height: calc(100% - 4px);
  width: calc(100% - 4px);
  opacity: 0;
  top: 0;
  left: 0;
  display: flex;
  border: 2px dashed rgba(255, 255, 255, 0.32);
  justify-content: flex-end;
  border-radius: 8px;
  pointer-events: none;
  transition: opacity 1s ease-in-out;

  .buttonContainer {
    width: fit-content;
    max-width: calc(100% - 16px);
    height: fit-content;
    padding: 8px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 4px;
    position: relative;
    pointer-events: auto;

    &:hover {
      gap: 8px;

      .el-icon {
        width: 32px;
        position: unset;

        svg {
          border: 2px solid rgba(255, 255, 255, 0.5);
        }
      }
    }

    .el-icon {
      cursor: pointer;
      width: 8px;
      pointer-events: auto;
      color: white;

      &:hover {
        scale: 1.4;
      }
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

  .module {
    svg {
      background-color: #46a9df;
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

</style>