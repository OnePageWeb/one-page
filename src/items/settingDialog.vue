<script setup>
import CommonDialog from "@/items/commonDialog.vue"
import {ref, watch} from "vue"
import {changeLanguage, getCurrentLanguage} from "@/i18n/utils.js"
import {ElEmpty, ElTag, ElText} from "element-plus"
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const dialogVisible = ref(false)

const projectList = {
  LANG: t('lang.title'),
  ABOUT: t('about.title')
}
const projectItem = ref('LANG')

const currentLang = ref(getCurrentLanguage())
watch(currentLang, (newLang) => {
  changeLanguage(newLang)
})
const selectLanguage = (lang) => {
  changeLanguage(lang)
  currentLang.value = lang
}
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
        <el-text
            v-for="key in Object.keys(projectList)"
            :key="key"
            :class="{'active': projectItem === key}"
            class="titleText"
            tag="div"
            @click="projectItem = key">{{ projectList[key] }}
        </el-text>
      </div>

      <div class="project">
        <div v-if="projectItem === 'LANG'">
          <el-tag
              v-for="item in langList"
              :key="item"
              :class="{'activeTag': item === currentLang, 'curTag': item === currentLang}"
              @click="selectLanguage(item)"
          >
            {{ t(`lang.${item}`) }}
          </el-tag>
        </div>
        <div v-else-if="projectItem === 'ABOUT'">
          <div v-html="t('about.content')"/>
        </div>
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
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;

    .titleText {
      border-left: 4px solid rgba(255, 165, 0, 0.5);
      padding: 4px 24px;
      font-size: 24px;
      align-self: unset;

      &:hover {
        cursor: pointer;
        padding-left: 36px;
        padding-right: 36px;
        background-color: #eaeaea;
        border-left: 8px solid orange;
      }

      &.active {
        background-color: #eaeaea;
        border-left: 8px solid orange;
      }
    }
  }

  .project {
    width: calc(100% - 256px);
    height: calc(100% - 48px);
    float: left;
    padding: 24px;
    overflow: auto;

    & > * {
      width: 100%;
      height: 100%;
    }

    .langSelect {

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