export function startsWith(str, prefix) {
  // 检查字符串是否为空
  if (!str) {
    return false
  }
  // 检查字符串长度至少为4，避免截取时出错
  if (str.length < prefix.length) {
    return false
  }
  // 截取前4个字符并转换为小写进行比较
  return str.substring(0, 4) === prefix
}
