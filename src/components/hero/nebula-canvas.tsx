import { useEffect, useRef } from "react"

// Full-screen WebGL view of Webb's "Cosmic Cliffs" nebula, built like a
// paper diorama, with the name as a thick 3D layer inside it and a small black
// hole that follows the cursor.
//
// Paper layers: a depth map (dust near, starfield far) is sliced into stacked
// layers. Each layer shifts with the pointer (parallax), casts a soft shadow
// on the layers below, has a lit top edge, and blurs with distance from the
// focal plane (depth of field). The name is its own layer at the focal plane,
// so dust in front of it still covers it.
//
// Letters: extruded toward the lower right, lit with a bevel normal taken from
// a blurred copy of the text mask, and casting a shadow on the layers behind.
//
// Black hole: point-mass lens equation. A pixel at distance r shows the scene
// at r - rE^2 / r, which produces an Einstein ring.

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
uniform sampler2D uDepth;
uniform vec2 uRes;
uniform vec2 uImgSize;
uniform vec2 uMouse;
uniform float uStrength;
uniform float uTime;
uniform vec2 uTilt;

const float FOCUS = 0.5;
const float HALF_STEP = 0.1;
const float EDGE = 0.012;

vec2 coverUv(vec2 uv) {
  float sr = uRes.x / uRes.y;
  float ir = uImgSize.x / uImgSize.y;
  vec2 scale = (sr > ir ? vec2(1.0, ir / sr) : vec2(sr / ir, 1.0)) * 0.9;
  vec2 half_ = 0.5 * scale;
  vec2 focus = clamp(vec2(0.5, 0.36), half_, 1.0 - half_);
  return clamp(focus + (uv - 0.5) * scale, vec2(0.001), vec2(0.999));
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float depthAt(vec2 uv) {
  return texture2D(uDepth, coverUv(uv)).r;
}

// How far a layer slides with the pointer, relative to the focal plane.
vec2 layerShift(float level) {
  return uTilt * (level - FOCUS) * vec2(0.03, 0.022);
}

// One paper layer: color with depth of field, drop shadow from the layer
// above, and a lit top-left edge. Alpha is how much of this layer covers the pixel.
vec4 paperLayer(float level, vec2 uv) {
  vec2 s = uv + layerShift(level);
  float d = depthAt(s);
  float a = level <= 0.0 ? 1.0 : smoothstep(level - HALF_STEP - EDGE, level - HALF_STEP + EDGE, d);
  if (a < 0.002) return vec4(0.0);

  vec2 ic = coverUv(s);
  float dof = clamp(abs(level - FOCUS) * 1.3, 0.0, 0.7);
  vec3 c = mix(texture2D(uImage, ic).rgb, texture2D(uBlur, ic).rgb, dof);

  // Light comes from the upper left, so shadows fall to the lower right.
  vec2 toLight = vec2(-0.55, -0.85) * vec2(uRes.y / uRes.x, 1.0) * 0.014;
  float upper = level + HALF_STEP;
  float shade = 0.6 * smoothstep(upper - EDGE, upper + EDGE, depthAt(s + toLight))
              + 0.4 * smoothstep(upper - EDGE, upper + EDGE, depthAt(s + toLight * 2.4));
  c *= 1.0 - 0.42 * shade;

  if (level > 0.0) {
    float lower = level - HALF_STEP;
    float edge = 1.0 - smoothstep(lower - EDGE, lower + EDGE, depthAt(s + toLight * 0.3));
    c += vec3(1.0, 0.9, 0.8) * edge * 0.08;
  }

  // Nearer sheets catch a little more light.
  c *= 0.8 + level * 0.28;
  return vec4(c, a);
}

// The name as a thick sheet: beveled face plus extruded sides.
vec4 nameLayer(vec2 uv) {
  vec2 px = 1.0 / uRes;
  vec3 m = texture2D(uText, uv).rgb;
  float face = m.r;

  // Extrusion: look back toward the upper left for letter pixels.
  vec2 stepDir = vec2(0.6, 1.0) * px * (uRes.y * 0.0016);
  float side = 0.0;
  float sideDepth = 0.0;
  for (int k = 1; k <= 8; k++) {
    float hit = texture2D(uText, uv - stepDir * float(k)).r;
    if (hit > 0.5 && side < 0.5) {
      side = hit;
      sideDepth = float(k) / 8.0;
    }
  }
  float alpha = max(face, side);
  if (alpha < 0.002) return vec4(0.0);

  // Bevel normal from the gradient of the softly blurred mask.
  vec2 o = px * 2.0;
  float gx = texture2D(uText, uv + vec2(o.x, 0.0)).b - texture2D(uText, uv - vec2(o.x, 0.0)).b;
  float gy = texture2D(uText, uv + vec2(0.0, o.y)).b - texture2D(uText, uv - vec2(0.0, o.y)).b;
  vec3 n = normalize(vec3(-gx * 4.0, -gy * 4.0, 1.0));
  vec3 lightDir = normalize(vec3(-0.5, -0.7, 0.6));
  float diffuse = max(dot(n, lightDir), 0.0);
  float spec = pow(max(dot(reflect(-lightDir, n), vec3(0.0, 0.0, 1.0)), 0.0), 28.0);

  // Face: a brighter, slightly offset copy of the nebula, like a print on card.
  vec3 inner = texture2D(uImage, coverUv(uv * 0.97 + vec2(0.015, 0.012))).rgb;
  inner = pow(inner, vec3(0.8)) * 1.25 + vec3(0.1, 0.13, 0.2);
  inner = mix(inner, vec3(0.92, 0.95, 1.0), 0.2);
  vec3 faceColor = inner * (0.55 + 0.6 * diffuse) + vec3(1.0, 0.97, 0.92) * spec * 0.55;

  // Sides: dark, cool card edge, darker further back.
  vec3 sideColor = mix(vec3(0.2, 0.26, 0.42), vec3(0.06, 0.08, 0.14), sideDepth) + inner * 0.08;

  return vec4(mix(sideColor, faceColor, face), alpha);
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 p = uv * uRes;
  vec2 d = p - uMouse;
  float dist = length(d);
  float r = dist / uRes.y;
  vec2 dir = d / max(dist, 0.0001);

  // Gravitational lens bends every layer.
  float rE = 0.09 * uStrength;
  float rH = rE * 0.42;
  float shift = min((rE * rE) / max(r, 0.0001), 0.6);
  vec2 luv = (p - dir * shift * uRes.y) / uRes;

  // Composite front to back: near dust, the name, then everything behind it.
  vec3 col = vec3(0.0);
  float covered = 0.0;
  vec4 layer;

  layer = paperLayer(1.0, luv); col += (1.0 - covered) * layer.a * layer.rgb; covered += (1.0 - covered) * layer.a;
  layer = paperLayer(0.8, luv); col += (1.0 - covered) * layer.a * layer.rgb; covered += (1.0 - covered) * layer.a;
  layer = paperLayer(0.6, luv); col += (1.0 - covered) * layer.a * layer.rgb; covered += (1.0 - covered) * layer.a;

  layer = nameLayer(luv); col += (1.0 - covered) * layer.a * layer.rgb; covered += (1.0 - covered) * layer.a;

  // The name casts a soft shadow and a faint glow on the sheets behind it.
  vec3 textBehind = texture2D(uText, luv - vec2(0.006, 0.011) * vec2(uRes.y / uRes.x, 1.0)).rgb;
  float nameShadow = textBehind.g;
  float nameGlow = texture2D(uText, luv).g;

  for (int i = 0; i < 3; i++) {
    float level = 0.4 - float(i) * 0.2;
    layer = paperLayer(level, luv);
    layer.rgb *= 1.0 - 0.5 * nameShadow;
    layer.rgb += vec3(0.3, 0.5, 1.0) * nameGlow * 0.12;
    col += (1.0 - covered) * layer.a * layer.rgb;
    covered += (1.0 - covered) * layer.a;
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

  // Paper grain, vignette and film grain.
  float fiber = hash(floor(p * 0.5)) * 0.5 + hash(floor(p * 0.12)) * 0.5;
  col *= 0.97 + 0.06 * fiber;
  float v = smoothstep(1.2, 0.3, length((uv - 0.5) * vec2(uRes.x / uRes.y, 1.0)));
  col *= mix(0.5, 1.0, v);
  col += (hash(p + fract(uTime) * 100.0) - 0.5) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}
`

interface NebulaCanvasProps {
  imageUrl: string
  blurUrl: string
  depthUrl: string
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
    while (widest() > width * (height > width ? 0.86 : 0.74) && fontSize > 12) {
      fontSize *= 0.96
      setFont()
    }

    const lineHeight = fontSize * 1.04
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
  const wide = layer(0.3)
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

export function NebulaCanvas({ imageUrl, blurUrl, depthUrl, lines, fontFamily, reduceMotion, onReady, onFail }: NebulaCanvasProps) {
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

    const u = (name: string) => gl.getUniformLocation(program, name)
    const uniforms = {
      res: u("uRes"),
      imgSize: u("uImgSize"),
      mouse: u("uMouse"),
      strength: u("uStrength"),
      time: u("uTime"),
      tilt: u("uTilt"),
    }
    gl.uniform1i(u("uImage"), 0)
    gl.uniform1i(u("uText"), 1)
    gl.uniform1i(u("uBlur"), 2)
    gl.uniform1i(u("uDepth"), 3)

    const textures: (WebGLTexture | null)[] = []
    let textTexture: WebGLTexture | null = null
    let imageSize = [1, 1]
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
      const dprCap = coarse ? 1 : 1.25
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap) * quality
      const width = Math.min(Math.round(canvas.clientWidth * dpr), 2400)
      const height = Math.round(width * (canvas.clientHeight / Math.max(canvas.clientWidth, 1)))
      if (!force && canvas.width === width && canvas.height === height && textTexture) return
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      const mask = drawNameMask(width, height, lines, fontFamily)
      if (textTexture) gl.deleteTexture(textTexture)
      textTexture = makeTexture(gl, 1, mask)
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
      let tiltX: number
      let tiltY: number
      if (active) {
        targetX = pointer.x * scale
        targetY = pointer.y * scale
        targetStrength = 1
        tiltX = (pointer.x / Math.max(canvas.clientWidth, 1)) * 2 - 1
        tiltY = (pointer.y / Math.max(canvas.clientHeight, 1)) * 2 - 1
      } else if (!reduceMotion) {
        // Slow idle orbit through the lower half, clear of the name.
        targetX = canvas.width * (0.5 + 0.3 * Math.sin(t * 0.11))
        targetY = canvas.height * (0.68 + 0.1 * Math.sin(t * 0.17 + 1.3))
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

    Promise.all([loadImage(imageUrl), loadImage(blurUrl), loadImage(depthUrl), document.fonts.load(`800 100px ${fontFamily}`).catch(() => undefined)])
      .then(([image, blur, depth]) => {
        if (disposed) return
        imageSize = [image.naturalWidth, image.naturalHeight]
        textures.push(makeTexture(gl, 0, image), makeTexture(gl, 2, blur), makeTexture(gl, 3, depth))
        resize()
        ready = true
        render()
        onReady()
        lastFrame = performance.now()
        if (!reduceMotion) loop()
      })
      .catch(() => onFail())

    const resizeObserver = new ResizeObserver(() => {
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
  }, [imageUrl, blurUrl, depthUrl, lines, fontFamily, reduceMotion, onReady, onFail])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
