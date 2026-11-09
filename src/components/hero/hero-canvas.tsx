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
uniform vec2 uSun;
uniform float uSunStrength;

const int RAY_STEPS = 24;

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

// Light that can reach the camera from a point on screen: bright gaps in the
// clouds plus the sun's glow. The jet is dark in the photo and the letters are
// masked out, so both block the light and cast shadow streaks in the rays.
float lightAt(vec2 q, vec2 aspect) {
  vec3 c = texture2D(uImage, coverUv(q + uTilt * vec2(0.008, 0.006))).rgb;
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  float gaps = smoothstep(0.62, 0.98, lum) * 0.7;
  float sun = exp(-length((q - uSun) * aspect) * 14.0) * 1.8;
  float letters = texture2D(uText, q - uTilt * vec2(0.006, 0.004)).r;
  float open = smoothstep(0.06, 0.22, lum);
  return (gaps + sun) * open * (1.0 - letters);
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 p = uv * uRes;
  float ir = uImgSize.x / uImgSize.y;
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);

  // Photo, focused on the jet.
  vec2 ic = coverUv(uv + uTilt * vec2(0.008, 0.006));
  float fromJet = length((ic - uJet) * vec2(ir, 1.0));
  float defocus = smoothstep(0.1, 0.7, fromJet) * 0.7;
  vec3 col = mix(texture2D(uImage, ic).rgb, texture2D(uBlur, ic).rgb, defocus);
  // Graded down a little so the light shafts read against the clouds.
  col *= mix(1.0, 0.78, uSunStrength);

  // Name: backlit silhouette. The rim is brightest on edges facing the sun.
  vec2 tc = uv - uTilt * vec2(0.006, 0.004);
  vec3 m = texture2D(uText, tc).rgb;
  float outside = m.g * (1.0 - m.r);
  col *= 1.0 - 0.28 * outside;
  vec2 px = 1.0 / uRes;
  vec2 grad = vec2(
    texture2D(uText, tc + vec2(px.x * 2.0, 0.0)).b - texture2D(uText, tc - vec2(px.x * 2.0, 0.0)).b,
    texture2D(uText, tc + vec2(0.0, px.y * 2.0)).b - texture2D(uText, tc - vec2(0.0, px.y * 2.0)).b
  );
  vec2 outward = length(grad) > 0.0001 ? normalize(-grad) : vec2(0.0);
  vec2 toSun = normalize((uSun - uv) * aspect + vec2(0.0001));
  float facing = max(dot(outward, toSun), 0.0);
  float rim = clamp(m.r - m.b, 0.0, 1.0) * (0.35 + 1.1 * facing * uSunStrength);
  vec3 face = mix(vec3(0.05, 0.035, 0.03), vec3(0.11, 0.08, 0.06), uv.y);
  face += vec3(1.0, 0.76, 0.48) * rim * 0.85;
  col = mix(col, face, m.r);

  // Light shafts: march toward the sun and gather the light along the way.
  if (uSunStrength > 0.01) {
    vec2 stepUv = (uSun - uv) * (1.0 / float(RAY_STEPS));
    vec2 q = uv;
    float decay = 1.0;
    float rays = 0.0;
    float jitter = hash(p + fract(uTime)) * 0.8;
    q += stepUv * jitter;
    for (int i = 0; i < RAY_STEPS; i++) {
      rays += lightAt(q, aspect) * decay;
      decay *= 0.965;
      q += stepUv;
    }
    rays /= float(RAY_STEPS);
    // Glow and shafts land on open sky, not on the jet or the letters.
    float lumHere = dot(col, vec3(0.299, 0.587, 0.114));
    float openHere = smoothstep(0.06, 0.2, lumHere) * (1.0 - m.r);
    float sunGlow = exp(-length((uv - uSun) * aspect) * 7.0);
    vec3 warm = vec3(1.0, 0.8, 0.55);
    col += warm * rays * 1.1 * uSunStrength * openHere;
    col += warm * sunGlow * 0.18 * uSunStrength * openHere;
  }

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
      sun: u("uSun"),
      sunStrength: u("uSunStrength"),
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
    // The sun follows the pointer; when idle it drifts through the upper sky.
    const sun = { x: 0.72, y: 0.16, strength: 0 }
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
      const active = now - pointer.lastMove < (coarse ? 6000 : 4000)
      const px = pointer.x / Math.max(canvas.clientWidth, 1)
      const py = pointer.y / Math.max(canvas.clientHeight, 1)

      let tiltX = 0
      let tiltY = 0
      let sunX = 0.72
      let sunY = 0.16
      if (active) {
        if (!coarse) {
          tiltX = px * 2 - 1
          tiltY = py * 2 - 1
        }
        sunX = px
        sunY = py
      } else if (!reduceMotion) {
        tiltX = Math.sin(t * 0.12) * 0.5
        tiltY = Math.sin(t * 0.08 + 0.8) * 0.3
        sunX = 0.5 + 0.32 * Math.sin(t * 0.07 + 0.6)
        sunY = 0.17 + 0.07 * Math.sin(t * 0.05)
      }
      tilt.x += (tiltX - tilt.x) * 0.05
      tilt.y += (tiltY - tilt.y) * 0.05
      const sunEase = active ? 0.12 : 0.02
      sun.x += (sunX - sun.x) * sunEase
      sun.y += (sunY - sun.y) * sunEase
      sun.strength += (1 - sun.strength) * 0.03

      // Slow settle from a slight zoom on load.
      const settle = 1 - Math.exp(-t / 1.4)
      const zoom = 0.86 + 0.06 * settle

      gl.uniform2f(uniforms.res, canvas.width, canvas.height)
      gl.uniform2f(uniforms.imgSize, imageSize[0], imageSize[1])
      gl.uniform2f(uniforms.tilt, tilt.x, tilt.y)
      gl.uniform1f(uniforms.zoom, zoom)
      gl.uniform1f(uniforms.time, t)
      gl.uniform2f(uniforms.sun, sun.x, sun.y)
      gl.uniform1f(uniforms.sunStrength, reduceMotion ? 1 : sun.strength)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const loop = () => {
      render()
      if (!disposed && visible) frame = requestAnimationFrame(loop)
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      // Ignore movement outside the hero (for example after scrolling down).
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
      pointer.x = x
      pointer.y = y
      pointer.lastMove = performance.now()
      if (reduceMotion) render()
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
    window.addEventListener("pointerdown", onPointerMove, { passive: true })

    return () => {
      window.removeEventListener("pointerdown", onPointerMove)
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
