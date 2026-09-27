// Cognimorph — shared site behaviour
// Source file. Pages load js/site.min.js — run `npm run build` after editing.
(function(){
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  // ---- Site-wide settings -------------------------------------------------
  var CONFIG = {
    // Every "Contact / Let's talk / Start a project" CTA goes to the contact page,
    // i.e. https://cognimorph.co/contact.html once deployed. (Header/footer links
    // are rendered by scripts/build.mjs — keep the two in step.)
    contactUrl: 'contact.html',
    email: 'hello@cognimorph.co',
    linkedin: 'https://www.linkedin.com/company/cognimorph',
    // WhatsApp business number in international format, digits only (e.g. '9779800000000').
    // Leave empty to hide every WhatsApp button until a real number is confirmed.
    whatsapp: ''
  };
  // Pages outside the site root (thank-you/, 404) declare data-root so shared links resolve
  var ROOT_PATH = root.getAttribute('data-root') || '';
  function u(href){ return /^(https?:|mailto:|tel:|#|\/)/.test(href) ? href : ROOT_PATH + href; }
  CONFIG.contactUrl = u(CONFIG.contactUrl);

  var WA_LINK = CONFIG.whatsapp
    ? 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent('Hello Cognimorph, I have a question about ')
    : '';

  var mq = function(q){ return window.matchMedia ? window.matchMedia(q).matches : false; };
  var reducedMotion = mq('(prefers-reduced-motion: reduce)');
  var finePointer = mq('(hover: hover) and (pointer: fine)');
  var hasIO = 'IntersectionObserver' in window;

  // ---- Theme ----------------------------------------------------------------
  function storeTheme(v){
    try{ localStorage.setItem('cognimorph-theme', v); }catch(e){ /* storage unavailable */ }
  }
  // (the inline <head> snippet applies the saved theme before first paint; this is the fallback)
  var stored = null;
  try{ stored = localStorage.getItem('cognimorph-theme'); }catch(e){ /* ignore */ }
  root.setAttribute('data-theme', stored || (mq('(prefers-color-scheme: dark)') ? 'dark' : 'light'));
  function toggleTheme(){
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    storeTheme(next);
    syncThemeButton();
  }
  function syncThemeButton(){
    var b = document.getElementById('theme-toggle');
    if(!b) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    b.setAttribute('aria-pressed', String(dark));
    b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  // ---- Utilities ------------------------------------------------------------
  // One IntersectionObserver per behaviour; `once` unobserves after first hit.
  function observe(els, cb, opts){
    els = Array.prototype.slice.call(els);
    if(!els.length) return;
    if(!hasIO){ els.forEach(function(el){ cb(el, true); }); return; }
    var once = !opts || opts.once !== false;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(once){
          if(en.isIntersecting){ cb(en.target, true); io.unobserve(en.target); }
        } else {
          cb(en.target, en.isIntersecting);
        }
      });
    }, { threshold: (opts && opts.threshold) || 0, rootMargin: (opts && opts.rootMargin) || '0px 0px -8% 0px' });
    els.forEach(function(el){ io.observe(el); });
  }

  // Frame-throttled scroll work shared by every scroll-linked effect
  var scrollTasks = [];
  var scrollQueued = false;
  function onScrollFrame(fn){ scrollTasks.push(fn); }
  function runScrollTasks(){
    scrollQueued = false;
    var y = window.pageYOffset, vh = window.innerHeight;
    for(var i = 0; i < scrollTasks.length; i++) scrollTasks[i](y, vh);
  }
  function queueScroll(){
    if(!scrollQueued){ scrollQueued = true; requestAnimationFrame(runScrollTasks); }
  }
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll);

  // Expose the small toolkit to page scripts (home.js)
  window.Cognimorph = {
    config: CONFIG,
    reducedMotion: reducedMotion,
    finePointer: finePointer,
    observe: observe,
    onScrollFrame: onScrollFrame,
    queueScroll: queueScroll
  };

  // ---- Init -------------------------------------------------------------------
  function init(){
    // Header and footer markup is rendered into each page by scripts/build.mjs
    var yearEl = document.getElementById('footer-year');
    if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

    var toggleBtn = document.getElementById('theme-toggle');
    if(toggleBtn){ toggleBtn.addEventListener('click', toggleTheme); syncThemeButton(); }

    initMenu();
    initHeaderState();
    initProgress();
    initReveals();
    initParallax();
    initSpotlight();
    initMagnetic();
    initCounters();
    initPanels();
    initRails();
    initAmbientPause();
    initContactForm();
    initAssistant();

    var brand = document.querySelector('.site-header .brand');
    if(brand && !reducedMotion){
      setTimeout(function(){
        brand.classList.add('sheen');
        setTimeout(function(){ brand.classList.remove('sheen'); }, 1400);
      }, 1600);
    }
  }

  // ---- Mobile menu: focus-trapped dialog ---------------------------------------
  function initMenu(){
    var openBtn = document.getElementById('menu-open');
    var closeBtn = document.getElementById('menu-close');
    var menu = document.getElementById('mobile-menu');
    if(!openBtn || !menu) return;

    function focusables(){
      return Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])'));
    }
    function setOpen(open){
      menu.classList.toggle('open', open);
      openBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if(open){
        menu.removeAttribute('inert');
        setTimeout(function(){ if(closeBtn) closeBtn.focus(); }, 60);
      } else {
        menu.setAttribute('inert', '');
        openBtn.focus({ preventScroll: true });
      }
    }
    openBtn.addEventListener('click', function(){ setOpen(true); });
    if(closeBtn) closeBtn.addEventListener('click', function(){ setOpen(false); });
    menu.addEventListener('click', function(e){
      if(e.target.closest('a')) setOpen(false);
    });
    menu.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){ setOpen(false); return; }
      if(e.key !== 'Tab') return;
      var f = focusables();
      if(!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    });
    // Close if the viewport grows past the mobile breakpoint
    if(window.matchMedia){
      var wide = window.matchMedia('(min-width: 881px)');
      var onWide = function(e){ if(e.matches && menu.classList.contains('open')) setOpen(false); };
      if(wide.addEventListener) wide.addEventListener('change', onWide);
    }
  }

  // ---- Header gains depth once the page scrolls ---------------------------------
  function initHeaderState(){
    var header = document.getElementById('site-header');
    if(!header) return;
    var last = null;
    onScrollFrame(function(y){
      var s = y > 8;
      if(s !== last){ header.classList.toggle('is-scrolled', s); last = s; }
    });
    queueScroll();
  }

  // ---- Reading progress (transform only) ------------------------------------------
  function initProgress(){
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var max = 1;
    function measure(){ max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
    requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    onScrollFrame(function(y){ bar.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')'; });
  }

  // ---- Scroll reveals -----------------------------------------------------------
  // Split section headings into words so they can rise line by line.
  function splitWords(el){
    var wi = 0;
    function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(child){
        if(child.nodeType === 3){
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function(p){
            if(!p) return;
            if(/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span');
            w.className = 'w';
            var inner = document.createElement('span');
            inner.style.setProperty('--wi', wi++);
            inner.textContent = p;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.parentNode.replaceChild(frag, child);
        } else if(child.nodeType === 1 && child.tagName !== 'BR'){
          walk(child);
        }
      });
    }
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    Array.prototype.slice.call(el.querySelectorAll('.w')).forEach(function(w){ w.setAttribute('aria-hidden', 'true'); });
    el.classList.add('split-words');
  }

  function initReveals(){
    var main = document.getElementById('main');
    if(!main) return;

    // Interior page titles and section headings rise word by word
    Array.prototype.slice.call(main.querySelectorAll('h2.reveal-up, .page-header h1, [data-split]')).forEach(function(h){
      if(!reducedMotion) splitWords(h);
      h.classList.add('reveal-up');
    });
    Array.prototype.slice.call(main.querySelectorAll('.eyebrow:not(.hero-rise)')).forEach(function(e){ e.classList.add('reveal-eyebrow'); });

    var els = main.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-media, .reveal-eyebrow, section.hairline, .approach-row, .anim-panel');
    if(reducedMotion){
      Array.prototype.forEach.call(els, function(el){ el.classList.add('is-visible'); });
      return;
    }
    // The huge top margin means anything the reader has already scrolled past
    // (fast flicks, anchor jumps, restored scroll) is revealed rather than left hidden.
    observe(els, function(el){ el.classList.add('is-visible'); }, { rootMargin: '100000px 0px -10% 0px' });

    // Anything already in view on load (e.g. page headers) appears straight away
    requestAnimationFrame(function(){
      Array.prototype.forEach.call(document.querySelectorAll('.page-header .reveal-up'), function(el){ el.classList.add('is-visible'); });
    });
  }

  // ---- Parallax on framed imagery (desktop, visible elements only) -----------------
  function initParallax(){
    if(reducedMotion || !mq('(min-width: 901px)')) return;
    var items = Array.prototype.slice.call(document.querySelectorAll('.media-parallax img, .band-media img'));
    if(!items.length) return;
    var live = new Set();
    observe(items.map(function(img){ return img.parentElement.closest('.media-parallax, .band') || img.parentElement; }), function(el, inView){
      if(inView) live.add(el); else live.delete(el);
      queueScroll();
    }, { once: false, rootMargin: '120px 0px 120px 0px' });
    onScrollFrame(function(y, vh){
      live.forEach(function(box){
        var r = box.getBoundingClientRect();
        var delta = ((r.top + r.height / 2) - vh / 2) / vh; // -1 .. 1
        var img = box.querySelector('img');
        var isBand = box.classList.contains('band');
        var amt = isBand ? -60 : -24;
        img.style.transform = (isBand ? '' : 'scale(1.1) ') + 'translate3d(0,' + (delta * amt).toFixed(1) + 'px,0)';
      });
    });
  }

  // ---- Pointer spotlight on cards (fine pointers only) ----------------------------
  function initSpotlight(){
    if(!finePointer || reducedMotion) return;
    Array.prototype.forEach.call(document.querySelectorAll('.ind, .case-card, .case-full, .metric-cell'), function(card){
      card.classList.add('spot');
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // ---- Magnetic CTAs: primary buttons lean toward the cursor (fine pointers only) ---
  function initMagnetic(){
    if(!finePointer || reducedMotion) return;
    Array.prototype.forEach.call(document.querySelectorAll('.btn-magnetic, #nav-cta'), function(btn){
      btn.classList.add('btn-magnetic');
      btn.addEventListener('pointermove', function(e){
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.22).toFixed(1) + 'px,' + (dy * 0.32 - 2).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function(){ btn.style.transform = ''; });
    });
  }

  // ---- Counters: count up once when scrolled into view (years count the last stretch)
  function initCounters(){
    var counters = document.querySelectorAll('.count');
    observe(counters, function(el){
      var target = parseInt(el.getAttribute('data-to'), 10) || 0;
      if(reducedMotion){ el.textContent = target; return; }
      var from = target > 1000 ? target - 25 : 0;
      var dur = 1600, t0 = null;
      function step(ts){
        if(!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 4)));
        if(p < 1) requestAnimationFrame(step);
      }
      el.textContent = from;
      requestAnimationFrame(step);
    }, { rootMargin: '0px 0px -15% 0px' });
  }

  // ---- Expanding panels: one open at a time; hover, click, Enter or Space ----------
  function initPanels(){
    Array.prototype.forEach.call(document.querySelectorAll('.xpanels'), function(group){
      var panels = Array.prototype.slice.call(group.querySelectorAll('.xpanel'));
      function open(p){
        panels.forEach(function(x){
          var on = x === p;
          x.classList.toggle('is-open', on);
          x.setAttribute('aria-expanded', String(on));
        });
      }
      panels.forEach(function(p){
        p.addEventListener('click', function(){ open(p); });
        p.addEventListener('keydown', function(e){
          if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(p); }
        });
        if(finePointer) p.addEventListener('pointerenter', function(){ open(p); });
      });
    });
  }

  // ---- Side-scrolling rails: arrows, progress, drag-to-scroll on desktop ------------
  function initRails(){
    Array.prototype.forEach.call(document.querySelectorAll('.rail'), function(rail){
      var track = rail.querySelector('.rail-track');
      var btns = rail.querySelectorAll('.rail-btn');
      var bar = rail.querySelector('.rail-progress');
      if(!track) return;
      function step(){ var c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 16 : 300; }
      function sync(){
        var max = track.scrollWidth - track.clientWidth;
        var p = max > 0 ? track.scrollLeft / max : 1;
        var vis = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
        if(bar) bar.style.setProperty('--rp', Math.min(1, vis + (1 - vis) * p).toFixed(3));
        if(btns[0]) btns[0].disabled = track.scrollLeft <= 2;
        if(btns[1]) btns[1].disabled = track.scrollLeft >= max - 2;
        rail.classList.toggle('is-static', max <= 2);
      }
      Array.prototype.forEach.call(btns, function(b){
        b.addEventListener('click', function(){
          track.scrollBy({ left: step() * (+b.getAttribute('data-dir')), behavior: reducedMotion ? 'auto' : 'smooth' });
        });
      });
      track.addEventListener('scroll', function(){ requestAnimationFrame(sync); }, { passive: true });
      window.addEventListener('resize', sync);
      track.addEventListener('keydown', function(e){
        if(e.key === 'ArrowRight'){ e.preventDefault(); track.scrollBy({ left: step(), behavior: 'smooth' }); }
        if(e.key === 'ArrowLeft'){ e.preventDefault(); track.scrollBy({ left: -step(), behavior: 'smooth' }); }
      });
      // drag with the mouse; clicks still work when the pointer barely moved
      if(finePointer){
        var down = false, startX = 0, startLeft = 0, moved = 0;
        track.addEventListener('pointerdown', function(e){
          if(e.pointerType !== 'mouse' || e.button !== 0) return;
          down = true; moved = 0; startX = e.clientX; startLeft = track.scrollLeft;
        });
        window.addEventListener('pointermove', function(e){
          if(!down) return;
          var dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
          if(moved > 6){ track.classList.add('is-dragging'); track.scrollLeft = startLeft - dx; }
        });
        window.addEventListener('pointerup', function(){
          if(!down) return; down = false;
          if(track.classList.contains('is-dragging')){
            track.classList.remove('is-dragging');
            // settle onto the nearest card
            var w = step(); track.scrollTo({ left: Math.round(track.scrollLeft / w) * w, behavior: 'smooth' });
          }
        });
        track.addEventListener('click', function(e){ if(moved > 6){ e.preventDefault(); e.stopPropagation(); } }, true);
      }
      sync();
    });
  }

  // ---- Pause looping panel animations when off-screen -----------------------------
  function initAmbientPause(){
    var loops = document.querySelectorAll('.anim-panel, .net-banner, .case-visual');
    observe(loops, function(el, inView){ el.classList.toggle('is-paused', !inView); }, { once: false });
  }

  // ---- Contact form: posts to hello@cognimorph.co, then redirects to the thank-you page
  // Without JS the form posts natively and FormSubmit follows the hidden `_next` field.
  function initContactForm(){
    var form = document.getElementById('contact-form');
    if(!form || !window.fetch) return;
    var status = document.getElementById('form-status');
    var btn = document.getElementById('contact-submit');
    var label = btn && btn.querySelector('.btn-label');
    var redirect = form.getAttribute('data-redirect');

    // Arriving from a "free consultation" button pre-selects that option
    try{
      if(new URLSearchParams(window.location.search).get('topic') === 'consultation'){
        var interest = document.getElementById('interest');
        if(interest) interest.value = 'Free consultation';
      }
    }catch(e){ /* URLSearchParams unavailable */ }

    function fail(){
      btn.disabled = false;
      label.textContent = 'Send enquiry';
      status.innerHTML = 'That didn’t send. Please email '
        + '<a href="mailto:' + CONFIG.email + '" class="text-link">' + CONFIG.email + '</a> directly and we’ll pick it up.';
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(!form.reportValidity()) return;
      btn.disabled = true;
      label.textContent = 'Sending…';
      status.textContent = '';

      var payload = {};
      new FormData(form).forEach(function(v, k){ payload[k] = v; });

      fetch(form.getAttribute('data-ajax-action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(r){ if(!r.ok) throw new Error('rejected'); return r.json().catch(function(){ return {}; }); })
      .then(function(data){
        if(data && (data.success === false || data.success === 'false')) throw new Error('rejected');
        window.location.assign(redirect);
      })
      .catch(fail);
    });
  }

  // ---- Conversational assistant (panel built on first open) -------------------------
  var OPENERS = ['services','pricing','start','human'];
  var TOPICS = {
    services: {
      q:'What do you do?',
      a:'Four things, run by one team:\n\n• Digital growth — performance marketing, paid social and search, SEO\n• Digital build — websites, apps and software\n• Creative — video, design and CGI\n• AI and automation\n\nMost clients use more than one.',
      next:['growth','build','creative','ai','pricing']
    },
    pricing: {
      q:'How much does it cost?',
      a:'We quote per project rather than publishing rate cards, because scope varies a lot.\n\nMost engagements begin with a short paid discovery, then a fixed scope. Growth and maintenance usually run as a monthly retainer.\n\nTell us the problem and we will come back with a number.',
      next:['start','retainers','human']
    },
    start: {
      q:'How do we get started?',
      a:'Send us a brief and we will reply within one business day, then set up a call to understand the problem before proposing anything.\n\nYou can use the contact form, or email ' + CONFIG.email + ' directly.',
      next:['human','timeline','services'],
      cta:true
    },
    human: {
      q:'I want to talk to a person',
      a:'Of course. Send your question through the contact form or by email and a member of the team will reply within one business day.',
      next:['start','pricing'],
      human:true
    },
    growth: {
      q:'Tell me about digital growth',
      a:'We plan, buy and optimise paid media across Meta, Google, YouTube, TikTok, LinkedIn, Reddit, X, Snapchat, Pinterest and Spotify, plus programmatic through StackAdapt.\n\nSEO and AEO and social media management sit alongside, so the channels support each other.',
      next:['pricing','platforms','start']
    },
    build: {
      q:'Tell me about digital build',
      a:'Websites, web apps, mobile apps and internal software — designed around how people actually behave, then built to stay fast and easy for your team to run.\n\nWe stay on for maintenance rather than handing over and disappearing.',
      next:['pricing','start','services']
    },
    creative: {
      q:'Tell me about creative',
      a:'Video editing, graphic design, CGI and AI video, produced in-house.\n\nWe plan for multi-format capture up front, so one production day covers hero film, short-form cutdowns and stills rather than needing three shoots.',
      next:['pricing','start','services']
    },
    ai: {
      q:'Tell me about AI and automation',
      a:'Two things. We automate the repetitive work inside your business — document handling, reporting, data entry — and we train your team to run and extend it themselves.\n\nWe also use AI in our own production and research, which is why our output holds up.',
      next:['pricing','start','services']
    },
    platforms: {
      q:'Which ad platforms do you run?',
      a:'Meta, Google, YouTube, TikTok, LinkedIn, Reddit, X, Snapchat, Pinterest and Spotify, plus programmatic buying through StackAdapt.\n\nWe also handle the tracking behind them — GA4, Tag Manager, Meta CAPI and server-side events.',
      next:['growth','pricing','start']
    },
    industries: {
      q:'Which industries do you know?',
      a:'SaaS and B2B, e-commerce and retail, yoga and wellness, beauty and personal care, FMCG, and real estate.\n\nIf your sector is not on that list, ask — the fundamentals usually transfer.',
      next:['services','start']
    },
    retainers: {
      q:'Do you work on retainer?',
      a:'Yes. Growth and maintenance work almost always runs monthly.\n\nBuild and creative projects are usually fixed scope, and often continue as a retainer once live.',
      next:['pricing','start']
    },
    timeline: {
      q:'How long do projects take?',
      a:'A marketing site is typically four to six weeks. An app build runs three to five months. Growth campaigns go live within two to three weeks of kickoff, then improve continuously.\n\nWe will give you a real timeline once we know the scope.',
      next:['pricing','start']
    },
    where: {
      q:'Where are you based?',
      a:'We are an expert team built in Nepal and accessible globally. Our main client base is in Dubai, Singapore, the UK, Australia and the USA, and we work across their time zones.',
      next:['services','start']
    }
  };
  var ROUTES = [
    [/\b(price|pricing|cost|budget|quote|rate|charge|fee)\b/i, 'pricing'],
    [/\b(human|person|someone|talk|call|speak|agent|team member)\b/i, 'human'],
    [/\b(whatsapp|phone|number|contact|email|reach)\b/i, 'human'],
    [/\b(start|begin|kick ?off|onboard|hire|work with|brief)\b/i, 'start'],
    [/\b(seo|aeo|ads?|advertis|meta|google|tiktok|linkedin|paid|ppc|campaign|marketing|media buy)\b/i, 'growth'],
    [/\b(platform|channel)\b/i, 'platforms'],
    [/\b(web ?site|app|develop|build|software|shopify|wordpress|code)\b/i, 'build'],
    [/\b(video|creative|design|cgi|edit|graphic|brand|logo)\b/i, 'creative'],
    [/\b(ai|automat|workflow|n8n|chatbot|train)\b/i, 'ai'],
    [/\b(industr|sector|niche|saas|ecommerce|e-commerce|retail|beauty|fmcg|real estate|wellness|yoga)\b/i, 'industries'],
    [/\b(retainer|monthly|ongoing|contract)\b/i, 'retainers'],
    [/\b(how long|timeline|duration|when|deadline|fast|quick)\b/i, 'timeline'],
    [/\b(where|located|location|based|nepal|kathmandu|office)\b/i, 'where'],
    [/\b(what do you do|services?|offer|capabilit)\b/i, 'services']
  ];

  function initAssistant(){
    if(document.getElementById('asst-btn')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<button type="button" class="asst-btn" id="asst-btn" aria-expanded="false" aria-controls="asst-panel" aria-label="Open questions panel">'
      + '<svg class="ic-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.1-4.3A8.5 8.5 0 1 1 20.5 12Z"/><path d="M8.5 10.5h7M8.5 14h4.5"/></svg>'
      + '<svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'
      + '</button>'
      + (WA_LINK ? '<a class="wa-btn" href="' + WA_LINK + '" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">'
      + '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.78 9.78 0 0 1-1.5-5.22c0-5.4 4.41-9.8 9.82-9.8a9.75 9.75 0 0 1 6.94 2.88 9.72 9.72 0 0 1 2.87 6.93c0 5.4-4.41 9.81-9.82 9.81M20.52 3.45A11.67 11.67 0 0 0 12.05 0C5.6 0 .35 5.25.34 11.7c0 2.06.54 4.07 1.56 5.85L.24 24l6.6-1.73a11.7 11.7 0 0 0 5.2 1.24h.01c6.45 0 11.7-5.25 11.7-11.7 0-3.13-1.21-6.07-3.43-8.28"/></svg></a>' : '');
    while(wrap.firstChild){ document.body.appendChild(wrap.firstChild); }

    var btn = document.getElementById('asst-btn');
    var panel, log, chips, form, input, started = false;

    function buildPanel(){
      var p = document.createElement('div');
      p.className = 'asst-panel';
      p.id = 'asst-panel';
      p.setAttribute('role', 'dialog');
      p.setAttribute('aria-label', 'Chat with Cognimorph');
      p.innerHTML =
        '<div class="asst-head">'
        +   '<span class="av-dot" aria-hidden="true"></span>'
        +   '<div class="asst-id"><strong>Cognimorph</strong><span>Answers to common questions</span></div>'
        +   '<button type="button" class="asst-min" id="asst-min" aria-label="Close chat">'
        +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 14h12"/></svg>'
        +   '</button>'
        + '</div>'
        + '<div class="asst-log" id="asst-log" role="log" aria-live="polite"></div>'
        + '<div class="asst-chips" id="asst-chips"></div>'
        + '<form class="asst-composer" id="asst-composer">'
        +   '<input id="asst-input" type="text" autocomplete="off" placeholder="Write a message…" aria-label="Write a message">'
        +   '<button type="submit" aria-label="Send message">'
        +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12h13M12 5.5 18.5 12 12 18.5"/></svg>'
        +   '</button>'
        + '</form>';
      document.body.appendChild(p);
      panel = p;
      log = p.querySelector('#asst-log');
      chips = p.querySelector('#asst-chips');
      form = p.querySelector('#asst-composer');
      input = p.querySelector('#asst-input');
      p.querySelector('#asst-min').addEventListener('click', function(){ setOpen(false); });
      chips.addEventListener('click', function(e){
        var b = e.target.closest('button');
        if(!b) return;
        bubble(TOPICS[b.dataset.k].q, 'me');
        answer(b.dataset.k);
      });
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var text = (input.value || '').trim();
        if(!text) return;
        input.value = '';
        bubble(text, 'me');
        started = true;
        chips.innerHTML = '';
        for(var i = 0; i < ROUTES.length; i++){
          if(ROUTES[i][0].test(text)){ answer(ROUTES[i][1]); return; }
        }
        var typing = typingBubble();
        setTimeout(function(){
          typing.remove();
          bubble('That one is better answered by a person than by me. Send it to the team and you will get a proper reply within one business day.', 'bot');
          humanRow();
          renderChips(['services','pricing','start']);
        }, 560);
      });
      // Force a reflow so the first open animates
      void p.offsetWidth;
    }

    function setOpen(open){
      if(open && !panel) buildPanel();
      document.body.classList.toggle('asst-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close questions panel' : 'Open questions panel');
      if(open){
        if(!started) greet();
        setTimeout(function(){
          var f = started ? input : chips.querySelector('button');
          if(f) f.focus();
        }, 320);
      } else {
        btn.focus();
      }
    }
    btn.addEventListener('click', function(){ setOpen(!document.body.classList.contains('asst-open')); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && document.body.classList.contains('asst-open')) setOpen(false);
    });

    function scrollLog(){ log.scrollTop = log.scrollHeight; }
    function bubble(text, who){
      var m = document.createElement('div');
      m.className = 'msg ' + who;
      String(text).split('\n').forEach(function(line, i){
        if(i) m.appendChild(document.createElement('br'));
        if(line) m.appendChild(document.createTextNode(line));
      });
      log.appendChild(m);
      scrollLog();
      return m;
    }
    function typingBubble(){
      var t = document.createElement('div');
      t.className = 'msg bot typing';
      t.setAttribute('aria-label', 'Typing');
      t.innerHTML = '<span></span><span></span><span></span>';
      log.appendChild(t);
      scrollLog();
      return t;
    }
    function renderChips(keys){
      chips.innerHTML = keys.map(function(k){
        return '<button type="button" data-k="' + k + '">' + TOPICS[k].q + '</button>';
      }).join('');
      chips.classList.toggle('is-opening', !started);
    }
    function actionRow(html){
      var w = document.createElement('div');
      w.className = 'msg-actions';
      w.innerHTML = html;
      log.appendChild(w);
      scrollLog();
    }
    function humanRow(){
      actionRow(
        '<a class="primary" href="' + CONFIG.contactUrl + '">Contact form</a>'
        + '<a href="mailto:' + CONFIG.email + '">' + CONFIG.email + '</a>'
        + (WA_LINK ? '<a class="wa" href="' + WA_LINK + '" target="_blank" rel="noopener">WhatsApp us</a>' : '')
      );
    }
    function answer(key){
      var t = TOPICS[key];
      if(!t) return;
      started = true;
      chips.innerHTML = '';
      var typing = typingBubble();
      setTimeout(function(){
        typing.remove();
        bubble(t.a, 'bot');
        if(t.human) humanRow();
        if(t.cta) actionRow('<a class="primary" href="' + CONFIG.contactUrl + '">Open the contact form</a>');
        renderChips(t.next || ['start','human']);
        scrollLog();
      }, 520 + Math.random() * 280);
    }
    function greet(){
      bubble('Hi — I can answer the common questions here, or put you in touch with someone on the team.', 'bot');
      renderChips(OPENERS);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
