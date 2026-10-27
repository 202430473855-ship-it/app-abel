const viewLinks = document.querySelectorAll('[data-view-link]');
const views = document.querySelectorAll('.view');
const navigationItems = document.querySelectorAll('.nav-item');
const profileForm = document.querySelector('#developer-form');
const profileName = document.querySelector('#developer-name');
const profileClass = document.querySelector('#developer-class');
const profileGrade = document.querySelector('#developer-grade');
const profileNamePreview = document.querySelector('#profile-name-preview');
const profileClassPreview = document.querySelector('#profile-class-preview');
const saveStatus = document.querySelector('#save-status');
const installButton = document.querySelector('#install-button');
let installPrompt;

function showView(name) {
  views.forEach((view) => {
    const active = view.id === `view-${name}`;
    view.hidden = !active;
    view.classList.toggle('active', active);
  });
  navigationItems.forEach((item) => {
    const active = item.dataset.viewLink === name;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  history.replaceState(null, '', `#${name}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

viewLinks.forEach((link) => {
  link.addEventListener('click', () => showView(link.dataset.viewLink));
});

function updateProfilePreview() {
  const name = profileName.value.trim();
  const className = profileClass.value.trim();
  const grade = profileGrade.value.trim();
  profileNamePreview.textContent = name || 'Seu nome';
  profileClassPreview.textContent = [className && `Turma ${className}`, grade].filter(Boolean).join(' · ') || 'Estudante do Abel';
}

try {
  const savedProfile = JSON.parse(localStorage.getItem('abel-developer-profile') || '{}');
  profileName.value = savedProfile.name || '';
  profileClass.value = savedProfile.class || '';
  profileGrade.value = savedProfile.grade || '';
} catch {
  localStorage.removeItem('abel-developer-profile');
}
updateProfilePreview();

[profileName, profileClass, profileGrade].forEach((input) => {
  input.addEventListener('input', updateProfilePreview);
});

profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const profile = {
    name: profileName.value.trim(),
    class: profileClass.value.trim(),
    grade: profileGrade.value.trim(),
  };
  try {
    localStorage.setItem('abel-developer-profile', JSON.stringify(profile));
    saveStatus.textContent = 'Perfil salvo neste dispositivo.';
  } catch {
    saveStatus.textContent = 'Não foi possível salvar. Verifique o armazenamento do navegador.';
  }
});

const initialView = window.location.hash.slice(1);
if (['inicio', 'escola', 'desenvolvedor'].includes(initialView)) showView(initialView);

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}