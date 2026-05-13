const titles = {
  home: ["Привет, Кщщщ! 👋", "Готов к новым знаниям сегодня?"],
  profile: ["Мой профиль", "Твой личный центр развития"],
  laboratory: ["Лаборатория", "Практика, эксперименты и симуляции по каждому предмету"],
  library: ["Библиотека", "Все учебные материалы в одном месте"],
  simulations: ["Симуляции", "Интерактивные 3D-симуляции и виртуальные эксперименты"],
  subjects: ["Мои предметы", "Прогресс по всем направлениям обучения"],
  tasks: ["Задания", "Твои сегодняшние цели и тесты"],
  notes: ["Мои заметки", "Конспекты, идеи и сохраненные материалы"],
  stats: ["Статистика", "Динамика обучения и достижения"],
  assistant: ["AI-помощник", "Персональный ассистент для учебы"]
};

const navButtons = document.querySelectorAll("[data-page]");
const pages = document.querySelectorAll(".page");
const pageTitle = document.querySelector("#page-title");
const pageSubtitle = document.querySelector("#page-subtitle");

function setPage(pageId) {
  const page = document.getElementById(pageId) ? pageId : "home";
  pages.forEach(section => section.classList.toggle("active", section.id === page));
  navButtons.forEach(button => button.classList.toggle("active", button.dataset.page === page));
  pageTitle.textContent = titles[page][0];
  pageSubtitle.textContent = titles[page][1];
  window.history.replaceState(null, "", `#${page}`);
  animateMeters();
}

navButtons.forEach(button => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});

function animateMeters() {
  document.querySelectorAll(".page.active .meter i, .page.active .xp span").forEach(bar => {
    const width = bar.style.getPropertyValue("--w") || "0%";
    bar.style.width = "0%";
    requestAnimationFrame(() => {
      bar.style.transition = "width 900ms cubic-bezier(.22,1,.36,1)";
      bar.style.width = width;
    });
  });
}

document.querySelectorAll(".glass").forEach(card => {
  card.addEventListener("pointermove", event => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  });
});

document.querySelectorAll(".ask").forEach(form => {
  const input = form.querySelector("input");
  const button = form.querySelector("button");
  button.addEventListener("click", () => {
    if (!input.value.trim()) return;
    button.textContent = "✓";
    input.value = "";
    setTimeout(() => button.textContent = "➤", 900);
  });
});

const initialPage = window.location.hash.replace("#", "");
setPage(initialPage || "home");
