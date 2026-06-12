/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { Paintbrush, Eraser, Trash2, Download, Sparkles, Smile, Star, Type } from "lucide-react";
import { COLORING_PAGES, STICKER_LIST } from "../data";

interface DrawingCanvasProps {
  onEarnBadge: (badgeId: string) => void;
  onAddStars: (count: number) => void;
}

export default function DrawingCanvas({ onEarnBadge, onAddStars }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FF6B6B"); // Coral Orange
  const [brushSize, setBrushSize] = useState(8);
  const [tool, setTool] = useState<"draw" | "erase" | "sticker">("draw");
  const [selectedSticker, setSelectedSticker] = useState("🦄");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [savedDrawings, setSavedDrawings] = useState<string[]>([]);

  const childColors = [
    { value: "#FF6B6B", label: "Coral 🍎" },
    { value: "#FFD93D", label: "Yellow 🍌" },
    { value: "#6BCB77", label: "Mint 🍏" },
    { value: "#4D96FF", label: "Sky 🐳" },
    { value: "#D1A3FF", label: "Lavender 🍇" },
    { value: "#FF9ebb", label: "Pink 🦩" },
    { value: "#1e293b", label: "Charcoal 🐈" },
    { value: "#ffffff", label: "White 🥚" },
  ];

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill with white background initially
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Redraw template when selected
  const applyTemplate = (templateId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSelectedTemplate(templateId);

    const page = COLORING_PAGES.find((p) => p.id === templateId);
    if (!page) return;

    // Draw lines onto the 2D canvas dynamically
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    page.outlines.forEach((shape: any) => {
      ctx.beginPath();
      if (shape.type === "circle") {
        ctx.arc(shape.cx * (canvas.width / 300), shape.cy * (canvas.height / 300), shape.r * (canvas.width / 300), 0, Math.PI * 2);
        if (shape.fill !== "transparent") {
          ctx.fillStyle = shape.fill;
          ctx.fill();
        }
        ctx.stroke();
      } else if (shape.type === "rect") {
        const x = shape.x * (canvas.width / 300);
        const y = shape.y * (canvas.height / 300);
        const w = shape.width * (canvas.width / 300);
        const h = shape.height * (canvas.height / 300);
        ctx.rect(x, y, w, h);
        ctx.stroke();
      } else if (shape.type === "path") {
        // Simple mock triangle render or custom path
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 20);
        ctx.lineTo(40, canvas.height - 40);
        ctx.lineTo(canvas.width - 40, canvas.height - 40);
        ctx.closePath();
        ctx.stroke();
      } else if (shape.type === "polygon") {
        const pts = shape.points.split(" ").map((pair: string) => {
          const [px, py] = pair.split(",").map(Number);
          return { x: px * (canvas.width / 300), y: py * (canvas.height / 300) };
        });
        if (pts.length > 0) {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    });

    onAddStars(5);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (tool === "sticker") {
      // Stamp sticker emoji directly on coordinates
      ctx.font = `${brushSize * 4 + 16}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(selectedSticker, x, y);
      onAddStars(2);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === "erase" ? "#ffffff" : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === "sticker") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Prevent scrolling while drawing on touch screens
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSelectedTemplate(null);
  };

  const saveArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    setSavedDrawings((prev) => [dataUrl, ...prev].slice(0, 4));

    onEarnBadge("badge-first-painting");
    onAddStars(15);
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-xl border-4 border-emerald-200 shadow-xl font-body" id="creative-corner">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-800 flex items-center gap-2 font-heading">
            <Sparkles className="text-yellow-400 fill-yellow-400" />
            Wonder Paintbrush & Coloring Pad
          </h2>
          <p className="text-emerald-700 font-body">Draw freely, color inside magical outlines, or stamp cute stars!</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-sm font-body">
            ✨ Creative Space
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-body">
        {/* Left Side: Coloring pages & Stickers */}
        <div className="lg:col-span-1 space-y-4">
          {/* Coloring Templates */}
          <div className="bg-white p-4 rounded-xl border-2 border-emerald-100 shadow-sm font-body">
            <h3 className="font-bold text-emerald-700 mb-2 text-sm uppercase tracking-wide font-heading">
              1. Choose Coloring Outline
            </h3>
            <div className="grid grid-cols-3 gap-2 font-body">
              {COLORING_PAGES.map((page) => (
                <button
                  key={page.id}
                  id={`btn-color-page-${page.id}`}
                  onClick={() => applyTemplate(page.id)}
                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition-transform duration-200 active:scale-95 text-xs font-semibold font-button ${
                    selectedTemplate === page.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 scale-105 font-black"
                      : "border-slate-100 hover:border-emerald-200 text-slate-600 hover:bg-emerald-50/50"
                  }`}
                >
                  <span className="text-2xl mb-1">{page.emoji}</span>
                  <span className="text-center overflow-hidden text-ellipsis whitespace-nowrap w-full">
                    {page.name}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={clearCanvas}
              className="w-full mt-3 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-slate-50 border-2 border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 active:scale-98 transition-all font-button"
            >
              <Trash2 size={14} /> Clear Blank Canvas
            </button>
          </div>

          {/* Stickers Selection */}
          <div className="bg-white p-4 rounded-xl border-2 border-emerald-100 shadow-sm font-body">
            <h3 className="font-bold text-emerald-700 mb-2 text-sm uppercase tracking-wide flex items-center gap-1 font-heading">
              <Smile size={16} /> 2. Sticker Stamps
            </h3>
            <div className="grid grid-cols-4 gap-2 font-body">
              {STICKER_LIST.map((sticker) => (
                <button
                  key={sticker}
                  id={`btn-sticker-${sticker}`}
                  onClick={() => {
                    setSelectedSticker(sticker);
                    setTool("sticker");
                  }}
                  className={`text-2xl p-2 rounded-lg border-2 hover:scale-110 active:scale-90 transition-transform ${
                    tool === "sticker" && selectedSticker === sticker
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300"
                      : "border-transparent"
                  }`}
                >
                  {sticker}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Canvas Platform */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="relative bg-white rounded-xl border-8 border-yellow-200 shadow-inner overflow-hidden max-w-full w-[420px] h-[340px]">
            <canvas
              ref={canvasRef}
              width={400}
              height={320}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair w-full h-full touch-none"
            />
          </div>

          {/* Canvas Bottom Tools quick bar */}
          <div className="flex gap-4 mt-4 w-full justify-center font-button">
            <button
              id="tool-draw"
              onClick={() => setTool("draw")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm font-button ${
                tool === "draw"
                  ? "bg-emerald-500 text-white scale-105 font-black"
                  : "bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Paintbrush size={16} /> Paint
            </button>
            <button
              id="tool-erase"
              onClick={() => setTool("erase")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm font-button ${
                tool === "erase"
                  ? "bg-slate-700 text-white scale-105 font-black"
                  : "bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Eraser size={16} /> Eraser
            </button>
            <button
              id="tool-save"
              onClick={saveArtwork}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-slate-900 font-bold transition-all hover:bg-yellow-500 hover:scale-105 shadow-md active:scale-95 font-button"
            >
              <Download size={16} /> Save Canvas
            </button>
          </div>
        </div>

        {/* Right Side: Palette and saved masterpieces */}
        <div className="lg:col-span-1 space-y-4 font-body">
          {/* Color Palette */}
          <div className="bg-white p-4 rounded-xl border-2 border-emerald-100 shadow-sm font-body">
            <h3 className="font-bold text-emerald-700 mb-2 text-sm uppercase tracking-wide font-heading">
              3. Magic Paint Colors
            </h3>
            <div className="grid grid-cols-2 gap-2 font-button">
              {childColors.map((c) => (
                <button
                  key={c.value}
                  id={`color-palette-${c.value.replace("#", "")}`}
                  onClick={() => {
                    setColor(c.value);
                    if (tool === "erase" || tool === "sticker") {
                      setTool("draw");
                    }
                  }}
                  className={`flex items-center gap-2 w-full p-2.5 rounded-lg border-2 text-xs font-bold transition-transform active:scale-95 ${
                    color === c.value && tool === "draw"
                      ? "border-emerald-500 ring-2 ring-emerald-250 scale-103 font-black"
                      : "border-slate-100 hover:scale-102"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-lg border border-slate-400"
                    style={{ backgroundColor: c.value }}
                  />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Brush sizes */}
            <div className="mt-4 border-t-2 border-slate-50 pt-3">
              <label className="text-xs font-bold text-slate-500 block mb-2 font-body">
                Brush Size: {brushSize === 4 ? "Tiny 🐜" : brushSize === 8 ? "Medium 🐱" : "Giant 🦖"}
              </label>
              <div className="flex gap-2">
                {[4, 8, 16].map((size) => (
                  <button
                    key={size}
                    id={`brush-size-${size}`}
                    onClick={() => setBrushSize(size)}
                    className={`flex-1 text-xs py-1 px-1 rounded-lg border-2 font-bold font-button ${
                      brushSize === size
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-slate-100 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {size === 4 ? "Tiny" : size === 8 ? "Medium" : "Giant"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Child Gallery */}
          {savedDrawings.length > 0 && (
            <div className="bg-white p-4 rounded-xl border-2 border-emerald-100 shadow-sm font-body">
              <h3 className="font-bold text-emerald-700 mb-2 text-xs uppercase tracking-wide flex items-center gap-1 font-heading">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                Wonder Museum (Saved!)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {savedDrawings.map((drawing, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg border border-yellow-250 overflow-hidden shadow-sm hover:scale-105 transition-transform duration-200">
                    <img src={drawing} alt="Saved Art" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
