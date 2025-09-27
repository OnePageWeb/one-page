<script lang="ts" setup>
import CommonDialog from "@/items/commonDialog.vue"
import {ref, watch} from "vue"
import {changeLanguage, getCurrentLanguage} from "@/i18n/utils.js"
import {ElButton, ElInput, ElSegmented, ElTag, ElText} from "element-plus"
import {useI18n} from 'vue-i18n'
import {loadData} from "@/js/data.js"
import {BackgroundType, splitBackgroundData} from "@/js/background.js"
import FileLibrary from "@/items/fileLibrary.vue"

const {t} = useI18n()

const emit = defineEmits(['backgroundChanged'])

const dialogVisible = ref(false)

const projectList = {
  LANG: t('lang.title'),
  BACKGROUND: t('background.title'),
  FILE_LIBRARY: t('fileLibrary.title'),
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

// 背景类型
const backgroundType = ref(BackgroundType.IMG)
const backgroundOptions = [
  {
    label: t('background.type.img'),
    value: BackgroundType.IMG
  },
  {
    label: t('background.type.css'),
    value: BackgroundType.CSS
  },
  {
    label: t('background.type.html'),
    value: BackgroundType.HTML
  }
]

const appBackground = ref('')
const saveBackground = () => {
  let bg = appBackground.value.trim()
  for (const key of Object.keys(BackgroundType)) {
    if (backgroundType.value === BackgroundType[key]) {
      bg = `${backgroundType.value}:${bg}`
      break
    }
  }
  emit('backgroundChanged', bg)
}

const initBackground = () => {
  const data = loadData('appBackground') || ''
  if (data) {
    const split = splitBackgroundData(data)
    if (split.length === 2) {
      const type = split[0]
      if (backgroundOptions.findIndex(item => item.value === type) !== -1) {
        backgroundType.value = type
        appBackground.value = split[1]
      }
    }
  }
}

defineExpose({
  openDialog() {
    initBackground()
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
        <!-- 语言栏 -->
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
        <!-- 背景设置 -->
        <div v-else-if="projectItem === 'BACKGROUND'">
          <div>
            <el-segmented
                v-model="backgroundType"
                :options="backgroundOptions"
                style="margin-bottom: 1rem"
            />
            <el-input
                v-model="appBackground"
                class="backgroundInput"
                :rows="8"
                type="textarea"
            />
          </div>
          <div style="margin-top: 8px">
            <el-button style="float: right" @click="saveBackground">{{ t('common.apply') }}</el-button>
          </div>
        </div>
        <!-- 文件库 -->
        <div v-else-if="projectItem === 'FILE_LIBRARY'">
          <file-library ref="fileLibraryDialogRef" />
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
  height: 50%;

  .el-dialog__body {
    height: calc(100% - 80px) !important;
  }

  .title {
    width: 30%;
    height: 100%;
    float: left;
    border-right: 4px solid var(--color-black);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;

    .titleText {
      border-left: 4px solid rgba(255, 165, 0, 0.5);
      max-width: calc(100% - 80px);
      padding: 4px 24px;
      font-size: 24px;
      align-self: unset;

      &:hover {
        cursor: pointer;
      }

      &.active, &:hover {
        padding-left: 36px;
        padding-right: 36px;
        background-color: #eaeaea;
        border-left: 8px solid orange;
      }
    }
  }

  .project {
    width: calc(70% - 56px);
    height: calc(100% - 48px);
    float: left;
    padding: 24px;
    overflow: auto;

    & > * {
      width: 100%;
    }

    .backgroundInput {
      .el-input__inner {
        padding: 4px 12px;
        font-size: 18px;
      }
    }
  }
}
</style>