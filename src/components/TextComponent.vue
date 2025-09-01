<script setup>
import {ElIcon, ElTooltip} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {Edit} from '@element-plus/icons-vue'
import ComponentOperator from "@/items/componentOperator.vue"
import InputWithParams from "@/items/inputWithParams.vue";

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {text, enableEdit} = toRefs(props)

const contentValue = ref('')

function onInputUpdate(value) {
  contentValue.value = value
  save()
}

function edit() {
  isEditing.value = !isEditing.value
}

const isEditing = ref(false)

const inputWithParams = ref(null)

function save() {
  const data = inputWithParams.value.save()
  saveData(props.id, JSON.stringify(data))
}

onMounted(() => {
  load()
})

watch(enableEdit, (newVal) => {
  if (!newVal) {
    isEditing.value = false
  }
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    const parse = JSON.parse(save)
    nextTick(() => {
      inputWithParams.value.load(parse)
    })
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
  >
    <div :class="['result', isEditing ? 'resultOnFocus' : '']" v-html="contentValue"/>
    <input-with-params
        ref="inputWithParams"
        :class="['editContainer', isEditing ? 'editOnFocus' : '']"
        @update="onInputUpdate"/>
    <component-operator :visible="enableEdit">
      <el-tooltip
          effect="light"
          content="开启编辑"
          placement="bottom"
      >
        <el-icon @click="edit">
          <Edit/>
        </el-icon>
      </el-tooltip>
    </component-operator>
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