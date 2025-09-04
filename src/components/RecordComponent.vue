<script setup>
import {ElIcon, ElMessage, ElTooltip} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {CopyDocument, Delete, Edit, Plus, Upload, View} from '@element-plus/icons-vue'
import ComponentOperator from "@/items/componentOperator.vue"
import InputWithParams from "@/items/inputWithParams.vue"
import {useI18n} from "vue-i18n"

const {t} = useI18n()

const props = defineProps({
  id: String,
  enableEdit: Object
})
const {enableEdit} = toRefs(props)

const resultList = ref([])
const contentList = ref([])

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
    resultList.value[currentIndex] = contentList.value[currentIndex].text
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

function copy(index) {
  // 将resultList.value[index]复制到剪切板
  navigator.clipboard.writeText(resultList.value[index])
  ElMessage.success(t('success.copy'))
}

const isEditing = ref(false)

const inputWithParamsRef = ref(null)

function save() {
  saveData(props.id, JSON.stringify({ list: contentList.value }))
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
    resultList.value = parse.list.map(item => item.text)
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="recordContent">
    <div :class="['result', isEditing ? 'resultOnFocus' : '']">
      <div
          v-for="(content, index) in resultList"
          class="record"
          @dblclick="edit(index)"
      >
        <pre class="recordText">{{ content }}</pre>
        <div class="recordOperator">
          <el-tooltip
              effect="light"
              :content="t('common.edit')"
              placement="top"
              :show-after="200"
          >
            <el-icon class="edit"  @click="edit(index)">
              <Edit/>
            </el-icon>
          </el-tooltip>
          <el-tooltip
              effect="light"
              :content="t('common.pinToTop')"
              placement="top"
              :show-after="200"
          >
            <el-icon class="pinToTop"  @click="top(index)">
              <upload/>
            </el-icon>
          </el-tooltip>
          <el-tooltip
              effect="light"
              :content="t('common.delete')"
              placement="top"
              :show-after="200"
          >
            <el-icon class="delete" @click="deleteRecord(index)">
              <Delete/>
            </el-icon>
          </el-tooltip>
          <el-tooltip
              effect="light"
              :content="t('common.copy')"
              placement="top"
              :show-after="200"
          >
            <el-icon class="copy" @click="copy(index)">
              <CopyDocument/>
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
          :show-after="200"
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
          :show-after="200"
      >
        <el-icon @click="edit(-1)">
          <Plus/>
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
    background-color: #0000001c;
    cursor: pointer;
    position: relative;
    backdrop-filter: blur(4px);
    box-shadow: 0 0 2px #00000040;
    overflow: hidden;
    scrollbar-width: none;

    .recordText {
      width: 100%;
      height: 100%;
      font-size: 20px;
      color: #e8e8e8;
      font-weight: bold;
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
      margin: 4px 0;
      padding: 8px 4px;
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

  .editContainer {
    display: flex;
    flex-direction: column;
    width: 0;
    height: 100%;
    opacity: 0;

    .resultOnFocus {
      width: 20%;
    }

    .inputOnFocus .el-textarea__inner {
      padding: 8px !important;
    }
  }

  .editOnFocus {
    width: 200%;
    height: 100%;
    opacity: 1;
  }
}
</style>