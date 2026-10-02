/**
 * High-DPI Interactive Canvas Chart Engine
 * Renders smooth historical exchange rate curves with entrance animation and hover inspection
 */
class HistoricalChart {
  constructor(canvasId, tooltipId) {
    this.canvas = document.getElementById(canvasId);
    this.tooltip = document.getElementById(tooltipId);
    this.ctx = this.canvas.getContext('2d');
    this.dataPoints = [];
    this.stats = null;
    this.hoverIndex = -1;
    this.animationId = null;
    this.progress = 1;

    this.initEvents();
  }

  initEvents() {
    window.addEventListener('resize', () => {
      if (this.dataPoints.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.draw(rect.width, rect.height, 1);
      }
    });

    const handlePointerMove = (e) => {
      if (!this.dataPoints || this.dataPoints.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;

      const padding = { left: 60, right: 30 };
      const chartWidth = rect.width - padding.left - padding.right;
      const step = chartWidth / (this.dataPoints.length - 1);

      let nearestIdx = Math.round((x - padding.left) / step);
      nearestIdx = Math.max(0, Math.min(this.dataPoints.length - 1, nearestIdx));

      this.hoverIndex = nearestIdx;
      this.draw(rect.width, rect.height, 1);
      this.showTooltip(rect, nearestIdx);
    };

    const handlePointerLeave = () => {
      this.hoverIndex = -1;
      const rect = this.canvas.getBoundingClientRect();
      this.draw(rect.width, rect.height, 1);
      if (this.tooltip) {
        this.tooltip.style.display = 'none';
      }
    };

    this.canvas.addEventListener('mousemove', handlePointerMove);
    this.canvas.addEventListener('mouseleave', handlePointerLeave);
    this.canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
    this.canvas.addEventListener('touchend', handlePointerLeave);
  }

  showTooltip(rect, index) {
    const pt = this.dataPoints[index];
    if (!pt || !this.tooltip) return;

    this.tooltip.style.display = 'block';
    this.tooltip.innerHTML = `
      <div style="font-weight: 700; color: #94a3b8; font-size: 0.72rem; margin-bottom: 2px;">${pt.date}</div>
      <div style="font-weight: 800; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; color: #10b981;">
        ${pt.rate.toFixed(4)}
      </div>
    `;

    const padding = { left: 60, right: 30 };
    const chartWidth = rect.width - padding.left - padding.right;
    const step = chartWidth / (this.dataPoints.length - 1);
    const pointX = padding.left + index * step;

    this.tooltip.style.left = `${pointX}px`;
    this.tooltip.style.top = `35%`;
  }

  render(dataPoints, stats) {
    this.dataPoints = dataPoints;
    this.stats = stats;
    this.hoverIndex = -1;

    // Smooth Entrance Animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    const startTime = performance.now();
    const duration = 450; // ms

    const animate = (now) => {
      const elapsed = now - startTime;
      const linearProgress = Math.min(1, elapsed / duration);
      // Ease out cubic
      this.progress = 1 - Math.pow(1 - linearProgress, 3);

      const rect = this.canvas.getBoundingClientRect();
      this.draw(rect.width, rect.height, this.progress);

      if (linearProgress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.progress = 1;
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  draw(displayW, displayH, progress = 1) {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = displayW * dpr;
    this.canvas.height = displayH * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, displayW, displayH);

    if (!this.dataPoints || this.dataPoints.length < 2) return;

    const padding = { left: 60, right: 30, top: 30, bottom: 40 };
    const chartW = displayW - padding.left - padding.right;
    const chartH = displayH - padding.top - padding.bottom;

    const rates = this.dataPoints.map(p => p.rate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const rateRange = maxRate - minRate || 0.001;

    const bufferedMin = minRate - rateRange * 0.08;
    const bufferedMax = maxRate + rateRange * 0.08;
    const bufferedRange = bufferedMax - bufferedMin;

    const getX = (idx) => padding.left + (idx / (this.dataPoints.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - ((val - bufferedMin) / bufferedRange) * chartH;

    // 1. Gridlines & Y-axis labels
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#64748b' : '#94a3b8';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.fillStyle = textColor;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const stepVal = bufferedMin + (bufferedRange / ySteps) * i;
      const yPos = getY(stepVal);

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(displayW - padding.right, yPos);
      ctx.stroke();

      ctx.fillText(stepVal.toFixed(4), padding.left - 10, yPos + 4);
    }

    // 2. Dates along X-axis
    ctx.textAlign = 'center';
    const xLabelCount = Math.min(6, this.dataPoints.length);
    const xStepIdx = Math.floor((this.dataPoints.length - 1) / (xLabelCount - 1));

    for (let i = 0; i < this.dataPoints.length; i += xStepIdx) {
      const pt = this.dataPoints[i];
      const xPos = getX(i);
      ctx.fillText(pt.date.slice(5), xPos, displayH - 12);
    }

    // Clip to animation progress width
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, padding.left + chartW * progress, displayH);
    ctx.clip();

    // 3. Gradient Area below curve
    const areaGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    const isBullish = this.stats && this.stats.change_percent >= 0;
    const lineColor = isBullish ? '#10b981' : '#f43f5e';
    const gradColorStart = isBullish ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)';
    const gradColorEnd = isBullish ? 'rgba(16, 185, 129, 0.0)' : 'rgba(244, 63, 94, 0.0)';

    areaGrad.addColorStop(0, gradColorStart);
    areaGrad.addColorStop(1, gradColorEnd);

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(this.dataPoints[0].rate));

    for (let i = 0; i < this.dataPoints.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(this.dataPoints[i].rate);
      const x1 = getX(i + 1);
      const y1 = getY(this.dataPoints[i + 1].rate);
      const cpX = (x0 + x1) / 2;

      ctx.bezierCurveTo(cpX, y0, cpX, y1, x1, y1);
    }

    ctx.lineTo(getX(this.dataPoints.length - 1), padding.top + chartH);
    ctx.lineTo(getX(0), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // 4. Continuous stroke line
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(this.dataPoints[0].rate));

    for (let i = 0; i < this.dataPoints.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(this.dataPoints[i].rate);
      const x1 = getX(i + 1);
      const y1 = getY(this.dataPoints[i + 1].rate);
      const cpX = (x0 + x1) / 2;

      ctx.bezierCurveTo(cpX, y0, cpX, y1, x1, y1);
    }

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();

    // 5. Active Hover guideline & marker (only when progress is complete)
    if (progress >= 1 && this.hoverIndex >= 0 && this.hoverIndex < this.dataPoints.length) {
      const hX = getX(this.hoverIndex);
      const hY = getY(this.dataPoints[this.hoverIndex].rate);

      // Vertical dashed line
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)';
      ctx.moveTo(hX, padding.top);
      ctx.lineTo(hX, padding.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outer halo
      ctx.beginPath();
      ctx.arc(hX, hY, 8, 0, Math.PI * 2);
      ctx.fillStyle = isBullish ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(hX, hY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
