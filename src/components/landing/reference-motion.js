/** Canvas and scroll artwork ported from the supplied design. No exporter runtime or remote scripts. */
class ReferenceMotion {
  constructor(root) {
    this._cv = [...root.querySelectorAll('[data-motion="planes"]')];
    this._glCv = root.querySelector('[data-motion="globe"]');
    this._fxCv = root.querySelector('[data-motion="globe-fx"]');
    this._px = root.querySelector('[data-motion="parallax"]');
    this._st = root.querySelector('[data-motion="stages"]');
    this._sk = root.querySelector('[data-motion="stack"]');
    this._path = new Path2D(
      "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
    );
    this._fields = [];
    this._tick = 0;
    this._dead = false;
    this._media = window.matchMedia("(prefers-reduced-motion: reduce)");
    this._reduced = this._media.matches;
    this._onMotion = () => {
      this._reduced = this._media.matches;
      this._stLast = null;
      this._skLast = null;
      this._pxLast = null;
      this._fields.forEach((f) => (f.drawnStatic = false));
    };
    this._media.addEventListener("change", this._onMotion);
    this._loop = () => {
      if (this._dead) return;
      if (!document.hidden) this._frame();
      this._raf = requestAnimationFrame(this._loop);
    };
    this._loop();
  }
  destroy() {
    this._dead = true;
    cancelAnimationFrame(this._raf);
    this._media.removeEventListener("change", this._onMotion);
    const g = this._globe;
    if (g) {
      if (g.onDown) {
        g.cv.removeEventListener("pointerdown", g.onDown);
        g.cv.removeEventListener("pointermove", g.onMove);
        ["pointerup", "pointercancel", "pointerleave"].forEach((e) =>
          g.cv.removeEventListener(e, g.onUp),
        );
      }
      if (g.gl) {
        Object.values(g.tex).forEach((t) => g.gl.deleteTexture(t));
        if (g.buffer) g.gl.deleteBuffer(g.buffer);
        if (g.program) {
          (g.gl.getAttachedShaders(g.program) || []).forEach((s) => g.gl.deleteShader(s));
          g.gl.deleteProgram(g.program);
        }
      }
    }
    this._fields.forEach((f) => {
      f.host.removeEventListener("mousemove", f.move);
      f.host.removeEventListener("mouseleave", f.leave);
      f.host.removeEventListener("touchmove", f.move);
      f.host.removeEventListener("touchend", f.leave);
    });
  }
  _rand(a, b) {
    return a + Math.random() * (b - a);
  }

  _field(cv) {
    for (var i = 0; i < this._fields.length; i++)
      if (this._fields[i].cv === cv) return this._fields[i];
    var host = cv.parentElement;
    var f = {
      cv: cv,
      host: host,
      ctx: cv.getContext("2d"),
      w: 0,
      h: 0,
      planes: [],
      mouse: { x: -9999, y: -9999, active: false },
      drawnStatic: false,
    };
    f.move = function (e) {
      var r = host.getBoundingClientRect();
      var k = r.width / (host.offsetWidth || 1) || 1;
      var pt = e.touches ? e.touches[0] : e;
      f.mouse.x = (pt.clientX - r.left) / k;
      f.mouse.y = (pt.clientY - r.top) / k;
      f.mouse.active = true;
    };
    f.leave = function () {
      f.mouse.active = false;
      f.mouse.x = -9999;
      f.mouse.y = -9999;
    };
    host.addEventListener("mousemove", f.move);
    host.addEventListener("mouseleave", f.leave);
    host.addEventListener("touchmove", f.move, { passive: true });
    host.addEventListener("touchend", f.leave);
    this._fields.push(f);
    return f;
  }

  _spawn(f, n) {
    var R = this._rand;
    f.planes = [];
    for (var i = 0; i < n; i++) {
      var o = R(0, Math.PI * 2),
        a = R(0.35, 0.85),
        s = R(0.5, 1.1);
      f.planes.push({
        x: R(0, f.w),
        y: R(0, f.h),
        vx: Math.cos(o) * a,
        vy: Math.sin(o) * a,
        cruise: a,
        heading: o,
        wobble: R(0, 100),
        size: s,
        alpha: 0.24 + (s - 0.5) * 0.35,
        trail: [],
        ring: i % 6 === 0,
      });
    }
  }

  _step(f, e, speed) {
    var I = this._tick;
    var r = Math.sin(I * 0.006 + e.wobble) * 0.9 + Math.sin(I * 0.013 + e.wobble * 2.1) * 0.5;
    e.heading += r * 0.012;
    var ax = Math.cos(e.heading) * 0.014,
      ay = Math.sin(e.heading) * 0.014;
    if (f.mouse.active) {
      var dx = e.x - f.mouse.x,
        dy = e.y - f.mouse.y,
        d = Math.hypot(dx, dy);
      if (d < 140 && d > 0.01) {
        var w = 1 - d / 140,
          j = w * w * 1.1;
        ax += (dx / d) * j;
        ay += (dy / d) * j;
      }
    }
    e.vx += ax;
    e.vy += ay;
    var n = Math.hypot(e.vx, e.vy) || 0.0001;
    e.vx += (e.vx / n) * (e.cruise - n) * 0.05;
    e.vy += (e.vy / n) * (e.cruise - n) * 0.05;
    var y = Math.hypot(e.vx, e.vy);
    if (y > 2.8) {
      e.vx *= 2.8 / y;
      e.vy *= 2.8 / y;
    }
    e.x += e.vx * speed;
    e.y += e.vy * speed;
    var m = 60;
    if (e.x < -m) e.x = f.w + m;
    if (e.x > f.w + m) e.x = -m;
    if (e.y < -m) e.y = f.h + m;
    if (e.y > f.h + m) e.y = -m;
    if (I % 4 === 0) {
      e.trail.push({ x: e.x, y: e.y });
      if (e.trail.length > 44) e.trail.shift();
    }
  }

  _draw(f, e, rgb, ringRgb) {
    var t = f.ctx,
      i;
    if (e.trail.length > 1) {
      t.save();
      t.setLineDash([1.5, 6.5]);
      t.lineCap = "round";
      t.lineWidth = 1;
      t.strokeStyle = "rgba(" + rgb + "," + (e.alpha * 0.38).toFixed(3) + ")";
      t.beginPath();
      var open = false;
      for (i = 0; i < e.trail.length; i++) {
        var p = e.trail[i];
        if (i > 0) {
          var q = e.trail[i - 1];
          if (Math.hypot(p.x - q.x, p.y - q.y) > 90) open = false;
        }
        if (open) t.lineTo(p.x, p.y);
        else {
          t.moveTo(p.x, p.y);
          open = true;
        }
      }
      t.stroke();
      t.restore();
    }
    var o = Math.atan2(e.vy, e.vx);
    t.save();
    t.translate(e.x, e.y);
    t.rotate(o + Math.PI / 2);
    t.scale(e.size, e.size);
    if (e.ring) {
      t.save();
      t.rotate(-(o + Math.PI / 2));
      t.strokeStyle = "rgba(" + ringRgb + ",0.22)";
      t.lineWidth = 1 / e.size;
      for (var n = 14; n <= 34; n += 12) {
        t.beginPath();
        t.arc(0, 0, n, 0, Math.PI * 2);
        t.stroke();
      }
      t.restore();
    }
    t.translate(-12, -12);
    t.fillStyle = "rgba(" + (e.ring ? ringRgb : rgb) + "," + e.alpha.toFixed(3) + ")";
    t.fill(this._path);
    t.restore();
  }

  // ---------- Globo terráqueo (WebGL, texturas NASA día/noche, rutas desde MEX) ----------
  _globeInit() {
    var cv = this._glCv,
      fx = this._fxCv,
      self = this;
    if (!cv || !fx || !cv.isConnected || !fx.isConnected) return null;
    if (this._globe && this._globe.cv === cv && this._globe.gl && !this._globe.gl.isContextLost()) return this._globe;
    var opts = {
      premultipliedAlpha: true,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    };
    var gl = cv.getContext("webgl", opts),
      v2 = false;
    if (!gl) gl = cv.getContext("webgl", opts);
    var g = {
      cv: cv,
      fx: fx,
      gl: gl,
      v2: v2,
      w: 0,
      h: 0,
      tex: {},
      lon: -95,
      lat: -30,
      dragLon: 0,
      dragLat: 0,
      vel: 0,
      down: null,
      spin: 0,
      dpr: 0,
      t0: performance.now(),
    };
    this._globe = g;
    if (!gl) return g;
    var vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    var fs = [
      "precision highp float;",
      "uniform vec2 uC;uniform float uR;uniform mat3 uM;uniform vec3 uSun;uniform float uMode;uniform float uHas;",
      "uniform sampler2D uDay;uniform sampler2D uNight;",
      "void main(){",
      " vec2 q=(gl_FragCoord.xy-uC)/uR;float d=length(q);",
      " vec3 atm=vec3(0.28,0.47,0.70);",
      " vec3 col=vec3(0.);float a=0.;",
      " if(d<1.){",
      "  vec3 n=vec3(q,sqrt(1.-d*d));vec3 w=uM*n;",
      "  float lon=atan(w.x,w.z);float lat=asin(clamp(w.y,-1.,1.));",
      "  vec2 uv=vec2(lon/6.2831853+.5,.5-lat/3.14159265);",
      "  float ndl=dot(n,uSun);float dayAmt=smoothstep(-.18,.32,ndl);",
      "  vec3 c;",
      "  if(uHas>.5){",
      "   vec3 day=texture2D(uDay,uv).rgb;vec3 night=texture2D(uNight,uv).rgb;",
      "   float l=dot(day,vec3(.3,.59,.11));day=mix(day,vec3(l),.12);",
      "   vec3 lit=day*(.22+1.05*max(ndl,0.));",
      "   vec3 h=normalize(uSun+vec3(0.,0.,1.));float oc=smoothstep(.12,.0,day.r-day.b+.08);",
      "   lit+=vec3(.9,.85,.7)*pow(max(dot(n,h),0.),60.)*.35*oc;",
      "   vec3 lights=night*vec3(1.55,1.18,.72)*1.9;",
      "   c=mix(lights+day*.035,lit,dayAmt);",
      "   if(uMode>.5)c=lights*1.15+night*.25+vec3(.01,.03,.07);",
      "  }else{",
      "   float gx=abs(fract(lon*5.7296)-.5);float gy=abs(fract(lat*5.7296)-.5);",
      "   float line=1.-smoothstep(.0,.04,min(gx,gy));",
      "   c=vec3(.04,.11,.22)+vec3(.28,.47,.70)*line*.55;",
      "  }",
      "  float rim=pow(1.-n.z,3.2);",
      "  c+=atm*rim*(.30+.95*dayAmt);",
      "  float e=1.-smoothstep(1.-2.5/uR,1.,d);",
      "  col=c;a=e;",
      " }",
      " float halo=exp(-max(d-1.,0.)*34.)*.55*(.45+.55*smoothstep(-.6,.6,dot(normalize(vec3(q,0.)),uSun)));",
      " vec3 outc=col*a+atm*halo*(1.-a);float outa=a+halo*(1.-a);",
      " gl_FragColor=vec4(outc,outa);",
      "}",
    ].join("\n");
    var mk = function (type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    var pr = gl.createProgram();
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      g.gl = null;
      return g;
    }
    gl.useProgram(pr);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    g.program = pr;
    g.buffer = buf;
    g.u = {};
    ["uC", "uR", "uM", "uSun", "uMode", "uHas", "uDay", "uNight"].forEach(function (k) {
      g.u[k] = gl.getUniformLocation(pr, k);
    });
    gl.uniform1i(g.u.uDay, 0);
    gl.uniform1i(g.u.uNight, 1);
    this._globeTex(g, "day", "/flightdeck/tierra-dia-nasa.jpg", 0);
    this._globeTex(g, "night", "/flightdeck/tierra-noche-nasa.jpg", 1);

    g.onDown = function (e) {
      g.down = { x: e.clientX, y: e.clientY, lon: g.dragLon, lat: g.dragLat };
      g.vel = 0;
      cv.style.cursor = "grabbing";
      if (cv.setPointerCapture && e.pointerId != null) {
        try {
          cv.setPointerCapture(e.pointerId);
        } catch (err) {}
      }
    };
    g.onMove = function (e) {
      if (!g.down) return;
      var r = cv.getBoundingClientRect();
      var k = r.width / (cv.offsetWidth || 1) || 1;
      var R = g.R || 500;
      var nl = g.down.lon - ((e.clientX - g.down.x) / k / R) * 57.2958;
      g.vel = nl - g.dragLon;
      g.dragLon = nl;
      g.dragLat = Math.max(
        -20,
        Math.min(48, g.down.lat + ((e.clientY - g.down.y) / k / R) * 57.2958),
      );
    };
    g.onUp = function () {
      g.down = null;
      cv.style.cursor = "grab";
    };
    cv.addEventListener("pointerdown", g.onDown);
    cv.addEventListener("pointermove", g.onMove);
    cv.addEventListener("pointerup", g.onUp);
    cv.addEventListener("pointercancel", g.onUp);
    cv.addEventListener("pointerleave", g.onUp);
    cv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); this._globe = null; }, false);
    return g;
  }

  _globeTex(g, key, url, unit) {
    var gl = g.gl;
    var self = this;
    var done = function (src) {
      if (self._dead) {
        if (src.close) src.close();
        return;
      }
      var max = gl.getParameter(gl.MAX_TEXTURE_SIZE),
        s = src;
      if (src.width > max) {
        var c = document.createElement("canvas");
        c.width = max;
        c.height = Math.round(max / 2);
        c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
        s = c;
      }
      var t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, s);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, g.v2 ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      var aniso =
        gl.getExtension("EXT_texture_filter_anisotropic") ||
        gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
      if (aniso) {
        var maxAniso = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, maxAniso));
      }
      g.tex[key] = t;
      g.texturesReady = (g.texturesReady || 0) + 1;
      if (g.texturesReady === 2 && g.cv.parentElement) {
        g.cv.parentElement.classList.add("is-globe-ready");
      }
      if (src.close) src.close();
    };
    var viaImg = function () {
      var im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = function () {
        try {
          done(im);
        } catch (e) {}
      };
      im.src = url;
    };
    if (window.fetch && window.createImageBitmap) {
      fetch(url)
        .then(function (r) {
          if (!r.ok) throw new Error("tex");
          return r.blob();
        })
        .then(function (b) {
          return createImageBitmap(b);
        })
        .then(done)
        .catch(viaImg);
    } else viaImg();
  }

  _globeRoutes() {
    if (this._routes) return this._routes;
    var hub = { code: "MEX", lat: 19.43, lon: -99.13 };
    var dest = [
      { code: "MTY", lat: 25.69, lon: -100.32 },
      { code: "GDL", lat: 20.67, lon: -103.35, left: true },
      { code: "CUN", lat: 21.16, lon: -86.85 },
      { code: "LAX", lat: 34.05, lon: -118.24, left: true },
      { code: "JFK", lat: 40.71, lon: -74.0 },
      { code: "YYZ", lat: 43.65, lon: -79.38 },
      { code: "IAH", lat: 29.76, lon: -95.37 },
      { code: "BOG", lat: 4.71, lon: -74.07 },
      { code: "LIM", lat: -12.05, lon: -77.04 },
      { code: "GRU", lat: -23.55, lon: -46.63 },
      { code: "MAD", lat: 40.42, lon: -3.7 },
      { code: "YVR", lat: 49.28, lon: -123.12, left: true },
      { code: "HAV", lat: 23.11, lon: -82.37 },
    ];
    var vec = function (c) {
      var a = c.lat * 0.0174533,
        b = c.lon * 0.0174533;
      return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)];
    };
    var h = vec(hub);
    this._routes = {
      hub: hub,
      hv: h,
      list: dest.map(function (d, i) {
        var v = vec(d),
          dot = Math.max(-1, Math.min(1, h[0] * v[0] + h[1] * v[1] + h[2] * v[2])),
          om = Math.acos(dot),
          pts = [],
          N = 40;
        for (var s = 0; s <= N; s++) {
          var t = s / N,
            A = Math.sin((1 - t) * om) / Math.sin(om),
            B = Math.sin(t * om) / Math.sin(om),
            k = 1 + Math.sin(Math.PI * t) * Math.min(0.16, om * 0.16);
          pts.push([
            (A * h[0] + B * v[0]) * k,
            (A * h[1] + B * v[1]) * k,
            (A * h[2] + B * v[2]) * k,
          ]);
        }
        return {
          d: d,
          v: v,
          pts: pts,
          off: (i * 0.37) % 1,
          speed: 0.05 + (0.05 / Math.max(om, 0.15)) * 0.3,
          back: i % 3 === 1,
        };
      }),
    };
    return this._routes;
  }

  _globeFrame() {
    var g = this._globeInit();
    if (!g) return;
    var cv = g.cv,
      fx = g.fx;
    var rect = cv.getBoundingClientRect();
    if (rect.bottom < -80 || rect.top > (window.innerHeight || 0) + 80) return;
    var w = cv.clientWidth,
      h = cv.clientHeight;
    if (!w || !h) return;
    var nativeDpr = window.devicePixelRatio || 1,
      maxPixels = 8000000,
      pixelBudgetDpr = Math.sqrt(maxPixels / Math.max(1, w * h)),
      dpr = Math.min(nativeDpr, 3, pixelBudgetDpr);
    if (w !== g.w || h !== g.h || Math.abs(dpr - g.dpr) > 0.01) {
      g.w = w;
      g.h = h;
      g.dpr = dpr;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      fx.width = cv.width;
      fx.height = cv.height;
    }
    var R = w * 0.39,
      cx = w / 2,
      cy = 26 + R;
    g.R = R;
    var t = (performance.now() - g.t0) / 1000;
    if (!g.down) {
      if (Math.abs(g.vel) > 0.01) {
        g.dragLon += g.vel;
        g.vel *= 0.94;
      }
      if (!this._reduced) {
        if (false) g.spin += 0.06;
        else {
          g.dragLon *= 0.997;
          g.dragLat *= 0.997;
          g.spin *= 0.99;
        }
      }
    }
    var sway = this._reduced || false ? 0 : Math.sin(t * 0.13) * 20;
    var lon0 = (g.lon + sway + g.spin + g.dragLon) * 0.0174533,
      lat0 = (g.lat + g.dragLat) * 0.0174533;
    var cl = Math.cos(lon0),
      sl = Math.sin(lon0),
      ca = Math.cos(lat0),
      sa = Math.sin(lat0);
    var M = [cl, 0, -sl, -sa * sl, ca, -sa * cl, ca * sl, sa, ca * cl];
    var gl = g.gl;
    if (gl) {
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(g.u.uC, cx * dpr, (h - cy) * dpr);
      gl.uniform1f(g.u.uR, R * dpr);
      gl.uniformMatrix3fv(g.u.uM, false, new Float32Array(M));
      var sx = -0.84,
        sy = 0.32,
        sz = 0.44,
        sn = Math.hypot(sx, sy, sz);
      gl.uniform3f(g.u.uSun, sx / sn, sy / sn, sz / sn);
      gl.uniform1f(g.u.uMode, false ? 1 : 0);
      gl.uniform1f(g.u.uHas, g.tex.day && g.tex.night ? 1 : 0);
      if (g.tex.day) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, g.tex.day);
      }
      if (g.tex.night) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, g.tex.night);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    // Capa 2D: rutas, aviones y aeropuertos
    var c = fx.getContext("2d");
    if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    var proj = function (p) {
      var x = M[0] * p[0] + M[1] * p[1] + M[2] * p[2],
        y = M[3] * p[0] + M[4] * p[1] + M[5] * p[2],
        z = M[6] * p[0] + M[7] * p[1] + M[8] * p[2];
      var vis = z > 0 || x * x + y * y > 1.02;
      return {
        x: cx + x * R,
        y: cy - y * R,
        z: z,
        vis: vis,
        a: z > 0 ? Math.min(1, z / 0.3) : 0.35,
      };
    };
    var rt = this._globeRoutes(),
      gold = "199,160,82",
      i,
      s;
    for (i = 0; i < rt.list.length; i++) {
      var r = rt.list[i],
        P = r.pts.map(proj);
      c.save();
      c.setLineDash([2, 5]);
      c.lineCap = "round";
      c.lineWidth = 1.2;
      for (s = 1; s < P.length; s++) {
        if (!P[s].vis || !P[s - 1].vis) continue;
        c.strokeStyle =
          "rgba(" + gold + "," + (0.75 * Math.min(P[s].a, P[s - 1].a)).toFixed(3) + ")";
        c.beginPath();
        c.moveTo(P[s - 1].x, P[s - 1].y);
        c.lineTo(P[s].x, P[s].y);
        c.stroke();
      }
      c.restore();
      var tt = this._reduced ? 0.5 : (t * r.speed + r.off) % 1;
      if (r.back) tt = 1 - tt;
      var f = tt * (P.length - 1),
        i0 = Math.min(P.length - 2, Math.floor(f)),
        fr = f - i0,
        A = P[i0],
        B = P[i0 + 1];
      if (A.vis && B.vis) {
        var px = A.x + (B.x - A.x) * fr,
          py = A.y + (B.y - A.y) * fr,
          ang = Math.atan2(B.y - A.y, B.x - A.x) + (r.back ? Math.PI : 0);
        c.save();
        c.translate(px, py);
        c.rotate(ang + Math.PI / 2);
        c.scale(0.62, 0.62);
        c.translate(-12, -12);
        c.shadowColor = "rgba(8,26,53,0.8)";
        c.shadowBlur = 6;
        c.fillStyle = "rgba(255,255,255," + (0.95 * Math.min(A.a, B.a)).toFixed(3) + ")";
        c.fill(this._path);
        c.restore();
      }
      var D = proj(r.v);
      if (D.z > 0.05) {
        c.fillStyle = "rgba(" + gold + "," + D.a.toFixed(3) + ")";
        c.beginPath();
        c.arc(D.x, D.y, 2.6, 0, 6.2832);
        c.fill();
        c.font = '500 10px "Geist Mono", monospace';
        c.fillStyle = "rgba(255,255,255," + (0.8 * D.a).toFixed(3) + ")";
        c.shadowColor = "rgba(8,26,53,0.9)";
        c.shadowBlur = 4;
        c.textAlign = r.d.left ? "right" : "left";
        c.fillText(r.d.code, D.x + (r.d.left ? -7 : 7), D.y + 3);
        c.textAlign = "left";
        c.shadowBlur = 0;
      }
    }
    var H = proj(rt.hv);
    if (H.z > 0.05) {
      var pu = this._reduced ? 0.5 : (t * 0.6) % 1;
      c.strokeStyle = "rgba(" + gold + "," + ((1 - pu) * 0.8 * H.a).toFixed(3) + ")";
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(H.x, H.y, 5 + pu * 18, 0, 6.2832);
      c.stroke();
      c.fillStyle = "rgba(" + gold + "," + H.a.toFixed(3) + ")";
      c.beginPath();
      c.arc(H.x, H.y, 4.5, 0, 6.2832);
      c.fill();
      c.fillStyle = "#081A35";
      c.beginPath();
      c.arc(H.x, H.y, 1.8, 0, 6.2832);
      c.fill();
      c.font = '600 11px "Geist Mono", monospace';
      c.fillStyle = "rgba(255,255,255," + H.a.toFixed(3) + ")";
      c.shadowColor = "rgba(8,26,53,0.9)";
      c.shadowBlur = 4;
      c.fillText("MEX", H.x + 10, H.y + 4);
      c.shadowBlur = 0;
    }
  }

  // Parallax por capas: cada [data-depth] baja depth × progreso × alto mientras la sección cruza la ventana.
  _parallaxFrame() {
    var el = this._px;
    if (!el || !el.isConnected) return;
    var r = el.getBoundingClientRect(),
      vh = window.innerHeight || 800,
      p = 0;
    if (!this._reduced && vh < 3000 && r.height > 0)
      p = (vh * 0.55 - r.top) / (r.height + vh * 0.55);
    p = Math.max(0, Math.min(1, p));

    if (this._pxLast === p) return;
    this._pxLast = p;
    var Hh = el.offsetHeight || 680,
      ls = el.querySelectorAll("[data-depth]");
    for (var i = 0; i < ls.length; i++) {
      var d = parseFloat(ls[i].getAttribute("data-depth")) || 0;
      ls[i].style.transform = "translate3d(0," + (d * p * Hh).toFixed(1) + "px,0)";
    }
  }

  // Etapas: panel de imagen "sticky" + textos que entran y salen según el scroll (equivalente a Scroll01 sin dependencias).
  _stagesFrame() {
    var el = this._st;
    if (!el || !el.isConnected) return;
    if (this._reduced || window.innerWidth < 901) {
      el.querySelectorAll("[data-stage-item]").forEach((n) => {
        n.style.opacity = "1";
        n.style.transform = "none";
      });
      const panel = el.querySelector("[data-stage-panel]");
      if (panel) panel.style.transform = "none";
      return;
    }
    var panel = el.querySelector("[data-stage-panel]");
    if (!panel) return;
    var r = el.getBoundingClientRect(),
      Hs = el.offsetHeight,
      Hp = panel.offsetHeight,
      k = r.height / (Hs || 1) || 1,
      vh = window.innerHeight || 800;
    var travel = Math.max(0, Hs - Hp),
      y = 0;
    if (!this._reduced && vh < 3000) y = Math.max(24, (vh / k - Hp) / 2) - r.top / k;
    y = Math.max(0, Math.min(travel, y));

    if (this._stLast === y) return;
    this._stLast = y;
    panel.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
    var items = el.querySelectorAll("[data-stage-item]"),
      center = y + Hp / 2,
      best = 0,
      bd = 1e9,
      i;
    for (i = 0; i < items.length; i++) {
      var it = items[i],
        d = it.offsetTop + it.offsetHeight / 2 - center,
        ad = Math.abs(d);
      if (ad < bd) {
        bd = ad;
        best = i;
      }
      it.style.opacity = Math.max(0.14, Math.min(1, 1 - (ad - 90) / 240)).toFixed(3);
      it.style.transform =
        "translate3d(0," + (Math.max(-1, Math.min(1, d / (Hp / 2))) * 20).toFixed(1) + "px,0)";
    }
    if (this._stBest === best) return;
    this._stBest = best;
    var set = function (sel, fn) {
      var ns = el.querySelectorAll(sel);
      for (var j = 0; j < ns.length; j++) fn(ns[j], j);
    };
    set("[data-stage-img]", function (n, j) {
      n.style.opacity = j === best ? "1" : "0";
    });
    set("[data-stage-num]", function (n, j) {
      n.style.opacity = j === best ? "1" : "0";
    });
    set("[data-stage-seg]", function (n, j) {
      n.style.backgroundColor = j <= best ? "#C7A052" : "rgba(255,255,255,0.28)";
    });
  }

  // Herramientas: tarjetas que se apilan al hacer scroll (equivalente a StackingCards, sin dependencias).
  _stackFrame() {
    var el = this._sk;
    if (!el || !el.isConnected) return;
    if (this._reduced || window.innerWidth < 901) {
      el.querySelectorAll("[data-stack-card]").forEach((n) => (n.style.transform = "none"));
      return;
    }
    var cards = el.querySelectorAll("[data-stack-card]"),
      N = cards.length;
    if (!N) return;
    var r = el.getBoundingClientRect(),
      Hc = el.offsetHeight,
      k = r.height / (Hc || 1) || 1,
      vh = window.innerHeight || 800;
    var ch = cards[0].offsetHeight,
      step = 22,
      range = Math.max(1, Hc - ch - (N - 1) * step),
      S = 0;
    if (!this._reduced && vh < 3000) S = Math.max(32, (vh / k - ch) / 2 - 40) - r.top / k;
    S = Math.max(0, Math.min(range, S));

    if (this._skLast === S) return;
    this._skLast = S;
    var p = S / range;
    for (var i = 0; i < N; i++) {
      var slot = cards[i].parentElement,
        top0 = slot.offsetTop,
        ty = Math.max(0, S + i * step - top0);
      var cap = Hc - ch - (N - 1 - i) * step - top0;
      if (cap < 0) cap = 0;
      if (ty > cap) ty = cap;
      var f = Math.max(0, Math.min(1, (p - i / N) / (1 - i / N))),
        sc = 1 - (N - 1 - i) * 0.03 * f;
      cards[i].style.transform =
        "translate3d(0," + ty.toFixed(1) + "px,0) scale(" + sc.toFixed(4) + ")";
    }
  }

  _frame() {
    try {
      this._stackFrame();
    } catch (e) {}
    try {
      this._stagesFrame();
    } catch (e) {}
    try {
      this._parallaxFrame();
    } catch (e) {}
    try {
      this._globeFrame();
    } catch (e) {
      if (!this._gErr) {
        this._gErr = true;
        if (window.console) console.warn("globe", e);
      }
    }
    var on = true;
    var count = 14;
    var speed = 1;
    this._tick += 1;
    var list = this._cv || [];
    for (var c = 0; c < list.length; c++) {
      var cv = list[c];
      if (!cv.isConnected || !cv.parentElement) continue;
      var f = this._field(cv);
      if (!f.ctx) continue;
      var w = f.host.clientWidth,
        h = f.host.clientHeight;
      if (w !== f.w || h !== f.h) {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        f.w = w;
        f.h = h;
        cv.width = Math.max(1, Math.round(w * dpr));
        cv.height = Math.max(1, Math.round(h * dpr));
        f.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        f.drawnStatic = false;
        if (!f.planes.length) this._spawn(f, count);
      }
      if (f.planes.length !== count) {
        this._spawn(f, count);
        f.drawnStatic = false;
      }
      if (!on) {
        f.ctx.clearRect(0, 0, f.w, f.h);
        f.drawnStatic = false;
        continue;
      }
      if (this._reduced && f.drawnStatic) continue;
      var r = cv.getBoundingClientRect();
      if (!this._reduced && (r.bottom < -120 || r.top > (window.innerHeight || 0) + 120)) continue;
      var dark = cv.getAttribute("data-tone") === "dark";
      var rgb = dark ? "255,255,255" : "22,61,112";
      var ringRgb = "199,160,82";
      f.ctx.clearRect(0, 0, f.w, f.h);
      for (var i = 0; i < f.planes.length; i++) {
        if (this._reduced) {
          for (var k = 0; k < 24; k++) this._step(f, f.planes[i], 1);
        } else this._step(f, f.planes[i], speed);
        this._draw(f, f.planes[i], rgb, ringRgb);
      }
      f.drawnStatic = true;
    }
  }
}
export function mountReferenceMotion(root) {
  const motion = new ReferenceMotion(root);
  return () => motion.destroy();
}
