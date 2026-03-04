const body = document.body;

const endpoints = {
  contentUrl: body.dataset.contentUrl,
  projectsUrl: body.dataset.projectsUrl,
  contactUrl: body.dataset.contactUrl,
  csrfUrl: body.dataset.csrfUrl,
};

const selectors = {
  heroTitle: document.querySelector("#hero-title"),
  heroSubtitle: document.querySelector("#hero-subtitle"),
  heroFocus: document.querySelector("#hero-focus"),
  heroLocation: document.querySelector("#hero-location"),
  heroEmail: document.querySelector("#hero-email"),
  aboutText: document.querySelector("#about-text"),
  socialLinks: document.querySelector("#social-links"),
  skillsGrid: document.querySelector("#skills-grid"),
  projectsGrid: document.querySelector("#projects-grid"),
  year: document.querySelector("#year"),
  contactForm: document.querySelector("#contact-form"),
  contactStatus: document.querySelector("#contact-status"),
  nav: document.querySelector(".nav"),
  navLinks: document.querySelectorAll(".nav__link"),
  navToggle: document.querySelector(".nav__toggle"),
  navPanel: document.querySelector("#nav-panel"),
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fetchJson = async (url) => {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};

const updateYear = () => {
  if (selectors.year) {
    selectors.year.textContent = String(new Date().getFullYear());
  }
};

const setActiveLink = (id) => {
  selectors.navLinks.forEach((link) => {
    const isMatch = link.getAttribute("href") === `#${id}`;
    link.setAttribute("aria-current", isMatch ? "true" : "false");
  });
};

const setupActiveNavigation = () => {
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  if (!sections.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-20% 0px -35% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
};

const setupMobileNavigation = () => {
  if (!selectors.nav || !selectors.navToggle || !selectors.navPanel) {
    return;
  }

  const closeMenu = () => {
    selectors.nav.classList.remove("is-open");
    selectors.navToggle.setAttribute("aria-expanded", "false");
  };

  selectors.navToggle.addEventListener("click", () => {
    const isExpanded = selectors.navToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
      return;
    }

    selectors.nav.classList.add("is-open");
    selectors.navToggle.setAttribute("aria-expanded", "true");
  });

  selectors.navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!selectors.nav.classList.contains("is-open")) {
      return;
    }

    if (!selectors.nav.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  const mediaQuery = window.matchMedia("(min-width: 641px)");
  mediaQuery.addEventListener("change", (event) => {
    if (event.matches) {
      closeMenu();
    }
  });
};

const renderSocialLinks = (links) => {
  if (!selectors.socialLinks) {
    return;
  }

  selectors.socialLinks.innerHTML = "";
  links.forEach((item) => {
    const listItem = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = item.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = item.label;
    listItem.appendChild(anchor);
    selectors.socialLinks.appendChild(listItem);
  });
};

const renderSkills = (skills) => {
  if (!selectors.skillsGrid) {
    return;
  }

  selectors.skillsGrid.innerHTML = "";
  skills.forEach((group) => {
    const card = document.createElement("article");
    card.className = "skill-card";

    const title = document.createElement("h3");
    title.className = "skill-card__title";
    title.textContent = group.category;

    const chipWrapper = document.createElement("div");
    chipWrapper.className = "skill-card__chips";
    group.items.forEach((skill) => {
      const chip = document.createElement("span");
      chip.className = "skill-chip";
      chip.textContent = skill;
      chipWrapper.appendChild(chip);
    });

    card.appendChild(title);
    card.appendChild(chipWrapper);
    selectors.skillsGrid.appendChild(card);
  });
};

const renderProjectCard = (project) => {
  const card = document.createElement("article");
  card.className = "project-card";

  const title = document.createElement("h3");
  title.className = "project-card__title";
  title.textContent = project.title;

  const description = document.createElement("p");
  description.className = "project-card__description";
  description.textContent = project.description;

  const stack = document.createElement("div");
  stack.className = "project-card__stack";
  project.tech_stack.forEach((tech) => {
    const badge = document.createElement("span");
    badge.className = "skill-chip";
    badge.textContent = tech;
    stack.appendChild(badge);
  });

  const links = document.createElement("div");
  links.className = "project-card__links";

  const liveLink = document.createElement("a");
  liveLink.href = project.live_url || "#";
  liveLink.textContent = "Live";
  liveLink.className = "button button--secondary";
  if (project.live_url) {
    liveLink.target = "_blank";
    liveLink.rel = "noopener noreferrer";
  } else {
    liveLink.setAttribute("aria-disabled", "true");
    liveLink.classList.add("is-disabled");
    liveLink.tabIndex = -1;
  }

  const githubLink = document.createElement("a");
  githubLink.href = project.github_url || "#";
  githubLink.textContent = "GitHub";
  githubLink.className = "button button--secondary";
  if (project.github_url) {
    githubLink.target = "_blank";
    githubLink.rel = "noopener noreferrer";
  } else {
    githubLink.setAttribute("aria-disabled", "true");
    githubLink.classList.add("is-disabled");
    githubLink.tabIndex = -1;
  }

  links.appendChild(liveLink);
  links.appendChild(githubLink);

  card.appendChild(title);
  card.appendChild(stack);
  card.appendChild(description);
  card.appendChild(links);

  return card;
};

const loadSiteContent = async () => {
  const content = await fetchJson(endpoints.contentUrl);

  if (selectors.heroTitle) {
    selectors.heroTitle.textContent = content.displayName;
  }
  if (selectors.heroSubtitle) {
    selectors.heroSubtitle.textContent = content.heroTagline;
  }
  if (selectors.heroFocus) {
    selectors.heroFocus.textContent = content.heroFocus;
  }
  if (selectors.heroLocation) {
    selectors.heroLocation.textContent = content.location;
  }
  if (selectors.heroEmail) {
    selectors.heroEmail.href = `mailto:${content.publicEmail}`;
    selectors.heroEmail.textContent = content.publicEmail;
  }
  if (selectors.aboutText) {
    selectors.aboutText.textContent = content.about;
  }

  renderSocialLinks(content.socialLinks || []);
  renderSkills(content.skills || []);
};

const loadProjects = async () => {
  if (!selectors.projectsGrid) {
    return;
  }

  selectors.projectsGrid.innerHTML = "<p>Loading projects...</p>";
  try {
    const projects = await fetchJson(endpoints.projectsUrl);
    selectors.projectsGrid.innerHTML = "";

    if (!projects.length) {
      selectors.projectsGrid.innerHTML = "<p>No featured projects available yet.</p>";
      return;
    }

    projects.forEach((project) => {
      selectors.projectsGrid.appendChild(renderProjectCard(project));
    });
  } catch (error) {
    selectors.projectsGrid.innerHTML = "<p>Unable to load projects right now.</p>";
  }
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return "";
};

const ensureCsrfToken = async () => {
  await fetch(endpoints.csrfUrl, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });
};

const clearErrors = () => {
  document.querySelectorAll(".contact-form__error").forEach((errorNode) => {
    errorNode.textContent = "";
  });
};

const renderErrors = (errors) => {
  Object.entries(errors).forEach(([field, message]) => {
    const errorNode = document.querySelector(`[data-error-for="${field}"]`);
    if (errorNode) {
      errorNode.textContent = message;
    }
  });
};

const validateFormData = (data) => {
  const errors = {};

  if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }
  if (!emailPattern.test(data.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (data.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
};

const setLoadingState = (isLoading) => {
  if (!selectors.contactForm) {
    return;
  }

  selectors.contactForm.classList.toggle("is-loading", isLoading);
  const submitButton = selectors.contactForm.querySelector(".contact-form__submit");
  if (submitButton) {
    submitButton.disabled = isLoading;
  }
};

const setStatus = (message, type) => {
  if (!selectors.contactStatus) {
    return;
  }

  selectors.contactStatus.textContent = message;
  selectors.contactStatus.classList.remove("is-success", "is-error", "is-warning");
  if (type) {
    selectors.contactStatus.classList.add(type);
  }
};

const setupContactForm = () => {
  if (!selectors.contactForm) {
    return;
  }

  selectors.contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    setStatus("", "");

    const formData = new FormData(selectors.contactForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    const errors = validateFormData(payload);
    if (Object.keys(errors).length > 0) {
      renderErrors(errors);
      return;
    }

    setLoadingState(true);
    try {
      await ensureCsrfToken();
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(endpoints.contactUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          setStatus("Security token expired. Refresh this page and try again.", "is-error");
          return;
        }

        const detail = data.detail || "Unable to submit form right now.";
        const isSavedButEmailFailed = detail.toLowerCase().includes("message saved");
        if (isSavedButEmailFailed) {
          selectors.contactForm.reset();
          setStatus(detail, "is-warning");
          return;
        }

        setStatus(detail, "is-error");
        return;
      }

      selectors.contactForm.reset();
      setStatus("Message sent successfully.", "is-success");
    } catch (error) {
      setStatus("An unexpected error occurred. Please try again.", "is-error");
    } finally {
      setLoadingState(false);
    }
  });
};

const initialize = async () => {
  updateYear();
  setupMobileNavigation();
  setupActiveNavigation();
  setupContactForm();

  try {
    await Promise.all([loadSiteContent(), loadProjects(), ensureCsrfToken()]);
  } catch (error) {
    setStatus("Unable to load all dynamic content.", "is-error");
  }
};

initialize();
