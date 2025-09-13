<script setup>
import {ref} from 'vue'
import {defineProps, defineExpose} from 'vue'
import {ElButton, ElInput, ElDialog} from "element-plus"
import {useI18n} from "vue-i18n"
import commonDialog from "@/items/commonDialog.vue"

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

const name = ref('')
const desc = ref('')
const close = () => {
  emit('close')
}

const open = () => {
  visible.value = true
}

const cancel = () => {
  visible.value = false
}

const save = () => {
  emit('save', {
    name: name.value,
    desc: desc.value
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
    <div>
      <el-input v-model="name" style="margin-bottom: 8px;">
        <template #prepend>
          {{ nameText }}
        </template>
      </el-input>
      <el-input v-model="desc">
        <template #prepend>
          {{ descText }}
        </template>
      </el-input>
    </div>

    <template #footer>
      <el-button type="primary" @click="save">{{ t('common.apply') }}</el-button>
    </template>
  </common-dialog>
</template>

<style>
.nameDescDialog {
  height: 200px !important;
}
</style>