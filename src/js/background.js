// 一个枚举，用于表示背景类型
export const BackgroundType = {
  IMG: 'img',
  CSS: 'css',
  HTML: 'html',
}

export const splitBackgroundData = (data) => {
  // 找到第一个冒号的位置
  const firstColonIndex = data?.indexOf(':')
  if (firstColonIndex !== -1) {
    // 分割成两部分
    const part1 = data.substring(0, firstColonIndex)
    const part2 = data.substring(firstColonIndex + 1)
    // 替换第二部分中的冒号为小数点并转换为数字
    return [part1, part2]
  } else {
    return [data]
  }
}