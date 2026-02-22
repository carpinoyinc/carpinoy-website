/* Carpinoy Sticky Chat Widget (v0.1)
   NOTE: This is a scaffold. Wire these endpoints to your Supabase Edge Functions.
*/
(function(){
  const CFG = {
    // TODO: replace with your Supabase Edge Function endpoints
    START_URL: window.CP_CHAT_START_URL || "",
    SEND_URL: window.CP_CHAT_SEND_URL || "",
    STORAGE_KEY: "cp_webchat_session_id_v1",
    AVATAR_URL: window.CP_CHAT_AVATAR_URL || "/cp-support-avatar-96.png"
  };

  function uid(){
    return "cp_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  function getSessionId(){
    try{
      let v = localStorage.getItem(CFG.STORAGE_KEY);
      if(!v){ v = uid(); localStorage.setItem(CFG.STORAGE_KEY, v); }
      return v;
    }catch(_){ return uid(); }
  }

  function el(tag, attrs, children){
    const n = document.createElement(tag);
    if(attrs){
      Object.keys(attrs).forEach(k=>{
        if(k==="class") n.className = attrs[k];
        else if(k==="text") n.textContent = attrs[k];
        else n.setAttribute(k, attrs[k]);
      });
    }
    (children||[]).forEach(c=> n.appendChild(c));
    return n;
  }

  function mount(){
    if(document.getElementById("cp-chat-launcher")) return;

    const launcher = el("button",{id:"cp-chat-launcher", type:"button", "aria-label":"Open chat"});
    const launcherImg = el("img",{src:CFG.AVATAR_URL, alt:"Support"});
    const launcherLabel = el("span",{text:"Chat"});
    launcher.appendChild(launcherImg);
    launcher.appendChild(launcherLabel);
    const panel = el("div",{id:"cp-chat-panel", role:"dialog", "aria-modal":"false"});

    const header = el("div",{id:"cp-chat-header"});
    const headerLeft = el("div",{class:"cp-chat-header-left"});
    const headerImg = el("img",{src:(window.CP_CHAT_AVATAR_URL_HEADER||"/cp-support-avatar-40.png"), alt:"Support"});
    headerLeft.appendChild(headerImg);
    headerLeft.appendChild(el("div",{id:"cp-chat-title", text:"Carpinoy Support"}));
    header.appendChild(headerLeft);
    const closeBtn = el("button",{id:"cp-chat-close", type:"button", "aria-label":"Close chat", text:"×"});
    header.appendChild(closeBtn);

    const body = el("div",{id:"cp-chat-body"});
    const msgs = el("div",{id:"cp-chat-msgs"});
    body.appendChild(msgs);

    const note = el("div",{id:"cp-chat-note", text:"Tip: For booking/quotes, you can ask here. If you need a human agent, type 'human'."});

    const footer = el("div",{id:"cp-chat-footer"});
    const input = el("input",{id:"cp-chat-input", type:"text", placeholder:"Type your question…", autocomplete:"off"});
    const send = el("button",{id:"cp-chat-send", type:"button", text:"Send"});
    footer.appendChild(input); footer.appendChild(send);

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(note);
    panel.appendChild(footer);

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    // Floating hint bubble (dismissible)
    const hint = el("div",{id:"cp-chat-hint"});
    hint.appendChild(el("span",{text:"Chat me for more info"}));
    const hintClose = el("button",{type:"button","aria-label":"Dismiss",text:"×"});
    hint.appendChild(hintClose);
    document.body.appendChild(hint);
    let hintTimer = setTimeout(()=>{ try{ hint.remove(); }catch(_){} }, 9000);
    hintClose.addEventListener("click", ()=>{ clearTimeout(hintTimer); hint.remove(); });

    function open(){ panel.classList.add("is-open"); input.focus(); const h=document.getElementById("cp-chat-hint"); if(h) h.remove(); }
    function close(){ panel.classList.remove("is-open"); }
    launcher.addEventListener("click", open);
    closeBtn.addEventListener("click", close);

    function addBubble(role, text){
      msgs.appendChild(el("div",{class:"cp-chat-bubble "+role, text:text}));
      body.scrollTop = body.scrollHeight;
    }

    async function sendMsg(){
      const text = (input.value||"").trim();
      if(!text) return;
      input.value="";
      addBubble("user", text);

      // Temporary auto-answer (website): route to human admins.
      addBubble("ai", "NOT AVAILABLE at the moment. Please chat our human admins @ https://m.me/carpinoylogistics");
    }

    send.addEventListener("click", sendMsg);
    input.addEventListener("keydown", (e)=>{ if(e.key==="Enter") sendMsg(); });

    // welcome
    addBubble("ai","Hi! Ask your question here. If you need a human admin, we will direct you to Messenger.");
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
