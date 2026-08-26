/* =========================================================
   What's in Your Bag? — Unit 3A | Mr. Sheyhaki
   Page 1: Bag · Page 2: Wallet
   ========================================================= */

(function () {
  "use strict";

  const GAME_ID = "starter-3a-whats-in-your-bag";

  const PAGES = [
    {
      id: "bag",
      title: "What's in your bag?",
      closedLabel: "BAG",
      openLabel: "OPEN BAG",
      hintClosed: "Tap the bag to open it.",
      hintOpen: "Look at the items. Write a sentence starting with “I have…”",
      modeClass: "",
      items: [
        { id: "notebook", label: "NOTEBOOK", name: "notebook", count: 1, aliases: ["notebook", "a notebook"], img: "item-notebook.png" },
        { id: "pencil", label: "PENCIL", name: "pencil", count: 2, aliases: ["pencil", "pencils", "two pencils", "2 pencils"], imgs: ["item-pencil1.png", "item-pencil2.png"] },
        { id: "book", label: "BOOK", name: "book", count: 1, aliases: ["book", "a book"], img: "item-book.png" },
        { id: "pen", label: "PEN", name: "pen", count: 2, aliases: ["pen", "pens", "two pens", "2 pens"], imgs: ["item-pen1.png", "item-pen2.png"] },
        { id: "phone", label: "PHONE", name: "phone", count: 1, aliases: ["phone", "a phone", "cell phone", "a cell phone", "mobile", "a mobile"], img: "item-phone.png" },
      ],
    },
    {
      id: "wallet",
      title: "What's in your wallet?",
      closedLabel: "WALLET",
      openLabel: "OPEN WALLET",
      hintClosed: "Tap the wallet to open it.",
      hintOpen: "Look at the items. Write a sentence starting with “I have…”",
      modeClass: "wallet-mode",
      items: [
        {
          id: "credit-card",
          label: "CARD",
          name: "credit card",
          count: 2,
          aliases: [
            "credit card", "credit cards", "a credit card",
            "two credit cards", "2 credit cards",
            "card", "cards", "two cards", "2 cards",
            "debit card", "debit cards",
          ],
          imgs: ["item-card1.png", "item-card2.png"],
        },
        {
          id: "id-card",
          label: "ID",
          name: "ID card",
          count: 1,
          aliases: [
            "id card", "an id card", "a id card",
            "identity card", "an identity card",
            "id", "an id", "identification",
          ],
          img: "item-id.png",
        },
        {
          id: "money",
          label: "MONEY",
          name: "money",
          count: 1,
          aliases: [
            "money", "some money",
            "cash", "some cash",
            "dollars", "dollar bills", "bills",
            "100 dollars", "dollars",
          ],
          img: "item-money.png",
        },
      ],
    },
  ];

  // Even circle; start slightly left of top so nothing sits under the hint
  function itemPositions(count) {
    const r = 46;
    const start = -140; // degrees
    const step = 360 / count;
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push({ angle: start + i * step, r: r });
    }
    return out;
  }

  const $ = function (id) {
    return document.getElementById(id);
  };

  const bagBtn = $("bagBtn");
  const bagLabel = $("bagLabel");
  const itemsRing = $("itemsRing");
  const answerArea = $("answerArea");
  const answerInput = $("answerInput");
  const checkBtn = $("checkBtn");
  const feedback = $("feedback");
  const hint = $("hint");
  const tryAgainBtn = $("tryAgainBtn");
  const gamePanel = $("gamePanel");
  const midPanel = $("midPanel");
  const successPanel = $("successPanel");
  const pageTitle = $("pageTitle");
  const midModel = $("midModel");
  const midMsg = $("midMsg");
  const nextPageBtn = $("nextPageBtn");
  const playAgainBtn = $("playAgainBtn");
  const allModels = $("allModels");
  const artBag = document.querySelector(".art-bag");
  const artWallet = document.querySelector(".art-wallet");

  let pageIndex = 0;
  let isOpen = false;
  const completedModels = [];

  function currentPage() {
    return PAGES[pageIndex];
  }

  function updateDots() {
    document.querySelectorAll(".page-dots .dot").forEach(function (dot, i) {
      dot.classList.toggle("active", i === pageIndex);
      dot.classList.toggle("done", i < pageIndex);
    });
  }

  function setContainerArt(page) {
    bagBtn.classList.remove("wallet-mode");
    if (page.modeClass) bagBtn.classList.add(page.modeClass);
    if (artBag) artBag.hidden = page.id === "wallet";
    if (artWallet) artWallet.hidden = page.id !== "wallet";
  }

  function buildItems() {
    const page = currentPage();
    itemsRing.innerHTML = "";
    const bubbles = [];
    page.items.forEach(function (item) {
      for (let i = 0; i < item.count; i++) bubbles.push(item);
    });

    const positions = itemPositions(bubbles.length);
    bubbles.forEach(function (item, index) {
      const pos = positions[index];
      const el = document.createElement("div");
      el.className = "item";
      el.dataset.id = item.id;

      const rad = (pos.angle * Math.PI) / 180;
      // percent of scene (items-ring) — not of the item itself
      const left = 50 + Math.cos(rad) * pos.r;
      const top = 50 + Math.sin(rad) * pos.r;

      var imgSrc = item.img || null;
      if (item.imgs && item.imgs.length) {
        // cycle through provided images for multiples
        var occ = bubbles.slice(0, index + 1).filter(function (b) { return b.id === item.id; }).length - 1;
        imgSrc = item.imgs[occ % item.imgs.length];
      }
      var bubbleInner = imgSrc
        ? '<img class="item-img" src="' + imgSrc + '" alt="' + item.name + '">'
        : item.label;
      el.innerHTML =
        '<div class="item-bubble' + (imgSrc ? ' has-img' : '') + '">' +
        bubbleInner +
        '</div><span class="item-name">' +
        item.name +
        "</span>";

      el.dataset.left = left;
      el.dataset.top = top;
      // start centered (closed bag)
      el.style.left = "50%";
      el.style.top = "50%";
      itemsRing.appendChild(el);
    });
  }

  function loadPage(index) {
    pageIndex = index;
    isOpen = false;
    const page = currentPage();

    pageTitle.textContent = page.title;
    bagLabel.textContent = page.closedLabel;
    hint.textContent = page.hintClosed;
    bagBtn.disabled = false;
    bagBtn.classList.remove("open");
    bagBtn.setAttribute("aria-label", "Open the " + page.id);
    setContainerArt(page);

    answerArea.hidden = true;
    answerInput.value = "";
    answerInput.classList.remove("invalid", "valid");
    setFeedback("");

    buildItems();
    updateDots();

    gamePanel.hidden = false;
    midPanel.hidden = true;
    successPanel.hidden = true;
  }

  function openContainer() {
    if (isOpen) {
      closeContainer();
      return;
    }
    isOpen = true;
    const page = currentPage();

    bagBtn.classList.add("open");
    bagBtn.setAttribute("aria-label", "Close the " + page.id);
    bagLabel.textContent = page.openLabel;
    hint.textContent = page.hintOpen;
    bagBtn.disabled = false;

    const nodes = itemsRing.querySelectorAll(".item");
    nodes.forEach(function (el, i) {
      el.classList.remove("hiding");
      setTimeout(function () {
        el.classList.add("show");
        el.style.left = el.dataset.left + "%";
        el.style.top = el.dataset.top + "%";
        // start float after fly-out finishes
        setTimeout(function () {
          el.classList.add("arrived");
        }, 550);
      }, 80 + i * 70);
    });

    setTimeout(function () {
      answerArea.hidden = false;
      answerInput.focus();
    }, 80 + nodes.length * 70 + 200);
  }

  function closeContainer() {
    if (!isOpen) return;
    isOpen = false;
    const page = currentPage();

    // Hide answer first
    answerArea.hidden = true;
    answerInput.value = "";
    answerInput.classList.remove("invalid", "valid");
    setFeedback("");

    const nodes = itemsRing.querySelectorAll(".item");
    // reverse order for a nice "suck back in" feel
    const list = Array.prototype.slice.call(nodes).reverse();
    list.forEach(function (el, i) {
      el.classList.remove("arrived");
      setTimeout(function () {
        el.classList.add("hiding");
        el.style.left = "50%";
        el.style.top = "50%";
      }, 40 + i * 55);
    });

    // After items are back, switch bag visual
    const total = 40 + list.length * 55 + 400;
    setTimeout(function () {
      bagBtn.classList.remove("open");
      bagBtn.setAttribute("aria-label", "Open the " + page.id);
      bagLabel.textContent = page.closedLabel;
      hint.textContent = page.hintClosed;
      // fully reset item classes for next open
      nodes.forEach(function (el) {
        el.classList.remove("show", "hiding", "arrived");
        el.style.left = "50%";
        el.style.top = "50%";
      });
    }, total);
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.,!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function startsWithIHave(text) {
    const n = normalize(text);
    return /^(i have|i've|i have got|i've got)\b/.test(n);
  }

  function stripLeadIn(text) {
    return normalize(text)
      .replace(/^(i have got|i've got|i have|i've)\s+/, "")
      .trim();
  }

  function numberWord(n) {
    const map = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five" };
    return map[n] || String(n);
  }

  function checkItems(rest, items) {
    const missing = [];
    items.forEach(function (item) {
      let ok = false;
      const name = normalize(item.name);
      const plural = name.endsWith("s") ? name : name + "s";

      if (item.count > 1) {
        if (rest.indexOf(plural) !== -1) ok = true;
        [String(item.count), numberWord(item.count)].forEach(function (w) {
          if (rest.indexOf(w + " " + plural) !== -1) ok = true;
          if (rest.indexOf(w + " " + name) !== -1) ok = true;
        });
      }
      item.aliases.forEach(function (a) {
        if (rest.indexOf(normalize(a)) !== -1) ok = true;
      });
      if (rest.indexOf(name) !== -1) ok = true;

      if (!ok) {
        missing.push(item.count > 1 ? (name.endsWith("s") ? name : name + "s") : name);
      }
    });
    return { ok: missing.length === 0, missing: missing };
  }

  function modelAnswer(page) {
    const parts = page.items.map(function (item) {
      if (item.count === 1) {
        // special articles
        if (item.id === "money") return "some money";
        if (item.id === "id-card") return "an ID card";
        const article = /^[aeiou]/i.test(item.name) ? "an" : "a";
        return article + " " + item.name;
      }
      const plural = item.name.endsWith("s") ? item.name : item.name + "s";
      return numberWord(item.count) + " " + plural;
    });
    if (parts.length === 1) return "I have " + parts[0] + ".";
    const last = parts.pop();
    return "I have " + parts.join(", ") + ", and " + last + ".";
  }

  function setFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className = "feedback" + (type ? " " + type : "");
  }

  function onCheck() {
    const page = currentPage();
    const raw = answerInput.value;
    answerInput.classList.remove("invalid", "valid");

    if (!raw.trim()) {
      answerInput.classList.add("invalid");
      setFeedback("Please write a sentence.", "error");
      return;
    }
    if (!startsWithIHave(raw)) {
      answerInput.classList.add("invalid");
      setFeedback('Start with “I have…” (for example: I have a phone.)', "warn");
      return;
    }

    const rest = stripLeadIn(raw);
    if (!rest) {
      answerInput.classList.add("invalid");
      setFeedback("Write the items after “I have…”.", "error");
      return;
    }

    const result = checkItems(rest, page.items);
    if (!result.ok) {
      answerInput.classList.add("invalid");
      setFeedback("Almost! Missing: " + result.missing.join(", ") + ".", "error");
      return;
    }

    answerInput.classList.add("valid");
    setFeedback("Perfect!", "ok");

    const model = modelAnswer(page);
    completedModels[pageIndex] = model;

    setTimeout(function () {
      if (pageIndex < PAGES.length - 1) {
        midMsg.textContent = "Next up: the wallet…";
        midModel.textContent = model;
        // hide the Next button — auto-advance
        if (nextPageBtn) nextPageBtn.hidden = true;
        gamePanel.hidden = true;
        midPanel.hidden = false;
        // brief celebration then go to wallet
        setTimeout(function () {
          if (nextPageBtn) nextPageBtn.hidden = false;
          loadPage(pageIndex + 1);
        }, 1600);
      } else {
        finishAll();
      }
    }, 450);
  }

  function finishAll() {
    try {
      if (window.LAStars) {
        window.LAStars.recordPlay(GAME_ID);
        window.LAStars.saveFromAccuracy(GAME_ID, 100);
      }
    } catch (e) {}

    allModels.innerHTML = "";
    completedModels.forEach(function (m, i) {
      if (!m) return;
      const p = document.createElement("p");
      p.className = "model";
      p.textContent = (i === 0 ? "Bag: " : "Wallet: ") + m;
      allModels.appendChild(p);
    });

    gamePanel.hidden = true;
    midPanel.hidden = true;
    successPanel.hidden = false;
    updateDots();
    document.querySelectorAll(".page-dots .dot").forEach(function (d) {
      d.classList.add("done");
      d.classList.remove("active");
    });
  }

  function resetGame() {
    completedModels.length = 0;
    loadPage(0);
  }

  // Events
  bagBtn.addEventListener("click", openContainer);
  checkBtn.addEventListener("click", onCheck);
  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      onCheck();
    }
  });
  tryAgainBtn.addEventListener("click", function () {
    loadPage(pageIndex);
  });
  nextPageBtn.addEventListener("click", function () {
    loadPage(pageIndex + 1);
  });
  playAgainBtn.addEventListener("click", resetGame);

  // Init
  loadPage(0);
})();
