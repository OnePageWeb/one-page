<script setup>
import CommonDialog from "@/items/commonDialog.vue"
import {ref, watch} from "vue"
import {changeLanguage, getCurrentLanguage} from "@/i18n/utils.js"
import {ElOption, ElSelect, ElText} from "element-plus"
import {useI18n} from 'vue-i18n'
const {t} = useI18n()

const dialogVisible = ref(false)

const projectList = {
  LANG: 'LANG'
}
const projectItem = ref(projectList.LANG)

const currentLang = ref(getCurrentLanguage())
watch(currentLang, (newLang) => {
  changeLanguage(newLang)
})
const langList = [
  'zh',
  'en'
]

defineExpose({
  openDialog() {
    dialogVisible.value = true
  }
})
</script>

<template>
  <common-dialog
      :model-value="dialogVisible"
      class="settingDialog"
      width="800px"
      @closed="dialogVisible = false"
  >
    <div>
      <div class="title">
        <el-text :class="{'active': projectItem === projectList.LANG}" class="titleText" @click="projectItem = projectList.LANG">{{ $t('lang.title') }}</el-text>
      </div>

      <div class="project">
        <el-select v-if="projectItem === projectList.LANG" class="langSelect" v-model="currentLang">
          <el-option
              v-for="item in langList"
              :key="item"
              :label="t(`lang.${item}`)"
              :value="item"
          />
        </el-select>
      </div>
    </div>
  </common-dialog>

</template>

<style>
.settingDialog {
  height: 40%;

  .el-dialog__body {
    height: calc(100% - 80px) !important;
  }

  .title {
    width: 200px;
    height: 100%;
    float: left;
    border-right: 4px solid var(--color-black);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;

    .titleText {
      border-left: 8px solid orange;
      padding: 4px 24px;
      font-size: 24px;

      &:hover {
        cursor: pointer;
        padding-left: 36px;
        padding-right: 36px;
        background-color: #eaeaea;
      }

      &.active {
        background-color: #eaeaea;
      }
    }
  }

  .project {
    width: calc(100% - 256px);
    height: calc(100% - 48px);
    float: left;
    padding: 24px;

    .langSelect {
      width: 100%;

      .el-select__wrapper {
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
        border-left: var(--button-border-left);
        border-right: var(--button-border-left);
        border-top: var(--button-border-top);
        border-bottom: var(--button-border-top);
        font-size: 18px;
        height: 36px;

        &:hover {
          border: 2px solid var(--color-black);
        }
      }
    }
  }
}
</style>