document.addEventListener('DOMContentLoaded', () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const formatPrice = (n) => Math.round(n).toLocaleString('ru-RU');

  // ===== Шапка при скролле =====
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Мобильное меню =====
  const burger = $('#burger');
  const nav = $('#nav');
  const toggleMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach((link) => link.addEventListener('click', () => toggleMenu(false)));

  // ===== Анимация появления =====
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  // ===== Счётчики в первом экране =====
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatPrice(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    });
  });
  $$('[data-count]').forEach((el) => countObserver.observe(el));

  // ===== Калькулятор =====
  const TRACK_PRICE = 9500;   // ₽ за погонный метр магнитного трека со светильниками
  const SMART_PRICE = 45000; // ₽ за интеграцию с «умным домом»

  const area = $('#area');
  const track = $('#track');
  const smart = $('#smart');
  const chips = $$('#typeChips .chip');

  const updateRangeFill = (input) => {
    const p = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.background = `linear-gradient(90deg, var(--c-gold) ${p}%, var(--c-line) ${p}%)`;
  };

  const calculate = () => {
    const s = Number(area.value);
    const pricePerM = Number($('#typeChips .chip.is-active').dataset.price);

    let total = s * pricePerM + Number(track.value) * TRACK_PRICE;
    if (smart.checked) total += SMART_PRICE;

    $('#areaValue').textContent = s;
    $('#trackValue').textContent = track.value;
    $('#total').textContent = formatPrice(total);
    [area, track].forEach(updateRangeFill);
  };

  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    calculate();
  }));
  [area, track].forEach((el) => el.addEventListener('input', calculate));
  smart.addEventListener('change', calculate);
  calculate();

  // ===== Маска телефона =====
  const phone = $('#phone');
  phone.addEventListener('input', () => {
    let digits = phone.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    const parts = [digits.slice(1, 4), digits.slice(4, 7), digits.slice(7, 9), digits.slice(9, 11)];
    let out = '+7';
    if (parts[0]) out += ` (${parts[0]}`;
    if (parts[0].length === 3) out += ')';
    if (parts[1]) out += ` ${parts[1]}`;
    if (parts[2]) out += `-${parts[2]}`;
    if (parts[3]) out += `-${parts[3]}`;
    phone.value = out;
  });

  // ===== Форма заявки =====
  const form = $('#leadForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const phoneOk = phone.value.replace(/\D/g, '').length === 11;
    const nameOk = name.value.trim().length > 1;

    name.closest('.form__field').classList.toggle('is-error', !nameOk);
    phone.closest('.form__field').classList.toggle('is-error', !phoneOk);
    if (!nameOk || !phoneOk) return;

    // TODO: подключить отправку заявки (Telegram-бот / почта / CRM)
    console.log('Заявка:', Object.fromEntries(new FormData(form)));
    $('#formSuccess').hidden = false;
    form.reset();
  });

  // ===== Год в подвале =====
  $('#year').textContent = new Date().getFullYear();
});
