import { useEffect, useRef, useState } from "react";
import { ASSETS, DESTINATIONS } from "./destinations";

const RAD = Math.PI / 180;
function vector(lat: number, lon: number) {
  return [
    Math.cos(lat * RAD) * Math.sin(lon * RAD),
    Math.sin(lat * RAD),
    Math.cos(lat * RAD) * Math.cos(lon * RAD),
  ];
}
// Low-precision solar position from the supplied Director reference, computed in UTC.
export function solarPosition(time = Date.now()) {
  const n = time / 86400000 + 2440587.5 - 2451545;
  const L = (280.46 + 0.9856474 * n) % 360,
    g = ((357.528 + 0.9856003 * n) % 360) * RAD;
  const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const eps = (23.439 - 0.0000004 * n) * RAD;
  const lat = Math.asin(Math.sin(eps) * Math.sin(lam)) / RAD;
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  return {
    lat,
    lon: ((((ra / RAD - (280.46061837 + 360.98564736629 * n)) % 360) + 540) % 360) - 180,
  };
}
const vertex = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
// Day/night shader ported from Hub-D-Director.html; textures are served locally.
const fragment = `precision highp float;
uniform vec2 uC; uniform float uR; uniform mat3 uM; uniform vec3 uSun;
uniform sampler2D uDay; uniform sampler2D uNight;
void main(){
 vec2 q=(gl_FragCoord.xy-uC)/uR;float d=length(q);
 vec3 atm=vec3(.28,.47,.70), col=vec3(0.);float a=0.;
 if(d<1.){
  vec3 n=vec3(q,sqrt(1.-d*d)),w=uM*n;
  vec2 uv=vec2(atan(w.x,w.z)/6.2831853+.5,.5-asin(clamp(w.y,-1.,1.))/3.14159265);
  float ndl=dot(n,uSun),dayAmt=smoothstep(-.18,.32,ndl);
  vec3 day=texture2D(uDay,uv).rgb,night=texture2D(uNight,uv).rgb;
  float l=dot(day,vec3(.3,.59,.11));day=mix(day,vec3(l),.12);
  vec3 lit=day*(.22+1.05*max(ndl,0.));
  vec3 h=normalize(uSun+vec3(0.,0.,1.));
  float oc=1.-smoothstep(.0,.12,day.r-day.b+.08);
  lit+=vec3(.9,.85,.7)*pow(max(dot(n,h),0.),60.)*.35*oc;
  vec3 lights=night*vec3(1.55,1.18,.72)*1.9;
  col=mix(lights+day*.035,lit,dayAmt)+atm*pow(1.-n.z,3.2)*(.30+.95*dayAmt);
  a=1.-smoothstep(1.-2.5/uR,1.,d);
 }
 float halo=exp(-max(d-1.,0.)*34.)*.55*(.45+.55*smoothstep(-.6,.6,dot(normalize(vec3(q,.001)),uSun)));
 gl_FragColor=vec4(col*a+atm*halo*(1.-a),a+halo*(1.-a));
}`;

export function Globe({
  selected,
  onSelect,
  live,
  reduced = false,
}: {
  selected: number;
  onSelect: (index: number) => void;
  live: boolean;
  reduced?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const markers = useRef<(HTMLButtonElement | null)[]>([]);
  const current = useRef({ selected, live, reduced });
  current.current = { selected, live, reduced };
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) {
      setFallback(true);
      return;
    }
    let stopped = false,
      raf = 0,
      loaded = 0;
    const shaders: WebGLShader[] = [],
      textures: WebGLTexture[] = [],
      images: HTMLImageElement[] = [];
    const program = gl.createProgram(),
      buffer = gl.createBuffer();
    if (!program || !buffer) {
      setFallback(true);
      return;
    }
    for (const [kind, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(kind)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      shaders.push(shader);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach((s) => gl.deleteShader(s));
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      setFallback(true);
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const u = Object.fromEntries(
      ["uC", "uR", "uM", "uSun", "uDay", "uNight"].map((k) => [
        k,
        gl.getUniformLocation(program, k),
      ]),
    );
    ["tierra-dia-nasa.jpg", "tierra-noche-nasa.jpg"].forEach((file, index) => {
      const texture = gl.createTexture()!;
      textures.push(texture);
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([8, 26, 53, 255]),
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(u[index === 0 ? "uDay" : "uNight"], index);
      const image = new Image();
      images.push(image);
      image.onload = () => {
        if (stopped) return;
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        loaded++;
        render();
      };
      image.onerror = () => {
        if (!stopped) setFallback(true);
      };
      image.src = ASSETS + file;
    });
    let lon = -95,
      lat = 12,
      dragLon = 0,
      dragLat = 0,
      velocity = 0;
    let down: { x: number; y: number; lon: number; lat: number } | null = null;
    let lastFrame = 0,
      lastSunMinute = -1,
      sun = vector(0, 0);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    function render(time = performance.now()) {
      if (stopped || document.hidden) return;
      cancelAnimationFrame(raf);
      const still = mq.matches || current.current.reduced;
      if (!still && time - lastFrame < 33) {
        raf = requestAnimationFrame(render);
        return;
      }
      const d = DESTINATIONS[current.current.selected];
      const delta = ((d.lon + 4 - lon + 540) % 360) - 180;
      lon += delta * (still ? 1 : 0.075);
      lat += (d.lat - 8 - lat) * (still ? 1 : 0.075);
      if (!down && !still) {
        dragLon += velocity;
        velocity *= 0.93;
        dragLon *= 0.99;
        dragLat *= 0.99;
      }
      const w = cv!.clientWidth,
        h = cv!.clientHeight,
        ratio = Math.min(devicePixelRatio || 1, 2);
      if (!w || !h) {
        raf = requestAnimationFrame(render);
        return;
      }
      if (cv!.width !== Math.round(w * ratio) || cv!.height !== Math.round(h * ratio)) {
        cv!.width = Math.round(w * ratio);
        cv!.height = Math.round(h * ratio);
      }
      const r = Math.min(w, h) * 0.455,
        cx = w / 2,
        cy = h / 2;
      const lo = (lon + dragLon) * RAD,
        la = (lat + dragLat) * RAD;
      const cl = Math.cos(lo),
        sl = Math.sin(lo),
        ca = Math.cos(la),
        sa = Math.sin(la);
      const m = [cl, 0, -sl, -sa * sl, ca, -sa * cl, ca * sl, sa, ca * cl];
      const project = (v: number[]) => [
        m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
        m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
        m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
      ];
      const minute = Math.floor(Date.now() / 60000);
      if (minute !== lastSunMinute) {
        const s = solarPosition();
        sun = vector(s.lat, s.lon);
        lastSunMinute = minute;
      }
      const sunlight = current.current.live ? project(sun) : [-0.55, 0.62, -0.5];
      gl!.viewport(0, 0, cv!.width, cv!.height);
      gl!.uniform2f(u.uC, cx * ratio, cy * ratio);
      gl!.uniform1f(u.uR, r * ratio);
      gl!.uniformMatrix3fv(u.uM, false, new Float32Array(m));
      gl!.uniform3fv(u.uSun, new Float32Array(sunlight));
      if (loaded === 2) gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      DESTINATIONS.forEach((dest, index) => {
        const marker = markers.current[index];
        if (!marker) return;
        const [x, y, z] = project(vector(dest.lat, dest.lon));
        marker.style.transform = `translate(${cx + x * r}px,${cy - y * r}px) translate(-50%,-50%)`;
        marker.style.visibility = z > 0.08 ? "visible" : "hidden";
      });
      // Reduced motion still renders changes, but does not animate the idle globe.
      if (still) {
        lastFrame = time;
        return;
      }
      lastFrame = time;
      raf = requestAnimationFrame(render);
    }
    const start = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY, lon: dragLon, lat: dragLat };
      velocity = 0;
      cv.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!down) return;
      const next = down.lon - ((e.clientX - down.x) / cv.clientWidth) * 125;
      velocity = next - dragLon;
      dragLon = next;
      dragLat = Math.max(
        -35,
        Math.min(35, down.lat + ((e.clientY - down.y) / cv.clientHeight) * 100),
      );
      render();
    };
    const end = () => {
      down = null;
    };
    const visibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) render();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
      setFallback(true);
    };
    cv.addEventListener("pointerdown", start);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
    cv.addEventListener("webglcontextlost", contextLost);
    document.addEventListener("visibilitychange", visibility);
    mq.addEventListener("change", renderChange);
    function renderChange() {
      render(lastFrame);
    }
    const resize = new ResizeObserver(renderChange);
    resize.observe(cv);
    const changes = window.setInterval(() => {
      if (mq.matches || current.current.reduced) render();
    }, 250);
    render();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      clearInterval(changes);
      resize.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      mq.removeEventListener("change", renderChange);
      cv.removeEventListener("pointerdown", start);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", end);
      cv.removeEventListener("pointercancel", end);
      cv.removeEventListener("webglcontextlost", contextLost);
      images.forEach((im) => {
        im.onload = null;
        im.onerror = null;
      });
      textures.forEach((t) => gl.deleteTexture(t));
      shaders.forEach((s) => gl.deleteShader(s));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);
  return (
    <div className={"fd-globe" + (fallback ? " fd-globe-fallback" : "")}>
      {fallback ? (
        <img src={ASSETS + "tierra-noche-nasa.jpg"} alt="La Tierra de noche" />
      ) : (
        <canvas
          ref={canvas}
          aria-label="Globo terráqueo. Arrastra para girar y elige un destino con los botones."
        />
      )}
      <div className="fd-markers" aria-label="Destinos en el globo">
        {DESTINATIONS.map((d, i) => (
          <button
            key={d.code}
            ref={(el) => {
              markers.current[i] = el;
            }}
            className={"fd-marker" + (selected === i ? " is-active" : "")}
            onClick={() => onSelect(i)}
            aria-label={`Seleccionar ${d.name}, ${d.city}`}
            aria-pressed={selected === i}
          >
            <span className="fd-marker-icon">
              <d.icon size={22} weight="duotone" />
            </span>
            <span>
              <small>{d.code}</small>
              <strong>{d.name}</strong>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
