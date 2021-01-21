/**
 * 
 * @author Carmelo Anthony(carmelo0508@outlook.com)
 * @description Render a dynamic starry sky by canvas.
 * 
 */

(function (global, factory) {
  'use stric'

  if (typeof global === 'object' && global !== null && global.window === global) {
    factory(global)
  } else {
    throw new Error('This script could only be excuted in broswer where the top object is window.')
  }

})(window || this, function (window) {
  function StarrySky(options) {
    this.stars = []
    this.starCount = 0

    this._id = `starrySky${parseInt(Math.random() * 10000)}`
    this._starsAroundMouse = []
    this._running = false
    this._d = window.document
    this._mouseX = this._mouseY = 0
    this._previousBGColor = this._container = this._ctx = this._host = this._containerWidth = this._containerHeight = null

    this.stars = []
    this.starCount = 0
    this.options = {
      starCount: 0.5,
      containerSelector: '.starry-sky-container',
      enableConnectLine: true,
      enableMouseEvent: true,
      enableClickEvent: true,
      mouseRange: 58,
      lineColor: '#dcdcdc',
      mouseLineColor: 'skyblue',
      containerBackgroundColor: 'rgba(0, 0, 0, .95)',
      starFillColor: getColor()
    }

    this._init(options)
  }

  StarrySky.prototype = {
    _init(options) {
      this.options = {
        ...this.options,
        ...options
      }

      this._initContainer()
      this._initHost()
      this._initStarts()
      this._initResizeHandler()
      this._initMouseEvent()
      this._initClickEvent()
    },
    _initContainer() {
      this._container = this._d.querySelector(this.options.containerSelector)
      this._previousBGColor = this._container.style.backgroundColor
      this._container.style.backgroundColor = this.options.containerBackgroundColor
    },
    _initHost() {
      this._host = this._d.createElement('canvas')
      this._ctx = this._host.getContext('2d')

      this._containerWidth = this._host.width = this._container.offsetWidth
      this._containerHeight = this._host.height = this._container.offsetHeight

      this._container.appendChild(this._host)
    },
    _initStarts() {
      this.stars.length = 0
      this.starCount = Math.pow(this._containerWidth * this._containerHeight, 0.5) * (this.options.starCount)

      for (let i = 0; i < this.starCount; i++) {
        this.stars.push(this._generateStar())
        this.stars.sort((a, b) => a.y - b.y)
      }
    },
    _initClickEvent() {
      if (!this.options.enableClickEvent) return

      this._host.addEventListener('click', event => {
        if (event.target !== this._host) return

        this.stars.pop()
        this.stars.unshift(this._generateStar(event.offsetX, event.offsetY))
      })
    },
    _initMouseEvent() {
      if (!this.options.enableMouseEvent) return

      this._host.addEventListener('mousemove', event => {
        event.stopPropagation()

        if (event.target !== this._host) {
          this._mouseX = this._mouseY = 0
          this._starsAroundMouse.length = 0

          return
        }

        this._mouseX = event.offsetX
        this._mouseY = event.offsetY

        this._starsAroundMouse = this.stars.filter(this._filterStarsByRange(this._mouseX, this._mouseY))
      })

      this._host.addEventListener('mouseout', event => {
        this._mouseX = this._mouseY = 0
        this._starsAroundMouse.length = 0
      })
    },
    _initResizeHandler() {
      window[this._id] = () => {
        this._containerWidth = this._host.width = this._container.offsetWidth
        this._containerHeight = this._host.height = this._container.offsetHeight

        this._initStarts()
      }

      window.addEventListener('resize', window[this._id])
    },
    _draw(star) {
      this._ctx.save()
      this._ctx.beginPath()
      this._ctx.shadowBlur = star.shadowBlur
      this._ctx.shadowColor = star.shadowColor
      this._ctx.fillStyle = star.fillStyle
      this._ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI)
      this._ctx.fill()
      this._ctx.closePath()
      this._ctx.restore()

      this.options.enableConnectLine && this._connectAroundStars(star.aroundStars.filter(aroundStar => aroundStar.y > star.y), star.x, star.y)
    },
    _connectAroundStars(stars, x, y, lineWidth = 0.05, lineColor = this.options.lineColor) {
      stars.forEach(star => {
        this._ctx.save()
        this._ctx.beginPath()
        this._ctx.lineWidth = lineWidth
        this._ctx.strokeStyle = lineColor
        this._ctx.moveTo(x, y)
        this._ctx.lineTo(star.x, star.y)
        this._ctx.stroke()
        this._ctx.closePath()
        this._ctx.restore()
      })
    },
    _render() {
      this._ctx.clearRect(0, 0, this._containerWidth, this._containerHeight)

      this.stars.forEach(star => {
        this._updateStarPosition(star)
        this._updateAroundStars(star)
        this._draw(star)
      })

      if (this.options.enableMouseEvent && this._starsAroundMouse.length) {
        this._starsAroundMouse = this.stars.filter(this._filterStarsByRange(this._mouseX, this._mouseY))

        this._connectAroundStars(
          this._starsAroundMouse,
          this._mouseX,
          this._mouseY,
          0.5,
          this.options.mouseLineColor)
      }

      this._running && window.requestAnimationFrame(this._render.bind(this))
    },
    _generateStar(
      x = Math.floor(Math.random() * this._containerWidth),
      y = Math.floor(Math.random() * this._containerHeight)) {

      const radius = (Math.random() + 0.5).toFixed(1)
      const fillStyle = this.options.starFillColor

      return new Star({
        x,
        y,
        radius,
        fillStyle
      })
    },
    _updateStarPosition(star) {
      const {
        x,
        y,
        directionX,
        directionY
      } = star

      const stepX = (Math.random() / 2) * directionX
      const stepY = (Math.random() / 2) * directionY

      let newX = x + stepX
      let newY = y + stepY

      if (newX < 0 || newX > this._containerWidth) {
        star.directionX = -star.directionX
        newX = newX < 0 ? -newX : newX - 2 * stepX
      }

      if (newY < 0 || newY > this._containerHeight) {
        star.directionY = -star.directionY
        newY = newY < 0 ? -newY : newY - 2 * stepY
      }

      star.setPosition(newX, newY)
    },
    _updateAroundStars(star) {
      star.aroundStars = this.stars.filter(this._filterStarsByRange(star.x, star.y))
    },
    _filterStarsByRange(x, y) {
      return star => {
        return Math.abs(star.x - x) < this.options.mouseRange &&
          Math.abs(star.y - y) < this.options.mouseRange
      }
    },

    start() {
      this._running = true
      this._render()

      // setTimeout(this.stop.bind(this), 5000)
    },
    stop() {
      this._running = false
      this._container.removeChild(this._host)
      this._container.style.backgroundColor = this._previousBGColor

      window.removeEventListener('resize', window[this._id])
    }
  }

  // ----------------------------------------------------------------------------------------------

  function Star(options) {
    this.x = options.x || 0
    this.y = options.y || 0
    this.directionX = options.directionX || this.getRandomDirection()
    this.directionY = options.directionX || this.getRandomDirection()
    this.radius = options.radius || 1
    this.fillStyle = options.fillStyle || '#ffffff'
    this.shadowBlur = options.shadowBlur || 50
    this.shadowColor = options.shadowColor || '#ffffff'
    this.aroundStars = []
  }

  Star.prototype.setPosition = function (x, y) {
    this.x = x
    this.y = y
  }

  Star.prototype.getRandomDirection = function () {
    return Math.random() > 0.5 ? 1 : -1
  }

  // ----------------------------------------------------------------------------------------------


  function getColor() {
    const color = Math.ceil(Math.random() * 55 + 200)
    const transparency = Math.floor(Math.random() * 3 + 8) / 10

    return `rgba(${color}, ${color}, ${color}, ${transparency})`
  }

  // ----------------------------------------------------------------------------------------------

  window.StarrySky = StarrySky
})
