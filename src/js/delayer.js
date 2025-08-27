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