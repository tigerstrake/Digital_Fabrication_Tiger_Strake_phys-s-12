(function () {
  "use strict";

  function unwrapDeprecatedTags(root) {
    root.querySelectorAll("font").forEach(function (fontEl) {
      var parent = fontEl.parentNode;
      while (fontEl.firstChild) {
        parent.insertBefore(fontEl.firstChild, fontEl);
      }
      parent.removeChild(fontEl);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var source = document.querySelector("xmp");
    if (!source) {
      return;
    }

    document.body.classList.add("markdown-page");

    var raw = source.textContent || "";

    if (window.marked && raw.trim().length > 0) {
      marked.setOptions({
        gfm: true,
        breaks: true,
        mangle: false,
        headerIds: false
      });

      var article = document.createElement("article");
      article.className = "assignment-content";
      article.innerHTML = marked.parse(raw);
      source.replaceWith(article);
      unwrapDeprecatedTags(article);

      article.querySelectorAll('a[href^="http"]').forEach(function (link) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      });

      return;
    }

    // Fallback: always show raw content if markdown parser is unavailable.
    source.className = "markdown-fallback";
    source.style.display = "block";
  });
})();
