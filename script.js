/* =========================================================
   Everyday Performance — landing page behaviour
   ========================================================= */

/*
  FORM DESTINATION — set this before going live.
  Any endpoint that accepts a POST of form data works, for example:
    - Formspree:  "https://formspree.io/f/xxxxxxx"
    - Zapier / Make webhook (then forward to Google Sheets, email, your CRM, GoHighLevel, etc.)
  Leave empty to run in demo mode (shows the success message, logs the data to the console).
*/
const FORM_ENDPOINT = "";

(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Capture ad attribution from the URL ---------- */
  const params = new URLSearchParams(window.location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"].forEach(function (key) {
    const field = document.querySelector('input[name="' + key + '"]');
    if (field && params.get(key)) field.value = params.get(key);
  });

  /* ---------- Sticky mobile CTA: show after the hero, hide when the form is on screen ---------- */
  const sticky = document.querySelector(".sticky-cta");
  const hero = document.querySelector(".hero");
  const enquire = document.getElementById("enquire");
  if (sticky && hero && enquire && "IntersectionObserver" in window) {
    let heroVisible = true;
    let formVisible = false;
    const update = function () {
      sticky.classList.toggle("is-visible", !heroVisible && !formVisible);
    };
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting; update();
    }, { threshold: 0.05 }).observe(hero);
    new IntersectionObserver(function (entries) {
      formVisible = entries[0].isIntersecting; update();
    }, { threshold: 0 }).observe(enquire);
  }

  /* ---------- Gentle reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll(
    ".checklist li, .feature, .journey__step, .tcard, .reframe__col, .offer, .faq details"
  );
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  /* ---------- Track CTA clicks (useful for seeing which button converts) ---------- */
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    el.addEventListener("click", function () {
      track("trackCustom", "CTAClick", { location: el.getAttribute("data-cta") });
    });
  });

  /* ---------- Lead form ---------- */
  const form = document.getElementById("lead-form");
  if (!form) return;

  const body = form.querySelector(".lead-form__body");
  const success = form.querySelector(".lead-form__success");
  const formError = form.querySelector(".form-error");
  let started = false;

  form.addEventListener("input", function () {
    if (!started) { started = true; track("trackCustom", "FormStart"); }
  }, { once: true });

  const validators = {
    first_name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your first name."; },
    phone: function (v) {
      const digits = v.replace(/[^\d]/g, "");
      return digits.length >= 10 && digits.length <= 14 ? "" : "Please enter a valid mobile number so we can reach you.";
    },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."; }
  };

  function setError(input, errId, message) {
    const el = document.getElementById(errId);
    if (el) el.textContent = message;
    if (input) {
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (message) input.setAttribute("aria-describedby", errId);
      else input.removeAttribute("aria-describedby");
    }
    return !message;
  }

  function validate() {
    let firstInvalid = null;
    const nameEl = form.elements.first_name;
    const phoneEl = form.elements.phone;
    const emailEl = form.elements.email;

    if (!setError(nameEl, "f-name-err", validators.first_name(nameEl.value))) firstInvalid = firstInvalid || nameEl;
    if (!setError(phoneEl, "f-phone-err", validators.phone(phoneEl.value))) firstInvalid = firstInvalid || phoneEl;
    if (!setError(emailEl, "f-email-err", validators.email(emailEl.value))) firstInvalid = firstInvalid || emailEl;

    const situation = form.querySelector('input[name="situation"]:checked');
    const firstRadio = form.querySelector('input[name="situation"]');
    if (!setError(null, "f-situation-err", situation ? "" : "Please choose the option that fits best.")) firstInvalid = firstInvalid || firstRadio;

    const consent = form.elements.consent;
    if (!setError(consent, "f-consent-err", consent.checked ? "" : "Please tick this box so we can get in touch.")) firstInvalid = firstInvalid || consent;

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  // Clear an error as soon as the user fixes it
  ["first_name", "phone", "email"].forEach(function (name) {
    const input = form.elements[name];
    const errId = { first_name: "f-name-err", phone: "f-phone-err", email: "f-email-err" }[name];
    input.addEventListener("blur", function () {
      if (input.value) setError(input, errId, validators[name](input.value));
    });
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") setError(input, errId, validators[name](input.value));
    });
  });
  form.querySelectorAll('input[name="situation"]').forEach(function (r) {
    r.addEventListener("change", function () { setError(null, "f-situation-err", ""); });
  });
  form.elements.consent.addEventListener("change", function (e) {
    if (e.target.checked) setError(e.target, "f-consent-err", "");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formError.hidden = true;

    // Honeypot: bots fill hidden fields; quietly pretend it worked
    if (form.elements.company.value) { showSuccess(""); return; }
    if (!validate()) return;

    const data = new FormData(form);
    data.delete("company");
    data.append("page", window.location.href.split("#")[0]);
    data.append("submitted_at", new Date().toISOString());

    form.classList.add("is-loading");

    const send = FORM_ENDPOINT
      ? fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); })
      : new Promise(function (resolve) {
          console.info("[EDP demo mode] FORM_ENDPOINT is not set. Lead data:", Object.fromEntries(data));
          setTimeout(resolve, 700);
        });

    send
      .then(function () {
        track("track", "Lead", { content_name: "6-Week Foundation Programme" });
        showSuccess(form.elements.first_name.value.trim());
      })
      .catch(function (err) {
        console.error(err);
        formError.hidden = false;
      })
      .finally(function () { form.classList.remove("is-loading"); });
  });

  function showSuccess(firstName) {
    if (firstName) {
      const nameSlot = success.querySelector("[data-first-name]");
      if (nameSlot) nameSlot.textContent = firstName;
    }
    body.hidden = true;
    success.hidden = false;
    success.focus();
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- Meta Pixel helper (no-op if the Pixel isn't installed) ---------- */
  function track(method, event, props) {
    try { if (typeof window.fbq === "function") window.fbq(method, event, props || {}); } catch (_) { /* ignore */ }
  }
})();
