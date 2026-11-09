import { useEffect, useRef } from "react"

// Full-screen WebGL view of the Webb "Cosmic Cliffs" nebula with the name
// drawn into it and a small black hole that follows the cursor.
//
// The black hole bends the image with the point-mass lens equation: a pixel at
// distance r from the lens shows the source at r - rE^2 / r, which creates an
// Einstein ring. The name is rendered to a canvas mask (R = letters,
// G = wide glow, B = tight blur for the rim) and lensed with the same math,
// so it warps together with the nebula. Orange dust in the photo is treated
// as foreground and drawn in front of the letters.

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
uniform vec2 uRes;
uniform vec2 uImgSize;
uniform vec2 uMouse;
uniform float uStrength;
uniform float uTime;
uniform vec2 uDrift;

vec2 coverUv(vec2 uv) {
  float sr = uRes.x / uRes.y;
  float ir = uImgSize.x / uImgSize.y;
  vec2 scale = (sr > ir ? vec2(1.0, ir / sr) : vec2(sr / ir, 1.0)) * 0.92;
  vec2 half_ = 0.5 * scale;
  vec2 focus = clamp(vec2(0.5, 0.36), half_, 1.0 - half_);
  return clamp(focus + (uv - 0.5) * scale + uDrift, vec2(0.001), vec2(0.999));
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 p = uv * uRes;
  vec2 d = p - uMouse;
  float dist = length(d);
  float r = dist / uRes.y;
  vec2 dir = d / max(dist, 0.0001);

  // Point-mass gravitational lens.
  float rE = 0.09 * uStrength;
  float rH = rE * 0.42;
  float shift = min((rE * rE) / max(r, 0.0001), 0.6);
  vec2 luv = (p - dir * shift * uRes.y) / uRes;

  // Background with a slight color split close to the lens.
  float split = (1.0 - smoothstep(rE, rE * 3.0, r)) * uStrength * 0.004;
  vec3 base;
  base.r = texture2D(uImage, coverUv(luv + dir * split)).r;
  base.g = texture2D(uImage, coverUv(luv)).g;
  base.b = texture2D(uImage, coverUv(luv - dir * split)).b;

  // Name mask, lensed with the same coordinates.
  vec3 mask = texture2D(uText, clamp(luv, 0.0, 1.0)).rgb;
  float dust = smoothstep(0.04, 0.2, base.r - base.b) * smoothstep(0.12, 0.35, base.r);
  float fill = mask.r * (1.0 - dust * 0.9);
  float glow = mask.g * (1.0 - mask.r) * (1.0 - dust * 0.85);
  float rim = clamp(mask.r - mask.b, 0.0, 1.0) * (1.0 - dust);

  // Inside the letters: a brighter, slightly offset copy of the nebula.
  // Kept below white so the nebula's color and structure read through the type.
  vec3 inner = texture2D(uImage, coverUv(luv * 0.97 + vec2(0.015, 0.012))).rgb;
  inner = pow(inner, vec3(0.8)) * 1.3 + vec3(0.1, 0.13, 0.2);
  inner = mix(inner, vec3(0.92, 0.95, 1.0), 0.18);
  inner += vec3(0.75, 0.85, 1.0) * rim * 0.9;

  vec3 col = base * 0.82;
  col += vec3(0.35, 0.55, 1.0) * glow * 0.55;
  col = mix(col, inner, fill);

  // Accretion glow, photon ring and event horizon.
  if (uStrength > 0.01) {
    float ang = atan(d.y, d.x);
    // Brighter on one side, like Doppler-boosted gas in a real accretion disk.
    float ring = exp(-pow((r - rH * 1.45) / (rH * 0.55), 2.0));
    float swirl = 0.5 + 0.5 * sin(ang * 3.0 - uTime * 2.4 + r * 120.0);
    float beaming = 0.65 + 0.35 * cos(ang - 0.6);
    col += vec3(1.0, 0.6, 0.3) * ring * (0.45 + 0.55 * swirl) * beaming * 0.95 * uStrength;
    float photon = exp(-pow((r - rH * 1.03) / (rH * 0.1), 2.0));
    col += vec3(1.0, 0.88, 0.75) * photon * 0.9 * uStrength;
    float horizon = 1.0 - smoothstep(rH * 0.9, rH, r);
    col = mix(col, vec3(0.0), horizon);
  }

  // Vignette and fine grain.
  float v = smoothstep(1.2, 0.3, length((uv - 0.5) * vec2(uRes.x / uRes.y, 1.0)));
  col *= mix(0.5, 1.0, v);
  col += (hash(p + fract(uTime) * 100.0) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`

interface NebulaCanvasProps {
  imageUrl: string
  lines: string[]
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

function makeTexture(gl: WebGLRenderingContext, source: TexImageSource) {
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

// Draws the name three times (sharp, wide glow, tight blur) and packs the
// results into the R, G and B channels of one canvas.
function drawNameMask(width: number, height: number, lines: string[], fontFamily: string) {
  const layer = (blur: number) => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height)

    let fontSize = Math.min(width * 0.14, height * 0.2)
    const setFont = () => {
      ctx.font = `800 ${fontSize}px ${fontFamily}`
      if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${fontSize * 0.02}px`
    }
    setFont()
    const widest = () => Math.max(...lines.map((line) => ctx.measureText(line).width))
    while (widest() > width * (height > width ? 0.88 : 0.76) && fontSize > 12) {
      fontSize *= 0.96
      setFont()
    }

    const lineHeight = fontSize * 1.02
    const portrait = height > width
    const centerY = height * (portrait ? 0.33 : 0.3)
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
    const passes = blur > 0.1 ? 2 : 1
    for (let pass = 0; pass < passes; pass++) {
      lines.forEach((line, i) => ctx.fillText(line, width / 2 - offset, top + i * lineHeight))
    }
    return ctx.getImageData(0, 0, width, height).data
  }

  const sharp = layer(0)
  const wide = layer(0.32)
  const tight = layer(0.035)

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

export function NebulaCanvas({ imageUrl, lines, fontFamily, reduceMotion, onReady, onFail }: NebulaCanvasProps) {
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
    } catch {
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

    const u = (name: string) => gl.getUniformLocation(program, name)
    const uniforms = {
      image: u("uImage"),
      text: u("uText"),
      res: u("uRes"),
      imgSize: u("uImgSize"),
      mouse: u("uMouse"),
      strength: u("uStrength"),
      time: u("uTime"),
      drift: u("uDrift"),
    }
    gl.uniform1i(uniforms.image, 0)
    gl.uniform1i(uniforms.text, 1)

    let imageTexture: WebGLTexture | null = null
    let textTexture: WebGLTexture | null = null
    let imageSize = [1, 1]
    let frame = 0
    let disposed = false
    let visible = true
    let ready = false

    // Lens state: eased toward the pointer, or along a slow idle path.
    const lens = { x: 0, y: 0, strength: 0 }
    const pointer = { x: 0, y: 0, lastMove: -Infinity, inside: false }
    const coarse = window.matchMedia("(pointer: coarse)").matches
    const start = performance.now()

    const resize = () => {
      const dprCap = coarse ? 1.25 : 1.5
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
      const width = Math.min(Math.round(canvas.clientWidth * dpr), 2880)
      const height = Math.round(width * (canvas.clientHeight / Math.max(canvas.clientWidth, 1)))
      if (canvas.width === width && canvas.height === height && textTexture) return
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      const mask = drawNameMask(width, height, lines, fontFamily)
      if (textTexture) gl.deleteTexture(textTexture)
      gl.activeTexture(gl.TEXTURE1)
      textTexture = makeTexture(gl, mask)
      if (!lens.x && !lens.y) {
        lens.x = width * 0.72
        lens.y = height * 0.62
      }
    }

    const render = () => {
      if (!ready) return
      const now = performance.now()
      const t = reduceMotion ? 0 : (now - start) / 1000
      const scale = canvas.width / Math.max(canvas.clientWidth, 1)
      const active = pointer.inside && now - pointer.lastMove < 2500

      let targetX: number
      let targetY: number
      let targetStrength: number
      if (active) {
        targetX = pointer.x * scale
        targetY = pointer.y * scale
        targetStrength = 1
      } else if (!reduceMotion) {
        // Slow idle orbit through the lower half, clear of the name.
        targetX = canvas.width * (0.5 + 0.3 * Math.sin(t * 0.11))
        targetY = canvas.height * (0.68 + 0.1 * Math.sin(t * 0.17 + 1.3))
        targetStrength = 0.7
      } else {
        targetX = lens.x
        targetY = lens.y
        targetStrength = 0
      }
      const ease = active ? 0.14 : 0.03
      lens.x += (targetX - lens.x) * ease
      lens.y += (targetY - lens.y) * ease
      lens.strength += (targetStrength - lens.strength) * 0.06

      gl.uniform2f(uniforms.res, canvas.width, canvas.height)
      gl.uniform2f(uniforms.imgSize, imageSize[0], imageSize[1])
      gl.uniform2f(uniforms.mouse, lens.x, lens.y)
      gl.uniform1f(uniforms.strength, lens.strength)
      gl.uniform1f(uniforms.time, t)
      gl.uniform2f(uniforms.drift, Math.sin(t * 0.05) * 0.012, Math.cos(t * 0.04) * 0.008)
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
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height
      pointer.lastMove = performance.now()
      if (reduceMotion) render()
    }

    const image = new Image()
    image.decoding = "async"
    image.onload = async () => {
      if (disposed) return
      await document.fonts.load(`800 100px ${fontFamily}`).catch(() => undefined)
      if (disposed) return
      imageSize = [image.naturalWidth, image.naturalHeight]
      gl.activeTexture(gl.TEXTURE0)
      imageTexture = makeTexture(gl, image)
      resize()
      ready = true
      render()
      onReady()
      if (!reduceMotion) loop()
    }
    image.onerror = () => onFail()
    image.src = imageUrl

    const resizeObserver = new ResizeObserver(() => {
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
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      canvas.removeEventListener("webglcontextlost", onContextLost)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerdown", onPointerMove)
      if (imageTexture) gl.deleteTexture(imageTexture)
      if (textTexture) gl.deleteTexture(textTexture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [imageUrl, lines, fontFamily, reduceMotion, onReady, onFail])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
