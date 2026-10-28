/**
 * OmniSport CRM - Ruleta Interactiva de Stickers
 * Incluye: Audio nativo (Web Audio API), Confeti Canvas y Lógica Anti-Trampas (localStorage)
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. CONFIGURACIÓN CON TUS STICKERS REALES IMPRESOS
  const segments = [
    {
      label: "EMMAC Vence Mañana",
      fullTitle: "El EMMAC vence mañana",
      color: "#0284c7",
      icon: "📋",
      textColor: "#ffffff",
      desc: "Reclamá la credencial médica oficial EMMAC",
    },
    {
      label: "It Works On My Machine",
      fullTitle: "It works on my machine",
      color: "#ea580c",
      icon: "🔥",
      textColor: "#ffffff",
      desc: "Reclamá el meme del perro en llamas",
    },
    {
      label: "100% Activo, 0% Moroso",
      fullTitle: "100% Activo, 0% Moroso",
      color: "#10b981",
      icon: "⚽",
      textColor: "#ffffff",
      desc: "Reclamá la pelota de fútbol OmniSport",
    },
    {
      label: "Me Da Amsieda",
      fullTitle: "Me da Amsieda OmniSport",
      color: "#8b5cf6",
      icon: "🐕",
      textColor: "#ffffff",
      desc: "Reclamá el perrito Cheems con amsieda",
    },
    {
      label: "Basta de Planillas",
      fullTitle: "Basta de planillas de papel",
      color: "#0369a1",
      icon: "📄",
      textColor: "#ffffff",
      desc: "Reclamá la libreta tachada contra el papel",
    },
    {
      label: "¡Pack x2 a Elección!",
      fullTitle: "Premio Doble: 2 stickers a elección",
      color: "#f59e0b",
      icon: "⚡",
      textColor: "#ffffff",
      desc: "¡Premio x2! Elegí cualquier par de stickers disponibles en la mesa",
    },
    {
      label: "Mate & Gestión",
      fullTitle: "Mate & Gestión",
      color: "#0d9488",
      icon: "🧉",
      textColor: "#ffffff",
      desc: "Reclamá el gatito abrigado tomando mate",
    },
    {
      label: "Sin Café No Hay Deploy",
      fullTitle: "Sin café no hay deploy",
      color: "#475569",
      icon: "☕",
      textColor: "#ffffff",
      desc: "Reclamá el pingüino o gatito con café",
    },
    {
      label: "Descuento Hermanos",
      fullTitle: "Hermanos x3 = Descuento Infinito",
      color: "#ec4899",
      icon: "💸",
      textColor: "#ffffff",
      desc: "Reclamá la billetera con alas del motor financiero",
    },
    {
      label: "Clean Code",
      fullTitle: "Clean Code",
      color: "#06b6d4",
      icon: "🧼",
      textColor: "#ffffff",
      desc: "Reclamá el jabón de código limpio",
    },
    {
      label: "Todo Bajo Control",
      fullTitle: "Todo tu club bajo control",
      color: "#1e293b",
      icon: "⬡",
      textColor: "#ffffff",
      desc: "Reclamá el logo oficial OmniSport",
    },
    {
      label: "A Elección Libre",
      fullTitle: "Sticker a elección",
      color: "#e11d48",
      icon: "🎁",
      textColor: "#ffffff",
      desc: "Elegí libremente tu diseño favorito entre los disponibles en la mesa",
    },
  ];

  const canvas = document.getElementById("wheelCanvas");
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spinBtn");
  const spinCenterBtn = document.getElementById("spinCenterBtn");
  const pointer = document.getElementById("wheelPointer");

  const gameView = document.getElementById("gameView");
  const ticketView = document.getElementById("ticketView");
  const voucherPrize = document.getElementById("voucherPrize");
  const voucherCode = document.getElementById("voucherCode");
  const voucherIcon = document.getElementById("voucherIcon");
  const voucherTime = document.getElementById("voucherTime");
  const adminResetTrigger = document.getElementById("adminResetTrigger");

  let currentAngle = 0;
  let isSpinning = false;
  const numSegments = segments.length;
  const arcSize = (2 * Math.PI) / numSegments;

  // 2. SISTEMA DE AUDIO SINTETIZADO (Sin archivos externos)
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    },
    playTick() {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        150,
        this.ctx.currentTime + 0.04,
      );
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    },
    playWin() {
      if (!this.ctx) return;
      const notes = [261.63, 329.63, 392.0, 523.25]; // Acorde mayor
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.1);
        gain.gain.linearRampToValueAtTime(
          0.2,
          this.ctx.currentTime + idx * 0.1 + 0.05,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.ctx.currentTime + idx * 0.1 + 0.5,
        );
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.1);
        osc.stop(this.ctx.currentTime + idx * 0.1 + 0.5);
      });
    },
  };

  // 3. DIBUJO DE LA RULETA
  const drawWheel = () => {
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSegments; i++) {
      const angle = currentAngle + i * arcSize;
      ctx.beginPath();
      ctx.fillStyle = segments[i].color;
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius - 4, angle, angle + arcSize);
      ctx.lineTo(radius, radius);
      ctx.fill();

      // Borde divisorio sutil
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto e Icono
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = segments[i].textColor;
      ctx.font = "bold 9.5px Inter, sans-serif";

      // Icono y Texto
      const text = `${segments[i].icon} ${segments[i].label}`;
      ctx.fillText(text, radius - 24, 4);
      ctx.restore();
    }
  };

  drawWheel();

  // 4. ANIMACIÓN DE GIRO
  const spin = () => {
    if (isSpinning) return;
    AudioEngine.init();
    isSpinning = true;
    spinBtn.disabled = true;

    // Número de vueltas (entre 5 y 8 vueltas completas) + ángulo aleatorio
    const totalRotation = (5 + Math.random() * 3) * 2 * Math.PI;
    const duration = 4500; // 4.5 segundos
    const startAngle = currentAngle;
    const startTime = performance.now();
    let lastTickIndex = -1;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing out cubic (deceleración realista)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      currentAngle = startAngle + totalRotation * easeOut;
      drawWheel();

      // Detección de paso de pines para el sonido Ticking
      const currentSegmentIndex =
        Math.floor(((currentAngle % (2 * Math.PI)) + 2 * Math.PI) / arcSize) %
        numSegments;

      if (currentSegmentIndex !== lastTickIndex) {
        AudioEngine.playTick();
        if (pointer) {
          pointer.classList.add("tick");
          setTimeout(() => pointer.classList.remove("tick"), 50);
        }
        lastTickIndex = currentSegmentIndex;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        finalizeSpin();
      }
    };

    requestAnimationFrame(animate);
  };

  // 5. DETERMINAR GANADOR Y SALVAGUARDAR EN LOCALSTORAGE
  const finalizeSpin = () => {
    isSpinning = false;

    // La flecha está en el tope superior (3*PI / 2 radianes)
    const normalizedAngle =
      (2 * Math.PI - (currentAngle % (2 * Math.PI)) + (3 * Math.PI) / 2) %
      (2 * Math.PI);
    const winningIndex = Math.floor(normalizedAngle / arcSize) % numSegments;
    const winner = segments[winningIndex];

    if (winner.isRetry) {
      alert("¡Tenés un giro extra! Probá suerte de nuevo.");
      spinBtn.disabled = false;
      return;
    }

    // Código de verificación único
    const randomCode = "#OMNI-" + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} hs`;

    // Guardado anti-trampas
    const prizeRecord = {
      prize: winner.fullTitle,
      icon: winner.icon,
      code: randomCode,
      time: timeString,
    };

    try {
      localStorage.setItem(
        "omnisport_sticker_claimed",
        JSON.stringify(prizeRecord),
      );
    } catch (e) {
      console.warn("Storage no disponible");
    }

    AudioEngine.playWin();
    triggerConfetti();
    setTimeout(() => showVoucher(prizeRecord), 600);
  };

  // 6. MOSTRAR EL VOUCHER
  const showVoucher = (record) => {
    if (voucherPrize) voucherPrize.textContent = record.prize;
    if (voucherIcon) voucherIcon.textContent = record.icon;
    if (voucherCode) voucherCode.textContent = record.code;
    if (voucherTime) voucherTime.textContent = record.time;

    gameView.style.display = "none";
    ticketView.style.display = "block";
  };

  // 7. CHEQUEO ANTI-TRAMPA AL CARGAR (Si ya giró, no vuelve a girar)
  const checkClaimedPrize = () => {
    try {
      const saved = localStorage.getItem("omnisport_sticker_claimed");
      if (saved) {
        const record = JSON.parse(saved);
        showVoucher(record);
      }
    } catch (e) {}
  };

  checkClaimedPrize();

  spinBtn.addEventListener("click", spin);
  spinCenterBtn.addEventListener("click", spin);

  // 8. RESET SECRETO PARA EL STAND (Tocar el logo 5 veces seguidas)
  let clickCount = 0;
  let clickTimer = null;

  if (adminResetTrigger) {
    adminResetTrigger.addEventListener("click", () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 1500);

      if (clickCount >= 5) {
        if (confirm("¿Resetear ruleta para permitir otro tiro de prueba?")) {
          localStorage.removeItem("omnisport_sticker_claimed");
          location.reload();
        }
        clickCount = 0;
      }
    });
  }

  // 9. MOTOR NATIVO DE CONFETI
  function triggerConfetti() {
    const c = document.getElementById("confettiCanvas");
    if (!c) return;
    const cctx = c.getContext("2d");
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    const particles = [];
    const colors = [
      "#0284c7",
      "#38bdf8",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
    ];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: c.width / 2,
        y: c.height / 2,
        r: Math.random() * 6 + 3,
        dx: (Math.random() - 0.5) * 14,
        dy: (Math.random() - 0.7) * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10,
      });
    }

    let frames = 0;
    const renderConfetti = () => {
      cctx.clearRect(0, 0, c.width, c.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.35; // Gravedad
        cctx.fillStyle = p.color;
        cctx.beginPath();
        cctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        cctx.fill();
      });

      frames++;
      if (frames < 120) {
        requestAnimationFrame(renderConfetti);
      } else {
        cctx.clearRect(0, 0, c.width, c.height);
      }
    };
    renderConfetti();
  }
});
