<script setup>
import {ElCollapse, ElCollapseItem, ElInput, ElText} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {text, enableEdit} = toRefs(props)

// 默认文本内容
const content = ref(text.value)
const onFocus = ref(false)

const input = ref(null)
const params = ref([])

// test
params.value.push({
  name: 'name',
  desc: '请输入姓名'
}, {
  name: 'age',
  desc: '请输入年龄'
})

function edit() {
  if (!enableEdit.value) {
    onFocus.value = true
    nextTick(() => {
      input.value.focus()
    })
  }
}

function onMouseLeave() {
  const inputElement = input?.value.$el
  // 获取第一个子元素
  const firstChild = inputElement?.firstElementChild
  if (firstChild !== document.activeElement) {
    onFocus.value = false
  }
}

function save() {
  saveData(props.id, JSON.stringify({text: content.value}))
}

onMounted(() => {
  load()
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    content.value = JSON.parse(save).text
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div
      class="textContent"
      @dblclick="edit"
      @mouseenter="onFocus = true"
      @mouseleave="onMouseLeave"
  >
    <div :class="['result', onFocus && enableEdit ? 'resultOnFocus' : '']" v-html="content"/>
    <div :class="['editContainer', onFocus && enableEdit ? 'editOnFocus' : 'editOnFocus']">
      <el-collapse class="paramContainer">
        <el-collapse-item title="参数列表">
          <el-input
              class="paramInput"
              v-for="param in params"
              :rows="1"
              :placeholder="param.desc"
              @change="save"
          >
            <template #prepend>
              <div class="paramName">{{ param.name }}</div>
            </template>
          </el-input>
        </el-collapse-item>
      </el-collapse>
      <el-input
          v-model="content"
          ref="input"
          class="input"
          :rows="2"
          type="textarea"
          placeholder="输入内容"
          @blur="onFocus = false"
          @change="save"
      />
    </div>
  </div>
</template>

<style>
.textContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .result {
    width: 100%;
    font-size: 18px;
    height: 100%;
    overflow: auto;
    scrollbar-width: none;
  }

  :deep(.el-text) {
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

    .paramContainer {
      width: 100%;
      border-top: unset;
      z-index: 1;
      --el-collapse-header-height: 36px;
      --el-border-radius-base: 0;

      .el-collapse-icon-position-right .el-collapse-item__header {
        padding: 0;
      }

      .el-collapse-item__header {
        padding: 0 8px;
        width: calc(100% - 16px);
      }

      .el-collapse-item__content {
        padding: 0;
      }

      .el-collapse-item__wrap {
        position: absolute;
        border-bottom: 1px dotted #000000;
      }
    }

    .input {
      width: 100%;
      height: calc(100% - 48px);
    }

    .input .el-textarea__inner {
      width: 100%;
      height: 100%;
      opacity: 1;
      min-width: unset !important;
      min-height: unset !important;
      padding: 0;
      border-radius: 0;
      color: #3a3a3a;
      font-weight: bold;
      background: repeating-linear-gradient(
          -45deg,
          rgba(240, 240, 240, 0.9),
          rgba(240, 240, 240, 0.9) 40px,
          rgba(255, 255, 255, 0.9) 40px,
          rgba(255, 255, 255, 0.9) 80px
      );
    }

    .resultOnFocus {
      width: 40%;
    }

    .inputOnFocus .el-textarea__inner {
      padding: 8px !important;
    }
  }

  .editOnFocus {
    width: 60%;
    height: 100%;
    opacity: 1;
  }
}
</style>