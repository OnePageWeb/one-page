export class Delayer {

  delayTime = 1000
  timer = null
  constructor(delay = 1000) {
    this.delayTime = delay
  }

  delay(fn, delayTime = this.delayTime) {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(fn, this.delayTime)
  }

  clear() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }
}

/**
 * 防抖：延迟执行 fn，连续触发时只执行最后一次。
 * 返回的 debounced 函数带 cancel() 方法，可在组件卸载时取消未执行的调用。
 */
export function debounce(fn, delay = 300) {
  let timer = null
  const debounced = (...args) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, delay)
  }
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  return debounced
}
