<script setup>
import {ElInput, ElText} from "element-plus"
import {onMounted, ref, toRefs, watch} from "vue"

const props = defineProps({
  id: String,
  text: String,
  isLock: Object
})
const { text, isLock } = toRefs(props)

// 默认文本内容
let content = ref(text.value)
let isEditing = ref(false)

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

onMounted(() => {
  load()
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
    <el-text v-if="!isEditing" v-html="content"/>
    <el-input
      v-else
      v-model="content"
      class="input"
      :rows="2"
      type="textarea"
      placeholder="Please input"
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
}

.input, .el-text{
  width: 100%;
  height: 100%;
  font-size: 18px;
}

.input .el-textarea__inner {
  width: 100%;
  height: 100%;
}
</style>