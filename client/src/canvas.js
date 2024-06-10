import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from "./context";
import arriereImg from './images/arriere.png';
import avanntImg from './images/avannt.png';
import couperImg from './images/couper.png';
import crayonImg from './images/crayon.png';
import gommeImg from './images/gomme.png';
import plumeImg from './images/plume.png';

import textImg from './images/text.png';

const Canvas = () => {
  var old;


  const canvas = document.getElementsByTagName("canvas")[0];

  const drawHistory = [];

  const {
    ctx,
    changeCtx,
    changeCanvas,
    socket,
    room,
    brushMode,
    brush,
    eraser,
    brushColor,
    brushWidth,
    role,
    viewOwnDrawing,
    changeBrushMode,
    changeBrushWidth,
    changeBrushColor,
    bgColor,
    changeBgColor,
    handleClearCanvas
  } = useContext(AppContext);

  if(!ctx){
    var x = 0;
    var y = 0;
  }

  useEffect(() => {
    const canv = document.createElement('canvas');
    changeCanvas(canv);
    document.getElementsByClassName("canvas_main")[0].appendChild(canv);
    const ctxTemp = canv.getContext("2d");
    ctxTemp.canvas.width = 1460;
    ctxTemp.canvas.height = 920;
    ctxTemp.lineWidth = 5;
    ctxTemp.lineCap = 'round';
    ctxTemp.strokeStyle = '#c0392b';
    changeCtx(ctxTemp);
    // Initialiser la variable canvas ici
    const canvas = canv;
  },[]);
  

  const setPosition = useCallback((e) => {
    if(brushMode === "brush" && (brush || role === "leader")){
      x = e.offsetX;
      y = e.offsetY;
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = brushWidth;
      ctx.strokeStyle = brushColor;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (!viewOwnDrawing) {
        socket.emit("sendCanvas", [room, x, y, brushWidth, brushColor]);
      } else {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    } 
    else if (brushMode === "eraser" && (eraser || role === "leader")) {
      x = e.offsetX;
      y = e.offsetY;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushWidth;
      ctx.strokeStyle = brushColor;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (!viewOwnDrawing) {
        socket.emit("sendCanvas", [room, x, y, brushWidth]);
      } else {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  }, [brushMode, brush, role, eraser, brushColor, brushWidth, viewOwnDrawing]);

  const draw = useCallback((e) => {
    if(e.buttons === 1){
      if (brushMode === "brush" && (brush || role === "leader")) {
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = brushWidth;
        ctx.strokeStyle = brushColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        x = e.offsetX;
        y = e.offsetY;
        ctx.lineTo(x, y);
        ctx.stroke();
        if (!viewOwnDrawing) {
          socket.emit("sendCanvas", [room, x, y, brushWidth, brushColor]);
        }
      } 
      else if (brushMode === "eraser" && (eraser || role === "leader")){
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = brushWidth;
        ctx.strokeStyle = brushColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        x = e.offsetX;
        y = e.offsetY;
        ctx.lineTo(x, y);
        ctx.stroke();
        if (!viewOwnDrawing) {
          socket.emit("sendCanvas", [room, x, y, brushWidth]);
        }
      }
    }
  }, [brushMode, brush, role, eraser, brushColor, brushWidth, viewOwnDrawing]);

  const mouseUp = useCallback(() => {
    old = null;
    if (!viewOwnDrawing) {
      socket.emit("clearOld", room);
    }
  }, [brushMode, brush, role, eraser, brushColor, brushWidth, viewOwnDrawing]);

  useEffect((e) => {
    if(ctx){
      document.getElementsByTagName("canvas")[0].addEventListener("mousedown", setPosition);
      document.getElementsByTagName("canvas")[0].addEventListener("mousemove", draw);
      document.addEventListener("mouseup", mouseUp);

      return () =>{
        document.getElementsByTagName("canvas")[0].removeEventListener("mousedown", setPosition);
        document.getElementsByTagName("canvas")[0].removeEventListener("mousemove", draw);
        document.removeEventListener("mouseup", mouseUp);
      }
    }
  }, [ctx, brushMode, brush, role, eraser, brushColor, brushWidth, setPosition, draw, mouseUp]);

  useEffect(() => {
    socket.on("sendCanvasToUsers", (data) => {
      if (ctx && !viewOwnDrawing) {
        if (!old) {
          old = [data[1], data[2]];
        }
        if(data.length === 5){
          ctx.globalCompositeOperation = "source-over";
          ctx.lineWidth = data[3];
          ctx.strokeStyle = data[4];
          ctx.beginPath();
          ctx.moveTo(old[0], old[1]);
          ctx.lineTo(data[1], data[2]);
          ctx.stroke();
          old = [data[1], data[2]];
        } 
        else {
          if (!old) {
            old = [data[1], data[2]];
          }
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineWidth = data[3];
          ctx.beginPath();
          ctx.moveTo(old[0], old[1]);
          ctx.lineTo(data[1], data[2]);
          ctx.stroke();
          old = [data[1], data[2]];
        }
      }
    });

    socket.on("clearOldForUsers", () => {
      old = undefined;
    });
  }, [socket, ctx, viewOwnDrawing]);

  const handleTextButtonClick = () => {
    changeBrushMode("text");
  };

  const handleUndo = () => {
    if (ctx) {
      if (drawHistory.length > 0) {
        const lastDraw = drawHistory.pop(); 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawHistory.forEach(({ x, y, width, color }) => {
          ctx.beginPath();
          ctx.lineWidth = width;
          ctx.strokeStyle = color;
          ctx.lineTo(x, y);
          ctx.stroke();
        });
      }
    }
  };

  const handleText = (e) => {
    if (brushMode === "text") {
      ctx.font = `${brushWidth * 2}px Arial`;
      ctx.fillStyle = brushColor;
      ctx.fillText(e.key, x, y);
      if (!viewOwnDrawing) {
        socket.emit("sendCanvas", [room, x, y, brushWidth, brushColor, e.key]);
      }
    }
  }

  return (
    <div className='canvas_main'>
      <div className='canvas_title'>Canvas</div>
      <div className='canvas_underline' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <button className="canvas_button" onClick={handleUndo}><img src={arriereImg} alt="Arrière" /></button>
          <button className="canvas_button" ><img src={avanntImg} alt="Avant" /></button>
          <button className="canvas_button" ><img src={couperImg} alt="Couper" /></button>
          <button className={brushMode === "brush" ? 'white_bg canvas_button' : 'canvas_button'} onClick={e => changeBrushMode("brush")}><img src={crayonImg} alt="Crayon" /></button>
          <button className={brushMode === "eraser" ? 'white_bg canvas_button' : 'canvas_button'} onClick={e => changeBrushMode("eraser")}><img src={gommeImg} alt="Gomme" /></button>
          <button className="canvas_button"><img src={plumeImg} alt="Plume" /></button>
          <button className={brushMode === "text" ? 'white_bg canvas_button' : 'canvas_button'} onClick={e => changeBrushMode("text")}>
            <img src={textImg} alt="Text" />
          </button>
      </div>
    </div>
  )
}
export default Canvas;