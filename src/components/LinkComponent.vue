<script setup>
import {ElButton, ElDialog, ElForm, ElFormItem, ElIcon, ElInput, ElText} from "element-plus"
import {onMounted, ref, toRefs, watch} from "vue"
import {Close, Operation, Plus} from "@element-plus/icons-vue"

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

let dialogVisible = ref(false)
let tempLinks = ref([])

function edit() {
  isEditing.value = true
  dialogVisible.value = true
  tempLinks.value.length = 0
  tempLinks.value = [...links.value]
}

function cancelEdit() {
  isEditing.value = false
  dialogVisible.value = false
}

function deleteLink(index) {
  tempLinks.value.splice(index, 1)
}

function saveEdit() {
  links.value = [...tempLinks.value]
  dialogVisible.value = false
  isEditing.value = false
  refreshIcon()
}

// 打开窗口
function open(url) {
  window.open(url, '_blank')
}
// 打开弹窗
let modalVisible = ref(false)
let curLink = ref({})
function openModal(link) {
  modalVisible.value = true
  curLink.value = link
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
  refreshIcon()
}

function refreshIcon() {
  // 处理图标
  for (let link of links.value) {
    if (!link.img) {
      link.img = getFaviconUrl(link.url)
    }
  }
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).origin
    return `${domain}/favicon.ico`
  } catch {
    return null;
  }
}

defineExpose({
  save, load
})

</script>

<template>
  <div class="content">
    <div
      v-for="(link, index) in links"
      class="linkContainer"
      @click="open(link.url)"
    >
      <div class="linkItem">
        <img :src="link.img" alt="图标"/>
        <el-text tag="b">{{ link.name }}</el-text>
      </div>
    </div>

    <div v-show="!isLock" class="editContainer" @click.stop="edit">
      <el-icon>
        <Operation/>
      </el-icon>
    </div>

    <!-- 编辑搜索引擎弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑快速链接"
      width="60%"
    >
      <div class="linkEditContainer">
        <el-form ref="formRef" class="linkForm">
          <template v-for="(item, index) in tempLinks">
            <div class="linkEditItem">
              <el-form-item label="快速链接名称" prop="name" class="linkName">
                <el-input v-model="item.name" placeholder="请输入快速链接名称"/>
              </el-form-item>
              <el-form-item label="链接URL" prop="url" class="linkUrl">
                <el-input v-model="item.url" placeholder="请输入快速链接URL"/>
              </el-form-item>
              <el-form-item label="链接图标地址" prop="img" class="linkImg">
                <el-input v-model="item.img" placeholder="请输入快速链接图标地址"/>
              </el-form-item>
              <el-form-item class="deleteIcon" @click="deleteLink(index)">
                <el-icon>
                  <Close/>
                </el-icon>
              </el-form-item>
            </div>
          </template>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="() => tempLinks.push({name: '', url: '', img: ''})">
            <el-icon>
              <Plus/>
            </el-icon>
          </el-button>
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveEdit">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
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
  cursor: pointer;
  padding: 10px;
  height: calc(100% - 30px);
}

.linkContainer:hover {
  border-radius: 20px;
  box-shadow: 0 0 4px rgba(126, 126, 126, 0.5);
}

.linkContainer, .linkItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.linkItem {
  height: 100%;
}

.linkItem img {
  height: 40%;
  margin-bottom: 8px;
}

.editContainer {
  height: 40px;
  width: 40px;
  position: absolute;
  pointer-events: auto;
  background-color: rgba(182, 182, 182, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-radius: 40px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.editContainer :deep(path) {
  fill: #737373;
}

.linkForm .linkEditItem {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  border-bottom: 1px dashed #aaaaaa;
  /* 最后一个不添加 */

  &:last-child {
    padding-bottom: 0;
    border-bottom: unset;
  }

  /* 第一个不添加 */

  &:first-child {
    padding-top: 0;
  }
}

.linkEditContainer .linkName {
  display: block !important;
  width: 160px !important;
}

.linkEditContainer .linkUrl {
  display: block !important;
  width: calc(100% - 380px) !important;
}

.linkEditContainer .linkImg {
  display: block !important;
  width: 200px !important;
}
</style>