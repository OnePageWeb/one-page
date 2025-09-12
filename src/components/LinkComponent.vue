<script setup>
import {ElButton, ElForm, ElFormItem, ElIcon, ElImage, ElInput, ElPopover, ElText, ElTooltip} from "element-plus"
import {onMounted, ref, toRefs} from "vue"
import {Close, Finished, Operation, Picture, Plus, Switch} from "@element-plus/icons-vue"
import {loadData, saveData} from "@/js/data.js"
import H5tag from "@/items/h5tag.vue"
import {useI18n} from "vue-i18n"
import commonDialog from "@/items/commonDialog.vue"

const {t} = useI18n()

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

// 链接列表
const links = ref([])
const layoutDict = [
  'horizontal',
  'floating',
  'vertical'
]
const layout = ref(0)
const nameVisible = ref(true)

function changeDirection() {
  layout.value = (layout.value + 1) % layoutDict.length
  save()
}

function changeNameVisible() {
  nameVisible.value = !nameVisible.value
  save()
}

const dialogVisible = ref(false)
const tempLinks = ref([])

function edit() {
  dialogVisible.value = true
  tempLinks.value.length = 0
  tempLinks.value = JSON.parse(JSON.stringify(links.value))
  tempLinks.value.push({
    name: '',
    url: ''
  })
}

function cancelEdit() {
  dialogVisible.value = false
  tempLinks.value.length = 0
}

function deleteLink(index) {
  tempLinks.value.splice(index, 1)
}

function saveEdit() {
  links.value = [...tempLinks.value].filter(link => link.url)
  tempLinks.value.length = 0
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
  }, 800)

}

function save() {
  saveData(props.id, JSON.stringify({links: links.value, layout: layout.value, nameVisible: nameVisible.value}))
}

onMounted(() => {
  load()
})

function load(data) {
  links.value.length = 0
  const save = data || loadData(props.id)
  const parse = JSON.parse(save)
  if (parse) {
    links.value = parse.links
    const ly = parse.layout
    if (ly === undefined || typeof ly !== "number") {
      layout.value = 0
    } else {
      layout.value = ly
    }
    nameVisible.value = parse.nameVisible === undefined ? true : parse.nameVisible
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
  <div :class="['linkContent', layoutDict[layout]]">
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
        <el-tooltip
            effect="light"
            :content="curOpenedWindow.includes(link.name) ? t('component.link.openFastWindow') : link.url"
            placement="top"
            :show-after="400"
        >
          <el-image :src="link.img" alt="favicon" fit="contain">
            <template #error>
              <div class="image-slot">
                <el-icon>
                  <Picture/>
                </el-icon>
              </div>
            </template>
          </el-image>
        </el-tooltip>
        <el-tooltip
            effect="light"
            :content="link.name"
            placement="bottom"
            :show-after="400"
        >
          <el-text v-if="nameVisible" tag="span">
            <div v-html="link.name"/>
          </el-text>
        </el-tooltip>
      </div>
    </div>

    <div v-show="enableEdit" class="editContainer" @click.stop="edit">
      <el-icon class="editIcon">
        <Operation/>
      </el-icon>
    </div>

    <!-- 编辑快速链接弹窗 -->
    <common-dialog
        class="linkEditDialog"
        :visible="dialogVisible"
        :title="t('component.link.edit.title')"
        width="60%"
        @closed="dialogVisible = false"
    >
      <div class="linkEditContainer">
        <el-form ref="formRef" class="linkForm">
          <template v-for="(item, index) in tempLinks">
            <div class="linkEditItem">
              <el-form-item prop="name" :class="['linkName', {'imgLinkName': item.img}]">
                <el-input v-model="item.name" :placeholder="t('component.link.edit.urlName')">
                  <template #prepend>
                    <el-image v-if="item.img" :src="item.img" fit="scale-down" alt="favicon">
                      <template #error>
                        <div class="image-slot">
                          <el-icon>
                            <Picture/>
                          </el-icon>
                        </div>
                      </template>
                    </el-image>
                    <h5tag v-else :text="t('common.name')"/>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item :label="t('component.link.url')" prop="url" class="linkUrl">
                <el-input v-model="item.url" :placeholder="t('component.link.edit.url')"/>
              </el-form-item>
              <el-form-item :label="t('component.link.img')" prop="img" class="linkImg">
                <el-input v-model="item.img" :placeholder="t('component.link.edit.img')"/>
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
          <el-popover
              class="box-item"
              :title="nameVisible ? t('common.showName') : t('common.hideName')"
              :content="t('component.link.switchNameVisible')"
              placement="top-end"
          >
            <template #reference>
              <el-icon
                  class="nameVisibleIcon"
                  :style="{background: nameVisible ? 'var(--el-color-primary)' : 'var(--el-color-primary-light-9)'}"
                  @click="changeNameVisible"
              >
                <Finished/>
              </el-icon>
            </template>
          </el-popover>
          <el-popover
              class="box-item"
              :title="layout === 0 ? t('component.link.layout.horizontal') : (layout === 1 ? t('component.link.layout.floating') : t('component.link.layout.vertical'))"
              :content="t('component.link.layout.switch')"
              placement="top-end"
          >
            <template #reference>
              <el-icon class="directionIcon" @click="changeDirection">
                <Switch :style="{transform: `rotate(${layout * 45 + 180}deg)`}"/>
              </el-icon>
            </template>
          </el-popover>
          <el-button type="primary" @click="() => tempLinks.push({name: '', url: '', img: ''})">
            <el-icon>
              <Plus/>
            </el-icon>
          </el-button>
          <el-button @click="cancelEdit">
            {{ t('common.cancel') }}
          </el-button>
          <el-button type="primary" @click="saveEdit">
            {{ t('common.save') }}
          </el-button>
        </div>
      </template>
    </common-dialog>
  </div>
</template>

<style>
.linkContent {
  height: 100%;
  width: 100%;
  max-height: 240px;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: auto;
  scrollbar-width: none;
  flex-wrap: nowrap;

  .linkContainer {
    position: relative;
    cursor: pointer;
    padding: 2px;
    height: calc(100% - 8px);
  }

  .linkContainer, .linkItem {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .linkItem {
    height: calc(100% - 16px);
    padding: 8px 16px;
    user-select: none;
    margin: 2px;

    &:hover {
      border-radius: 20px;
      box-shadow: 0 0 4px rgba(126, 126, 126, 0.5);
      background-color: rgba(255, 255, 255, 0.1);
    }

    .el-image {
      height: 60%;
      margin-bottom: 8px;

      .el-image__error, .el-image__inner, .el-image__placeholder, .el-image__wrapper {
        width: unset;
      }
    }

    span {
      white-space: nowrap;
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
    min-height: 40px;
    width: 40px;
    min-width: 40px;
    position: sticky;
    pointer-events: auto;
    background-color: rgba(234, 234, 234, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.5);
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
      scale: 1.2;
      box-shadow: 0 0 4px rgba(255, 255, 255, 0.7);
    }

    .editIcon {
      color: #707070;

      svg {
        height: 20px;
        width: 20px;
      }
    }
  }
}

.vertical {
  flex-direction: column;
  width: 100%;
  max-height: unset;

  .linkContainer {
    width: 100%;
  }

  /* 第一个和左后一个子元素增加margin */

  .linkContainer:first-child {
    margin-left: 0;
  }

  .linkContainer:last-child {
    margin-right: 0;
  }

  .editContainer {
    right: 0;
    bottom: 8px;
  }

  .linkItem {
    max-height: 120px;
    width: calc(100% - 24px);
    padding: 8px 8px;

    .el-text {
      width: 100%;
      display: block;
      text-align: center;

      div {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .el-image {
    height: unset !important;
    width: 80%;

    .el-image__error, .el-image__inner, .el-image__placeholder, .el-image__wrapper {
      width: 100% !important;
    }
  }
}

.floating {
  flex-wrap: wrap;
  justify-content: center;

  /* 第一个和左后一个子元素增加margin */

  .linkContainer:first-child {
    margin-left: 0;
  }

  .linkContainer:last-child {
    margin-right: 0;
  }
}

.linkEditDialog {
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;

    /* 方向图标 */

    .directionIcon, .nameVisibleIcon {
      padding: 4px;
      background: #fba240;
      border-radius: 16px;
      color: white;
      cursor: pointer;
      font-size: large;

      &:hover {
        scale: 1.2;
        /* 旋转 */
        transform: rotate(180deg);
      }
    }

    .nameVisibleIcon {
      &:hover {
        scale: 1.2;
        /* 旋转 */
        transform: rotate(360deg) !important;
      }
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

      .el-image {
        height: 100%;
      }

      .linkName {
        width: 20%;
        height: 60px;
        align-items: center;
        gap: 8px;
        padding: 0;

        .el-input-group__prepend {
          background-color: var(--el-color-primary);
          color: white;
          font-weight: bold;
          font-size: 16px;
          padding: 0 12px;
        }

        .el-form-item__label {
          padding: 0;
          margin: 0;
          font-size: 18px;
        }

        .el-input__inner {
          font-size: 24px;
          font-weight: bold;
        }

        .el-form-item__content {
          margin-left: 0 !important;
          height: 100%;
        }

        .el-input {
          height: 100%;
        }
      }

      .imgLinkName {
        .el-input-group__prepend {
          background-color: unset;
        }
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