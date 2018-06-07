import {Fisheye2Perspective, Fisheye2Equirectangular, Equirectangular2Fisheye} from "./";
import * as dat from "dat-gui";

async function main(){
  const video = document.createElement('video');
  video.height = 480;
  video.width = 640;
  await new Promise((resolve, reject)=>{
    video.src = "./test3.mov";
    video.autoplay = true;
    video.onplay = resolve;
    video.onerror = reject;
  });

document.body.appendChild(video);

  const cam = new Fisheye2Perspective();
  window["cam"] = cam;
  cam.src = video;
  cam.canvasSize = {width: 600, height: 400};
  cam.cameraPose = {pitch: Math.PI/4, yaw: 0};
  cam.zoom = 1/3
  //cam.fisheyeRegion = {centerX: img.width/2, centerY: img.height/2, radius: Math.min(img.width, img.height)/2}; // auto
  cam.fisheyeRegion = {centerX: 3200/2, centerY: 3000/2, radius: 2900/2}; // ajast by hand
  cam.defaultExponent = 10; // 2^10 if you use large texture
  cam.resize();

  let dragging = false;
  cam.canvas.addEventListener("mousemove", (ev)=>{ if(dragging){ cam.drag("move", ev.offsetX, ev.offsetY); } });
  cam.canvas.addEventListener("mousedown", (ev)=>{ dragging = true; cam.drag("start", ev.offsetX, ev.offsetY); });
  cam.canvas.addEventListener("mouseup", (ev)=>{ dragging = false; });
  cam.canvas.addEventListener("mouseleave", (ev)=>{ dragging = false; });

  //cam.canvasSize = {width: window.innerWidth, height: window.innerHeight};
  //window.addEventListener("resize", (ev)=>{ cam.canvasSize = {width: window.innerWidth, height: window.innerHeight}; cam.render(); });

  cam.render();
  //cam.texctx.canvas.style.border = "1px solid black";
  //cam.texctx.canvas.style.width = "300px";
  document.body.appendChild(cam.canvas);
  //document.body.appendChild(cam.texctx.canvas);

  const cam2 = new Fisheye2Equirectangular();
  window["cam2"] = cam2;
  cam2.src = video;
  cam2.fisheyeRegion = cam.fisheyeRegion;
  cam2.width/=8;
  cam2.height/=8;
  cam2.render();

  document.body.appendChild(cam2.canvas);

  window.setInterval(function() {
    cam.render();
    cam2.render();
  }, 100);

  /*const cam3 = new Equirectangular2Fisheye();
  window["cam3"] = cam3;
  cam3.src = cam2.canvas;
  cam3.render();
  document.body.appendChild(cam3.canvas);*/

  // dat-GUI
  const gui = new dat.GUI();

  gui.add(cam, "zoom", 0.01, 2).step(0.01).onChange((x)=>{ cam.render(); });
  gui.add(cam, "centerX", -video.width, video.width).onChange((x)=>{ cam.render(); cam2.centerX = x; cam2.render(); });
  gui.add(cam, "centerY", -video.height, video.height).onChange((x)=>{ cam.render(); cam2.centerY = x; cam2.render(); });
  gui.add(cam, "radius", 1, Math.max(video.width, video.height)).onChange((x)=>{ cam.render(); cam2.radius = x; cam2.render(); });
  gui.add(cam, "pitch", 0, Math.PI/2).onChange((x)=>{ cam.render(); });
  gui.add(cam, "yaw", -Math.PI, Math.PI).onChange((x)=>{ cam.render();  });
  gui.close();


}

main();
