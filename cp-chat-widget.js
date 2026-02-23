/* Carpinoy Sticky Chat Widget (v0.2 - Sales AI wired)
   - Requires Supabase Edge Functions:
     POST {startUrl} -> { thread_id }
     POST {sendUrl}  -> { reply, handoff? }
*/
(function () {
  const DEFAULTS = {
    startUrl: window.CP_CHAT_START_URL || "",
    sendUrl: window.CP_CHAT_SEND_URL || "",
    handoffUrl: "https://m.me/carpinoylogistics",
    requireLead: true,
    noticeText:
      "We ask for your name and phone so we can remember your inquiry for follow-ups even if the chat closes.",
    avatarUrl: window.CP_CHAT_AVATAR_URL || "/cp-support-avatar-96.png",
    storage: {
      sessionId: "cp_webchat_session_id_v1",
      threadId: "cp_webchat_thread_id_v1",
      lead: "cp_webchat_lead_v1",
      messages: "cp_webchat_messages_v1"
    }
  };

  const CFG = Object.assign({}, DEFAULTS, (window.CP_CHAT_CONFIG || {}));
  if (!CFG.startUrl || !CFG.sendUrl) {
    // Still render UI; will fallback to handoff.
    console.warn("[cp-chat] startUrl/sendUrl not set; using handoff-only mode.");
  }

  function uid() {
    return (
      "cp_" +
      Math.random().toString(16).slice(2) +
      Date.now().toString(16)
    );
  }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (_) {}
  }
  function safeDel(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  function getSessionId() {
    let v = safeGet(CFG.storage.sessionId);
    if (!v) { v = uid(); safeSet(CFG.storage.sessionId, v); }
    return v;
  }

  function getThreadId() {
    return safeGet(CFG.storage.threadId) || "";
  }
  function setThreadId(id) {
    if (id) safeSet(CFG.storage.threadId, id);
  }

  function getLead() {
    const raw = safeGet(CFG.storage.lead);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  }
  function setLead(obj) {
    safeSet(CFG.storage.lead, JSON.stringify(obj || {}));
  }

  function getMsgs() {
    const raw = safeGet(CFG.storage.messages);
    if (!raw) return [];
    try { return JSON.parse(raw) || []; } catch (_) { return []; }
  }
  function setMsgs(arr) {
    safeSet(CFG.storage.messages, JSON.stringify(arr || []));
  }

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === "class") n.className = attrs[k];
        else if (k === "style") n.setAttribute("style", attrs[k]);
        else if (k.startsWith("on") && typeof attrs[k] === "function")
          n.addEventListener(k.slice(2), attrs[k]);
        else n.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach((c) => {
      if (c == null) return;
      if (typeof c === "string") n.appendChild(document.createTextNode(c));
      else n.appendChild(c);
    });
    return n;
  }

  function parseUtm() {
    try {
      const u = new URL(window.location.href);
      return {
        utm_source: u.searchParams.get("utm_source") || null,
        utm_medium: u.searchParams.get("utm_medium") || null,
        utm_campaign: u.searchParams.get("utm_campaign") || null
      };
    } catch (_) {
      return { utm_source: null, utm_medium: null, utm_campaign: null };
    }
  }

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error || ("HTTP " + res.status);
      throw new Error(msg);
    }
    return data;
  }

  // UI
  const launcher = el("button", { id: "cp-chat-launcher", "aria-label": "Chat with Carpinoy Support" }, [
    el("img", { src: CFG.avatarUrl, alt: "Carpinoy Support" })
  ]);

  const hint = el("div", { id: "cp-chat-hint", role: "note" }, [
    el("div", { class: "cp-chat-hint__text" }, ["Chat me for more info"]),
    el("button", { class: "cp-chat-hint__x", "aria-label": "Dismiss hint", onclick: () => hideHint() }, ["×"])
  ]);

  const panel = el("div", { id: "cp-chat-panel", "aria-hidden": "true" }, [
    el("div", { id: "cp-chat-header" }, [
      el("img", { id: "cp-chat-header-avatar", src: CFG.avatarUrl, alt: "Support" }),
      el("div", { id: "cp-chat-header-title" }, [
        el("div", { class: "cp-chat-title" }, ["Carpinoy Support"]),
        el("div", { class: "cp-chat-subtitle" }, ["Sales inquiry assistant"])
      ]),
      el("button", { id: "cp-chat-close", "aria-label": "Close chat", onclick: () => closePanel() }, ["×"])
    ]),
    el("div", { id: "cp-chat-body" }, [
      el("div", { id: "cp-chat-messages" }, [])
    ]),
    el("div", { id: "cp-chat-footer" }, [])
  ]);

  document.body.appendChild(launcher);
  document.body.appendChild(hint);
  document.body.appendChild(panel);

  // Hint behavior
  let hintTimer = null;
  function showHint() {
    hint.classList.add("is-visible");
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = setTimeout(() => hideHint(), 9000);
  }
  function hideHint() {
    hint.classList.remove("is-visible");
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = null;
  }

  // Panel behavior
  function openPanel() {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    hideHint();
    renderFooter();
    renderMessages();
    scrollToBottom();
  }
  function closePanel() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
  }

  launcher.addEventListener("click", () => {
    const open = panel.classList.contains("is-open");
    if (open) closePanel();
    else openPanel();
  });

  // Render messages
  const messagesEl = panel.querySelector("#cp-chat-messages");
  function addLocalMsg(role, text) {
    const arr = getMsgs();
    arr.push({ role, text, ts: Date.now() });
    setMsgs(arr);
  }
  function renderMessages() {
    const arr = getMsgs();
    messagesEl.innerHTML = "";
    if (arr.length === 0) {
      messagesEl.appendChild(el("div", { class: "cp-chat-row cp-chat-row--sys" }, [
        el("div", { class: "cp-chat-msg cp-chat-msg--sys" }, ["Hi! Please tell us what you need (shipping, rates, schedule)."])
      ]));
      if (CFG.requireLead && !getLead()) {
        messagesEl.appendChild(el("div", { class: "cp-chat-row cp-chat-row--sys" }, [
          el("div", { class: "cp-chat-msg cp-chat-msg--sys" }, ["Before we proceed, please enter your name and phone."])
        ]));
      }
      return;
    }
    arr.forEach((m) => {
      const rowCls =
        m.role === "user" ? "cp-chat-row--user" :
        m.role === "ai" ? "cp-chat-row--ai" :
        "cp-chat-row--sys";
      const bubbleCls =
        m.role === "user" ? "cp-chat-msg--user" :
        m.role === "ai" ? "cp-chat-msg--ai" :
        "cp-chat-msg--sys";

      const bubble = el("div", { class: "cp-chat-msg " + bubbleCls }, [m.text]);
      const row = el("div", { class: "cp-chat-row " + rowCls }, [bubble]);
      messagesEl.appendChild(row);
    });
  }
  function scrollToBottom() {
    try { messagesEl.scrollTop = messagesEl.scrollHeight; } catch (_) {}
  }

  // Footer: either lead form or chat input
  const footerEl = panel.querySelector("#cp-chat-footer");

  function renderFooter() {
    footerEl.innerHTML = "";
    const lead = getLead();

    if (CFG.requireLead && (!lead || !lead.name || !lead.phone)) {
      footerEl.classList.add("cp-chat-footer--lead");
      const notice = el("div", { class: "cp-chat-notice" }, [CFG.noticeText]);

      const nameIn = el("input", { class: "cp-chat-inp", type: "text", placeholder: "Your name", autocomplete: "name" });
      const phoneIn = el("input", { class: "cp-chat-inp", type: "tel", placeholder: "Phone number", autocomplete: "tel" });
      const emailIn = el("input", { class: "cp-chat-inp", type: "email", placeholder: "Email (optional)", autocomplete: "email" });

      const err = el("div", { class: "cp-chat-error", style: "display:none" }, [""]);

      const btn = el("button", {
        class: "cp-chat-btn",
        onclick: async () => {
          err.style.display = "none";
          const name = (nameIn.value || "").trim();
          const phone = (phoneIn.value || "").trim();
          const email = (emailIn.value || "").trim();
          if (!name || !phone) {
            err.textContent = "Name and phone are required.";
            err.style.display = "block";
            return;
          }
          // Persist lead locally
          setLead({ name, phone, email: email || null });

          // Create/Reuse thread in backend
          try {
            if (CFG.startUrl) {
              const session_id = getSessionId();
              const utm = parseUtm();
              const resp = await postJson(CFG.startUrl, {
                session_id,
                name,
                phone,
                email: email || null,
                page_url: window.location.href,
                ...utm
              });
              if (resp?.thread_id) setThreadId(resp.thread_id);
            }
            addLocalMsg("system", "Thanks! How can we help you today?");
            renderMessages();
            renderFooter();
            scrollToBottom();
          } catch (e) {
            // Backend failed -> still allow user to message, but we'll handoff.
            addLocalMsg("system", "Thanks! Please type your question. If we can't answer, we'll connect you to a human admin.");
            renderMessages();
            renderFooter();
            scrollToBottom();
          }
        }
      }, ["Continue"]);

      const leadWrap = el("div", { class: "cp-chat-lead" }, [notice, err, nameIn, phoneIn, emailIn, btn]);
      footerEl.appendChild(leadWrap);
      return;
    }

    // Chat input
    const row = el("div", { class: "cp-chat-row" }, []);
    const input = el("input", { class: "cp-chat-inp", type: "text", placeholder: "Type your message...", autocomplete: "off" });
    const send = el("button", { class: "cp-chat-btn" }, ["Send"]);
    const small = el("button", {
      class: "cp-chat-link",
      onclick: () => window.open(CFG.handoffUrl, "_blank")
    }, ["Talk to human"]);

    row.appendChild(input);
    row.appendChild(send);
    footerEl.appendChild(row);
    footerEl.appendChild(el("div", { class: "cp-chat-actions" }, [small]));

    async function doSend() {
      const text = (input.value || "").trim();
      if (!text) return;
      input.value = "";
      addLocalMsg("user", text);
      renderMessages();
      scrollToBottom();

      // If backend not wired, immediate handoff
      if (!CFG.sendUrl) {
        const msg = `NOT AVAILABLE at the moment. Please chat our human admins @ ${CFG.handoffUrl}`;
        addLocalMsg("ai", msg);
        renderMessages();
        scrollToBottom();
        return;
      }

      // Typing
      const typing = el("div", { class: "cp-chat-msg cp-chat-msg--ai", id: "cp-chat-typing" }, ["Typing…"]);
      messagesEl.appendChild(typing);
      scrollToBottom();

      try {
        const session_id = getSessionId();
        const thread_id = getThreadId();
        const resp = await postJson(CFG.sendUrl, {
          session_id,
          thread_id,
          message: text
        });

        const reply = (resp && resp.reply) ? String(resp.reply) : `NOT AVAILABLE at the moment. Please chat our human admins @ ${CFG.handoffUrl}`;
        addLocalMsg("ai", reply);

        // If handoff signaled, open link button is already present; user can click.
      } catch (e) {
        const msg = `NOT AVAILABLE at the moment. Please chat our human admins @ ${CFG.handoffUrl}`;
        addLocalMsg("ai", msg);
      } finally {
        const t = document.getElementById("cp-chat-typing");
        if (t && t.parentNode) t.parentNode.removeChild(t);
        renderMessages();
        scrollToBottom();
      }
    }

    send.addEventListener("click", doSend);
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") doSend();
    });
  }

  // Initial hint show (after slight delay)
  setTimeout(() => {
    try {
      // Show only if panel not opened yet this session
      showHint();
    } catch (_) {}
  }, 900);

})();
