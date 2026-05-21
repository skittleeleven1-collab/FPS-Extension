(function () {
  // Prevent duplicate execution on the same tab
  if (document.getElementById("fps-root-wrap")) return;

  // 1. Create Base Elements
  const rootWrap = document.createElement("div");
  rootWrap.id = "fps-root-wrap";

  rootWrap.innerHTML = `
    <div id="fps-card">
      <span id="fps-dot"></span>
      <span id="fps-value">00</span>
      <span id="fps-label">FPS</span>
    </div>
  `;
  document.body.appendChild(rootWrap);

  // 2. Inject Compact Stylesheet
  const style = document.createElement("style");
  style.textContent = `
    #fps-root-wrap {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 999999;
      pointer-events: none;
      user-select: none;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    #fps-card {
      display: flex; 
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(10, 12, 18, 0.6);
      backdrop-filter: blur(12px); 
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    #fps-dot {
      width: 6px;
      height: 6px;
      background-color: #00f2fe; 
      border-radius: 50%;
      box-shadow: 0 0 10px #00f2fe;
      animation: fps-pulse 1s infinite ease-in-out;
      transition: background-color 0.15s, box-shadow 0.15s;
    }

    #fps-value { 
      color: #ffffff; 
      font-weight: 800; 
      line-height: 1; 
      text-align: right;
      font-size: 16px; 
      min-width: 22px; 
      letter-spacing: -0.02em; 
    }

    #fps-label { 
      color: rgba(255, 255, 255, 0.4); 
      text-transform: uppercase; 
      font-weight: 700;
      font-size: 9px; 
      letter-spacing: 0.08em; 
      margin-top: 1px;
    }

    @keyframes fps-pulse {
      0%, 100% { opacity: 0.5; transform: scale(0.95); }
      50% { opacity: 1; transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);

  // 3. Ultra-Fast Performance Core Logic
  const fpsValue = document.getElementById("fps-value");
  const fpsCard = document.getElementById("fps-card");
  const fpsDot = document.getElementById("fps-dot");
  
  let lastTime = performance.now();
  
  // Controls sample history size. Higher numbers = smoother text, lower numbers = raw real-time speed.
  const frameSampleCount = 10; 
  const frameTimes = [];
  let framePtr = 0;
  let frameSum = 0;

  // Rate limit the UI layout updates slightly so your monitor can physically display it without lag
  let lastUiUpdate = 0;

  function updateFPS() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Build the rolling frame time history buffer
    if (frameTimes.length < frameSampleCount) {
      frameTimes.push(deltaTime);
      frameSum += deltaTime;
    } else {
      frameSum -= frameTimes[framePtr];
      frameTimes[framePtr] = deltaTime;
      frameSum += deltaTime;
      framePtr = (framePtr + 1) % frameSampleCount;
    }

    // Update numbers instantly every few frames (approx. 20-30 times per second)
    if (currentTime - lastUiUpdate >= 40) { 
      const avgDelta = frameSum / frameTimes.length;
      const fps = Math.round(1000 / avgDelta);
      
      fpsValue.innerText = fps;

      // Real-time responsive accent colors
      let accent = "#00f2fe"; 
      if (fps < 30) accent = "#ff0055"; 
      else if (fps < 50) accent = "#ff9f00"; 
      
      fpsDot.style.backgroundColor = accent;
      fpsDot.style.boxShadow = `0 0 10px ${accent}`;
      fpsCard.style.borderColor = `rgba(${hexToRgb(accent)}, 0.25)`;
      fpsCard.style.boxShadow = `0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 0 10px rgba(${hexToRgb(accent)}, 0.08)`;
      
      lastUiUpdate = currentTime;
    }

    requestAnimationFrame(updateFPS);
  }

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
  }

  requestAnimationFrame(updateFPS);
})();
