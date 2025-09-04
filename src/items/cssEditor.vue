<template>
  <codemirror
    v-model="content"
    :placeholder="placeholder || t('placeholder.needInput')"
    :style="{ height: '100%' }"
    :autofocus="true"
    :tabSize="2"
    :extensions="extensions"
    @blur="blur"
    @focus="focus"
    @change="update"
    @keydown.enter.ctrl="enter"
  />
</template>

<script setup>
import {Codemirror} from "vue-codemirror"
import {css} from "@codemirror/lang-css"
import {ref} from "vue"
import {useI18n} from "vue-i18n"
const {t} = useI18n()

const props = defineProps({
  placeholder: String,
  initContent: String,
})

const emit = defineEmits(['update', 'enter', 'blur', 'focus'])

const content = ref(props.initContent || '')
const extensions = [css()]

const update = (value) => {
  emit('update', value)
}

const load = (value) => {
  content.value = value
}

const enter = () => {
  emit('enter', content.value)
}
const blur = () => {
  emit('blur', content.value)
}
const focus = () => {
  emit('focus', content.value)
}
defineExpose({
  load
})
</script>

<style scoped>
</style>