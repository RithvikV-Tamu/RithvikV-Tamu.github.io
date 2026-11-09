import { useEffect, useRef } from "react"

// Full-screen WebGL view of Webb's "Cosmic Cliffs" nebula in two layers, with
// the name sitting between them and a small black hole that follows the cursor.
//
// Layers: a depth map splits the photo into a far background (starfield) and
// a near foreground (dust). They slide by different amounts with the pointer
// (parallax), the foreground casts a soft shadow on the background, and the
// background is slightly softened (depth of field).
//
// Name: solid, light lettering with a short extrusion, bevel lighting and a
// shadow on the background. It sits behind the foreground dust, but the dust
// turns mostly see-through over the letters so the name always reads clearly.
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

// uDepth holds the foreground mask: white below the ridge of the dust cliffs.
const float SPLIT = 0.5;

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

float foregroundAt(vec2 uv, float softness) {
  float d = texture2D(uDepth, coverUv(uv)).r;
  return smoothstep(SPLIT - softness, SPLIT + softness, d);
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

  vec2 aspect = vec2(uRes.y / uRes.x, 1.0);
  vec2 toLight = vec2(-0.55, -0.85) * aspect * 0.016;

  // Background: far starfield, slid slightly against the pointer and softened.
  vec2 bs = luv - uTilt * vec2(0.012, 0.009);
  vec2 bc = coverUv(bs);
  vec3 col = mix(texture2D(uImage, bc).rgb, texture2D(uBlur, bc).rgb, 0.3) * 0.82;

  // Foreground: near dust, slid further with the pointer.
  vec2 fs = luv + uTilt * vec2(0.02, 0.015);
  float fg = foregroundAt(fs, 0.08);
  vec3 fgColor = texture2D(uImage, coverUv(fs)).rgb;
  float fgShadow = 0.6 * foregroundAt(fs + toLight, 0.45) + 0.4 * foregroundAt(fs + toLight * 2.2, 0.45);

  // Name, sitting between the two layers at the focal plane.
  vec2 px = 1.0 / uRes;
  vec3 m = texture2D(uText, luv).rgb;
  float face = m.r;
  vec2 extrude = vec2(0.55, 1.0) * px * (uRes.y * 0.0011);
  float side = 0.0;
  float sideDepth = 0.0;
  for (int k = 1; k <= 6; k++) {
    float hit = texture2D(uText, luv - extrude * float(k)).r;
    if (hit > 0.5 && side < 0.5) {
      side = hit;
      sideDepth = float(k) / 6.0;
    }
  }
  float nameAlpha = max(face, side);

  // Shadows on the background: the dust above it, and the name in front of it.
  float nameShadow = texture2D(uText, luv - vec2(0.006, 0.012) * aspect).g;
  col *= 1.0 - 0.4 * fgShadow * (1.0 - fg);
  col *= 1.0 - 0.55 * nameShadow;

  if (nameAlpha > 0.001) {
    vec2 o = px * 2.0;
    float gx = texture2D(uText, luv + vec2(o.x, 0.0)).b - texture2D(uText, luv - vec2(o.x, 0.0)).b;
    float gy = texture2D(uText, luv + vec2(0.0, o.y)).b - texture2D(uText, luv - vec2(0.0, o.y)).b;
    vec3 n = normalize(vec3(-gx * 3.0, -gy * 3.0, 1.0));
    vec3 lightDir = normalize(vec3(-0.5, -0.7, 0.6));
    float diffuse = max(dot(n, lightDir), 0.0);
    float spec = pow(max(dot(reflect(-lightDir, n), vec3(0.0, 0.0, 1.0)), 0.0), 30.0);

    // Warm white face with a cool shadow side, then a deep slate extrusion.
    vec3 faceColor = mix(vec3(0.72, 0.78, 0.9), vec3(1.0, 0.98, 0.95), diffuse) + spec * 0.35;
    vec3 sideColor = mix(vec3(0.2, 0.25, 0.36), vec3(0.07, 0.09, 0.14), sideDepth);
    vec3 nameColor = mix(sideColor, faceColor, face);
    // A little of the dust's shadow falls across the name too.
    nameColor *= 1.0 - 0.2 * fgShadow;
    col = mix(col, nameColor, nameAlpha);
  }

  // Foreground on top, mostly see-through where it crosses the letters.
  float fgAlpha = fg * mix(1.0, 0.2, nameAlpha);
  col = mix(col, fgColor * 1.04, fgAlpha);

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

// Draws the name three times (sharp, wide blur, tight blur) and packs the
// results into the R, G and B channels of one canvas. G drives the cast
// shadow; B gives the bevel its rounded edge.
function drawNameMask(width: number, height: number, lines: string[], fontFamily: string) {
  const layer = (blur: number) => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height)

    let fontSize = Math.min(width * 0.1, height * 0.16)
    const setFont = () => {
      ctx.font = `400 ${fontSize}px ${fontFamily}`
      if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${fontSize * 0.05}px`
    }
    setFont()
    const widest = () => Math.max(...lines.map((line) => ctx.measureText(line).width))
    while (widest() > width * (height > width ? 0.86 : 0.72) && fontSize > 12) {
      fontSize *= 0.96
      setFont()
    }

    const lineHeight = fontSize * 1.18
    const portrait = height > width
    const centerY = height * (portrait ? 0.32 : 0.29)
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
  const wide = layer(0.22)
  const tight = layer(0.06)

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
      const dprCap = coarse ? 1.25 : 1.5
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap) * quality
      const width = Math.min(Math.round(canvas.clientWidth * dpr), 2560)
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

    Promise.all([loadImage(imageUrl), loadImage(blurUrl), loadImage(depthUrl), document.fonts.load(`400 100px ${fontFamily}`).catch(() => undefined)])
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
