// @ts-ignore
// eslint-disable-next-line
/* global-disable chrome-passive-event-listeners */
import { fabric } from "fabric";
import type { Canvas } from "../types/canvas";
import type { Options } from "../types/options";

export const createCanvas = (options: Options): fabric.Canvas => {
  const canvasEle = document.getElementById(options.id);
  if (!canvasEle) {
    throw new Error(`Canvas element with id ${options.id} not found`);
  }

  const parentEle = canvasEle?.parentElement;
  let height =
    parentEle != undefined &&
    options.height > parentEle.clientHeight &&
    options.boundToParentSize
      ? parentEle.clientHeight
      : options.height;
  let width =
    parentEle != undefined &&
    options.width > parentEle.clientWidth &&
    options.boundToParentSize
      ? parentEle.clientWidth
      : options.width;
  return new fabric.Canvas(options.id, {
    width: width,
    height: height,
    hoverCursor: "pointer",
    selection: false,
    allowTouchScrolling: true,
    enableRetinaScaling: false,
    isDrawingMode: false,
  });
};

export const setupCanvas = (canvas: fabric.Canvas) => {
  if (!canvas) return;

  // Get the canvas HTML element to add our own passive wheel event listener
  const canvasElement = canvas.getElement();
  const canvasParent = canvasElement.parentElement;

  // Custom wheel handler with passive: true option
  function handleWheel(evt: WheelEvent) {
    // Handle zoom logic
    const delta = evt.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;

    // Apply zoom limits
    if (zoom > 20) zoom = 20;
    if (zoom < 0.1) zoom = 0.1;

    // Apply zoom to canvas
    canvas.zoomToPoint({ x: evt.offsetX, y: evt.offsetY }, zoom);

    // We still need to prevent default behavior, but this happens after the passive event has been processed
    evt.preventDefault();
  }

  // Add wheel event listener with passive option to the canvas element
  if (canvasParent) {
    canvasParent.addEventListener("wheel", handleWheel, { passive: false });
  }

  // We'll still use Fabric's event system for the other events
  function touchZoom(this: Canvas, opt: any) {
    const evt = opt.e as TouchEvent;
    // Handle zoom only if 2 fingers are touching the screen
    if (evt.touches && evt.touches.length == 2) {
      this.isDragging = false;
      let point1 = new fabric.Point(
        evt.touches[0].clientX,
        evt.touches[0].clientY
      );
      let point2 = new fabric.Point(
        evt.touches[1].clientX,
        evt.touches[1].clientY
      );
      let midPoint = point1.midPointFrom(point2);
      if (opt.self.state == "start") {
        this.zoomStartScale = this.getZoom();
      }
      let delta = this.zoomStartScale * opt.self.scale;
      this.zoomToPoint(midPoint, delta);
      this.isDragging = true;
    }
  }

  function resetCanvas(this: Canvas) {
    var vpt = this.viewportTransform as number[];
    vpt[4] = this.getCenter().left - 200; // Using a constant here
    vpt[5] = 200; // Using a constant here
    this.setViewportTransform(vpt);
    this.setZoom(1);
    this.requestRenderAll();
  }

  // We're removing the mouse:wheel event and handling it separately above
  canvas.on("touch:gesture", touchZoom);
  canvas.on("touch:longpress", resetCanvas);
  canvas.on("mouse:dblclick", resetCanvas);

  // Setup pan by dragging on mouse press and hold
  canvas.on("mouse:down", function (this: Canvas, opt) {
    if (opt.target) {
      return;
    }
    var evt = opt.e as MouseEvent | TouchEvent;
    let isTouch =
      evt.type === "touchstart" && "touches" in evt && evt.touches.length === 1;
    this.isDragging = true;
    this.setCursor("grabbing");
    this.lastPosX = isTouch
      ? (evt as TouchEvent).touches[0].clientX
      : (evt as MouseEvent).clientX;
    this.lastPosY = isTouch
      ? (evt as TouchEvent).touches[0].clientY
      : (evt as MouseEvent).clientY;
  });

  canvas.on("mouse:move", function (this: Canvas, opt) {
    if (this.isDragging) {
      let isTouch = opt.e.type === "touchmove" && "touches" in opt.e;
      var evt = opt.e as MouseEvent | TouchEvent;
      let clientX = isTouch
        ? (evt as TouchEvent).touches[0].clientX
        : (evt as MouseEvent).clientX;
      let clientY = isTouch
        ? (evt as TouchEvent).touches[0].clientY
        : (evt as MouseEvent).clientY;
      const zoom = this.getZoom();
      var vpt = this.viewportTransform as number[];
      vpt[4] += clientX - this.lastPosX;
      vpt[5] += clientY - this.lastPosY;

      // prevent infinite pan
      if (vpt[4] > this.getWidth()) {
        vpt[4] = this.getWidth();
      }
      if (vpt[4] < -(this.getWidth() * zoom)) {
        vpt[4] = -(this.getWidth() * zoom);
      }
      if (vpt[5] > this.getHeight()) {
        vpt[5] = this.getHeight();
      }
      if (vpt[5] < -(this.getHeight() * zoom)) {
        vpt[5] = -(this.getHeight() * zoom);
      }
      this.requestRenderAll();
      this.lastPosX = clientX;
      this.lastPosY = clientY;
    }
  });

  canvas.on("mouse:up", function (this: Canvas) {
    this.setViewportTransform(this.viewportTransform as number[]);
    this.isDragging = false;
  });
};

export const fitCanvasContentToView = (canvas: fabric.Canvas) => {
  if (!canvas) return;

  // Get all objects
  const objects = canvas.getObjects();
  if (objects.length === 0) return;

  // Calculate the bounding box of all objects
  let left = Infinity,
    top = Infinity,
    right = -Infinity,
    bottom = -Infinity;

  objects.forEach((obj) => {
    const bbox = obj.getBoundingRect(true, true);
    left = Math.min(left, bbox.left);
    top = Math.min(top, bbox.top);
    right = Math.max(right, bbox.left + bbox.width);
    bottom = Math.max(bottom, bbox.top + bbox.height);
  });

  // Add padding
  const padding = 50;
  left -= padding;
  top -= padding;
  right += padding;
  bottom += padding;

  // Calculate dimensions
  const width = right - left;
  const height = bottom - top;

  // Calculate zoom to fit
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const zoomX = canvasWidth / width;
  const zoomY = canvasHeight / height;
  let zoom = Math.min(zoomX, zoomY);

  // Apply limits to zoom
  zoom = Math.min(Math.max(zoom, 0.1), 1.0);

  // Calculate center point
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;

  // Reset viewportTransform first
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

  // Apply zoom
  canvas.setZoom(zoom);

  // Center the content
  const vpCenter = canvas.getCenter();

  canvas.absolutePan(
    new fabric.Point(
      centerX * zoom - vpCenter.left,
      centerY * zoom - vpCenter.top
    )
  );

  canvas.requestRenderAll();
};
