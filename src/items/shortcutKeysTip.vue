<script setup>
import {Edit, Operation, Rank, RefreshRight, UploadFilled, View} from "@element-plus/icons-vue"
import {ElIcon} from "element-plus"

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div :class="['shortcutKeys', {'shortcutKeysHidden': !visible}]">
    <div class="shortcutKeysList">
      <div class="shortcutKeysItem">
        <div class="shortcutKeysItemTitle">Q</div>
        <el-icon>
          <Rank/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.q') }}</div>
      </div>
      <div class="shortcutKeysItem">
        <div class="shortcutKeysItemTitle">E</div>
        <el-icon>
          <Edit/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.e') }}</div>
      </div>
      <div class="shortcutKeysItem">
        <div class="shortcutKeysItemTitle">D</div>
        <el-icon>
          <Operation/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.d') }}</div>
      </div>
      <div class="shortcutKeysItem">
        <div class="shortcutKeysItemTitle">R</div>
        <el-icon>
          <RefreshRight/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.r') }}</div>
      </div>
      <div class="shortcutKeysItem">
        <div class="shortcutKeysItemTitle">F</div>
        <el-icon>
          <UploadFilled/>
        </el-icon>
        <div class="shortcutKeysItemDesc">{{ $t('shortcut.f') }}</div>
      </div>
      <div class="shortcutKeysItem">
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
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  width: calc(20% - 56px);
  bottom: 5%;
  left: 40%;
  opacity: 1;
  padding: 24px;
  border-radius: 24px;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.5);
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease-in-out;
  pointer-events: none;
  border: 4px solid rgba(255, 255, 255, 0.6);

  * {
    user-select: none;
    pointer-events: none;
  }

  .shortcutKeysList {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-items: center;
    flex-direction: column;
  }

  .shortcutKeysItem {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 20px;
    justify-content: flex-start;
    width: 100%;

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
  }
}

.shortcutKeysHidden {
  opacity: 0;
  padding: 0;
  bottom: 0;

  * {
    opacity: 0;
    padding: 0;
  }
}
</style>