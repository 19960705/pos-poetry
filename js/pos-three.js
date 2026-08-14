window.PosRig = (function () {
  const beige = 0xc9b89a;
  const beigeDark = 0x9a8668;
  const keyDark = 0x2c2a28;
  const lcdGreen = 0x7dff6a;

  let renderer, scene, camera, root, pos;
  let ambLight, fluoLight, fillLight;
  let lcdCanvas, lcdCtx, lcdTex;
  let receiptMesh, receiptTex;
  let keys = [];
  let led;
  let raycaster, pointer;
  let width = 1, height = 1;
  let hover = null;
  let printT = 0;
  let printing = false;
  let receiptLen = 1.55;
  const listeners = {};

  function emit(name, data) {
    (listeners[name] || []).forEach((fn) => fn(data));
  }

  function on(name, fn) {
    (listeners[name] = listeners[name] || []).push(fn);
  }

  const matCache = new Map();
  function lambert(color) {
    const key = String(color);
    if (!matCache.has(key)) {
      matCache.set(key, new THREE.MeshLambertMaterial({ color }));
    }
    return matCache.get(key);
  }

  function box(w, h, d, color, y) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lambert(color));
    if (y != null) m.position.y = y;
    return m;
  }

  function makeKeyTexture(label, bg, fg) {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = bg;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = fg;
    g.font = label.length > 2 ? "22px Share Tech Mono, monospace" : "42px Share Tech Mono, monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(label, 64, 66);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function addKey(parent, x, z, label, code, color, text) {
    const hex = "#" + (color || keyDark).toString(16).padStart(6, "0");
    const tex = makeKeyTexture(label, hex, text || "#efe6d4");
    const side = lambert(color || keyDark);
    const mats = [
      side, side,
      new THREE.MeshLambertMaterial({ map: tex }),
      lambert(0x1a1917),
      side, side,
    ];
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.09, 0.28), mats);
    m.position.set(x, 0.545, z);
    m.castShadow = true;
    m.userData = { code, baseY: 0.545, label };
    parent.add(m);
    keys.push(m);
    return m;
  }

  function buildPOS() {
    pos = new THREE.Group();
    pos.position.set(0, 0.02, 0.18);

    const body = box(2.35, 0.46, 2.05, beige, 0.23);
    pos.add(body);
    const deck = box(2.28, 0.06, 1.38, 0xb7a588, 0.49);
    deck.position.z = 0.28;
    pos.add(deck);

    // printer housing sits behind the screen
    const hood = box(1.55, 0.42, 0.72, beigeDark, 0.72);
    hood.position.z = -0.78;
    pos.add(hood);
    const mouth = box(1.22, 0.08, 0.22, 0x141311, 0.94);
    mouth.position.z = -0.52;
    pos.add(mouth);
    const teeth = box(1.24, 0.025, 0.05, 0x3a3834, 0.98);
    teeth.position.z = -0.42;
    pos.add(teeth);

    // modest tilted LCD
    const bezel = box(1.58, 0.52, 0.1, 0x2a2824, 1.08);
    bezel.position.z = -0.36;
    bezel.rotation.x = -0.42;
    pos.add(bezel);

    lcdCanvas = document.createElement("canvas");
    lcdCanvas.width = 512;
    lcdCanvas.height = 220;
    lcdCtx = lcdCanvas.getContext("2d");
    lcdTex = new THREE.CanvasTexture(lcdCanvas);
    lcdTex.colorSpace = THREE.SRGBColorSpace;
    const lcd = new THREE.Mesh(
      new THREE.PlaneGeometry(1.42, 0.42),
      new THREE.MeshBasicMaterial({ map: lcdTex })
    );
    lcd.position.set(0, 1.09, -0.305);
    lcd.rotation.x = -0.42;
    pos.add(lcd);

    // 7-8-9 near screen (smaller z), 0 near cashier (larger z)
    const layout = [
      ["7", "7", -0.58, 0.02], ["8", "8", -0.18, 0.02], ["9", "9", 0.22, 0.02], ["作废", "void", 0.66, 0.02, 0x7a2a22, "#f3c2b8"],
      ["4", "4", -0.58, 0.36], ["5", "5", -0.18, 0.36], ["6", "6", 0.22, 0.36], ["清除", "clr", 0.66, 0.36, 0x7a5a22, "#f3e2b0"],
      ["1", "1", -0.58, 0.7], ["2", "2", -0.18, 0.7], ["3", "3", 0.22, 0.7], ["确认", "ok", 0.66, 0.7, 0x2a5a32, "#c8f3c4"],
      ["0", "0", -0.58, 1.04], [".", ".", -0.18, 1.04], ["00", "00", 0.22, 1.04], ["刷卡", "card", 0.66, 1.04, 0x243a62, "#c8d8f3"],
    ];
    layout.forEach((row) => {
      addKey(pos, row[2], row[3], row[0], row[1], row[4] || keyDark, row[5]);
    });

    const rail = box(0.16, 0.14, 1.55, 0x2a2826, 0.68);
    rail.position.set(1.12, 0.68, 0.18);
    rail.userData = { code: "slot" };
    pos.add(rail);
    const slot = box(0.035, 0.045, 1.38, 0x0a0a0a, 0.7);
    slot.position.set(1.2, 0.7, 0.18);
    slot.userData = { code: "slot" };
    pos.add(slot);

    led = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x3cff4a })
    );
    led.position.set(-1.02, 0.78, -0.12);
    pos.add(led);

    [-1, 1].forEach((sx) => {
      [-1, 1].forEach((sz) => {
        const f = box(0.16, 0.05, 0.16, 0x1a1917, 0.025);
        f.position.set(sx * 0.98, 0.025, sz * 0.82);
        pos.add(f);
      });
    });

    const geo = new THREE.PlaneGeometry(0.72, 1.48, 1, 12);
    receiptTex = new THREE.CanvasTexture(document.createElement("canvas"));
    receiptMesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        map: receiptTex,
        side: THREE.DoubleSide,
      })
    );
    receiptMesh.position.set(0, 0.98, -0.5);
    receiptMesh.rotation.x = -0.04;
    receiptMesh.visible = false;
    pos.add(receiptMesh);

    root.add(pos);
  }

  function buildRoom() {
    const counterMat = lambert(0x3a2c22);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.18, 3.6), counterMat);
    counter.position.set(0, -0.09, 0.2);
    root.add(counter);

    const front = new THREE.Mesh(new THREE.BoxGeometry(7.4, 1.4, 0.18), counterMat);
    front.position.set(0, -0.78, 1.92);
    root.add(front);

    const wall = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 0.2), lambert(0x1b2428));
    wall.position.set(0, 2.2, -2.4);
    root.add(wall);

    const blob = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 20),
      new THREE.MeshBasicMaterial({ color: 0x0c0a08, transparent: true, opacity: 0.28 })
    );
    blob.rotation.x = -Math.PI / 2;
    blob.position.set(0, 0.02, 0.2);
    root.add(blob);

    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 4.4, 10),
      new THREE.MeshBasicMaterial({ color: 0xd8eeea })
    );
    tube.rotation.z = Math.PI / 2;
    tube.position.set(0, 3.15, -0.4);
    root.add(tube);

    const coin = box(0.55, 0.06, 0.55, 0x8a8070, 0.06);
    coin.position.set(-1.85, 0.06, 0.85);
    root.add(coin);
  }

  function drawLCD(state) {
    const g = lcdCtx;
    const w = lcdCanvas.width;
    const h = lcdCanvas.height;
    g.fillStyle = "#0b1a10";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(90, 220, 110, 0.04)";
    for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);

    g.shadowBlur = 0;
    g.fillStyle = "#7dff6a";
    g.font = "16px Share Tech Mono, monospace";
    g.fillText("夜班诗铺  POET-0217", 22, 32);
    g.font = "13px Share Tech Mono, monospace";
    g.fillStyle = "#5cbc58";
    g.fillText(state.line || "请输入金额", 22, 58);

    g.fillStyle = "#9eff8c";
    g.font = "44px Share Tech Mono, monospace";
    const amt = "¥ " + (state.amount || "0.00");
    g.fillText(amt, 22, 122);

    g.font = "14px Share Tech Mono, monospace";
    g.fillStyle = "#68c862";
    g.fillText(state.status || "等待确认", 22, 168);
    g.fillText("NO." + (state.txn || "------"), 300, 168);
    lcdTex.needsUpdate = true;
  }

  function attachReceiptCanvas(canvas) {
    receiptTex.dispose();
    receiptTex = new THREE.CanvasTexture(canvas);
    receiptTex.colorSpace = THREE.SRGBColorSpace;
    receiptTex.minFilter = THREE.LinearFilter;
    receiptTex.generateMipmaps = false;
    receiptMesh.material.map = receiptTex;
    receiptMesh.material.needsUpdate = true;
  }

  function mapPrint(head, usedPx) {
    const H = window.ReceiptPress ? window.ReceiptPress.height : 1100;
    const p = THREE.MathUtils.clamp(head / Math.max(usedPx, 1), 0.02, 1);
    receiptLen = THREE.MathUtils.clamp(usedPx / 620, 0.95, 1.9);
    receiptMesh.scale.set(1, p, 1);
    const half = 1.48 * p * 0.5;
    receiptMesh.position.set(0, 0.98 + half, -0.5);
    if (receiptTex) {
      const slice = THREE.MathUtils.clamp(head / H, 0.04, 1);
      receiptTex.wrapT = THREE.ClampToEdgeWrapping;
      receiptTex.repeat.set(1, slice);
      receiptTex.offset.set(0, 1 - slice);
    }
  }

  function startPrint(usedPx, onDone) {
    printing = true;
    printT = 0;
    receiptLen = THREE.MathUtils.clamp(usedPx / 620, 0.95, 1.9);
    receiptMesh.visible = true;
    mapPrint(24, usedPx);
    printJob = {
      start: performance.now(),
      dur: 2200,
      used: usedPx,
      onDone: typeof onDone === "function" ? onDone : null,
    };
  }

  function finishPrint(usedPx) {
    printing = false;
    printJob = null;
    mapPrint(usedPx || receiptLen * 620, usedPx || receiptLen * 620);
    const half = 1.48 * 0.5;
    receiptMesh.position.set(0, 0.98 + half, -0.5);
  }

  function hideReceipt() {
    receiptMesh.visible = false;
    printing = false;
    printJob = null;
  }

  function pressKey(mesh) {
    if (!mesh) return;
    mesh.position.y = mesh.userData.baseY - 0.03;
    setTimeout(() => {
      mesh.position.y = mesh.userData.baseY;
    }, 90);
  }

  function keyByCode(code) {
    return keys.find((k) => k.userData.code === code);
  }

  function init(el) {
    width = el.clientWidth;
    height = el.clientHeight;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x14181c);
    scene.fog = new THREE.Fog(0x14181c, 6, 14);

    camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    frameCamera();

    renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    root = new THREE.Group();
    scene.add(root);

    ambLight = new THREE.AmbientLight(0x8a9692, 0.78);
    scene.add(ambLight);
    fluoLight = new THREE.DirectionalLight(0xe7f3ef, 0.95);
    fluoLight.position.set(-0.6, 5.4, 2.1);
    scene.add(fluoLight);
    fillLight = new THREE.DirectionalLight(0xc4b49a, 0.28);
    fillLight.position.set(2.2, 1.8, 3.0);
    scene.add(fillLight);

    buildRoom();
    buildPOS();

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    const canvas = renderer.domElement;
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);
    window.addEventListener("resize", onResize);

    drawLCD({ amount: "0.00", line: "请将心灵靠近感应区", status: "待机", txn: "000000" });
    loop();
  }

  let dragging = false;
  let dragStartX = 0;
  let dragOnSlot = false;
  let aimY = 0;
  let aimX = 0;
  let rotY = 0;
  let rotX = 0;
  let lastFrame = performance.now();
  let printJob = null;
  let lastPrintTick = 0;
  let pickables = [];

  function ndc(e) {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }

  function hits() {
    if (!pickables.length) {
      pickables = keys.concat(pos.children.filter((c) => c.userData && c.userData.code === "slot"));
    }
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(pickables, false);
  }

  function onMove(e) {
    ndc(e);
    if (dragging) {
      const dx = e.clientX - dragStartX;
      if (dragOnSlot && Math.abs(dx) > 46) {
        dragging = false;
        emit("swipe");
        return;
      }
      aimY = THREE.MathUtils.clamp((root.userData.rotY || 0) + dx * 0.0015, -0.42, 0.42);
      aimX = 0;
      return;
    }
    aimY = pointer.x * 0.16;
    aimX = -pointer.y * 0.05;
  }

  function onDown(e) {
    ndc(e);
    dragging = true;
    dragStartX = e.clientX;
    root.userData.rotY = rotY;
    const hs = hits();
    dragOnSlot = !!(hs[0] && hs[0].object.userData && hs[0].object.userData.code === "slot");
    const keyHit = hs.find((h) => h.object.userData && h.object.userData.code && h.object.userData.code !== "slot");
    if (keyHit) {
      pressKey(keyHit.object);
      emit("key", keyHit.object.userData.code);
    }
  }

  function onUp() {
    dragging = false;
    dragOnSlot = false;
  }

  function frameCamera() {
    if (width < 820) {
      camera.fov = 42;
      camera.position.set(0.12, 3.55, 5.35);
      camera.lookAt(0.02, 0.72, 0.05);
    } else {
      camera.fov = 36;
      camera.position.set(0.28, 2.95, 4.55);
      camera.lookAt(0.02, 0.55, 0.12);
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function onResize() {
    const el = renderer.domElement.parentElement;
    width = el.clientWidth;
    height = el.clientHeight;
    frameCamera();
    renderer.setSize(width, height);
  }

  function loop() {
    requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;

    rotY = THREE.MathUtils.damp(rotY, aimY, 7, dt);
    rotX = THREE.MathUtils.damp(rotX, aimX, 7, dt);
    root.rotation.y = rotY;
    root.rotation.x = rotX;

    if (printJob) {
      const t = Math.min(1, (now - printJob.start) / printJob.dur);
      const eased = 1 - Math.pow(1 - t, 2);
      mapPrint(24 + (printJob.used - 24) * eased, printJob.used);
      if (now - lastPrintTick > 95) {
        lastPrintTick = now;
        window.PosAudio && window.PosAudio.printTick();
      }
      if (t >= 1) {
        const done = printJob.onDone;
        finishPrint(printJob.used);
        if (done) done();
      }
    }

    if (led) {
      const pulse = 0.55 + Math.sin(now * 0.0032) * 0.4;
      led.material.color.setRGB(0.12 * pulse, pulse, 0.22 * pulse);
    }
    renderer.render(scene, camera);
  }

  return {
    init,
    on,
    drawLCD,
    attachReceiptCanvas,
    startPrint,
    finishPrint,
    hideReceipt,
    mapPrint,
    pressKeyByCode(code) {
      pressKey(keyByCode(code));
    },
    setPrintingProgress(head, used) {
      if (typeof head === "number") mapPrint(head, used);
    },
    setShift(name) {
      const table = {
        night: { bg: 0x14181c, amb: 0.78, fluo: 0.95 },
        late: { bg: 0x0c1014, amb: 0.46, fluo: 0.62 },
        dawn: { bg: 0x1c1814, amb: 0.72, fluo: 0.8 },
        day: { bg: 0x243038, amb: 1.05, fluo: 1.1 },
        dusk: { bg: 0x18141a, amb: 0.82, fluo: 0.88 },
      };
      const s = table[name] || table.night;
      if (scene) {
        scene.background.setHex(s.bg);
        scene.fog.color.setHex(s.bg);
      }
      if (ambLight) ambLight.intensity = s.amb;
      if (fluoLight) fluoLight.intensity = s.fluo;
    },
    flicker(times, done) {
      let n = 0;
      const max = times || 7;
      const tick = () => {
        if (!ambLight) { if (done) done(); return; }
        ambLight.intensity = n % 2 === 0 ? 0.12 : 0.7;
        fluoLight.intensity = n % 2 === 0 ? 0.08 : 0.5;
        n += 1;
        if (n > max) {
          ambLight.intensity = 0.18;
          fluoLight.intensity = 0.15;
          if (done) done();
        } else {
          setTimeout(tick, 70 + (n % 3) * 40);
        }
      };
      tick();
    },
  };
})();
