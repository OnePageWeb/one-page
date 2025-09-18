<script setup>
import {reactive, ref} from 'vue'
import {defineProps, defineExpose} from 'vue'
import {ElButton, ElInput, ElForm, ElFormItem} from "element-plus"
import {useI18n} from "vue-i18n"
import commonDialog from "@/items/commonDialog.vue"
import {error} from "@/js/message.js";

const {t} = useI18n()

const props = defineProps({
  title: {
    type: String,
    default: '输入名称'
  },
  nameText: {
    type: String,
    default: '名称'
  },
  descText: {
    type: String,
    default: '描述'
  },
})

const visible = ref(false)

const emit = defineEmits(['close', 'save'])

const formRef = ref(null)
const form = reactive({
  name: '',
  desc: '',
})

const nameRules = {
  required: true,
  message: t('error.noName'),
  trigger: 'blur',
}


const close = () => {
  emit('close')
  visible.value = false
}

const open = () => {
  visible.value = true
}

const cancel = () => {
  visible.value = false
}

const save = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit('save', form)
    }
  })
}

defineExpose({
  open,
  cancel
})
</script>

<template>
  <common-dialog
      :title="title"
      :visible="visible"
      class="nameDescDialog"
      width="30%"
      @closed="close"
  >
    <el-form ref="formRef" :model="form">
      <el-form-item key="name" prop="name" :rules="nameRules">
        <el-input v-model="form.name">
          <template #prepend>
            {{ nameText }}
          </template>
        </el-input>
      </el-form-item>
      <el-form-item key="desc" prop="desc">
        <el-input v-model="form.desc">
          <template #prepend>
            {{ descText }}
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="save()">{{ t('common.confirm') }}</el-button>
    </template>
  </common-dialog>
</template>

<style>
.nameDescDialog {

  .el-form-item__error {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>