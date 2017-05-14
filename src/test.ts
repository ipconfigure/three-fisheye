import {Fisheye2Perspective, Fisheye2Equirectangular, mercator2Sphere, sphere2Mercator, sphere2Fisheye, fisheye2Sphere} from "./";

import * as dat from "dat-gui";

const QUnit     = <QUnit>require('qunitjs');
const empower   = <Function>require('empower');
const formatter = <Function>require('power-assert-formatter');
const qunitTap  = <Function>require("qunit-tap");

QUnit.config.autostart = true;
empower(QUnit.assert, formatter(), { destructive: true });
qunitTap(QUnit, function() { console.log.apply(console, arguments); }, {showSourceOnFailure: false});

QUnit.module("Fisheye");

QUnit.test("mercator2Sphere, sphere2Mercator", async (assert: Assert)=>{
  for(let x=0; x<=1; x+=0.1){
    for(let y=0; y<=1; y+=0.1){
      const [a, b] = mercator2Sphere(x, y);
      const [_x, _y] = sphere2Mercator(a, b);
      assert.ok(x-0.00000001 <= _x && _x <= x+0.00000001);
      assert.ok(y-0.00000001 <= _y && _y <= y+0.00000001);
    }
  }
});


QUnit.test("Fisheye2Perspective", async (assert: Assert)=>{
  const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          minFrameRate: 1,
          maxFrameRate: 5,
          minWidth: 2592,
          minHeight: 1944 } } });
  const url = URL.createObjectURL(stream);
  const video = document.createElement("video");
  video.src = url;

  await new Promise((resolve, reject)=>{
    video.addEventListener("loadeddata", resolve, <any>{once: true});
    video.addEventListener("error", reject, <any>{once: true});
  });

  video.autoplay = true;

  const cam = new Fisheye2Perspective();

  cam.src = video;
  cam.canvasSize = {width: 600, height: 400};
  cam.cameraPose = {pitch: Math.PI/4, yaw: 0};
  cam.zoom = 1/3
  cam.fisheyeRegion = {centerX: 1259, centerY: 887, radius: 879};

  let dragging = false;
  cam.canvas.addEventListener("mousemove", (ev)=>{ if(dragging){ cam.drag("move", ev.offsetX, ev.offsetY); } });
  cam.canvas.addEventListener("mousedown", (ev)=>{ dragging = true; cam.drag("start", ev.offsetX, ev.offsetY); });
  cam.canvas.addEventListener("mouseup", (ev)=>{ dragging = false; });
  cam.canvas.addEventListener("mouseleave", (ev)=>{ dragging = false; });

  // dat-GUI
  const gui = new dat.GUI();
  const width = cam.texctx.canvas.width;
  gui.add(video, "currentTime", 0, video.duration);
  gui.add(cam, "zoom", 0.01, 2).step(0.01);
  gui.add(cam, "centerX", -width, width);
  gui.add(cam, "centerY", -width, width);
  gui.add(cam, "radius", 1, width/2);
  gui.add(cam, "pitch", 0, Math.PI/2);
  gui.add(cam, "yaw", -Math.PI, Math.PI);
  gui.close();

  document.body.appendChild(cam.canvas);
  //document.body.appendChild(cam.texctx.canvas);
  //document.body.appendChild(cam.texctx1.canvas); // sep_mode
  //document.body.appendChild(cam.texctx2.canvas); // sep_mode
  //document.body.appendChild(video);

  const tid = setInterval(()=>{
    cam.render();
    gui.__controllers
        .forEach((ctrl)=>{ ctrl.updateDisplay(); }); // dat-gui
  }, 30);

  video.play();

  await sleep(5 * 60 * 1000);

  clearTimeout(tid);
  cam.destructor();
  video.pause();
  URL.revokeObjectURL(url);
  stream.getTracks().forEach((a)=>{ a.stop(); });

  assert.ok(true);
});


QUnit.test("Fisheye2Equirectangular", async (assert: Assert)=>{
  const video = document.createElement("video");
  video.src = "./ec2e5847-b502-484c-b898-b8e2955f4545.webm";

  await new Promise((resolve, reject)=>{
    video.addEventListener("loadeddata", resolve, <any>{once: true});
    video.addEventListener("error", reject, <any>{once: true});
  });
  const cam = new Fisheye2Equirectangular();
  window["cam"] = cam;
  cam.src = video;
  //cam.canvasSize = {width: 600, height: 400};
  cam.fisheyeRegion = {centerX: 1259, centerY: 887, radius: 879};
  document.body.appendChild(cam.canvas);

  cam.render();

  assert.ok(true);
});


function sleep(ms: number): Promise<void>{
  return new Promise<void>((resolve)=> setTimeout(resolve, ms));
}
