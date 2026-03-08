(function () {
  "use strict";

  var THEME_KEY = "tiger-site-theme";
  var PAGES = [
    { path: "01_intro/index.html", title: "Week 1: Introduction" },
    { path: "02_laser_cutting/index.html", title: "Week 2: 2D Design & Cutting" },
    { path: "03_Handtools_&_Electric_Motors/index.html", title: "Week 3: Electronics and Tools" },
    { path: "04_microcontroller_programming/index.html", title: "Week 4: Microcontroller Programming" },
    { path: "05_3D_Printing/index.html", title: "Week 5: 3D Design & Printing" },
    { path: "06_input_devices/index.html", title: "Week 6: Input Devices" },
    { path: "07_output_devices/index.html", title: "Week 7: Output Devices" },
    { path: "08_CNC_Milling_Molding_Casting/index.html", title: "Week 8: CNC, Molding, Casting" },
    { path: "09_Radio_WiFi_Bluetooth/index.html", title: "Week 9: ESP32 Communication" },
    { path: "10_Mashine_Building/index.html", title: "Week 10: Machine Building" },
    { path: "11_Wildcard/index.html", title: "Week 11: Wildcard" },
    { path: "Final_Project/index.html", title: "Final Project" }
  ];

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function initTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (e) {
      saved = null;
    }
    setTheme(saved || "dark");
  }

  function initThemeToggle() {
    var nav = document.querySelector(".site-nav");
    if (!nav) {
      return;
    }

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";

    function updateLabel() {
      var current = document.documentElement.getAttribute("data-theme") || "dark";
      btn.textContent = current === "dark" ? "Switch to Light" : "Switch to Dark";
      btn.setAttribute("aria-label", btn.textContent);
    }

    btn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") || "dark";
      var next = current === "dark" ? "light" : "dark";
      setTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        // ignore storage failures
      }
      updateLabel();
    });

    updateLabel();
    nav.appendChild(btn);
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function renderRawFallback(source, raw) {
    var pre = document.createElement("pre");
    pre.className = "markdown-fallback";
    pre.textContent = raw;
    source.replaceWith(pre);
    return pre;
  }

  function unwrapDeprecatedTags(root) {
    root.querySelectorAll("font").forEach(function (fontEl) {
      var parent = fontEl.parentNode;
      while (fontEl.firstChild) {
        parent.insertBefore(fontEl.firstChild, fontEl);
      }
      parent.removeChild(fontEl);
    });
  }

  function getCurrentPageIndex() {
    var path = window.location.pathname;
    for (var i = 0; i < PAGES.length; i += 1) {
      if (path.endsWith("/" + PAGES[i].path) || path.endsWith(PAGES[i].path)) {
        return i;
      }
    }
    return -1;
  }

  function relativePath(from, to) {
    var fromParts = from.split("/");
    var toParts = to.split("/");

    fromParts.pop();

    var i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
      i += 1;
    }

    var up = "";
    for (var j = i; j < fromParts.length; j += 1) {
      up += "../";
    }

    return up + toParts.slice(i).join("/");
  }

  function initProgressBar() {
    var header = document.querySelector(".site-header");
    if (!header) {
      return;
    }

    var bar = document.createElement("div");
    bar.className = "reading-progress";
    header.appendChild(bar);

    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var height = document.documentElement.scrollHeight - window.innerHeight;
      var progress = height > 0 ? Math.min(scrollTop / height, 1) : 0;
      bar.style.transform = "scaleX(" + progress + ")";
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function addHeadingAnchors(article) {
    var seen = new Set();
    var headings = article.querySelectorAll("h2, h3, h4");

    headings.forEach(function (heading) {
      var base = slugify(heading.textContent || "section");
      var id = base || "section";
      var n = 2;
      while (seen.has(id) || document.getElementById(id)) {
        id = base + "-" + n;
        n += 1;
      }
      seen.add(id);
      heading.id = id;

      var anchor = document.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = "#" + id;
      anchor.textContent = "#";
      anchor.setAttribute("aria-label", "Link to " + (heading.textContent || "section"));
      heading.appendChild(anchor);
    });

    return Array.prototype.slice.call(headings);
  }

  function buildToc(article, headings) {
    if (headings.length < 4) {
      return null;
    }

    var nav = document.createElement("nav");
    nav.className = "toc-panel reveal";
    nav.setAttribute("aria-label", "Table of contents");

    var h = document.createElement("h3");
    h.textContent = "On this page";
    nav.appendChild(h);

    var ul = document.createElement("ul");
    headings.forEach(function (heading) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + heading.id;
      a.textContent = heading.textContent.replace(/#$/, "").trim();
      a.dataset.target = heading.id;
      li.appendChild(a);
      ul.appendChild(li);
    });

    nav.appendChild(ul);

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = nav.querySelector('a[data-target="' + entry.target.id + '"]');
          if (link && entry.isIntersecting) {
            nav.querySelectorAll("a.active").forEach(function (x) {
              x.classList.remove("active");
            });
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0.01 }
    );

    headings.forEach(function (h2) {
      observer.observe(h2);
    });

    return nav;
  }

  function wrapContentWithToc(article, toc) {
    var wrapper = document.createElement("div");
    wrapper.className = "content-layout";

    article.parentNode.insertBefore(wrapper, article);
    if (toc) {
      wrapper.classList.add("has-toc");
      wrapper.appendChild(toc);
    }
    wrapper.appendChild(article);
  }

  function addPrevNext(article) {
    var currentIndex = getCurrentPageIndex();
    if (currentIndex === -1) {
      return;
    }

    var container = document.createElement("nav");
    container.className = "page-nav reveal";
    container.setAttribute("aria-label", "Page navigation");

    var prev = PAGES[currentIndex - 1];
    var next = PAGES[currentIndex + 1];

    if (prev) {
      var prevA = document.createElement("a");
      prevA.href = relativePath(PAGES[currentIndex].path, prev.path);
      prevA.innerHTML = "<small>Previous</small><span>" + prev.title + "</span>";
      container.appendChild(prevA);
    } else {
      var spacer = document.createElement("div");
      spacer.setAttribute("aria-hidden", "true");
      container.appendChild(spacer);
    }

    if (next) {
      var nextA = document.createElement("a");
      nextA.href = relativePath(PAGES[currentIndex].path, next.path);
      nextA.innerHTML = "<small>Next</small><span>" + next.title + "</span>";
      container.appendChild(nextA);
    }

    article.insertAdjacentElement("afterend", container);
  }

  function initLightbox(scope) {
    var images = scope.querySelectorAll("img");
    if (!images.length) {
      return;
    }

    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close image">×</button><img alt="Expanded image">';
    document.body.appendChild(lightbox);

    var lightboxImg = lightbox.querySelector("img");
    var closeBtn = lightbox.querySelector(".lightbox-close");

    function close() {
      lightbox.hidden = true;
      document.body.classList.remove("nav-open");
      lightboxImg.removeAttribute("src");
    }

    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) {
        close();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) {
        close();
      }
    });

    images.forEach(function (img) {
      if (!img.getAttribute("src") || img.closest("a")) {
        return;
      }
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        lightboxImg.src = img.getAttribute("src");
        lightboxImg.alt = img.getAttribute("alt") || "Expanded image";
        lightbox.hidden = false;
        document.body.classList.add("nav-open");
      });
    });
  }

  function initRevealAnimations() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) {
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initHomeFilters() {
    var search = document.getElementById("project-search");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".assignment-card[data-title]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var count = document.getElementById("results-count");
    var empty = document.getElementById("empty-state");

    if (!search || !cards.length) {
      return;
    }

    var activeFilter = "all";

    function apply() {
      var query = search.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.dataset.title || "").toLowerCase();
        var tags = (card.dataset.tags || "").toLowerCase();
        var matchesFilter = activeFilter === "all" || tags.indexOf(activeFilter) !== -1;
        var matchesQuery = !query || title.indexOf(query) !== -1 || tags.indexOf(query) !== -1;
        var show = matchesFilter && matchesQuery;

        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      count.textContent = visible + " project" + (visible === 1 ? "" : "s") + " shown";
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("active");
        });
        chip.classList.add("active");
        activeFilter = chip.dataset.filter || "all";
        apply();
      });
    });

    search.addEventListener("input", apply);
    apply();
  }

  function renderMarkdownIfNeeded() {
    var source = document.querySelector("xmp");
    if (!source) {
      return document.querySelector(".assignment-content") || null;
    }

    var raw = source.textContent || "";
    if (!raw.trim()) {
      return renderRawFallback(source, raw);
    }

    if (window.marked) {
      try {
        marked.setOptions({ gfm: true, breaks: true });
        var article = document.createElement("article");
        article.className = "assignment-content";
        article.innerHTML = marked.parse(raw);
        source.replaceWith(article);
        unwrapDeprecatedTags(article);

        article.querySelectorAll('a[href^="http"]').forEach(function (link) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        });

        return article;
      } catch (err) {
        return renderRawFallback(source, raw);
      }
    }

    return renderRawFallback(source, raw);
  }

  function initProjectPageEnhancements(article) {
    if (!article || !article.classList.contains("assignment-content")) {
      return;
    }

    var headings = addHeadingAnchors(article);
    var toc = buildToc(article, headings);
    wrapContentWithToc(article, toc);
    addPrevNext(article);
    initLightbox(article);
  }

  initTheme();

  document.addEventListener("DOMContentLoaded", function () {
    initThemeToggle();
    initProgressBar();

    var article = renderMarkdownIfNeeded();
    initProjectPageEnhancements(article);
    initHomeFilters();

    document.querySelectorAll(".assignment-card, .hero-panel, .featured-panel, .profile, .controls").forEach(function (el) {
      el.classList.add("reveal");
    });

    initRevealAnimations();
  });
})();
