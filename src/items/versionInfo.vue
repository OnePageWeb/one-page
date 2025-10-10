<script lang="ts" setup>
import packageJson from '../../package.json'
import {loadDataDirect, saveDataDirect} from "@/js/data.js"
import {onMounted, ref} from 'vue'
import {ElIcon, ElLink, ElTooltip} from "element-plus"
import {useI18n} from "vue-i18n"
import {Close} from "@element-plus/icons-vue"
import {warning} from "@/js/message.js"

const {t} = useI18n()

console.log('当前版本:', packageJson.version)
const currentVersion = ref(packageJson.version)
const lastVersion = loadDataDirect('app-version') || currentVersion.value

// 状态管理
const isShow = ref(true)
const releases = ref<any[]>([])
const repoUrl = 'https://github.com/Verlif/one'
const apiUrl = 'https://api.github.com/repos/Verlif/one/releases?per_page=10'

// 处理版本号格式（移除可能的 'v' 前缀）
const normalizeVersion = (version: string) => {
  return version.replace(/^v/, '').split('-')[0]
}

// 比较版本号大小
const compareVersions = (v1: string, v2: string) => {
  const arr1 = normalizeVersion(v1).split('.').map(Number)
  const arr2 = normalizeVersion(v2).split('.').map(Number)
  const maxLength = Math.max(arr1.length, arr2.length)

  for (let i = 0; i < maxLength; i++) {
    const num1 = arr1[i] || 0
    const num2 = arr2[i] || 0

    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }
  return 0
}

// 获取GitHub Releases信息
const fetchReleases = async () => {
  try {
    const response = await fetch(apiUrl)

    if (!response.ok) {
      warning(t('version.fetchError'))
    }

    const data = await response.json()
    // 过滤预发布版本并按版本号排序
    releases.value = data
        .filter((release: any) => !release.prerelease)
        .filter((release: any) => compareVersions(release.tag_name, currentVersion.value) < 1
            && compareVersions(release.tag_name, lastVersion) > 0
            && compareVersions(release.tag_name, '1.0') > 0)
        .sort((a: any, b: any) => compareVersions(b.tag_name, a.tag_name))
        .map(release => ({
          version: release.name,
          content: release.body
              .replace(/\r\n/g, '\n')
              .replace(/\n\n+/g, '</p><p>')
              .replace(/\n/g, '<br>')
              .replace(/^(.+)/, '<p>$1</p>'),
          url: release.html_url,
          date: release.published_at
        }))
  } catch (err) {
    console.error('获取版本信息失败:', err)
    warning(t('version.fetchError'))
  }
}

const close = () => {
  isShow.value = false
  saveDataDirect('app-version', currentVersion.value)
}

// 打开GitHub Release页面
const openReleasePage = () => {
  window.open(`${repoUrl}/releases/latest`, '_blank')
}

// 组件挂载时获取版本信息
onMounted(() => {
  if (compareVersions(lastVersion, currentVersion.value) !== 0) {
    fetchReleases()
  } else {
    releases.value = []
  }
})
</script>

<template>
  <div class="versionContainer" v-if="isShow && releases.length > 0">
    <div style="font-size: 24px">{{ t('version.updateInfo') }}</div>
    <div><span>{{ t('version.currentVersion') }}</span><span class="current">{{ currentVersion }}</span></div>
    <div v-for="version in releases" class="versionItem">
      <div class="versionName">
        <el-link type="success" :href="version.url" target="_blank">{{ version.version }}</el-link>
      </div>
      <div class="versionContent" v-html="version.content"/>
    </div>

    <div class="deleteIcon close-icon">
      <el-tooltip :content="t('common.close')" placement="top" effect="light">
        <el-icon @click="close">
          <Close/>
        </el-icon>
      </el-tooltip>
    </div>
  </div>
</template>

<style>
.versionContainer {
  position: fixed;
  top: 12px;
  right: 12px;
  width: 20%;
  max-height: 30%;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--background-color);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  scrollbar-width: none;
  border-top: 12px solid var(--dialog-background-bar);
  border-bottom: 12px solid var(--dialog-background-footer);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.45);
  animation: upAndDown 1s ease-in-out infinite;

  &:hover {
    animation-play-state: paused;
  }

  .current {
    margin-left: 8px;
    color: var(--el-color-primary);
    font-weight: bold;
  }

  .versionItem {

    .versionName {
      .el-link__inner {
        font-size: 24px;
      }
    }

    .versionContent {
      line-height: 24px;
      color: #232323;
    }
  }

  .deleteIcon.close-icon {
    position: fixed;
    top: 4px;
    right: 4px;

    svg {
      height: 18px;
      width: 18px;
    }
  }
}
</style>