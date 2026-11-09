import { useEffect, useRef } from "react"

// Full-screen WebGL hero: an F-22 silhouetted against storm clouds at twilight,
// with the name as a backlit silhouette in the sky above it.
//
// Depth of field: the jet is the focal point. The image mixes toward a blurred
// copy with distance from the jet, so the jet stays sharp and the clouds fall
// off smoothly.
//
// Name: flat, dark letters like the jet's silhouette, with warm light wrapping
// their edges and a soft darkening just outside them for contrast.
//
// Motion: a slow settle on load and gentle pointer parallax (the name and the
// photo shift by different amounts).

// The jet's center in the photo, in image coordinates (0 to 1).
const JET: [number, number] = [0.51, 0.48]
// Where the crop centers on narrow or tall screens.
const FOCUS: [number, number] = [0.51, 0.46]

const vertexShader = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uText;
uniform sampler2D uBlur;
uniform vec2 uRes;
uniform vec2 uImgSize;
uniform vec2 uFocus;
uniform vec2 uJet;
uniform vec2 uTilt;
uniform float uZoom;
uniform float uTime;

vec2 coverUv(vec2 uv) {
  float sr = uRes.x / uRes.y;
  float ir = uImgSize.x / uImgSize.y;
  vec2 scale = (sr > ir ? vec2(1.0, ir / sr) : vec2(sr / ir, 1.0)) * uZoom;
  vec2 half_ = 0.5 * scale;
  vec2 focus = clamp(uFocus, half_, 1.0 - half_);
  return clamp(focus + (uv - 0.5) * scale, vec2(0.001), vec2(0.999));
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 p = uv * uRes;
  float ir = uImgSize.x / uImgSize.y;

  // Photo, focused on the jet.
  vec2 ic = coverUv(uv + uTilt * vec2(0.008, 0.006));
  float fromJet = length((ic - uJet) * vec2(ir, 1.0));
  float defocus = smoothstep(0.1, 0.7, fromJet) * 0.7;
  vec3 col = mix(texture2D(uImage, ic).rgb, texture2D(uBlur, ic).rgb, defocus);

  // Name: backlit silhouette.
  vec2 tc = uv - uTilt * vec2(0.006, 0.004);
  vec3 m = texture2D(uText, tc).rgb;
  float outside = m.g * (1.0 - m.r);
  col *= 1.0 - 0.28 * outside;
  float rim = clamp(m.r - m.b, 0.0, 1.0);
  vec3 face = mix(vec3(0.05, 0.035, 0.03), vec3(0.11, 0.08, 0.06), uv.y);
  face += vec3(1.0, 0.76, 0.48) * rim * 0.85;
  col = mix(col, face, m.r);

  // Vignette and fine grain.
  float v = smoothstep(1.25, 0.3, length((uv - 0.5) * vec2(uRes.x / uRes.y, 1.0)));
  col *= mix(0.62, 1.05, v);
  col += (hash(p + fract(uTime) * 100.0) - 0.5) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`

interface HeroCanvasProps {
  imageUrl: string
  blurUrl: string
  name: string
  fontFamily: string
  reduceMotion: boolean
  onReady: () => void
  onFail: () => void
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed")
  }
  return shader
}

function makeTexture(gl: WebGLRenderingContext, unit: number, source: TexImageSource) {
  gl.activeTexture(gl.TEXTURE0 + unit)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
  return texture
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = "async"
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = url
  })
}

// Draws the name flat in the sky above the jet, three times (sharp, wide
// blur, tight blur), packed into the R, G and B channels of one canvas.
// One line on wide screens, two lines on tall ones.
function drawNameMask(width: number, height: number, name: string, fontFamily: string) {
  const portrait = height > width
  const lines = portrait ? name.split(" ") : [name]

  const layer = (blur: number) => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height)

    let fontSize = portrait ? width * 0.13 : height * 0.11
    const setFont = () => {
      ctx.font = `400 ${fontSize}px ${fontFamily}`
      if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${fontSize * 0.08}px`
    }
    setFont()
    const widest = () => Math.max(...lines.map((line) => ctx.measureText(line).width))
    while (widest() > width * (portrait ? 0.84 : 0.8) && fontSize > 10) {
      fontSize *= 0.96
      setFont()
    }

    const lineHeight = fontSize * 1.2
    const centerY = height * (portrait ? 0.24 : 0.22)
    const top = centerY - (lineHeight * (lines.length - 1)) / 2

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#fff"
    // Blur is drawn as a shadow cast from text placed off-canvas, which works
    // in every browser (canvas filters are not supported everywhere).
    const offset = blur > 0 ? width + 2000 : 0
    ctx.shadowColor = "#fff"
    ctx.shadowBlur = blur * fontSize
    ctx.shadowOffsetX = offset
    lines.forEach((line, i) => ctx.fillText(line, width / 2 - offset, top + i * lineHeight))
    return ctx.getImageData(0, 0, width, height).data
  }

  const sharp = layer(0)
  const wide = layer(0.35)
  const tight = layer(0.05)

  const out = document.createElement("canvas")
  out.width = width
  out.height = height
  const ctx = out.getContext("2d")!
  const image = ctx.createImageData(width, height)
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = sharp[i]
    image.data[i + 1] = wide[i]
    image.data[i + 2] = tight[i]
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  return out
}

export function HeroCanvas({ imageUrl, blurUrl, name, fontFamily, reduceMotion, onReady, onFail }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext("webgl", { antialias: false, premultipliedAlpha: false })
    if (!canvas || !gl) {
      onFail()
      return
    }

    let program: WebGLProgram
    try {
      program = gl.createProgram()!
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShader))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShader))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("link failed")
    } catch (error) {
      console.error(error)
      onFail()
      return
    }
    gl.useProgram(program)

    // One triangle that covers the screen.
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "aPosition")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const u = (uniformName: string) => gl.getUniformLocation(program, uniformName)
    const uniforms = {
      res: u("uRes"),
      imgSize: u("uImgSize"),
      tilt: u("uTilt"),
      zoom: u("uZoom"),
      time: u("uTime"),
    }
    gl.uniform1i(u("uImage"), 0)
    gl.uniform1i(u("uText"), 1)
    gl.uniform1i(u("uBlur"), 2)
    gl.uniform2f(u("uFocus"), FOCUS[0], FOCUS[1])
    gl.uniform2f(u("uJet"), JET[0], JET[1])

    const textures: (WebGLTexture | null)[] = []
    let textTexture: WebGLTexture | null = null
    let imageSize = [1, 1]
    let frame = 0
    let disposed = false
    let visible = true
    let ready = false

    const tilt = { x: 0, y: 0 }
    const pointer = { x: 0, y: 0, lastMove: -Infinity }
    const coarse = window.matchMedia("(pointer: coarse)").matches
    const start = performance.now()

    const resize = () => {
      const dprCap = coarse ? 1.25 : 1.5
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
      const width = Math.min(Math.round(canvas.clientWidth * dpr), 2560)
      const height = Math.round(width * (canvas.clientHeight / Math.max(canvas.clientWidth, 1)))
      if (canvas.width === width && canvas.height === height && textTexture) return
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      const mask = drawNameMask(width, height, name, fontFamily)
      if (textTexture) gl.deleteTexture(textTexture)
      textTexture = makeTexture(gl, 1, mask)
    }

    const render = () => {
      if (!ready) return
      const now = performance.now()
      const t = reduceMotion ? 10 : (now - start) / 1000
      const active = now - pointer.lastMove < 4000 && !coarse

      let tiltX = 0
      let tiltY = 0
      if (active) {
        tiltX = (pointer.x / Math.max(canvas.clientWidth, 1)) * 2 - 1
        tiltY = (pointer.y / Math.max(canvas.clientHeight, 1)) * 2 - 1
      } else if (!reduceMotion) {
        tiltX = Math.sin(t * 0.12) * 0.5
        tiltY = Math.sin(t * 0.08 + 0.8) * 0.3
      }
      tilt.x += (tiltX - tilt.x) * 0.05
      tilt.y += (tiltY - tilt.y) * 0.05

      // Slow settle from a slight zoom on load.
      const settle = 1 - Math.exp(-t / 1.4)
      const zoom = 0.86 + 0.06 * settle

      gl.uniform2f(uniforms.res, canvas.width, canvas.height)
      gl.uniform2f(uniforms.imgSize, imageSize[0], imageSize[1])
      gl.uniform2f(uniforms.tilt, tilt.x, tilt.y)
      gl.uniform1f(uniforms.zoom, zoom)
      gl.uniform1f(uniforms.time, t)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const loop = () => {
      render()
      if (!disposed && visible) frame = requestAnimationFrame(loop)
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.lastMove = performance.now()
    }

    Promise.all([loadImage(imageUrl), loadImage(blurUrl), document.fonts.load(`400 100px ${fontFamily}`).catch(() => undefined)])
      .then(([image, blur]) => {
        if (disposed) return
        imageSize = [image.naturalWidth, image.naturalHeight]
        textures.push(makeTexture(gl, 0, image), makeTexture(gl, 2, blur))
        resize()
        ready = true
        render()
        onReady()
        if (!reduceMotion) loop()
      })
      .catch(() => onFail())

    const resizeObserver = new ResizeObserver(() => {
      if (!ready) return
      resize()
      render()
    })
    resizeObserver.observe(canvas)

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible && ready && !reduceMotion) loop()
    })
    visibility.observe(canvas)

    const onContextLost = (event: Event) => {
      event.preventDefault()
      onFail()
    }
    canvas.addEventListener("webglcontextlost", onContextLost)
    window.addEventListener("pointermove", onPointerMove, { passive: true })

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      canvas.removeEventListener("webglcontextlost", onContextLost)
      window.removeEventListener("pointermove", onPointerMove)
      for (const texture of textures) gl.deleteTexture(texture)
      if (textTexture) gl.deleteTexture(textTexture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [imageUrl, blurUrl, name, fontFamily, reduceMotion, onReady, onFail])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
