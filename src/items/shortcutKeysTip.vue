<script setup>
import {Edit, Operation, Rank, RefreshRight, UploadFilled, View} from "@element-plus/icons-vue"
import {ElIcon} from "element-plus"

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  e: {
    type: Boolean,
    default: false,
  },
  d: {
    type: Boolean,
    default: false,
  },
  q: {
    type: Boolean,
    default: false,
  },
  w: {
    type: Boolean,
    default: false,
  },
  f: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['e', 'd', 'q', 'w', 'f', 'r', '~'])
</script>

<template>
  <div :class="['shortcutKeys', {'shortcutKeysHidden': !visible}]">
    <div class="shortcutKeysList">
      <div :class="['shortcutKeysItem', 'enabledActive', q ? 'activeKey' : '']" @click="emit('q')">
        <div class="shortcutKeysItemTitle">Q</div>
        <el-icon>
          <Rank/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.q') }}</div>
      </div>
      <div :class="['shortcutKeysItem', 'enabledActive', e ? 'activeKey' : '']" @click="emit('e')">
        <div class="shortcutKeysItemTitle">E</div>
        <el-icon color="#ffffff">
          <Edit/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.e') }}</div>
      </div>
      <div :class="['shortcutKeysItem', 'enabledActive', d ? 'activeKey' : '']" @click="emit('d')">
        <div class="shortcutKeysItemTitle">D</div>
        <el-icon>
          <Operation/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.d') }}</div>
      </div>
      <div :class="['shortcutKeysItem', 'enabledActive', w ? 'activeKey' : '']" @click="emit('w')">
        <div class="shortcutKeysItemTitle">W</div>
        <el-icon>
          <Operation/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.w') }}</div>
      </div>
      <div class="shortcutKeysItem enabledActive" @click="emit('r')">
        <div class="shortcutKeysItemTitle">R</div>
        <el-icon>
          <RefreshRight/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.r') }}</div>
      </div>
      <div :class="['shortcutKeysItem', 'enabledActive', f ? 'activeKey' : '']" @click="emit('f')">
        <div class="shortcutKeysItemTitle">F</div>
        <el-icon>
          <UploadFilled/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.f') }}</div>
      </div>
      <div class="shortcutKeysItem enabledActive" @click="emit('~')">
        <div class="shortcutKeysItemTitle">~</div>
        <el-icon>
          <View/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.~') }}</div>
      </div>
    </div>
  </div>
</template>

<style>
/* 快捷键样式 */
.shortcutKeys {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  width: calc(50% - 56px);
  bottom: 120px;
  left: calc(25% - 20px);
  opacity: 1;
  padding: 24px 48px;
  border-radius: 8px;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.5);
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease-in-out;
  border-top: 12px solid var(--dialog-background-bar);
  border-bottom: 12px solid var(--dialog-background-footer);
  border-right: unset;
  border-left: unset;
  pointer-events: all;

  * {
    user-select: none;
  }

  .enabledActive {
    cursor: pointer;
  }

  .shortcutKeysList {
    font-size: 24px;
    font-weight: bold;
  }

  .shortcutKeysItem {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 20px;
    padding-left: 1vw;
    justify-content: flex-start;
    width: calc(50% - 2vw);
    float: left;
    border-radius: 8px;
    border-left: 1vw solid transparent;

    &:hover {
      gap: 40px;
      border-left: 1vw solid orange;
    }

    .el-icon {
      color: #ffffff;
      height: 2vw;
      width: 2vw;

      svg {
        height: 100%;
        width: 100%;
      }
    }

    .shortcutKeysItemTitle {
      font-size: 3vw;
      font-weight: bold;
      width: 3vw;
      color: #ffffff;
    }

    .shortcutKeysItemDesc {
      font-size: 1.5vw;
      font-weight: bold;
      color: #e3e3e3;
    }

    &.activeKey {
      .shortcutKeysItemTitle, .shortcutKeysItemDesc, .el-icon {
        color: orange;
      }
    }
  }
}

.shortcutKeysHidden {
  opacity: 0;
  padding: 0;
  bottom: 0;
  pointer-events: none;

  * {
    opacity: 0;
    padding: 0;
  }
}
</style>