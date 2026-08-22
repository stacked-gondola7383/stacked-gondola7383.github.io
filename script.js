async function initPortfolio() {
  try {
    const res = await fetch("./data.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`data.json returned ${res.status}`);
    const db = await res.json();

    // HERO
    const hero = document.querySelector(".hero-copy");
    if (hero) {
      hero.querySelector(".eyebrow").textContent = db.hero.eyebrow;
      hero.querySelector("h1").innerHTML =
        `${escapeHtml(db.hero.headline)} <span>${escapeHtml(db.hero.headlineAccent)}</span>`;
      hero.querySelector(".hero-text").textContent = db.hero.description;

      const stats = hero.querySelector(".quick-stats");
      stats.innerHTML = db.hero.stats.map(s => `
        <div><strong>${escapeHtml(s.value)}</strong><span>${escapeHtml(s.label)}</span></div>
      `).join("");
    }

    // ABOUT
    const about = document.querySelector("#about");
    if (about) {
      const big = about.querySelector(".big-copy");
      big.innerHTML = `${escapeHtml(db.about.headline)} <em>${escapeHtml(db.about.headlineAccent)}</em>`;

      const aboutText = about.querySelector(".about-text");
      aboutText.innerHTML = db.about.paragraphs
        .map(p => `<p>${escapeHtml(p)}</p>`)
        .join("");
    }

    // EXPERIENCE
    const experience = document.querySelector("#experience");
    if (experience) {
      const timeline = experience.querySelector(".timeline");
      timeline.innerHTML = db.experience.map(item => `
        <article class="timeline-item">
          <div class="timeline-date">${escapeHtml(item.date)}</div>
          <div class="timeline-line"><span></span></div>
          <div class="timeline-content">
            <h3>${escapeHtml(item.role)}</h3>
            <h4>${escapeHtml(item.company)}</h4>
            <p>${escapeHtml(item.description)}</p>
            <div class="tags">${renderTags(item.tags)}</div>
          </div>
        </article>
      `).join("");
    }

    // PROJECTS
    const projects = document.querySelector("#projects");
    if (projects) {
      const grid = projects.querySelector(".project-grid");
      grid.innerHTML = db.projects.map(project => `
        <article class="project-card${project.featured ? " featured" : ""}">
          <div class="project-number">${escapeHtml(project.number)}</div>
          <div class="project-body">
            <p class="project-type">${escapeHtml(project.type)}</p>
            <h3>${escapeHtml(project.name)}</h3>
            <p>${escapeHtml(project.description)}</p>
            <div class="tags">${renderTags(project.tags)}</div>
          </div>
          <a class="project-arrow" href="${safeUrl(project.url)}" aria-label="Open project">↗</a>
        </article>
      `).join("");
    }

    // SKILLS
    const skills = document.querySelector("#skills");
    if (skills) {
      const groups = skills.querySelector(".skill-groups");
      groups.innerHTML = db.skills.map(group => `
        <div class="skill-group">
          <h3>${escapeHtml(group.name)}</h3>
          <p>${escapeHtml(group.skills)}</p>
        </div>
      `).join("");
    }

    // PRINCIPLES
    const principles = document.querySelector(".principles");
    if (principles) {
      const grid = principles.querySelector(".principles-grid");
      grid.innerHTML = db.principles.map(item => `
        <div class="principle">
          <span>${escapeHtml(item.number)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </div>
      `).join("");
    }

    // CONTACT
    const contact = document.querySelector("#contact");
    if (contact) {
      const links = contact.querySelectorAll(".contact-actions a");
      links[0].href = `mailto:${db.contact.email}`;
      links[1].href = db.contact.github;
      links[2].href = db.contact.linkedin;
    }

    // FOOTER
    const footer = document.querySelector("footer");
    if (footer) {
      footer.children[0].textContent = db.footer.copyright;
      footer.children[1].textContent = db.footer.text;
    }

    initAnimations();
  } catch (err) {
    console.error("Portfolio DB error:", err);
  }
}

function renderTags(tags = []) {
  return tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(url) {
  const value = String(url || "#");
  return value.startsWith("#") || value.startsWith("https://") || value.startsWith("http://")
    ? value
    : "#";
}

function initAnimations() {
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("open");
      menuBtn.textContent = nav.classList.contains("open") ? "✕" : "☰";
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuBtn.textContent = "☰";
      });
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".project-card, .timeline-item, .principle, .skill-group")
    .forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = "opacity .65s ease, transform .65s ease";
      observer.observe(el);
    });
}

initPortfolio();
