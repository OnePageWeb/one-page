<script setup>
import {ElIcon, ElInput, ElPopconfirm, ElText} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {Close} from "@element-plus/icons-vue";

const defaultLinks = [
  {
    name: 'Github',
    url: 'https://github.com/',
  },
  {
    name: 'Baidu',
    url: 'https://www.baidu.com/'
  }
]

const props = defineProps({
  id: String,
  isLock: Object
})
const {id, isLock} = toRefs(props)

// 默认文本内容
let links = ref([])
let isEditing = ref(false)

watch(isLock, (newValue) => {
  isEditing.value = !newValue
})

function edit() {
  if (!isLock.value) {
    isEditing.value = true
  }
}
function deleteLink(index) {
  links.value.splice(index, 1)
}

// 打开窗口
function open(url) {
  window.open(url, '_blank')
}

function save() {
  window.localStorage.setItem(props.id, JSON.stringify({links: links.value}))
}

watch(isEditing, (newValue) => {
  if (!newValue) {
    save()
  }
})
onMounted(() => {
  load()
  isEditing.value = !isLock.value
})

function load(data) {
  links.value.length = 0
  const save = data || window.localStorage.getItem(props.id)
  if (save) {
    links.value = JSON.parse(save).links
  } else {
    links.value.push(...defaultLinks)
  }
  // 处理图标
  for (let link of links.value) {
    if (!link.img) {
      link.img = getFaviconUrl(link.url)
    }
  }
}
function getFaviconUrl(url) {
  try {
    const domain = new URL(url).origin;
    return `${domain}/favicon.ico`;
  } catch {
    return null;
  }
}
defineExpose({
  save, load
})
</script>

<template>
  <div class="content" @dblclick="edit">
    <div v-for="(link, index) in links" class="linkContainer" @click="open(link.url)">
      <div class="linkItem">
        <img :src="link.img" alt="图标"/>
        <el-text tag="b">{{ link.name }}</el-text>
      </div>

      <div v-show="!isLock" class="deleteContainer" @click.stop>
        <el-popconfirm
            class="deleteLink"
            title="确定删除此组件"
            placement="top-start"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="deleteLink(index)"
        >
          <template #reference>
            <el-icon class="deleteLink">
              <Close/>
            </el-icon>
          </template>
        </el-popconfirm>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.linkContainer {
  position: relative;
}
.linkContainer, .linkItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.linkItem img {
  height: 35%;
  margin-bottom: 8px;
}

.deleteContainer {
  height: 100%;
  width: 100%;
  position: absolute;
  pointer-events: auto;
}
.deleteLink {
  position: absolute;
  right: -10px;
  top: 0;
  cursor: pointer;
  pointer-events: auto;
}
:deep(.el-icon svg) {
  height: unset !important;
  width: unset !important;
  border-radius: 48px;
  background-color: #b6b6b6;
  padding: 4px;
}
</style>