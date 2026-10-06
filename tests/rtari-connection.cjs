const assert = require("node:assert/strict");
const path = require("node:path");
const { createRequire } = require("node:module");
const esbuild = createRequire(require.resolve("vite/package.json"))("esbuild");
(async () => {
  const built = await esbuild.build({
    entryPoints: [path.resolve("src/lib/rtari-realtime.ts")],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    plugins: [
      {
        name: "offline-auth",
        setup(b) {
          b.onResolve({ filter: /integrations\/supabase\/client|fp\/practice.functions/ }, (a) => ({
            path: a.path,
            namespace: "mock",
          }));
          b.onLoad({ filter: /.*/, namespace: "mock" }, () => ({
            contents:
              'export const supabase = {auth:{getSession:async()=>({data:{session:{access_token:"fixture"}}})}}; export const markPracticeSession=async()=>{};',
          }));
        },
      },
    ],
  });
  const mod = { exports: {} };
  new Function("module", "exports", built.outputFiles[0].text)(mod, mod.exports);
  const { RtariRealtimeSession } = mod.exports;
  let pcs = [],
    requests = [],
    stopped = 0;
  class Channel extends EventTarget {
    readyState = "connecting";
    sent = [];
    send(s) {
      this.sent.push(JSON.parse(s));
    }
    close() {
      this.readyState = "closed";
      this.dispatchEvent(new Event("close"));
    }
    open() {
      this.readyState = "open";
      this.dispatchEvent(new Event("open"));
    }
  }
  class Peer extends EventTarget {
    connectionState = "new";
    dc = new Channel();
    constructor() {
      super();
      pcs.push(this);
    }
    addTrack() {}
    createDataChannel() {
      return this.dc;
    }
    async createOffer() {
      return { sdp: "fixture" };
    }
    async setLocalDescription() {}
    async setRemoteDescription() {}
    close() {
      this.connectionState = "closed";
    }
  }
  global.RTCPeerConnection = Peer;
  global.document = {
    body: { appendChild() {} },
    createElement: () => ({ style: {}, setAttribute() {}, pause() {}, remove() {} }),
  };
  const track = {
    stop() {
      stopped++;
    },
    enabled: true,
  };
  Object.defineProperty(global, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        getUserMedia: async () => ({ getTracks: () => [track], getAudioTracks: () => [track] }),
      },
    },
  });
  global.fetch = async (url, opts) => {
    requests.push({ url, body: opts?.body });
    return new Response(
      JSON.stringify(
        url === "/api/rtari/session"
          ? {
              value: "fixture",
              sessionId: "fixture-session",
              model: "fixture-model",
              maxMinutos: 20,
            }
          : {},
      ),
      { status: 200 },
    );
  };
  const options = { questionIds: [], voice: "marin", nivel: "estandar" };
  const flush = async () => {
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  };
  const errors = [];
  const states = [];
  let s = new RtariRealtimeSession({
    onTurn() {},
    onEstado: (e) => states.push(e),
    onError: (e) => errors.push(e),
  });
  const starting = s.start(options);
  await flush();
  assert.equal(s.getEstado(), "conectando", "SDP answer alone must not mark session active");
  assert.equal(s.elapsed(), 0, "negotiating must not count toward used minutes");
  pcs.at(-1).dc.open();
  await starting;
  assert.equal(s.getEstado(), "en_curso");
  assert.equal(pcs.at(-1).dc.sent.filter((e) => e.type === "response.create").length, 1);
  s.stop();
  const ended = s.elapsed();
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(s.elapsed(), ended, "elapsed must freeze after stop");
  s = new RtariRealtimeSession({ onTurn() {}, onError: (e) => errors.push(e) });
  const cancelled = s.start(options);
  await flush();
  const cancelledPc = pcs.at(-1);
  s.stop();
  await cancelled;
  cancelledPc.dc.open();
  assert.equal(cancelledPc.dc.sent.length, 0, "cancelled session must not send a greeting");
  assert(
    requests.some((r) => r.url === "/api/rtari/settle" && JSON.parse(r.body).durationSec === 0),
  );
  // Transport failure during negotiation reports a recoverable error and cleans up.
  s = new RtariRealtimeSession({ onTurn() {}, onError: (e) => errors.push(e) });
  const failed = s.start(options);
  const rejected = assert.rejects(failed, (e) => e.code === "red");
  await flush();
  pcs.at(-1).connectionState = "failed";
  pcs.at(-1).dispatchEvent(new Event("connectionstatechange"));
  await rejected;
  assert.equal(s.getEstado(), "error");
  assert.equal(s.cierre().durationSec, 0);
  assert.equal(pcs.at(-1).connectionState, "closed");
  // A stalled channel times out, without making a real network call or waiting 30 seconds.
  const realTimeout = global.setTimeout;
  global.setTimeout = (fn, ms, ...args) => realTimeout(fn, ms === 30000 ? 5 : ms, ...args);
  s = new RtariRealtimeSession({ onTurn() {}, onError: (e) => errors.push(e) });
  await assert.rejects(s.start(options), (e) => e.code === "red");
  global.setTimeout = realTimeout;
  assert.equal(s.cierre().durationSec, 0);
  // Permission denial never opens a peer and is surfaced to the user.
  const getMic = navigator.mediaDevices.getUserMedia;
  const peerCount = pcs.length;
  navigator.mediaDevices.getUserMedia = async () => {
    throw new Error("denied");
  };
  s = new RtariRealtimeSession({ onTurn() {}, onError: (e) => errors.push(e) });
  await assert.rejects(s.start(options), (e) => e.code === "micro");
  assert.equal(pcs.length, peerCount);
  navigator.mediaDevices.getUserMedia = getMic;
  // A fresh attempt works after failure, and channel closure stops it once.
  const beforeErrors = errors.length;
  s = new RtariRealtimeSession({ onTurn() {}, onError: (e) => errors.push(e) });
  const retry = s.start(options);
  await flush();
  pcs.at(-1).dc.open();
  await retry;
  pcs.at(-1).dc.close();
  assert.equal(s.getEstado(), "terminada");
  assert.equal(errors.length, beforeErrors + 1);
  assert(stopped >= 5);
  console.log(
    "RTARI offline: negotiation readiness, greeting once, cancellation, zero-use settlement, frozen duration passed",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
