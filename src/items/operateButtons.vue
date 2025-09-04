<script setup>
import {defineEmits, ref, toRefs} from 'vue'
import {Close, Connection, CopyDocument, Download, Picture, Rank, ZoomIn} from "@element-plus/icons-vue"
import {ElIcon, ElPopconfirm, ElTooltip} from "element-plus"
import {useI18n} from "vue-i18n"
const {t} = useI18n()

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
      :class="['operatorContainer', {'visible': enableEdit || enableMove || ctrl, 'onlyMove': enableMove && !enableEdit && !ctrl}]"
  >
    <div class="buttonContainer">

      <el-tooltip
          v-if="enableMove || ctrl"
          effect="light"
          :content="t('component.operate.drag')"
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
          :content="t('component.operate.export')"
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
          :content="t('component.operate.module')"
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
          :content="t('component.operate.copy')"
          placement="top-start"
          :show-after="300"
      >
        <el-icon class="copy" @click="copy">
          <CopyDocument/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          effect="light"
          :content="t('component.operate.zoomIn')"
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
          :content="t('component.operate.style')"
          placement="top-start"
          :show-after="300"
      >
        <el-icon class="editStyle" @click="editStyle">
          <Picture/>
        </el-icon>
      </el-tooltip>
      <el-popconfirm
          v-if="enableEdit || enableMove || ctrl"
          class="deleteItem"
          width="180px"
          :title="t('component.operate.deleteConfirm')"
          placement="top-start"
          :confirm-button-text="t('common.confirm')"
          :cancel-button-text="t('common.cancel')"
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
  z-index: 20;

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

.onlyMove {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  pointer-events: all;
}

</style>