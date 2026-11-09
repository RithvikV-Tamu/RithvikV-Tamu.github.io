import { useEffect, useRef } from "react"

// Full-screen WebGL view of Hubble's Veil Nebula with the name riding the
// upper edge of the bright filament, and a small black hole that follows the
// cursor.
//
// The name is drawn in image space along a hand-traced line on the filament's
// edge, so it stays on the edge at any screen size. Depth of field is a smooth
// focus band along that line: sharp at the name and the edge, gradually
// mixing toward a blurred copy of the image further away. The letters are
// solid silver with a short extrusion and bevel, lit from below by the
// filament's own color. The name drifts a little more than the nebula with
// the pointer, which places it slightly in front.
//
// Black hole: point-mass lens equation. A pixel at distance r shows the scene
// at r - rE^2 / r, which produces an Einstein ring.

// The filament's upper edge, in image coordinates (0 to 1).
const EDGE_A: [number, number] = [0.3, 0.56]
const EDGE_B: [number, number] = [0.7, 0.22]
// Where the crop centers on small or tall screens.
const FOCUS: [number, number] = [0.52, 0.4]
const ZOOM = 0.92

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
uniform vec2 uTextSize;
uniform vec2 uFocus;
uniform vec2 uLineA;
uniform vec2 uLineB;
uniform vec2 uMouse;
uniform float uStrength;
uniform float uTime;
uniform vec2 uTilt;

vec2 coverUv(vec2 uv) {
  float sr = uRes.x / uRes.y;
  float ir = uImgSize.x / uImgSize.y;
  vec2 scale = (sr > ir ? vec2(1.0, ir / sr) : vec2(sr / ir, 1.0)) * ${ZOOM.toFixed(2)};
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
  vec2 d = p - uMouse;
  float dist = length(d);
  // Lens size follows the shorter screen side, so it suits phones and desktops.
  float unit = min(uRes.x, uRes.y);
  float r = dist / unit;
  vec2 dir = d / max(dist, 0.0001);

  // Gravitational lens bends everything behind it.
  float rE = 0.1 * uStrength;
  float rH = rE * 0.42;
  float shift = min((rE * rE) / max(r, 0.0001), 0.6);
  vec2 luv = (p - dir * shift * unit) / uRes;

  // Nebula with a focus band along the filament edge.
  vec2 ic = coverUv(luv - uTilt * vec2(0.006, 0.005));
  float ir = uImgSize.x / uImgSize.y;
  vec2 lineDir = normalize((uLineB - uLineA) * vec2(ir, 1.0));
  vec2 rel = (ic - uLineA) * vec2(ir, 1.0);
  float lineDist = abs(rel.x * lineDir.y - rel.y * lineDir.x);
  float defocus = smoothstep(0.05, 0.32, lineDist) * 0.75;
  vec3 col = mix(texture2D(uImage, ic).rgb, texture2D(uBlur, ic).rgb, defocus);
  col *= 1.0 - 0.18 * defocus;

  // Name, in image space, drifting a bit more than the nebula.
  vec2 tc = coverUv(luv + uTilt * vec2(0.01, 0.008));
  vec2 texel = 1.0 / uTextSize;
  vec3 m = texture2D(uText, tc).rgb;
  float face = m.r;

  // Soft shadow on the nebula behind the letters.
  float shadow = texture2D(uText, tc - vec2(0.004, 0.009) * vec2(1.0, ir)).g;
  col *= 1.0 - 0.55 * shadow * (1.0 - face);

  // Short extrusion toward the lower right.
  vec2 extrude = vec2(0.6, 1.0) * texel * (uTextSize.y * 0.0012);
  float side = 0.0;
  float sideDepth = 0.0;
  for (int k = 1; k <= 6; k++) {
    float hit = texture2D(uText, tc - extrude * float(k)).r;
    if (hit > 0.5 && side < 0.5) {
      side = hit;
      sideDepth = float(k) / 6.0;
    }
  }
  float nameAlpha = max(face, side);

  if (nameAlpha > 0.001) {
    vec2 o = texel * 2.0;
    float gx = texture2D(uText, tc + vec2(o.x, 0.0)).b - texture2D(uText, tc - vec2(o.x, 0.0)).b;
    float gy = texture2D(uText, tc + vec2(0.0, o.y)).b - texture2D(uText, tc - vec2(0.0, o.y)).b;
    vec3 n = normalize(vec3(-gx * 3.0, -gy * 3.0, 1.0));
    vec3 lightDir = normalize(vec3(-0.45, -0.7, 0.6));
    float diffuse = max(dot(n, lightDir), 0.0);
    float spec = pow(max(dot(reflect(-lightDir, n), vec3(0.0, 0.0, 1.0)), 0.0), 30.0);

    // Silver face, plus colored light bouncing up from the filament below.
    vec3 bounce = texture2D(uBlur, coverUv(luv + vec2(0.012, 0.035))).rgb;
    float downward = clamp(n.y * 2.0 + 0.25, 0.0, 1.0);
    vec3 faceColor = mix(vec3(0.7, 0.75, 0.86), vec3(1.0, 0.98, 0.96), diffuse) + spec * 0.35;
    faceColor += bounce * (0.18 + 0.45 * downward);
    vec3 sideColor = mix(vec3(0.18, 0.2, 0.3), vec3(0.05, 0.06, 0.1), sideDepth) + bounce * 0.2;
    col = mix(col, mix(sideColor, faceColor, face), nameAlpha);
  }

  // Accretion glow, photon ring and event horizon.
  if (uStrength > 0.01) {
    float ang = atan(d.y, d.x);
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
  col *= mix(0.55, 1.0, v);
  col += (hash(p + fract(uTime) * 100.0) - 0.5) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`

interface NebulaCanvasProps {
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

// The part of the image (in 0..1 coordinates) visible on a screen of this shape.
function visibleRegion(screenAspect: number, imageAspect: number) {
  const sx = (screenAspect > imageAspect ? 1 : screenAspect / imageAspect) * ZOOM
  const sy = (screenAspect > imageAspect ? imageAspect / screenAspect : 1) * ZOOM
  const fx = Math.min(Math.max(FOCUS[0], sx / 2), 1 - sx / 2)
  const fy = Math.min(Math.max(FOCUS[1], sy / 2), 1 - sy / 2)
  return { x0: fx - sx / 2, x1: fx + sx / 2, y0: fy - sy / 2, y1: fy + sy / 2 }
}

// Draws the name along the filament edge in image space, three times
// (sharp, wide blur, tight blur), packed into the R, G and B channels.
// G drives the cast shadow; B gives the bevel its rounded edge.
function drawNameMask(texW: number, texH: number, name: string, fontFamily: string, screenAspect: number) {
  const region = visibleRegion(screenAspect, texW / texH)
  const ax = EDGE_A[0] * texW
  const ay = EDGE_A[1] * texH
  const dx = (EDGE_B[0] - EDGE_A[0]) * texW
  const dy = (EDGE_B[1] - EDGE_A[1]) * texH

  // Part of the edge line inside the visible region (with a small margin).
  const portrait = screenAspect < 1
  const margin = portrait ? 0.05 : 0.06
  const limits: [number, number][] = [
    [(region.x0 + margin * (region.x1 - region.x0)) * texW, (region.x1 - margin * (region.x1 - region.x0)) * texW],
    [(region.y0 + margin * (region.y1 - region.y0)) * texH, (region.y1 - margin * (region.y1 - region.y0)) * texH],
  ]
  let t0 = -Infinity
  let t1 = Infinity
  const clip = (origin: number, delta: number, [lo, hi]: [number, number]) => {
    const a = (lo - origin) / delta
    const b = (hi - origin) / delta
    t0 = Math.max(t0, Math.min(a, b))
    t1 = Math.min(t1, Math.max(a, b))
  }
  clip(ax, dx, limits[0])
  clip(ay, dy, limits[1])
  const segment = Math.hypot(dx, dy) * Math.max(t1 - t0, 0.1)
  const tm = (t0 + t1) / 2
  const cx = ax + dx * tm
  const cy = ay + dy * tm
  const angle = Math.atan2(dy, dx)
  const visibleHeight = (region.y1 - region.y0) * texH

  const layer = (blur: number) => {
    const canvas = document.createElement("canvas")
    canvas.width = texW
    canvas.height = texH
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, texW, texH)

    let fontSize = visibleHeight * 0.09
    const setFont = () => {
      ctx.font = `400 ${fontSize}px ${fontFamily}`
      if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${fontSize * 0.06}px`
    }
    setFont()
    while (ctx.measureText(name).width > segment * (portrait ? 0.88 : 0.74) && fontSize > 8) {
      fontSize *= 0.96
      setFont()
    }

    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.textAlign = "center"
    ctx.textBaseline = "alphabetic"
    ctx.fillStyle = "#fff"
    // Blur is drawn as a shadow cast from text placed off-canvas, which works
    // in every browser (canvas filters are not supported everywhere).
    const offset = blur > 0 ? texW * 3 : 0
    ctx.shadowColor = "#fff"
    ctx.shadowBlur = blur * fontSize
    // Shadow offsets ignore the rotation, so rotate the offset to match the text.
    ctx.shadowOffsetX = offset * Math.cos(angle)
    ctx.shadowOffsetY = offset * Math.sin(angle)
    // Baseline sits above the edge, in the dark space, so the letters ride the
    // filament without crossing its bright strands.
    const lift = -fontSize * 0.8
    const passes = blur > 0.1 ? 2 : 1
    for (let pass = 0; pass < passes; pass++) ctx.fillText(name, -offset, lift)
    return ctx.getImageData(0, 0, texW, texH).data
  }

  const sharp = layer(0)
  const wide = layer(0.22)
  const tight = layer(0.06)

  const out = document.createElement("canvas")
  out.width = texW
  out.height = texH
  const ctx = out.getContext("2d")!
  const image = ctx.createImageData(texW, texH)
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = sharp[i]
    image.data[i + 1] = wide[i]
    image.data[i + 2] = tight[i]
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  return out
}

export function NebulaCanvas({ imageUrl, blurUrl, name, fontFamily, reduceMotion, onReady, onFail }: NebulaCanvasProps) {
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
      textSize: u("uTextSize"),
      mouse: u("uMouse"),
      strength: u("uStrength"),
      time: u("uTime"),
      tilt: u("uTilt"),
    }
    gl.uniform1i(u("uImage"), 0)
    gl.uniform1i(u("uText"), 1)
    gl.uniform1i(u("uBlur"), 2)
    gl.uniform2f(u("uFocus"), FOCUS[0], FOCUS[1])
    gl.uniform2f(u("uLineA"), EDGE_A[0], EDGE_A[1])
    gl.uniform2f(u("uLineB"), EDGE_B[0], EDGE_B[1])

    const textures: (WebGLTexture | null)[] = []
    let textTexture: WebGLTexture | null = null
    let imageSize = [1, 1]
    let textSize = [1, 1]
    let lastAspect = 0
    let frame = 0
    let disposed = false
    let visible = true
    let ready = false

    // Lens and tilt state, eased toward the pointer or along a slow idle path.
    const lens = { x: 0, y: 0, strength: 0 }
    const tilt = { x: 0, y: 0 }
    const pointer = { x: 0, y: 0, lastMove: -Infinity, inside: false }
    const coarse = window.matchMedia("(pointer: coarse)").matches
    const start = performance.now()

    // Resolution scale drops automatically if frames get slow.
    let quality = 1
    let frameTimes: number[] = []
    let lastFrame = performance.now()

    const resize = (force = false) => {
      const dprCap = coarse ? 1.25 : 1.5
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap) * quality
      const width = Math.min(Math.round(canvas.clientWidth * dpr), 2560)
      const height = Math.round(width * (canvas.clientHeight / Math.max(canvas.clientWidth, 1)))
      if (!force && canvas.width === width && canvas.height === height && textTexture) return
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)

      // The name texture only depends on the screen shape, not its size.
      const aspect = width / Math.max(height, 1)
      if (!textTexture || Math.abs(aspect - lastAspect) > 0.02) {
        lastAspect = aspect
        const texW = 2560
        const texH = Math.round(texW * (imageSize[1] / imageSize[0]))
        textSize = [texW, texH]
        const mask = drawNameMask(texW, texH, name, fontFamily, aspect)
        if (textTexture) gl.deleteTexture(textTexture)
        textTexture = makeTexture(gl, 1, mask)
      }
      if (!lens.x && !lens.y) {
        lens.x = width * 0.7
        lens.y = height * 0.72
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
      let tiltX: number
      let tiltY: number
      if (active) {
        targetX = pointer.x * scale
        targetY = pointer.y * scale
        targetStrength = 1
        tiltX = (pointer.x / Math.max(canvas.clientWidth, 1)) * 2 - 1
        tiltY = (pointer.y / Math.max(canvas.clientHeight, 1)) * 2 - 1
      } else if (!reduceMotion) {
        // Slow idle orbit through the dark lower right, clear of the name.
        targetX = canvas.width * (0.68 + 0.18 * Math.sin(t * 0.11))
        targetY = canvas.height * (0.74 + 0.08 * Math.sin(t * 0.17 + 1.3))
        targetStrength = 0.7
        tiltX = Math.sin(t * 0.13) * 0.6
        tiltY = Math.sin(t * 0.09 + 0.8) * 0.4
      } else {
        targetX = lens.x
        targetY = lens.y
        targetStrength = 0
        tiltX = 0
        tiltY = 0
      }
      const ease = active ? 0.14 : 0.03
      lens.x += (targetX - lens.x) * ease
      lens.y += (targetY - lens.y) * ease
      lens.strength += (targetStrength - lens.strength) * 0.06
      tilt.x += (tiltX - tilt.x) * 0.06
      tilt.y += (tiltY - tilt.y) * 0.06

      gl.uniform2f(uniforms.res, canvas.width, canvas.height)
      gl.uniform2f(uniforms.imgSize, imageSize[0], imageSize[1])
      gl.uniform2f(uniforms.textSize, textSize[0], textSize[1])
      gl.uniform2f(uniforms.mouse, lens.x, lens.y)
      gl.uniform1f(uniforms.strength, lens.strength)
      gl.uniform1f(uniforms.time, t)
      gl.uniform2f(uniforms.tilt, tilt.x, tilt.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const loop = () => {
      const now = performance.now()
      frameTimes.push(now - lastFrame)
      lastFrame = now
      if (frameTimes.length >= 45) {
        const average = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
        frameTimes = []
        if (average > 24 && quality > 0.55) {
          quality = Math.max(0.55, quality * 0.85)
          resize(true)
        }
      }
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

    Promise.all([loadImage(imageUrl), loadImage(blurUrl), document.fonts.load(`400 100px ${fontFamily}`).catch(() => undefined)])
      .then(([image, blur]) => {
        if (disposed) return
        imageSize = [image.naturalWidth, image.naturalHeight]
        textures.push(makeTexture(gl, 0, image), makeTexture(gl, 2, blur))
        resize()
        ready = true
        render()
        onReady()
        lastFrame = performance.now()
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
      if (visible && ready && !reduceMotion) {
        lastFrame = performance.now()
        frameTimes = []
        loop()
      }
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
      for (const texture of textures) gl.deleteTexture(texture)
      if (textTexture) gl.deleteTexture(textTexture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [imageUrl, blurUrl, name, fontFamily, reduceMotion, onReady, onFail])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
