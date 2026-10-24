/**
 * OmniSport CRM - Script Principal
 * Tabs limpios para Módulos, Contador numérico, Formulario simplificado y Modal Legal
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Navegación móvil
  const menuBtn = document.getElementById("menu-btn");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link, .nav-btn");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
      });
    });
  }

  // 2. Contador animado para Hero
  const counters = document.querySelectorAll(".metric-num[data-count]");
  let hasAnimatedCounters = false;

  const animateCounters = () => {
    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-count");
      const duration = 1200;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(ease * target);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  const metricsSection = document.querySelector(".hero-metrics-bar");
  if (metricsSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedCounters) {
            hasAnimatedCounters = true;
            animateCounters();
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(metricsSection);
  } else {
    animateCounters();
  }

  // 3. SECCIÓN DE MÓDULOS: Pestañas (Tabs) Estables
  const tabBtns = document.querySelectorAll(".mod-tab-btn");
  const panels = document.querySelectorAll(".mod-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetIndex = btn.getAttribute("data-mod");

      tabBtns.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const activePanel = document.getElementById(`panel-${targetIndex}`);
      if (activePanel) {
        activePanel.classList.add("active");
      }
    });
  });

  // 4. Formulario de Contacto (Nombre, Teléfono, Email + Checkbox)
  const leadForm = document.getElementById("leadForm");
  const successAlert = document.getElementById("formSuccessAlert");
  const submitBtn = document.getElementById("submitBtn");

  if (leadForm) {
    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(leadForm);
      const leadData = Object.fromEntries(formData.entries());

      // Respaldo preventivo en LocalStorage
      try {
        const stored = JSON.parse(
          localStorage.getItem("omnisport_leads") || "[]",
        );
        stored.push({
          ...leadData,
          fecha: new Date().toISOString(),
        });
        localStorage.setItem("omnisport_leads", JSON.stringify(stored));
      } catch (err) {
        console.warn("No se pudo escribir en LocalStorage:", err);
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span>Guardando...</span>";
      }

      try {
        await fetch(leadForm.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });
      } catch (error) {
        console.log("Datos almacenados localmente de respaldo.");
      }

      if (submitBtn) submitBtn.style.display = "none";
      if (successAlert) successAlert.style.display = "block";
      leadForm.reset();
    });
  }

  // 5. Modal de Términos y Condiciones
  const modalBackdrop = document.getElementById("legalModalBackdrop");
  const openLegalBtn = document.getElementById("openLegalBtn");
  const footerLegalBtn = document.getElementById("footerLegalBtn");
  const closeLegalBtn = document.getElementById("closeLegalBtn");
  const confirmLegalBtn = document.getElementById("confirmLegalBtn");

  const openModal = () => {
    if (modalBackdrop) modalBackdrop.style.display = "flex";
  };

  const closeModal = () => {
    if (modalBackdrop) modalBackdrop.style.display = "none";
  };

  if (openLegalBtn) openLegalBtn.addEventListener("click", openModal);
  if (footerLegalBtn) footerLegalBtn.addEventListener("click", openModal);
  if (closeLegalBtn) closeLegalBtn.addEventListener("click", closeModal);
  if (confirmLegalBtn) confirmLegalBtn.addEventListener("click", closeModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }
});
