<script setup>
import {ElButton, ElDialog, ElForm, ElFormItem, ElIcon, ElInput, ElMessage, ElText} from "element-plus"
import {onMounted, reactive, ref, toRefs, watch} from "vue"
import {CircleCloseFilled, Close, Flag, LocationFilled, Operation, Plus} from "@element-plus/icons-vue"
import {loadData, saveData} from "@/js/data.js"

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
  enableEdit: Object
})
const {id, enableEdit} = toRefs(props)

// 默认文本内容
const links = ref([])

const dialogVisible = ref(false)
const tempLinks = ref([])

function edit() {
  dialogVisible.value = true
  tempLinks.value.length = 0
  tempLinks.value = [...links.value]
}

function cancelEdit() {
  dialogVisible.value = false
}

function deleteLink(index) {
  tempLinks.value.splice(index, 1)
}

function saveEdit() {
  links.value = [...tempLinks.value]
  dialogVisible.value = false
  refreshIcon()
}

// 打开窗口
function open(link) {
  window.open(link.url, '_blank')
}

// 打开弹窗
const modalVisible = ref(false)
const fastMode = ref(true)
const curLink = ref({})

function openModal(link) {
  modalVisible.value = true
  curLink.value = {...link}
  if (fastMode.value) {
    ElMessage({
      message: '快速模式已开启，鼠标移出弹窗即可关闭',
      type: 'success'
    })
  }
}

const linkIframe = ref(null)

function onIframeLoad() {
  const iframe = linkIframe.value
  if (!iframe) return

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document

    // 阻止所有链接在新窗口打开
    const links = iframeDoc.querySelectorAll('a')
    links.forEach(link => {
      link.target = '_self' // 强制在当前iframe内打开
      link.addEventListener('click', (e) => {
        e.preventDefault()
        // 在这里处理导航逻辑
      })
    })
  } catch (error) {
    console.warn('无法访问iframe内容:', error)
  }
}

watch(fastMode, b => {
  if (b) {
    ElMessage({
      message: '快速模式已开启，鼠标移出弹窗即可关闭',
      type: 'success'
    })
  } else {
    ElMessage({
      message: '快速模式已关闭，点击弹窗外区域即可关闭',
      type: 'info'
    })
  }
})

function fastModeCheck() {
  if (fastMode.value) {
    modalVisible.value = false
  }
}

function save() {
  saveData(props.id, JSON.stringify({links: links.value}))
}

onMounted(() => {
  load()
})

function load(data) {
  links.value.length = 0
  const save = data || loadData(props.id)
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
  <div class="linkContent">
    <div
        v-for="(link, index) in links"
        class="linkContainer"
        @click="open(link)"
    >
      <div
          class="linkItem"
          draggable="true"
          @dragend="openModal(link)"
      >
        <img :src="link.img" alt="图标"/>
        <el-text tag="b">{{ link.name }}</el-text>
      </div>
    </div>

    <div v-show="enableEdit" class="editContainer" @click.stop="edit">
      <el-icon>
        <Operation/>
      </el-icon>
    </div>

    <!-- 临时弹窗 -->
    <el-dialog
        class="urlWebDialog"
        v-model="modalVisible"
        ref="urlWebDialog"
        width="80%"
        :show-close="false"
        :append-to-body="true"
        @mouseleave="fastModeCheck"
        align-center
    >
      <template #header>
        <div class="urlWebHeader">
          <span style="margin-left: 8px;font-weight: bold">{{ curLink.name }}</span>
          <div class="urlWebOperator">
            <div :class="fastMode ? 'fastModeFlag' : 'commonModeFlag'" @click="fastMode = !fastMode">{{ fastMode ? '快速模式' : '普通模式' }}</div>
            <div
              style="color: white;background-color: #f34636"
              @click="modalVisible = false"
            >×</div>
          </div>
        </div>
      </template>
      <iframe
          class="linkIframe"
          ref="linkIframe"
          :src="curLink.url"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          frameborder="0"
          allowfullscreen
          @load="onIframeLoad"
      ></iframe>
    </el-dialog>

    <!-- 编辑快速链接弹窗 -->
    <el-dialog
        class="commonDialog"
        v-model="dialogVisible"
        title="编辑快速链接"
        width="60%"
        :append-to-body="true"
        align-center
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

<style>
.linkContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  overflow: auto;
  scrollbar-width: none;

  /* 第一个和左后一个子元素增加margin */
  .linkContainer:first-child {
    margin-left: 12px;
  }

  .linkContainer:last-child {
    margin-right: 12px;
  }

  .linkContainer {
    position: relative;
    cursor: pointer;
    padding: 10px;
    height: calc(100% - 30px);
  }

  .linkItem:hover {
    padding: 4px 8px;
    border-radius: 20px;
    box-shadow: 0 0 4px rgba(126, 126, 126, 0.5);
    background-color: rgba(255, 255, 255, 0.1);
  }

  .linkContainer, .linkItem {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .linkItem {
    height: 100%;
    user-select: none;

    img {
      height: 40%;
      margin-bottom: 8px;
    }
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
    transform: rotate(-180deg);

    &:hover {
      /* 旋转 */
      transform: rotate(0deg);
    }

    .el-icon {
      color: #e3e3e3;
    }
  }

}

.linkEditContainer {
  .linkForm {
    .linkEditItem {
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

      .linkName {
        display: block !important;
        width: 160px !important;
      }

      .linkUrl {
        display: block !important;
        width: calc(100% - 380px) !important;
      }

      .linkImg {
        display: block !important;
        width: 200px !important;
      }
    }
  }
}

.urlWebDialog {
  height: calc(80% - 4px);
  width: 80%;
  --el-dialog-padding-primary: 0 !important;

  .el-dialog__header {
    border-bottom: 3px solid #f1f1f1;
    margin-bottom: 0;
    border-radius: 0 !important;
  }

  .urlWebHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
  }

  .urlWebOperator {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 8px;

    /* 对其中的每一个子元素都添加cursor: pointer; */

    * {
      cursor: pointer;
      padding: 0 8px 2px 8px;
    }

    .commonModeFlag {
      color: #4b4b4b;
      background-color: #d5d5d5;
    }

    .fastModeFlag {
      color: white;
      background-color: #2ac0cf;
    }
  }

  .linkIframe {
    height: 100%;
    width: 100%;
  }

  .el-dialog__body {
    height: calc(100% - 24px) !important;
  }
}
</style>