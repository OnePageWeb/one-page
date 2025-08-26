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
  save()
}

// 打开窗口
function open(link) {
  if (curWindow[link.name] && !curWindow[link.name].closed) {
    curWindow[link.name].focus()
    return
  }
  window.open(link.url, '_blank')
}

// 打开弹窗
const curWindow = {}
const curOpenedWindow = ref([])
function openNewWindow(link) {
  const cur = curWindow[link.name]
  if (cur && !cur.closed) {
    cur.focus()
    return
  }
  // 将open的窗口居中，长宽都是80%
  const screenWidth = window.screen.width
  const screenHeight = window.screen.height
  const windowWidth = screenWidth * 0.8
  const windowHeight = screenHeight * 0.8
  const windowLeft = (screenWidth - windowWidth) / 2
  const windowTop = (screenHeight - windowHeight) / 2
  // 定义窗口特性
  const features = `width=${windowWidth},height=${windowHeight},left=${windowLeft},top=${windowTop},resizable=yes`
  // 尝试打开新窗口
  const newWindow = window.open(link.url, '_blank', features)
  curWindow[link.name] = newWindow
  curOpenedWindow.value.push(link.name)
  // 监听窗口关闭事件
  const closeListener = setInterval(() => {
    if (newWindow.closed) {
      clearTimeout(closeListener)
      // 清空窗口引用
      delete curWindow[link.name]
      // 从数组中移除
      curOpenedWindow.value = curOpenedWindow.value.filter(name => name !== link.name)
    }
  }, 1000)

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
          :class="['linkItem', {'hasWindow': curOpenedWindow.includes(link.name)}]"
          draggable="true"
          @dragend="openNewWindow(link)"
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
  max-height: 200px;
  margin: 0 8px;
  width: calc(100% - 16px);
  display: flex;
  align-items: center;
  gap: 4px;
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
    padding: 4px 16px;
    user-select: none;

    img {
      height: 40%;
      margin-bottom: 8px;
    }
  }

  .hasWindow {
    padding: 4px 16px;
    background: repeating-linear-gradient(
        45deg,
        rgba(150, 150, 150, 0.3),
        rgba(150, 150, 150, 0.3) 40px,
        rgba(255, 255, 255, 0.1) 40px,
        rgba(255, 255, 255, 0.1) 80px
    );
    background-size: 200%;
    border-radius: 8px;
    &:hover {
      animation: gradientScroll 1s ease-in-out infinite;
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
</style>