<script setup>
import {ElIcon, ElInput, ElTooltip, ElSwitch} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {Edit, View} from "@element-plus/icons-vue"
import ComponentOperator from "@/items/componentOperator.vue"
import {useI18n} from "vue-i18n"
import InputWithParams from "@/items/inputWithParams.vue"

const {t} = useI18n()

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {id, text, enableEdit} = toRefs(props)
const emit = defineEmits(['focus'])

// 默认文本内容
const content = ref(text.value)
let params = []
const contentValue = ref('')
const isEditing = ref(false)
watch(enableEdit, (newVal) => {
  if (!newVal) {
    isEditing.value = false
  }
})

const inputRef = ref(null)

const webIframe = ref(null)
const updateIframeContent = (value) => {
  if (!webIframe.value || value === undefined) return
  contentValue.value = value
  const blob = new Blob([value], {type: 'text/html'})
  webIframe.value.src = URL.createObjectURL(blob)
  save()
}

function edit() {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    inputRef.value.load(content.value)
    emit('focus', id)
  }
}

function view() {
  isEditing.value = false
}

function save() {
  const save = inputRef.value.save()
  saveData(props.id, JSON.stringify(save))
}

onMounted(() => {
  load()
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    const parse = JSON.parse(save)
    content.value = parse.text
    params = parse.params
    nextTick(() => {
      inputRef.value.load({text: content.value, params})
    })
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div
      class="htmlContent"
  >
    <iframe
        ref="webIframe"
        :class="['result', isEditing ? 'resultOnFocus' : '']"
        sandbox="allow-scripts allow-same-origin"
        frameborder="0"
    />
    <input-with-params
        :init-text="content"
        ref="inputRef"
        :class="['editContainer', isEditing ? 'editContainerOnFocus' : '']"
        :placeholder="t('placeholder.htmlInput')"
        @update="updateIframeContent"
        @change="save"
    />

    <component-operator :visible="enableEdit">
      <el-tooltip
          v-if="isEditing"
          effect="light"
          :content="t('common.closeEdit')"
          placement="top"
          :show-after="800"
          :hide-after="10"
      >
        <el-icon @click="view">
          <View/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-else
          effect="light"
          :content="t('common.openEdit')"
          placement="top"
          :show-after="800"
          :hide-after="10"
      >
        <el-icon @click="edit">
          <Edit/>
        </el-icon>
      </el-tooltip>
    </component-operator>
  </div>
</template>

<style>
.htmlContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .result {
    width: 100%;
    height: 100%;

    &.resultOnFocus {
      width: 50%;
    }
  }

  .el-text {
    width: 100%;
    height: 100%;
    font-size: 18px;
  }

  .editContainer {
    width: 0;
    height: 100%;
    opacity: 0;

    .el-textarea__inner {
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

    &.editContainerOnFocus {
      width: 50%;
      height: 100%;
      opacity: 1;

      .el-textarea__inner {
        padding: 8px !important;
      }
    }
  }
}
</style>