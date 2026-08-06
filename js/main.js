(() => {
  const content = window.BIRTHDAY_CONTENT || {};
  const recipient = document.querySelector("[data-recipient]");
  const signature = document.querySelector("[data-signature]");
  const letter = document.querySelector("[data-letter]");
  const playlistLink = document.querySelector("[data-playlist-link]");
  const notesContainer = document.querySelector("[data-song-notes]");

  if (recipient && content.recipient) {
    recipient.textContent = content.recipient;
  }

  if (signature && content.signature) {
    signature.textContent = content.signature;
  }

  if (letter && Array.isArray(content.letter)) {
    letter.replaceChildren();

    content.letter.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      letter.appendChild(p);
    });
  }

  if (playlistLink && content.youtubePlaylistId) {
    playlistLink.href =
      `https://www.youtube.com/playlist?list=${encodeURIComponent(content.youtubePlaylistId)}`;
  }

  if (
    notesContainer &&
    Array.isArray(content.songNotes) &&
    content.songNotes.length
  ) {
    notesContainer.replaceChildren();

    content.songNotes.forEach((song, index) => {
      const card = document.createElement("article");
      card.className = "song-note";
      card.style.setProperty("--reveal-delay", `${Math.min(index * 70, 350)}ms`);

      const number = document.createElement("span");
      number.className = "song-note__number";
      number.textContent = String(index + 1).padStart(2, "0");

      const title = document.createElement("h4");
      title.className = "song-note__title";
      title.textContent = song.title || `Song ${index + 1}`;

      const artist = document.createElement("span");
      artist.className = "song-note__artist";
      artist.textContent = song.artist || "";

      const note = document.createElement("p");
      note.className = "song-note__text";
      note.textContent = song.note || "";

      card.append(number, title, artist, note);
      notesContainer.appendChild(card);
    });
  }

  const soundButton = document.querySelector("[data-sound-toggle]");
  const soundLabel = soundButton?.querySelector("span");
  let soundEnabled = false;

  const makeSound = (frequency = 560, duration = 0.07) => {
    if (!soundEnabled) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gain.gain.value = 0.03;

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + duration
      );
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.info("Tiny sounds unavailable:", error);
    }
  };

  soundButton?.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundButton.setAttribute("aria-pressed", String(soundEnabled));

    if (soundLabel) {
      soundLabel.textContent = `tiny sounds: ${soundEnabled ? "on" : "off"}`;
    }

    if (soundEnabled) makeSound(720, 0.09);
  });

  const letterReveal = document.querySelector("[data-letter-reveal]");
  const letterToggle = document.querySelector("[data-letter-toggle]");
  const letterContent = document.querySelector("[data-letter-content]");
  const letterClose = document.querySelector("[data-letter-close]");
  const envelopeHint = document.querySelector("[data-envelope-hint]");

  const syncOpenLetterHeight = () => {
    if (!letterReveal?.classList.contains("is-open") || !letterContent) return;
    letterContent.style.maxHeight = `${letterContent.scrollHeight}px`;
  };

  const setLetterOpen = (shouldOpen) => {
    if (!letterReveal || !letterToggle || !letterContent) return;

    letterReveal.classList.toggle("is-open", shouldOpen);
    letterToggle.setAttribute("aria-expanded", String(shouldOpen));
    letterContent.setAttribute("aria-hidden", String(!shouldOpen));

    if (envelopeHint) {
      envelopeHint.textContent = shouldOpen ? "your letter is open" : "press to open";
    }

    if (shouldOpen) {
      letterContent.style.maxHeight = `${letterContent.scrollHeight}px`;
      makeSound(690, 0.09);
    } else {
      letterContent.style.maxHeight = "0px";
      makeSound(520, 0.08);
    }
  };

  letterToggle?.addEventListener("click", () => {
    const shouldOpen = !letterReveal?.classList.contains("is-open");
    setLetterOpen(shouldOpen);
  });

  letterClose?.addEventListener("click", () => {
    setLetterOpen(false);
    letterToggle?.focus({ preventScroll: true });
    letterToggle?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  window.addEventListener("resize", syncOpenLetterHeight);
  document.fonts?.ready.then(syncOpenLetterHeight);

  const backgroundMagic = document.querySelector("[data-background-magic]");
  const magicSymbols = ["♡", "✦", "✧", "⋆", "♥"];

  if (backgroundMagic) {
    for (let i = 0; i < 28; i += 1) {
      const piece = document.createElement("span");
      piece.className = "magic-piece";
      piece.textContent = magicSymbols[i % magicSymbols.length];
      piece.style.left = `${2 + Math.random() * 96}%`;
      piece.style.top = `${2 + Math.random() * 96}%`;
      piece.style.fontSize = `${0.8 + Math.random() * 1.7}rem`;
      piece.style.setProperty("--duration", `${6 + Math.random() * 8}s`);
      piece.style.setProperty("--delay", `${-Math.random() * 12}s`);
      backgroundMagic.appendChild(piece);
    }
  }

  const revealCards = document.querySelectorAll(".song-note:not(.song-note--empty)");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealCards.forEach((card) => card.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    revealCards.forEach((card) => observer.observe(card));
  }

  const confettiLayer = document.querySelector("[data-confetti]");
  const secretButton = document.querySelector("[data-secret-button]");
  const colors = ["#c06a7f", "#f2cbd7", "#fff8f3", "#944257", "#e8b8c7"];

  const throwConfetti = (amount = 80) => {
    if (!confettiLayer) return;

    for (let i = 0; i < amount; i += 1) {
      const piece = document.createElement("span");
      const isHeart = i % 7 === 0;

      piece.className = isHeart
        ? "confetti-piece confetti-piece--heart"
        : "confetti-piece";

      if (isHeart) {
        piece.textContent = "♡";
      } else {
        piece.style.background =
          colors[Math.floor(Math.random() * colors.length)];
      }

      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * 0.65}s`;
      piece.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
      piece.style.transform = `rotate(${Math.random() * 180}deg)`;

      confettiLayer.appendChild(piece);
      window.setTimeout(() => piece.remove(), 4700);
    }

    makeSound(880, 0.12);
  };

  secretButton?.addEventListener("click", () => throwConfetti(70));

  window.addEventListener("load", () => {
    window.setTimeout(() => throwConfetti(95), 350);
  });
})();
