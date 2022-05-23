
/**
 * images-to-video class
 * creater：qc
 * reference：1、https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
 * 2、https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API
*/
class ImagesToVideo {
  // 画布实例(DOM对象)
  canvas = null // document.getElementById('myCanvas')
  // 画笔(渲染上下文)
  ctx = null
  // 录制媒体实例
  mediaRecord = null
  // 存储图像流容器
  chunks = new Set()
  // 轮询绘画时间器
  timer = null

  // 配置属性
  option = {
    intervals: 100, // 视频抓取间隔毫秒
    drawIntervals: 1000, // 轮询绘图间隔毫秒
    // 注意，fileList此对象列表是已经封装处理过的了，里面不是[Object File]，而是对象{file: file, name: file.name, src: URL.createObjectURL(file)}
    fileList: [], // 选择的本地图片对象列表
    fileDownload: { // 视频下载配置
      fileType: `mp4`,
      fileName: `video`
    }
  }

  /**
   * 构造函数
  */
  constructor(canvas, option = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.option = { ...this.option, ...option }
    this.initMedia()
  }

  /**
   * 初始化录制媒体实例对象
  */
  initMedia() {
    console.log('initMedia start')
    // 获取画布canvasElement并设置帧频率(FPS)
    const mediaStream = this.canvas.captureStream(48)
    // 核心API，可以录制canvas, audio, video
    // PS：也可以录制浏览器屏幕，可以通过 MediaDevices.getDisplayMedia() 来获取屏幕内容 如
    // const mediaStream = await navigator.mediaDevices.getDisplayMedia({video: true})
    this.mediaRecord = new MediaRecorder(mediaStream, {
      videoBitsPerSecond: 8500000
    })
    // 接收数据
    this.mediaRecord.ondataavailable = (e) => {
      this.chunks.add(e.data)
    }
    console.log('initMedia end')
  }

  /**
   * 将图片绘制到画布
  */
  async drawImage(file) {
    try {
      console.log('drawImage file', file)
      const src = Object.prototype.toString.call(file) === '[object File]' ?
                  URL.createObjectURL(file) : file.src
      // 绘制图片流
      await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
          // this.ctx.drawImage(img, 0, 0, img.width, img.height)
          this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
          // resolve(true)
        }
        img.src = src
      })
    } catch (error) {
      console.log('drawImage error', error)
    } finally {
      console.log('drawImage finally')
    }
  }

  /**
   * 开始录屏，实列调用
  */
  async startRecord() {
    // 参数为抓取间隔毫秒，默认100毫秒
    this.mediaRecord && this.mediaRecord.start(this.option.intervals || 100)
    // 轮询绘图
    let index = 0
    this.timer && clearInterval(this.timer)
    return await new Promise((resolve) => {
      this.timer = setInterval(() => {
        const file = this.option.fileList[index] || null
        file ? (this.drawImage(file) && (index += 1)) : resolve(this.stopRecord())
      }, this.option.drawIntervals || 1000)
    })
  }

  /**
   * 停止录屏，并返回视频对象
   * @returns Object {name, blob, src}
  */
  stopRecord() {
    this.timer && clearInterval(this.timer)
    this.mediaRecord && this.mediaRecord.stop()
    // 生成视频blob
    const type = `${this.option.fileDownload.fileType || 'mp4'}`
    const name = `${this.option.fileDownload.fileName || 'video'}.${type}`
    const blob = new Blob(this.chunks, {
      type: `video/${type}`
    })
    const src = URL.createObjectURL(blob)
    return { name, blob, src }
  }
}
