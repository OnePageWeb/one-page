<script setup>
import {ElInput, ElText} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"

const props = defineProps({
  id: String,
  text: String,
  isLock: Object
})
const {text, isLock} = toRefs(props)

// 默认文本内容
let content = ref(text.value)
let isEditing = ref(false)

watch(isLock, (newValue) => {
  isEditing.value = !newValue
})
const input = ref(null)

function edit() {
  if (!isLock.value) {
    isEditing.value = true
    nextTick(() => {
      input.value.focus()
    })
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
  isEditing.value = !isLock.value
})

function load(data) {
  const save = data || window.localStorage.getItem(props.id)
  if (save) {
    content.value = JSON.parse(save).text
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="textContent" @dblclick="edit">
    <el-text v-html="content"/>
    <el-input
      v-model="content"
      ref="input"
      :class="[isEditing ? 'editing' : 'input']"
      :rows="2"
      type="textarea"
      placeholder="输入内容"
    />
  </div>
</template>

<style scoped>
.textContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 当textContent被选中时，改变editing的宽度 */
  &:hover {
    .editing {
      width: 200%;
      opacity: 1;
    }
  }
}

.editing {
  width: 0;
  opacity: 0;
  height: 100%;
  font-size: 18px;
  border: unset;
}

.editing :deep(.el-textarea__inner) {
  width: 100%;
  height: 100%;
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

:deep(.el-text) {
  width: 100%;
  height: 100%;
  font-size: 18px;
}

.input {
  width: 0;
  height: 100%;
}

:deep(textarea) {
  resize: none;
}

.input :deep(.el-textarea__inner) {
  width: 0;
  height: 0;
  opacity: 0 !important;
  min-width: unset !important;
  min-height: unset !important;
  padding: 0 !important;
}
</style>