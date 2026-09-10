// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in-view'));
}

// Access form -> delivered straight to the founder's inbox via FormSubmit
const accessForm = document.getElementById('access-form');
const formNote = document.getElementById('form-note');
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/santiago.varela1552006@gmail.com';

accessForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email-input').value.trim();
  const role = document.getElementById('role-input').value;

  if (!email) return;

  const submitBtn = accessForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  formNote.textContent = 'Sending...';

  fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email: email,
      role: role,
      _subject: 'Aurea: early access request',
      _template: 'table',
      _honey: ''
    })
  })
    .then((res) => {
      if (!res.ok) throw new Error('Request failed');
      formNote.textContent = "Thanks, that's sent straight to the founder. We'll be in touch.";
      accessForm.reset();
    })
    .catch(() => {
      formNote.textContent = `Something went wrong. Please email us directly at santiago.varela1552006@gmail.com`;
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
