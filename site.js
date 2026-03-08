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

  function each(list, fn) {
    if (!list) {
      return;
    }
    for (var i = 0; i < list.length; i += 1) {
      fn(list[i], i);
    }
  }

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function endsWith(str, suffix) {
    if (!str || !suffix) {
      return false;
    }
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  function safe(fn) {
    try {
      fn();
    } catch (e) {
      // keep other features working even if one fails
    }
  }

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

    var btn = document.querySelector(".theme-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-toggle";
      nav.appendChild(btn);
    }

    function updateLabel() {
      var current = document.documentElement.getAttribute("data-theme") || "dark";
      var label = current === "dark" ? "Switch to Light" : "Switch to Dark";
      btn.textContent = label;
      btn.setAttribute("aria-label", label);
    }

    btn.onclick = function () {
      var current = document.documentElement.getAttribute("data-theme") || "dark";
      var next = current === "dark" ? "light" : "dark";
      setTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        // ignore storage failures
      }
      updateLabel();
    };

    updateLabel();
  }

  function slugify(text) {
    return (text || "section")
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
    source.parentNode.replaceChild(pre, source);
    return pre;
  }

  function unwrapDeprecatedTags(root) {
    each(root.querySelectorAll("font"), function (fontEl) {
      var parent = fontEl.parentNode;
      while (fontEl.firstChild) {
        parent.insertBefore(fontEl.firstChild, fontEl);
      }
      parent.removeChild(fontEl);
    });
  }

  function getCurrentPageIndex() {
    var path = window.location.pathname || "";
    for (var i = 0; i < PAGES.length; i += 1) {
      if (endsWith(path, "/" + PAGES[i].path) || endsWith(path, PAGES[i].path)) {
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
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var height = document.documentElement.scrollHeight - window.innerHeight;
      var progress = height > 0 ? Math.min(scrollTop / height, 1) : 0;
      bar.style.transform = "scaleX(" + progress + ")";
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function addHeadingAnchors(article) {
    var seen = {};
    var headings = toArray(article.querySelectorAll("h2, h3, h4"));

    each(headings, function (heading) {
      var base = slugify(heading.textContent || "section");
      var id = base || "section";
      var n = 2;
      while (seen[id] || document.getElementById(id)) {
        id = base + "-" + n;
        n += 1;
      }
      seen[id] = true;
      heading.id = id;

      var anchor = document.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = "#" + id;
      anchor.textContent = "#";
      anchor.setAttribute("aria-label", "Link to " + (heading.textContent || "section"));
      heading.appendChild(anchor);
    });

    return headings;
  }

  function buildToc(headings) {
    if (!headings || headings.length < 4) {
      return null;
    }

    var nav = document.createElement("nav");
    nav.className = "toc-panel reveal";
    nav.setAttribute("aria-label", "Table of contents");

    var h = document.createElement("h3");
    h.textContent = "On this page";
    nav.appendChild(h);

    var ul = document.createElement("ul");
    each(headings, function (heading) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + heading.id;
      a.textContent = (heading.textContent || "").replace(/#$/, "").trim();
      a.dataset.target = heading.id;
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.appendChild(ul);

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          each(entries, function (entry) {
            var link = nav.querySelector('a[data-target="' + entry.target.id + '"]');
            if (link && entry.isIntersecting) {
              each(nav.querySelectorAll("a.active"), function (x) {
                x.classList.remove("active");
              });
              link.classList.add("active");
            }
          });
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0.01 }
      );
      each(headings, function (x) {
        observer.observe(x);
      });
    }

    return nav;
  }

  function addPageHeadingIfMissing(article) {
    if (article.classList.contains("assignment-content") && article.querySelector("h1")) {
      return;
    }
    var idx = getCurrentPageIndex();
    if (idx === -1) {
      return;
    }
    var h1 = document.createElement("h1");
    h1.textContent = PAGES[idx].title;
    if (article.classList.contains("assignment-content")) {
      article.insertBefore(h1, article.firstChild);
    } else if (article.classList.contains("markdown-fallback")) {
      article.parentNode.insertBefore(h1, article);
    }
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
    }

    if (next) {
      var nextA = document.createElement("a");
      nextA.href = relativePath(PAGES[currentIndex].path, next.path);
      nextA.innerHTML = "<small>Next</small><span>" + next.title + "</span>";
      container.appendChild(nextA);
    }

    if (container.children.length) {
      article.insertAdjacentElement("afterend", container);
    }
  }

  function initLightbox(scope) {
    var images = toArray(scope.querySelectorAll("img"));
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

    each(images, function (img) {
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
    var items = toArray(document.querySelectorAll(".reveal"));
    if (!items.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      each(items, function (el) {
        el.classList.add("reveal-in");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        each(entries, function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    each(items, function (item) {
      observer.observe(item);
    });
  }

  function initHomeFilters() {
    var search = document.getElementById("project-search");
    var cards = toArray(document.querySelectorAll(".assignment-card[data-title]"));
    var chips = toArray(document.querySelectorAll(".filter-chip"));
    var count = document.getElementById("results-count");
    var empty = document.getElementById("empty-state");

    if (!search || !cards.length) {
      return;
    }

    var activeFilter = "all";

    function apply() {
      var query = (search.value || "").trim().toLowerCase();
      var visible = 0;

      each(cards, function (card) {
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

      if (count) {
        count.textContent = visible + " project" + (visible === 1 ? "" : "s") + " shown";
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    each(chips, function (chip) {
      chip.addEventListener("click", function () {
        each(chips, function (c) {
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

  function parseMarkdown(raw) {
    if (!window.marked) {
      return null;
    }
    try {
      if (typeof window.marked.parse === "function") {
        window.marked.setOptions && window.marked.setOptions({ gfm: true, breaks: true });
        return window.marked.parse(raw);
      }
      if (typeof window.marked === "function") {
        return window.marked(raw);
      }
    } catch (e) {
      return null;
    }
    return null;
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

    var html = parseMarkdown(raw);
    if (html) {
      var article = document.createElement("article");
      article.className = "assignment-content";
      article.innerHTML = html;
      source.parentNode.replaceChild(article, source);
      unwrapDeprecatedTags(article);

      each(article.querySelectorAll('a[href^="http"]'), function (link) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      });

      return article;
    }

    return renderRawFallback(source, raw);
  }

  function initProjectPageEnhancements(article) {
    if (!article) {
      return;
    }

    if (article.classList.contains("markdown-fallback")) {
      addPageHeadingIfMissing(article);
      return;
    }
    if (!article.classList.contains("assignment-content")) {
      return;
    }

    addPageHeadingIfMissing(article);
    var headings = addHeadingAnchors(article);
    var toc = buildToc(headings);
    wrapContentWithToc(article, toc);
    addPrevNext(article);
    initLightbox(article);
  }

  initTheme();

  document.addEventListener("DOMContentLoaded", function () {
    safe(initThemeToggle);
    safe(initProgressBar);

    var article = null;
    safe(function () {
      article = renderMarkdownIfNeeded();
    });

    safe(function () {
      initProjectPageEnhancements(article);
    });

    safe(initHomeFilters);

    each(document.querySelectorAll(".assignment-card, .hero-panel, .featured-panel, .profile, .controls, .toc-panel"), function (el) {
      el.classList.add("reveal");
    });

    safe(initRevealAnimations);
  });
})();
