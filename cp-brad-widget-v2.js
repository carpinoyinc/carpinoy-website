/* Carpinoy Sticky Chat Widget v1.0 — Animated Brad
   Wired to: carpinoy-ai-chat Supabase Edge Function (Sales mode)
   Avatar: Inline animated SVG — no external image needed
*/
(function(){
  "use strict";

  /* ── Brad SVG (male Filipino logistics guy) ─────── */
  var BRAD_SVG = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">',
    '<defs><linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a2a1a"/><stop offset="100%" stop-color="#2d4a2d"/></linearGradient></defs>',
    '<rect width="120" height="120" fill="url(#bg1)"/>',
    /* Shirt/body */
    '<g class="cp-brad-body">',
    '<path d="M28 120 Q28 82 60 78 Q92 82 92 120Z" fill="#c5cd27"/>',
    '<path d="M44 120 Q44 90 60 86 Q76 90 76 120Z" fill="#b5bd22" opacity=".5"/>',
    /* Collar */
    '<path d="M48 82 L60 90 L72 82" fill="none" stroke="#a0a818" stroke-width="2"/>',
    '</g>',
    /* Neck */
    '<rect x="53" y="70" width="14" height="14" rx="4" fill="#c9956b"/>',
    /* Head */
    '<ellipse cx="60" cy="52" rx="24" ry="26" fill="#d4a574"/>',
    /* Hair */
    '<path d="M36 46 Q36 24 60 22 Q84 24 84 46 Q82 34 60 32 Q38 34 36 46Z" fill="#2c1810"/>',
    '<path d="M36 46 Q34 40 38 36" fill="#2c1810"/>',
    '<path d="M84 46 Q86 40 82 36" fill="#2c1810"/>',
    /* Side hair */
    '<ellipse cx="36" cy="50" rx="3" ry="8" fill="#2c1810"/>',
    '<ellipse cx="84" cy="50" rx="3" ry="8" fill="#2c1810"/>',
    /* Ears */
    '<ellipse cx="36" cy="54" rx="4" ry="5" fill="#c9956b"/>',
    '<ellipse cx="84" cy="54" rx="4" ry="5" fill="#c9956b"/>',
    /* Face features */
    '<g class="cp-brad-eyes">',
    '<ellipse cx="50" cy="52" rx="3" ry="3.2" fill="#1a1a1a"/>',
    '<ellipse cx="70" cy="52" rx="3" ry="3.2" fill="#1a1a1a"/>',
    '<circle cx="51.2" cy="51" r="1" fill="#fff" opacity=".7"/>',
    '<circle cx="71.2" cy="51" r="1" fill="#fff" opacity=".7"/>',
    '</g>',
    /* Eyebrows */
    '<path d="M45 46 Q50 43.5 55 46" fill="none" stroke="#3d2516" stroke-width="1.8" stroke-linecap="round"/>',
    '<path d="M65 46 Q70 43.5 75 46" fill="none" stroke="#3d2516" stroke-width="1.8" stroke-linecap="round"/>',
    /* Nose */
    '<path d="M58 56 Q60 60 62 56" fill="none" stroke="#b8845e" stroke-width="1.2" stroke-linecap="round"/>',
    /* Smile */
    '<path d="M50 63 Q60 70 70 63" fill="none" stroke="#8b5e3c" stroke-width="1.6" stroke-linecap="round"/>',
    /* Teeth hint */
    '<path d="M54 64.5 Q60 68 66 64.5" fill="#fff" opacity=".7"/>',
    /* Wave hand */
    '<g class="cp-brad-hand">',
    '<circle cx="96" cy="88" r="6" fill="#d4a574"/>',
    '<rect x="93" y="82" width="2.5" height="7" rx="1.2" fill="#d4a574" transform="rotate(-10 94 85)"/>',
    '<rect x="96" y="80" width="2.5" height="8" rx="1.2" fill="#d4a574" transform="rotate(-5 97 84)"/>',
    '<rect x="99" y="81" width="2.5" height="7" rx="1.2" fill="#d4a574" transform="rotate(2 100 84)"/>',
    '<rect x="102" y="83" width="2.2" height="6" rx="1.1" fill="#d4a574" transform="rotate(8 103 86)"/>',
    '</g>',
    /* Carpinoy text badge */
    '<rect x="38" y="96" width="44" height="14" rx="7" fill="rgba(0,0,0,.25)"/>',
    '<text x="60" y="106.5" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">BRAD AI</text>',
    '</svg>'
  ].join('');

  /* ── Config ──────────────────────────────────────── */
  var DEFAULTS = {
    edgeFnUrl: "",
    handoffUrl: "https://m.me/carpinoylogistics",
    requireLead: false,
    noticeText: "We ask for your name and phone so we can follow up even if the chat closes."
  };

  var uCfg = window.CP_CHAT_CONFIG || {};
  var CFG = {
    edgeFnUrl: uCfg.edgeFnUrl || uCfg.sendUrl || DEFAULTS.edgeFnUrl,
    handoffUrl: uCfg.handoffUrl || DEFAULTS.handoffUrl,
    requireLead: uCfg.requireLead != null ? uCfg.requireLead : DEFAULTS.requireLead,
    noticeText: uCfg.noticeText || DEFAULTS.noticeText
  };

  /* ── Storage helpers ─────────────────────────────── */
  var SK = {
    thread: "cp_brad_thread_v1",
    lead: "cp_brad_lead_v1",
    msgs: "cp_brad_msgs_v1"
  };

  function sGet(k){try{return localStorage.getItem(k)}catch(_){return null}}
  function sSet(k,v){try{localStorage.setItem(k,v)}catch(_){}}
  function sDel(k){try{localStorage.removeItem(k)}catch(_){}}

  function getThread(){return sGet(SK.thread)||""}
  function setThread(v){if(v)sSet(SK.thread,v)}
  function getLead(){try{return JSON.parse(sGet(SK.lead))||null}catch(_){return null}}
  function setLeadData(o){sSet(SK.lead,JSON.stringify(o||{}))}
  function getMsgs(){try{return JSON.parse(sGet(SK.msgs))||[]}catch(_){return[]}}
  function setMsgsData(a){sSet(SK.msgs,JSON.stringify(a||[]))}

  function addMsg(role,text){
    var a=getMsgs();
    a.push({role:role,text:text,ts:Date.now()});
    if(a.length>100)a=a.slice(-80);
    setMsgsData(a);
  }

  /* ── DOM helpers ─────────────────────────────────── */
  function el(tag,attrs,kids){
    var n=document.createElement(tag);
    if(attrs)Object.keys(attrs).forEach(function(k){
      if(k==="class")n.className=attrs[k];
      else if(k.indexOf("on")===0&&typeof attrs[k]==="function")n.addEventListener(k.slice(2),attrs[k]);
      else n.setAttribute(k,attrs[k]);
    });
    (kids||[]).forEach(function(c){
      if(c==null)return;
      if(typeof c==="string")n.appendChild(document.createTextNode(c));
      else n.appendChild(c);
    });
    return n;
  }

  function svgEl(html){
    var d=document.createElement("div");
    d.innerHTML=html;
    return d.firstChild;
  }

  /* ── Build UI ────────────────────────────────────── */

  // Launcher
  var launcherAvatar = el("div",{class:"cp-brad-avatar"});
  launcherAvatar.innerHTML = BRAD_SVG;
  var launcher = el("button",{id:"cp-chat-launcher","aria-label":"Chat with Brad AI"},[launcherAvatar]);

  // Hint
  var hint = el("div",{id:"cp-chat-hint"},[
    el("span",null,["Ask me about the Business Package! 🚛"]),
    el("button",{"aria-label":"Close",onclick:function(){hideHint()}},["×"])
  ]);

  // Panel
  var headerAvatar = el("div",{class:"cp-header-avatar"});
  headerAvatar.innerHTML = BRAD_SVG;

  var messagesEl = el("div",{id:"cp-chat-messages"});
  var footerEl = el("div",{id:"cp-chat-footer"});

  var panel = el("div",{id:"cp-chat-panel","aria-hidden":"true"},[
    el("div",{id:"cp-chat-header"},[
      headerAvatar,
      el("div",{id:"cp-chat-header-title"},[
        el("div",{class:"cp-chat-title"},["Brad AI"]),
        el("div",{class:"cp-chat-subtitle"},["Business Package Assistant"])
      ]),
      el("button",{id:"cp-chat-close","aria-label":"Close chat",onclick:function(){closePanel()}},["×"])
    ]),
    el("div",{id:"cp-chat-body"},[messagesEl]),
    footerEl
  ]);

  document.body.appendChild(launcher);
  document.body.appendChild(hint);
  document.body.appendChild(panel);

  /* ── Hint ─────────────────────────────────────────── */
  var hintTimer=null;
  function showHint(){
    hint.classList.add("is-visible");
    if(hintTimer)clearTimeout(hintTimer);
    hintTimer=setTimeout(hideHint,8000);
  }
  function hideHint(){
    hint.classList.remove("is-visible");
    if(hintTimer)clearTimeout(hintTimer);
    hintTimer=null;
  }

  /* ── Panel open/close ────────────────────────────── */
  var isOpen=false;
  function openPanel(){
    isOpen=true;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden","false");
    hideHint();
    renderFooter();
    renderMessages();
    scrollBottom();
  }
  function closePanel(){
    isOpen=false;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden","true");
  }

  launcher.addEventListener("click",function(){
    if(isOpen)closePanel();else openPanel();
  });

  /* ── Render messages ─────────────────────────────── */
  function renderMessages(){
    var arr=getMsgs();
    messagesEl.innerHTML="";
    if(arr.length===0){
      appendSysMsg("Hi! Ako si Brad, AI assistant ng Carpinoy Logistics. 🚛\nAsk me anything about the Business Package!");
      return;
    }
    arr.forEach(function(m){
      if(m.role==="user") appendUserMsg(m.text);
      else if(m.role==="ai") appendAiMsg(m.text);
      else appendSysMsg(m.text);
    });
  }

  function appendUserMsg(text){
    var row=el("div",{class:"cp-chat-row cp-chat-row--user"},[
      el("div",{class:"cp-chat-msg cp-chat-msg--user"},[text])
    ]);
    messagesEl.appendChild(row);
  }

  function appendAiMsg(text){
    var avatar=el("div",{class:"cp-msg-avatar"});
    avatar.innerHTML=BRAD_SVG;
    var row=el("div",{class:"cp-chat-row cp-chat-row--ai"},[
      avatar,
      el("div",{class:"cp-chat-msg cp-chat-msg--ai"},[text])
    ]);
    messagesEl.appendChild(row);
  }

  function appendSysMsg(text){
    var row=el("div",{class:"cp-chat-row cp-chat-row--sys"},[
      el("div",{class:"cp-chat-msg cp-chat-msg--sys"},[text])
    ]);
    messagesEl.appendChild(row);
  }

  function appendTyping(){
    var avatar=el("div",{class:"cp-msg-avatar"});
    avatar.innerHTML=BRAD_SVG;
    var dots=el("div",{class:"cp-typing-dots"},[
      el("span"),el("span"),el("span")
    ]);
    var bubble=el("div",{class:"cp-chat-msg cp-chat-msg--ai",id:"cp-chat-typing"},[dots]);
    var row=el("div",{class:"cp-chat-row cp-chat-row--ai",id:"cp-typing-row"},[avatar,bubble]);
    messagesEl.appendChild(row);
  }

  function removeTyping(){
    var r=document.getElementById("cp-typing-row");
    if(r&&r.parentNode)r.parentNode.removeChild(r);
  }

  function scrollBottom(){
    try{
      var body=panel.querySelector("#cp-chat-body");
      if(body)body.scrollTop=body.scrollHeight;
    }catch(_){}
  }

  /* ── Footer: lead form or chat input ─────────────── */
  var sending=false;

  function renderFooter(){
    footerEl.innerHTML="";
    var lead=getLead();

    if(CFG.requireLead && (!lead||!lead.name||!lead.phone)){
      renderLeadForm();
      return;
    }

    renderChatInput();
  }

  function renderLeadForm(){
    var notice=el("div",{class:"cp-chat-notice"},[CFG.noticeText]);
    var errEl=el("div",{class:"cp-chat-error"},[""]);
    var nameIn=el("input",{class:"cp-chat-inp",type:"text",placeholder:"Your name",autocomplete:"name"});
    var phoneIn=el("input",{class:"cp-chat-inp",type:"tel",placeholder:"Phone number",autocomplete:"tel"});

    var btn=el("button",{class:"cp-lead-btn",onclick:function(){
      errEl.style.display="none";
      var name=(nameIn.value||"").trim();
      var phone=(phoneIn.value||"").trim();
      if(!name||!phone){errEl.textContent="Name and phone are required.";errEl.style.display="block";return}
      setLeadData({name:name,phone:phone});
      addMsg("system","Thanks "+name+"! Ask me anything about the Business Package.");
      renderMessages();renderFooter();scrollBottom();
    }},["Continue"]);

    var form=el("div",{class:"cp-lead-form"},[notice,errEl,nameIn,phoneIn,btn]);
    footerEl.appendChild(form);
  }

  function renderChatInput(){
    var input=el("input",{class:"cp-chat-inp",type:"text",placeholder:"Type your message...",autocomplete:"off"});
    var sendBtn=el("button",{class:"cp-chat-btn",onclick:function(){doSend()}},[
      "➤"
    ]);

    var row=el("div",{class:"cp-input-row"},[input,sendBtn]);
    footerEl.appendChild(row);

    var handoff=el("button",{class:"cp-chat-link",onclick:function(){window.open(CFG.handoffUrl,"_blank")}},["Talk to human agent"]);
    footerEl.appendChild(el("div",{class:"cp-chat-actions"},[handoff]));

    var credit=el("div",{class:"cp-chat-credit"},["Powered by ",el("b",null,["Carpinoy Logistics"])," 🇵🇭"]);
    footerEl.appendChild(credit);

    input.addEventListener("keydown",function(e){
      if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();doSend()}
    });

    function doSend(){
      var text=(input.value||"").trim();
      if(!text||sending)return;
      input.value="";
      addMsg("user",text);
      appendUserMsg(text);
      scrollBottom();

      if(!CFG.edgeFnUrl){
        var fallback="Sorry, chat is temporarily unavailable. Please message us at "+CFG.handoffUrl;
        addMsg("ai",fallback);appendAiMsg(fallback);scrollBottom();
        return;
      }

      sending=true;
      sendBtn.disabled=true;
      appendTyping();scrollBottom();

      var lead=getLead();
      var threadId=getThread()||("web__sales__"+Date.now());
      setThread(threadId);

      var payload={
        plate_number:"MSG_web_"+Date.now(),
        account_code:"sales",
        thread_id:threadId,
        operator_name:(lead&&lead.name)||"Website Visitor",
        message:text
      };

      fetch(CFG.edgeFnUrl,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      })
      .then(function(res){return res.json()})
      .then(function(data){
        removeTyping();
        var reply=(data&&data.reply)?String(data.reply).trim():"Sorry, may issue. Try again or message us at "+CFG.handoffUrl;
        if(data&&data.thread_id)setThread(data.thread_id);
        addMsg("ai",reply);appendAiMsg(reply);scrollBottom();
      })
      .catch(function(){
        removeTyping();
        var errMsg="Connection issue. Please try again or message us at "+CFG.handoffUrl;
        addMsg("ai",errMsg);appendAiMsg(errMsg);scrollBottom();
      })
      .finally(function(){
        sending=false;
        sendBtn.disabled=false;
      });
    }
  }

  /* ── Init ─────────────────────────────────────────── */
  setTimeout(function(){showHint()},1200);

})();
