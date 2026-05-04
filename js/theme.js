const STORAGE_KEY = 'algolens_theme';

function getPreferredTheme() {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
}

function updateToggleLabel(toggle, theme) {
    if (!toggle) {
        return;
    }

    toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    toggle.querySelector('[data-theme-label]').textContent = theme === 'light' ? 'Light' : 'Dark';
}

function init() {
    const theme = getPreferredTheme();
    applyTheme(theme);

    const toggle = document.querySelector('[data-theme-toggle]');
    updateToggleLabel(toggle, theme);

    if (!toggle) {
        return;
    }

    toggle.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem(STORAGE_KEY, nextTheme);
        updateToggleLabel(toggle, nextTheme);
    });
}

export default { init };