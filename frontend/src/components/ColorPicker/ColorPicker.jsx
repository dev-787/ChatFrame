import React, { useState, useEffect, useRef } from 'react';
import './ColorPicker.scss';

// Helper: Convert Hex string to HSV
function hexToHsv(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

// Helper: Convert HSV to Hex string
function hsvToHex(h, s, v) {
  s /= 100;
  v /= 100;
  const i = Math.floor((h / 60) % 6);
  const f = (h / 60) - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0, g = 0, b = 0;
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const ColorPicker = ({ value = '#6366f1', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHsv] = useState({ h: 238, s: 71, v: 95 });
  const [inputText, setInputText] = useState(value);
  
  const containerRef = useRef(null);
  const colorAreaRef = useRef(null);
  const hueSliderRef = useRef(null);

  // Synchronize internal HSV with incoming value
  useEffect(() => {
    if (value) {
      const parsed = hexToHsv(value);
      setHsv(parsed);
      setInputText(value);
    }
  }, [value]);

  // Click outside handler to close popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const updateColor = (newHsv) => {
    setHsv(newHsv);
    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setInputText(hex);
    if (onChange) {
      onChange(hex);
    }
  };

  // Color Area Dragging (Saturation and Value)
  const handleColorAreaMouseDown = (e) => {
    e.preventDefault();
    handleColorAreaMove(e);
    window.addEventListener('mousemove', handleColorAreaMouseMove);
    window.addEventListener('mouseup', handleColorAreaMouseUp);
  };

  const handleColorAreaMouseMove = (e) => {
    handleColorAreaMove(e);
  };

  const handleColorAreaMouseUp = () => {
    window.removeEventListener('mousemove', handleColorAreaMouseMove);
    window.removeEventListener('mouseup', handleColorAreaMouseUp);
  };

  const handleColorAreaMove = (e) => {
    if (!colorAreaRef.current) return;
    const rect = colorAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const s = Math.round(x * 100);
    const v = Math.round((1 - y) * 100);

    updateColor({ ...hsv, s, v });
  };

  // Hue Slider Dragging
  const handleHueMouseDown = (e) => {
    e.preventDefault();
    handleHueMove(e);
    window.addEventListener('mousemove', handleHueMouseMove);
    window.addEventListener('mouseup', handleHueMouseUp);
  };

  const handleHueMouseMove = (e) => {
    handleHueMove(e);
  };

  const handleHueMouseUp = () => {
    window.removeEventListener('mousemove', handleHueMouseMove);
    window.removeEventListener('mouseup', handleHueMouseUp);
  };

  const handleHueMove = (e) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const h = Math.round(x * 360);

    updateColor({ ...hsv, h });
  };

  const handleHexInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
      if (onChange) {
        onChange(val);
      }
    }
  };

  const handleHexInputBlur = () => {
    // Reset display text to match actual value if left invalid
    setInputText(value);
  };

  // Coordinates for the thumb on the 2D area
  const thumbX = `${hsv.s}%`;
  const thumbY = `${100 - hsv.v}%`;
  
  // Coordinates for the hue slider thumb
  const hueThumbX = `${(hsv.h / 360) * 100}%`;

  return (
    <div className="custom-color-picker" ref={containerRef}>
      <div 
        className="custom-color-picker__swatch-wrapper"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div 
          className="custom-color-picker__swatch" 
          style={{ backgroundColor: value }}
        />
        <span className="custom-color-picker__value">{value}</span>
      </div>

      {isOpen && (
        <div className="custom-color-picker__popover">
          {/* 2D Saturation/Brightness Color Area */}
          <div 
            className="custom-color-picker__area" 
            ref={colorAreaRef}
            onMouseDown={handleColorAreaMouseDown}
            style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
          >
            <div className="custom-color-picker__gradient-saturation" />
            <div className="custom-color-picker__gradient-value" />
            <div 
              className="custom-color-picker__thumb"
              style={{ left: thumbX, top: thumbY }}
            />
          </div>

          {/* Hue Slider */}
          <div className="custom-color-picker__slider-container">
            <div 
              className="custom-color-picker__hue-slider" 
              ref={hueSliderRef}
              onMouseDown={handleHueMouseDown}
            >
              <div 
                className="custom-color-picker__slider-thumb"
                style={{ left: hueThumbX }}
              />
            </div>
          </div>

          {/* Value Inputs */}
          <div className="custom-color-picker__inputs">
            <div className="custom-color-picker__input-group">
              <label>Color</label>
              <input 
                type="text" 
                value={inputText} 
                onChange={handleHexInputChange}
                onBlur={handleHexInputBlur}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
