<script setup>
import {defineEmits, ref, toRefs} from 'vue'
import {Close, Connection, CopyDocument, DArrowLeft, Download, Picture, Promotion, Rank} from "@element-plus/icons-vue"
import {ElIcon, ElPopconfirm, ElTooltip} from "element-plus"
import {useI18n} from "vue-i18n"

const {t} = useI18n()

const emit = defineEmits(['delete', 'styleEdit', 'focus', 'exportComponent', 'copy', 'module', 'unFocus'])
const props = defineProps({
  id: String,
  type: String,
  enableEdit: Object,
  enableMove: Object,
  focusMode: Object,
  focusId: String,
  ctrl: Object,
  transferData: Function,
})
const {id, type, enableEdit, enableMove, focusMode, focusId, ctrl} = toRefs(props)

function deleteItem() {
  setTimeout(() => emit('delete', id), 300)
}

function editStyle() {
  emit('styleEdit', id)
}

function copy() {
  emit('copy', id, type)
}

function module() {
  emit('module', id, type)
}

function focus() {
  if (focusMode.value) {
    emit('focus', id, type)
  }
}

const unFocus = () => {
  emit('unFocus', id, type)
}

function onTransferStart(e) {
  e.stopPropagation()
  const transferData = props.transferData(id.value, type.value)
  e.dataTransfer.setData('text/plain', JSON.stringify(transferData))
}

function exportComponent() {
  emit('exportComponent', id, type)
}

const operatorContainer = ref(null)
</script>

<template>
  <div ref="operatorContainer" class="operatorContainer">
    <div v-if="enableEdit || enableMove || ctrl || focusId === id" class="buttonContainer">

      <el-tooltip
          v-if="enableEdit && !enableMove"
          effect="light"
          :content="t('component.operate.transfer')"
          placement="top-start"
          :show-after="300"
          :hide-after="10"
          :enterable="false"
      >
        <el-icon
            class="transfer"
            draggable="true"
            @dragstart.stop="onTransferStart"
        >
          <Promotion/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="enableMove || ctrl"
          effect="light"
          :content="t('component.operate.drag')"
          placement="top-start"
          :show-after="300"
          :hide-after="10"
          :enterable="false"
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
          :hide-after="10"
          :enterable="false"
      >
        <el-icon class="exportComponent" @click.prevent.stop="exportComponent">
          <Download/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="enableMove || ctrl"
          effect="light"
          :content="t('component.operate.module')"
          placement="top-start"
          :show-after="300"
          :hide-after="10"
          :enterable="false"
      >
        <el-icon class="module" @click.prevent.stop="module">
          <Connection/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="enableMove || ctrl"
          effect="light"
          :content="t('component.operate.copy')"
          placement="top-start"
          :show-after="300"
          :hide-after="10"
          :enterable="false"
      >
        <el-icon class="copy" @click.prevent.stop="copy">
          <CopyDocument/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="enableEdit || ctrl"
          effect="light"
          :content="t('component.operate.style')"
          placement="top-start"
          :show-after="300"
          :hide-after="10"
          :enterable="false"
      >
        <el-icon class="editStyle" @click.prevent.stop="editStyle">
          <Picture/>
        </el-icon>
      </el-tooltip>
      <el-popconfirm
          v-if="enableEdit || enableMove || ctrl"
          class="deleteItem"
          width="240px"
          :title="t('component.operate.deleteConfirm')"
          placement="top-start"
          :confirm-button-text="t('common.confirm')"
          :cancel-button-text="t('common.cancel')"
          @confirm="deleteItem"
      >
        <template #reference>
          <el-icon class="deleteItem" @click.prevent.stop>
            <Close/>
          </el-icon>
        </template>
      </el-popconfirm>
      <el-tooltip
          v-if="focusId === id"
          effect="light"
          :content="t('component.operate.cancelFocus')"
          placement="top-start"
          :show-after="300"
          :hide-after="10"
          :enterable="false"
      >
        <el-icon
            class="cancelFocus"
            @click.stop="unFocus(id)"
        >
          <DArrowLeft/>
        </el-icon>
      </el-tooltip>
    </div>

    <!-- 效果盖板 -->
    <div :class="{
      'operatorArea': true,
      'focusClick': focusMode,
      'onlyMoveMode': enableMove && !enableEdit && !ctrl,
      'onEditMode': enableEdit || ctrl,
      'onFocus': focusMode
    }"
         @click.prevent.stop="focus"
    />
  </div>
</template>

<style>
.operatorContainer {
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  transition: opacity 1s ease-in-out;
  z-index: 3;
  position: absolute;

  &:hover {
    .buttonContainer {
      opacity: 1;
    }
  }

  .buttonContainer {
    width: fit-content;
    height: fit-content;
    padding: 4px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 4px;
    position: relative;
    pointer-events: auto;
    top: -11px;
    right: -6px;
    z-index: 11;
    opacity: 0;

    &:hover {
      padding-left: 8px;
      padding-right: 8px;
      padding-top: 24px;
      z-index: 12;

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
      font-size: inherit;

      &.transfer {
        color: var(--color-transfer);
      }

      &:hover {
        scale: 1.2;
      }

      svg {
        height: unset;
        width: unset;
        border-radius: 48px;
        padding: 4px;
        border: 2px solid rgba(255, 255, 255);
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
      }
    }

    .deleteItem {
      svg {
        background-color: var(--color-delete);
      }
    }

    .cancelFocus {
      width: 32px;
      scale: 1.2;
      margin-left: 8px;

      svg {
        background-color: rgba(0, 0, 0, 0.7);
      }
    }

    .copy {
      svg {
        background-color: var(--color-copy);
      }
    }

    .module {
      svg {
        background-color: var(--color-module);
      }
    }

    .exportComponent {
      svg {
        background-color: var(--color-export);
      }
    }

    .editStyle {
      svg {
        background-color: var(--color-edit);
      }
    }

    .dragHandle {
      cursor: move;

      svg {
        background-color: var(--color-drag);
      }
    }

  }

  .operatorArea {
    height: calc(100% - 4px);
    width: calc(100% - 4px);
    top: 0;
    left: 0;
    position: absolute;
  }

  .focusClick {
    position: absolute;
    top: 0;
    left: 0;
    height: calc(100% - 4px);
    width: calc(100% - 4px);
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    border: 2px dashed rgb(255, 255, 255);
    z-index: 11;

    &:hover {
      opacity: .2;
      height: calc(100% + 12px);
      width: calc(100% + 12px);
      top: -8px;
      left: -8px;
      box-shadow: 0 0 16px rgba(0, 0, 0, 0.6);
    }
  }

  .onlyMoveMode {
    background-color: rgba(255, 255, 255, 0.2);
    pointer-events: auto;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .onEditMode {
    border: 2px dashed rgba(255, 255, 255, 0.6);
  }

  .onFocus {
    pointer-events: all;
  }

}

</style>