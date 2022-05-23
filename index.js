// import something here
/**
 * 图片转视频
 */
const startRecord = (canvas, fileList) => {
  try {
    const intance = new ImagesToVideo(canvas, { fileList })
    return intance.startRecord()
  } catch (error) {
    console.log('startRecord error', error)
  } finally {
    console.log('startRecord finally')
  }
  return null
}
/**
 * 下载视频
 */
const downloadVideo = ({ name, blob }) => {
  try {
    if ('download' in document.createElement('a')) {
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      document.body.appendChild(anchor)
      anchor.style = 'display: none'
      anchor.href = url
      anchor.download = name
      anchor.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(anchor)
    } else {
      navigator.msSaveBlob(blob, name)
    }
  } catch (error) {
    console.log('downloadVideo error', error)
  } finally {
    console.log('downloadVideo finally')
  }
}
