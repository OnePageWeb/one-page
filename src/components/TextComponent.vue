<script setup>
import {ElIcon, ElTooltip} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {Edit, View} from '@element-plus/icons-vue'
import ComponentOperator from "@/items/componentOperator.vue"
import InputWithParams from "@/items/inputWithParams.vue"
import {useI18n} from "vue-i18n"
const {t} = useI18n()

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

const isEditing = ref(false)

const inputWithParamsRef = ref(null)

function save() {
  const data = inputWithParamsRef.value.save()
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
      inputWithParamsRef.value.load(parse)
    })
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="textContent">
    <div :class="['result', isEditing ? 'resultOnFocus' : '']" v-html="contentValue"/>
    <input-with-params
        ref="inputWithParamsRef"
        :class="['editContainer', isEditing ? 'editOnFocus' : '']"
        @update="onInputUpdate"/>
    <component-operator :visible="enableEdit">
      <el-tooltip
          v-if="isEditing"
          effect="light"
          :content="t('common.closeEdit')"
          placement="top"
      >
        <el-icon @click="isEditing = false">
          <View/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-else
          effect="light"
          :content="t('common.openEdit')"
          placement="top"
      >
        <el-icon @click="isEditing = true">
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