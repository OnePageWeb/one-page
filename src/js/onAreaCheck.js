export class OnAreaCheck {

  parentRef = null
  isHovering = false

  constructor(parentRef) {
    this.parentRef = parentRef
  }

  onMouseOver(e, onEnter) {
    onEnter()
    this.isHovering = true
  }

  onMouseLeave(e, onLeave) {
    const parent = this.parentRef.value
    // 检查事件目标是否在父元素内部
    if (!parent) return
    const target = e.relatedTarget
    const isOutside = !parent.contains(target) && parent !== target
    if (isOutside) {
      this.isHovering = false
      onLeave()
    }
  }
}