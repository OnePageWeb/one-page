import {ElMessage} from "element-plus"

export const info = (msg) => {
  ElMessage({
    message: msg,
    type: 'info',
    placement: 'top-right',
  })
}
export const success = (msg) => {
  ElMessage({
    message: msg,
    type: 'success',
    placement: 'top-right',
  })
}
export const warning = (msg) => {
  ElMessage({
    message: msg,
    type: 'warning',
  })
}
export const error = (msg) => {
  ElMessage({
    message: msg,
    type: 'error',
    duration: 0,
    autoClose: false,
  })
}
