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

// Access form -> opens a prefilled email to the founder
const accessForm = document.getElementById('access-form');
const formNote = document.getElementById('form-note');

accessForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email-input').value.trim();
  const role = document.getElementById('role-input').value;

  if (!email) return;

  const subject = encodeURIComponent('Áurea — Early access request');
  const body = encodeURIComponent(
    `Contact email: ${email}\nRole: ${role}\n\n(Sent from the Áurea landing page)`
  );
  window.location.href = `mailto:santiago.varela1552006@gmail.com?subject=${subject}&body=${body}`;

  formNote.textContent = "Thanks — your email client should open with a prefilled message. We'll be in touch.";
  accessForm.reset();
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
