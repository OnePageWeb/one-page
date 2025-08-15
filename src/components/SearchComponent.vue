<script setup>
import {ElInput, ElText} from "element-plus"
import {ref, toRefs, watch} from "vue"

const props = defineProps({
  id: String,
  text: String,
  isLock: Object
})
const { text, isLock } = toRefs(props)

// 默认文本内容
let content = ref(text.value)
let isEditing = ref(false)

// 搜索
function search() {
  window.open('https://example.com', '_blank')
}

watch(isLock, (newValue) => {
  if (newValue) {
    isEditing.value = false
  }
})
function edit() {
  if (!isLock.value) {
    isEditing.value = true
  }
}

function save() {
  window.localStorage.setItem(props.id, JSON.stringify({text: content.value}))
}

watch(isEditing, (newValue) => {
  if (!newValue) {
    save()
  }
})

function load() {
  const save = window.localStorage.getItem(props.id)
  if (save) {
    content.value = JSON.parse(save).text
  }
}
defineExpose({
  save, load
})
</script>

<template>
  <div class="content" @dblclick="edit">
    <el-input
      v-model="content"
      class="input"
      :rows="2"
      placeholder="Please input"
      @keydown.enter="search"
    />
  </div>
</template>

<style>
.content {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffe1d5;
}

.input {
  width: 100%;
  height: 100%;
  font-size: 18px;
  background-color: #ffe1d5;
}

.input .el-textarea__inner {
  width: 100%;
  height: 100%;
}
</style>