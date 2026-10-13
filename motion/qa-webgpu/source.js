import * as THREE from 'three/webgpu';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** A spatial study of the supplied three-band company mark. No stock scene. */
function makeRibbon(radius, width) {
  const shape = new THREE.Shape();
  const inner = radius - width;
  shape.moveTo(0.08, -radius);
  shape.lineTo(0, -radius);
  shape.absarc(0, 0, radius, -Math.PI / 2, 0, true);
  shape.lineTo(radius, -radius - 0.10);
  shape.lineTo(0.48, -radius - 0.10);
  shape.lineTo(0.48, -radius + width - 0.10);
  shape.lineTo(inner, -radius + width - 0.10);
  shape.lineTo(inner, 0);
  shape.absarc(0, 0, inner, 0, -Math.PI / 2, false);
  shape.lineTo(0.08, -inner);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.32, bevelEnabled: true, bevelSegments: 4,
    steps: 1, bevelSize: 0.055, bevelThickness: 0.055, curveSegments: 88,
  });
  geometry.translate(0, 0, -0.16);
  return geometry;
}

async function initBrandScene() {
  const canvas = document.querySelector('#brand-canvas');
  const host = canvas?.closest('.hero-art');
  if (!canvas || !host) return () => {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const saveData = navigator.connection?.saveData === true;
  let renderer;
  try {
    renderer = new THREE.WebGPURenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    host.dataset.renderer = 'fallback';
    return () => {};
  }

  await renderer.init();
  renderer.setClearColor(0x061c25, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse.matches ? 1.35 : 1.65));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.1, 11.6);
  const group = new THREE.Group();
  scene.add(group);

  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, 0.035);
  scene.environment = environmentMap.texture;
  environment.dispose();
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xe2fffb, 0x082c37, 0.65));
  const key = new THREE.DirectionalLight(0xe5fff8, 3.0);
  key.position.set(-3, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x43dccc, 4.7);
  rim.position.set(4, -2, 2);
  scene.add(rim);
  const edge = new THREE.DirectionalLight(0x70a9fc, 3.5);
  edge.position.set(-4, -1, -3);
  scene.add(edge);

  const materials = [
    new THREE.MeshPhysicalMaterial({ color: 0x50aaa0, metalness: 0.90, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.05 }),
    new THREE.MeshPhysicalMaterial({ color: 0xc2d6d6, metalness: 0.88, roughness: 0.17, clearcoat: 1, clearcoatRoughness: 0.07, envMapIntensity: 1.2 }),
    new THREE.MeshPhysicalMaterial({ color: 0x228a90, metalness: 0.87, roughness: 0.23, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.2 }),
  ];
  const pieces = [2.15, 1.67, 1.19].map((radius, i) => {
    const mesh = new THREE.Mesh(makeRibbon(radius, 0.27), materials[i]);
    mesh.position.z = (1 - i) * 0.40;
    group.add(mesh);
    return mesh;
  });

  let visible = true;
  let alive = true;
  let manualPause = false;
  let contextLost = false;
  let raf = 0;
  let elapsed = 0;
  let lastFrame = 0;
  let scroll = 0;
  const pointer = { x: 0, y: 0 };
  const smoothed = { x: 0, y: 0 };
  const rest = { x: 0.24, y: -0.48, z: -0.24 };
  const shouldAnimate = () => alive && !contextLost && visible && !document.hidden && !reduce.matches && !saveData && !manualPause;

  function draw(time = 0) {
    if (!alive || contextLost) return;
    const moving = shouldAnimate();
    if (moving) elapsed += Math.min(0.045, lastFrame ? (time - lastFrame) / 1000 : 0);
    lastFrame = time;
    smoothed.x += (pointer.x - smoothed.x) * 0.045;
    smoothed.y += (pointer.y - smoothed.y) * 0.045;
    const drift = moving ? elapsed : 0;
    group.rotation.set(rest.x + smoothed.y * 0.10 + Math.sin(drift * 0.3) * 0.025,
      rest.y + smoothed.x * 0.12 + Math.sin(drift * 0.24) * 0.045,
      rest.z + scroll * 0.12);
    group.position.y = 0.10 + Math.sin(drift * 0.43) * 0.055 - scroll * 0.18;
    pieces.forEach((piece, i) => {
      piece.position.z = (1 - i) * 0.4 + (moving ? Math.sin(drift * 0.5 + i * 0.9) * 0.06 : 0);
    });
    renderer.render(scene, camera);
    if (moving) raf = requestAnimationFrame(draw);
    else raf = 0;
  }
  function schedule() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastFrame = 0;
    if (alive && !contextLost && visible && !document.hidden) raf = requestAnimationFrame(draw);
  }
  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 0.82 ? 13.6 : camera.aspect < 1.0 ? 12.2 : 11.6;
    camera.updateProjectionMatrix();
    schedule();
  }
  function move(event) {
    if (reduce.matches || coarse.matches || manualPause) return;
    const bounds = host.getBoundingClientRect();
    pointer.x = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointer.y = (event.clientY - bounds.top) / bounds.height - 0.5;
  }
  function leave() { pointer.x = 0; pointer.y = 0; }
  function updateScroll() {
    if (reduce.matches || manualPause) { scroll = 0; return; }
    scroll = Math.min(1, Math.max(0, -host.getBoundingClientRect().top / Math.max(host.clientHeight, 1)));
  }
  const toggle = document.querySelector('[data-motion-toggle]');
  const toggleLabel = toggle?.querySelector('[data-motion-label]');
  function setToggle() {
    const paused = manualPause || reduce.matches || saveData;
    const english = document.documentElement.lang.startsWith('en');
    toggle?.setAttribute('aria-pressed', String(paused));
    const constrained = reduce.matches || saveData;
    const label = constrained ? (english ? 'Reduced motion' : '모션 감소 적용') : english ? (paused ? 'Play motion' : 'Pause motion') : (paused ? '모션 재생' : '모션 일시정지');
    if (toggle) toggle.disabled = constrained;
    toggle?.setAttribute('aria-label', label);
    if (toggleLabel) toggleLabel.textContent = label;
    host.dataset.motion = paused ? 'paused' : 'playing';
  }
  function toggleMotion() { manualPause = !manualPause; setToggle(); schedule(); }
  function preference() { leave(); setToggle(); schedule(); }
  function lost(event) { event.preventDefault(); contextLost = true; host.dataset.renderer = 'fallback'; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function restored() { contextLost = false; host.dataset.renderer = 'webgl'; resize(); }

  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { rootMargin: '100px' });
  observer.observe(host);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  host.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerleave', leave, { passive: true });
  window.addEventListener('scroll', updateScroll, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  canvas.addEventListener('webglcontextlost', lost);
  canvas.addEventListener('webglcontextrestored', restored);
  reduce.addEventListener('change', preference);
  toggle?.addEventListener('click', toggleMotion);
  host.dataset.renderer = 'webgl';
  setToggle();
  resize();

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    observer.disconnect(); resizeObserver.disconnect();
    host.removeEventListener('pointermove', move);
    host.removeEventListener('pointerleave', leave);
    window.removeEventListener('scroll', updateScroll);
    document.removeEventListener('visibilitychange', schedule);
    canvas.removeEventListener('webglcontextlost', lost);
    canvas.removeEventListener('webglcontextrestored', restored);
    reduce.removeEventListener('change', preference);
    toggle?.removeEventListener('click', toggleMotion);
    pieces.forEach(mesh => mesh.geometry.dispose());
    materials.forEach(material => material.dispose());
    environmentMap.dispose(); renderer.dispose();
  };
}

export async function initMotion() {
  const disposeScene = await initBrandScene();
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const reveals = gsap.utils.toArray('[data-reveal]');
    reveals.forEach(element => {
      gsap.fromTo(element, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85,
        ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
    });
    if (matchMedia('(min-width: 800px)').matches) {
      gsap.utils.toArray('.project-visual img, .project-visual video').forEach(element => {
        gsap.fromTo(element, { scale: 1.04, yPercent: -2 }, { scale: 1, yPercent: 2, ease: 'none',
          scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      });
    }
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  function cleanup() { disposeScene(); media.revert(); }
  window.addEventListener('pagehide', event => { if (!event.persisted) cleanup(); });
  return cleanup;
}
