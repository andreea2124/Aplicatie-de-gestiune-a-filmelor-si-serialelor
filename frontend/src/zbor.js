// Animația de la adăugare: un mic bilet „zboară” de la butonul apăsat până la numărul de titluri
// de lângă linkul My List din bara de sus, iar ținta pulsează la sosire.
// E doar decor: nu blochează nimic și nu rulează dacă utilizatorul a cerut mai puțină mișcare.
export function zboara(dela, text) {
  if (!dela || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const tinta = document.getElementById("nav-lista");
  if (!tinta) return;

  const a = dela.getBoundingClientRect();
  const b = tinta.getBoundingClientRect();
  const bilet = document.createElement("div");
  bilet.className = "flyer";
  bilet.textContent = `🎟 ${text}`;
  bilet.style.left = `${a.left}px`;
  bilet.style.top = `${a.top}px`;
  document.body.append(bilet);

  const dx = b.left - a.left;
  const dy = b.top - a.top;
  const zbor = bilet.animate(
    [
      { transform: "translate(0, 0) rotate(0)" },
      { transform: `translate(${dx / 2}px, ${dy / 2 - 80}px) rotate(-8deg)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.5) rotate(4deg)`, opacity: 0.2 },
    ],
    { duration: 750, easing: "cubic-bezier(.4, 0, .2, 1)" },
  );
  zbor.onfinish = () => {
    bilet.remove();
    tinta.classList.remove("bump");
    void tinta.offsetWidth; // repornește animația dacă se adaugă repede mai multe titluri
    tinta.classList.add("bump");
  };
}
