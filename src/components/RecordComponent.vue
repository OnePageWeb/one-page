<script setup>
import {ElIcon, ElMessage, ElTooltip} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {CopyDocument, Delete, Edit, Plus, Upload, View} from '@element-plus/icons-vue'
import ComponentOperator from "@/items/componentOperator.vue"
import InputWithParams from "@/items/inputWithParams.vue"
import {useI18n} from "vue-i18n"
import {success} from "@/js/message.js"

const {t} = useI18n()

const props = defineProps({
  id: String,
  enableEdit: Object
})
const {enableEdit} = toRefs(props)

const resultList = ref([])
const contentList = ref([])

const dbClickType = ref(1)

function dbClick(index) {
  if (dbClickType.value === 1) {
    copy(index)
  } else {
    edit(index)
  }
}

function changeDbClickType() {
  dbClickType.value = (dbClickType.value + 1) % 2
  save()
}

let currentIndex = -1
function edit(index) {
  if (index === -1) {
    // 新增
    const newContent = { text: '' }
    contentList.value.push(newContent)
    currentIndex = contentList.value.length - 1
    inputWithParamsRef.value.load(newContent)
  } else {
    currentIndex = index
    inputWithParamsRef.value.load(contentList.value[index])
  }
  isEditing.value = true
}

function onInputUpdate(value, params) {
  if (currentIndex === -1) {
    return
  }
  contentList.value[currentIndex].text = value
  contentList.value[currentIndex].params = params
  resultList.value[currentIndex] = value
  save()
}

function closeEdit() {
  if (isEditing.value) {
    contentList.value[currentIndex] = inputWithParamsRef.value.save()
    inputWithParamsRef.value.clear()
    isEditing.value = false
    if (resultList.value[currentIndex].trim().length === 0) {
      deleteRecord(currentIndex)
    }
    currentIndex = -1
    save()
  }
}

function top(index) {
  if (index === -1) {
    return
  }
  const item = contentList.value[index]
  contentList.value.splice(index, 1)
  contentList.value.unshift(item)
  resultList.value.splice(index, 1)
  resultList.value.unshift(item.text)
  save()
}

function deleteRecord(index) {
  if (index === -1) {
    return
  }
  contentList.value.splice(index, 1)
  resultList.value.splice(index, 1)
  save()
}

let dragIndex = -1
let dragItem = null

function onDragstart(event, index) {
  dragItem = event.target
  dragIndex = index
  // 将内容添加到dataTransfer
  event.dataTransfer.setData('text/plain', dragItem.textContent)
}

function onDragover(event) {
  event.preventDefault()
  event.target.classList.add('dragTarget')
}

function onDragleave(event) {
  event.target.classList.remove('dragTarget')
}

function onDragend(event) {
  event.target.classList.remove('dragTarget')
  if (dragItem) {
    dragItem = null
    dragIndex = -1
  }
}

function onDrop(event, index = -1) {
  event.target.classList.remove('dragTarget')
  // 如果是自己元素的内容则忽略
  if (event.target === event.currentTarget || index === -1) {
    dragItem = null
    dragIndex = -1
    return
  }
  event.preventDefault()
  // 如果是文本则添加
  const data = event.dataTransfer.getData('text/plain')
  if (data) {
    if (index === -1) {
      index = contentList.value.length
    }
    if (dragItem) {
      // 交换元素
      const temp = contentList.value[dragIndex]
      contentList.value[dragIndex] = contentList.value[index]
      contentList.value[index] = temp
      // 交换元素
      const tempResult = resultList.value[dragIndex]
      resultList.value[dragIndex] = resultList.value[index]
      resultList.value[index] = tempResult
    } else {
      // 添加到index的位置
      contentList.value.splice(index, 0, { text: data })
      resultList.value.splice(index, 0, data)
    }
    save()
  }
  dragItem = null
  dragIndex = -1
}

function copy(index) {
  // 将resultList.value[index]复制到剪切板
  navigator.clipboard.writeText(resultList.value[index])
  success(t('success.copy'))
}

const isEditing = ref(false)

const inputWithParamsRef = ref(null)

function save() {
  saveData(props.id, JSON.stringify({ list: contentList.value, dbClick: dbClickType.value }))
}

onMounted(() => {
  load()
})

watch(enableEdit, (newVal) => {
  if (!newVal) {
    closeEdit()
  }
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    const parse = JSON.parse(save)
    contentList.value = parse.list
    dbClickType.value = parse.dbClick || 0
    resultList.value = []
    nextTick(() => {
      const tempList = []
      for (let value of contentList.value) {
        tempList.push(inputWithParamsRef.value.calcValue(value.text, value.params))
      }
      resultList.value = tempList
    })
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="recordContent">
    <div :class="['result', isEditing ? 'resultOnFocus' : '']"
         @drop="onDrop"
         @dblclick.prevent.stop="edit(-1)">
      <div
          v-for="(content, index) in resultList"
          class="record"
          @dblclick.prevent.stop="dbClick(index)"
          draggable="true"
          @dragstart="onDragstart($event, index)"
          @dragover="onDragover"
          @dragleave="onDragleave"
          @dragend="onDragend"
          @drop="onDrop($event, index)"
      >
        <el-tooltip
            class="box-item"
            :effect="index % 2 === 0 ? 'dark' : 'light'"
            placement="left"
            popper-class="recordPreContainer"
            :show-after="400"
            :hide-after="100"
        >
          <template #content><pre class="recordPre">{{ content }}</pre></template>
          <div class="recordText">{{ content }}</div>
        </el-tooltip>
        <div v-if="!isEditing" class="recordOperator">
          <el-tooltip
              effect="light"
              :content="t('common.edit')"
              placement="top"
              :show-after="800"
              :hide-after="10"
          >
            <el-icon class="edit"  @click="edit(index)">
              <Edit/>
            </el-icon>
          </el-tooltip>
          <el-tooltip
              effect="light"
              :content="t('common.pinToTop')"
              placement="top"
              :show-after="800"
              :hide-after="10"
          >
            <el-icon class="pinToTop"  @click="top(index)">
              <upload/>
            </el-icon>
          </el-tooltip>
          <el-tooltip
              effect="light"
              :content="t('common.copy')"
              placement="top"
              :show-after="800"
              :hide-after="10"
          >
            <el-icon class="copy" @click="copy(index)">
              <CopyDocument/>
            </el-icon>
          </el-tooltip>
          <el-tooltip
              effect="light"
              :content="t('common.dbDelete')"
              placement="top"
              :show-after="800"
              :hide-after="10"
          >
            <el-icon class="delete" @dblclick.prevent.stop="deleteRecord(index)">
              <Delete/>
            </el-icon>
          </el-tooltip>
        </div>
      </div>
    </div>
    <input-with-params
        ref="inputWithParamsRef"
        :class="['editContainer', isEditing ? 'editOnFocus' : '']"
        :placeholder="t('placeholder.recordInput')"
        @update="onInputUpdate"
        @enter="closeEdit"
    />
    <component-operator :visible="true">
      <el-tooltip
          v-if="isEditing"
          effect="light"
          :content="t('common.closeEdit')"
          placement="top"
          :show-after="800"
          :hide-after="10"
      >
        <el-icon @click="closeEdit">
          <View/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-else
          effect="light"
          :content="t('common.add')"
          placement="top"
          :show-after="800"
          :hide-after="10"
      >
        <el-icon @click="edit(-1)">
          <Plus/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          effect="light"
          :content="t('component.record.dbClickType') + ' : ' + t('common.' + (dbClickType === 1 ? 'copy' : 'edit'))"
          placement="top"
          :show-after="800"
          :hide-after="10"
          popper-class="recordOperateToolTip"
      >
        <el-icon class="dbClickIcon" @click="changeDbClickType">
          <CopyDocument v-if="dbClickType === 1"/>
          <Edit v-else/>
        </el-icon>
      </el-tooltip>
    </component-operator>
  </div>
</template>

<style>
.recordContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .result {
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    font-size: 18px;
    overflow: auto;
    scrollbar-width: none;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    flex-direction: column;
  }

  .record {
    width: calc(100% - 8px);
    padding: 4px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    position: relative;
    backdrop-filter: blur(4px);
    box-shadow: 0 0 2px #00000040;
    scrollbar-width: none;

    /* 对子元素每一个间隔一个来设置背景 */
    &:nth-child(odd) {
      background-color: rgba(0, 0, 0, 0.3);

      .recordText {
        color: #cdcdcd;
      }
    }

    .dragTarget {
      margin-top: 4px;
      font-weight: bold;
    }

    .recordText {
      width: 100%;
      height: 100%;
      font-size: 20px;
      color: #494949;
      font-weight: bolder;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .recordOperator {
      display: flex;
      justify-content: center;
      position: fixed;
      right: 4px;
      top: 4px;
      height: 100%;
      opacity: 0;
      pointer-events: none;

      .el-icon {
        margin: 0 2px;
        border-radius: 40px;
        padding: 4px;
        opacity: 0.8;

        svg {
          color: white;
        }

        &:hover {
          opacity: 1;
          scale: 1.2;
        }
      }

      .edit {
        background-color: #46a9df;
      }

      .pinToTop {
        background-color: #75e350;
      }

      .delete {
        background-color: #ff5050;
      }

      .copy {
        background-color: #dfa946;
      }
    }

    &:hover {
      .recordText {
        letter-spacing: 1px;
      }

      .recordOperator {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }

  .el-text {
    width: 100%;
    height: 100%;
    font-size: 18px;
  }

  .resultOnFocus {
    width: 10%;
    padding: 4px 0;
  }

  .editContainer {
    display: flex;
    flex-direction: column;
    width: 0;
    height: 100%;
    opacity: 0;

    .inputOnFocus .el-textarea__inner {
      padding: 8px !important;
    }
  }

  .editOnFocus {
    width: 100%;
    height: 100%;
    opacity: 1;
  }

  .componentOperatorContainer {
    .dbClickIcon {
      border-radius: 4px;
      padding: 2px;

      &:hover {
        padding: 2px;
        scale: 1.6;
      }
    }

    &:hover {
      .dbClickIcon {
        color: white;
        background-color: var(--color-black);
      }
    }
  }
}

.recordPreContainer {
  max-width: 40%;
  max-height: 80%;
  overflow-x: auto;

  .recordPre {
    font-size: 16px;
    font-weight: bolder;
    max-width: 100%;
  }
}

</style>