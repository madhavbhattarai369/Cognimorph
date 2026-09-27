// Cognimorph — live world network (Kathmandu exchanging data with client regions)
// Loaded on the home and about pages. Source file; pages load js/world.min.js.
(function(){
  'use strict';

  // ---- World network: Kathmandu exchanging data with the client regions --------------
  var WORLD = {"step":2.6,"lat0":75,"cols":138,"rows":50,"rle":"m,3,5,4,3,2,9,d,t,1,9,e,9,1,e,1,8,1,e,5,3,2,1,7,7,a,1,1,n,1h,2,22,9,5,1,1,4,1,1a,1y,4,1,4,2,1o,r,2,1,5,2,6,3,j,5,1,1o,6,6,1,k,6,3,a,1,i,5,1,1g,3,3,c,1,8,g,5,6,m,1,6,2,3,18,7,2,o,i,3,7,l,2,3,3,2,19,7,2,r,i,1,9,i,3,2,1h,5,1,s,q,1,1,m,1h,1,1,y,l,1,1,2,3,j,1j,11,l,1,2,n,c,1,5,2,x,11,l,o,4,3,2,1,4,5,3,1,v,3,1,10,j,p,3,3,1,2,1,1,1,1,9,2,p,1,2,5,1,10,i,q,3,5,1,2,1,2,9,1,q,2,1,3,1,12,h,r,6,a,w,5,3,13,e,s,9,2,1,5,x,3,1,18,7,1,1,2,1,r,n,1,r,1b,1,1,5,w,i,1,5,2,p,1d,1,1,4,v,k,1,5,1,1,4,k,1g,3,7,1,n,k,1,8,4,7,2,7,1j,3,2,2,5,2,k,l,1,6,6,5,3,5,1,1,1l,4,s,l,2,4,7,4,6,4,1p,3,q,m,1,2,a,2,7,4,5,1,1l,1,4,2,k,n,2,1,9,2,7,1,1,2,5,2,1l,2,1,6,i,p,i,1,9,1,1n,8,i,5,1,h,k,1,8,1,1n,b,n,e,l,1,4,1,1r,b,n,d,l,2,2,4,3,1,1l,e,l,c,n,1,3,2,1,1,4,1,1j,h,j,a,p,1,5,1,5,4,1f,i,i,a,q,2,b,3,3,1,1b,h,i,b,15,1,1f,f,j,b,z,2,1k,e,k,b,3,1,s,4,3,1,1j,c,k,a,2,2,s,9,1j,c,k,9,3,2,r,b,1i,b,m,8,3,2,p,e,1h,9,o,7,4,1,q,f,1g,9,o,7,v,f,1g,8,q,5,w,f,1g,7,r,4,y,3,4,7,1f,6,23,5,1g,6,24,3,a,2,15,4,3q,3,29,1,9,1,16,3,2i,2,17,4,3q,3,3t,1,2n"};
  function initWorld(C){
    var canvas = document.querySelector('.world-canvas');
    if(!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.band-cities li'));
    // unpack the run-length encoded land mask
    var bits = [], v = 0;
    WORLD.rle.split(',').forEach(function(n){ n = parseInt(n, 36); for(var i = 0; i < n; i++) bits.push(v); v = 1 - v; });
    var VIEW = { lon0: -98, lon1: 178, lat0: 68, lat1: -46 };
    var HUB = { name: 'Kathmandu', lat: 27.7, lon: 85.3 };
    var CITIES = [
      { name: 'Dubai', lat: 25.2, lon: 55.3 },
      { name: 'Singapore', lat: 1.35, lon: 103.8 },
      { name: 'London', lat: 51.5, lon: -0.13 },
      { name: 'Sydney', lat: -33.9, lon: 151.2 },
      { name: 'New York', lat: 40.7, lon: -74 }
    ];
    var W = 0, H = 0, dpr = 1, base = null, arcs = [], packets = [], rings = [], visible = false, running = false, last = 0;

    function proj(lat, lon){
      return [ (lon - VIEW.lon0) / (VIEW.lon1 - VIEW.lon0) * W, (VIEW.lat0 - lat) / (VIEW.lat0 - VIEW.lat1) * H ];
    }
    function layout(){
      var r = canvas.getBoundingClientRect();
      if(!r.width) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      // pre-render the dotted map once per size
      base = document.createElement('canvas');
      base.width = canvas.width; base.height = canvas.height;
      var b = base.getContext('2d');
      b.scale(dpr, dpr);
      var hub = proj(HUB.lat, HUB.lon);
      var dot = Math.max(1, W / 460);
      for(var row = 0; row < WORLD.rows; row++){
        for(var col = 0; col < WORLD.cols; col++){
          if(!bits[row * WORLD.cols + col]) continue;
          var lon = -180 + col * WORLD.step + WORLD.step / 2, lat = WORLD.lat0 - row * WORLD.step - WORLD.step / 2;
          if(lon < VIEW.lon0 || lon > VIEW.lon1 || lat > VIEW.lat0 || lat < VIEW.lat1) continue;
          var p = proj(lat, lon);
          var d = Math.hypot(p[0] - hub[0], p[1] - hub[1]) / W;
          b.fillStyle = 'rgba(244,239,228,' + (0.1 + Math.max(0, 0.32 - d * 0.9)).toFixed(3) + ')';
          b.beginPath(); b.arc(p[0], p[1], dot, 0, 6.2832); b.fill();
        }
      }
      arcs = CITIES.map(function(c){
        var a = proj(HUB.lat, HUB.lon), z = proj(c.lat, c.lon);
        var mx = (a[0] + z[0]) / 2, my = (a[1] + z[1]) / 2;
        var dx = z[0] - a[0], dy = z[1] - a[1], len = Math.hypot(dx, dy);
        var lift = Math.min(len * 0.35, H * 0.32);
        return { city: c, a: a, z: z, c: [mx + dy / len * lift * (dx < 0 ? 1 : -1) * 0.25, my - lift] };
      });
    }
    function pt(arc, t){
      var u = 1 - t;
      return [u * u * arc.a[0] + 2 * u * t * arc.c[0] + t * t * arc.z[0], u * u * arc.a[1] + 2 * u * t * arc.c[1] + t * t * arc.z[1]];
    }
    function spawn(){
      var i = Math.floor(Math.random() * arcs.length);
      packets.push({ arc: arcs[i], i: i, t: 0, out: Math.random() < 0.6, speed: 0.0035 + Math.random() * 0.003 });
    }
    function draw(now){
      var dt = last ? Math.min(50, now - last) / 16.7 : 1; last = now;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if(base) ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // arcs
      arcs.forEach(function(arc){
        ctx.strokeStyle = 'rgba(124,182,220,.28)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(arc.a[0], arc.a[1]); ctx.quadraticCurveTo(arc.c[0], arc.c[1], arc.z[0], arc.z[1]); ctx.stroke();
      });
      // packets with short glowing trails
      for(var k = packets.length - 1; k >= 0; k--){
        var pk = packets[k];
        pk.t += pk.speed * dt;
        if(pk.t >= 1){
          rings.push({ p: pk.out ? pk.arc.z : pk.arc.a, r: 0 });
          if(pk.out && chips[pk.i]){ var ch = chips[pk.i]; ch.classList.add('is-live'); setTimeout(function(){ ch.classList.remove('is-live'); }, 900); }
          packets.splice(k, 1); continue;
        }
        var tt = pk.out ? pk.t : 1 - pk.t;
        for(var s = 0; s < 8; s++){
          var ts = pk.out ? tt - s * 0.012 : tt + s * 0.012;
          if(ts < 0 || ts > 1) continue;
          var q = pt(pk.arc, ts);
          ctx.fillStyle = 'rgba(233,106,36,' + (0.9 - s * 0.11).toFixed(2) + ')';
          ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(0.6, 2.4 - s * 0.22), 0, 6.2832); ctx.fill();
        }
      }
      if(packets.length < 7 && Math.random() < 0.06 * dt) spawn();
      // arrival rings
      for(var r = rings.length - 1; r >= 0; r--){
        var rg = rings[r]; rg.r += 0.5 * dt;
        var a = 1 - rg.r / 18;
        if(a <= 0){ rings.splice(r, 1); continue; }
        ctx.strokeStyle = 'rgba(233,106,36,' + a.toFixed(2) + ')'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(rg.p[0], rg.p[1], 3 + rg.r, 0, 6.2832); ctx.stroke();
      }
      // cities and hub
      ctx.font = '500 ' + Math.max(10, Math.round(W / 62)) + 'px Inter, sans-serif';
      arcs.forEach(function(arc){
        ctx.fillStyle = '#F4EFE4'; ctx.beginPath(); ctx.arc(arc.z[0], arc.z[1], 3, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(244,239,228,.75)';
        var right = arc.z[0] > W * 0.82;
        ctx.textAlign = right ? 'right' : 'left';
        ctx.fillText(arc.city.name, arc.z[0] + (right ? -7 : 7), arc.z[1] + (right ? 16 : 4));
        ctx.textAlign = 'left';
      });
      var h = arcs.length ? arcs[0].a : proj(HUB.lat, HUB.lon);
      var pulse = (now / 1600) % 1;
      ctx.strokeStyle = 'rgba(233,106,36,' + (0.6 * (1 - pulse)).toFixed(2) + ')'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(h[0], h[1], 5 + pulse * 16, 0, 6.2832); ctx.stroke();
      ctx.fillStyle = '#E96A24'; ctx.beginPath(); ctx.arc(h[0], h[1], 5, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#F4EFE4'; ctx.font = '600 ' + Math.max(11, Math.round(W / 55)) + 'px Inter, sans-serif';
      ctx.fillText('Kathmandu', h[0] + 9, h[1] - 8);
      if(visible && !C.reducedMotion){ requestAnimationFrame(draw); } else { running = false; }
    }
    function start(){ if(!running){ running = true; last = 0; requestAnimationFrame(draw); } }
    layout();
    window.addEventListener('resize', function(){ layout(); if(!running) requestAnimationFrame(draw); });
    if(C.reducedMotion){
      // static frame: a few packets frozen mid-flight
      arcs.forEach(function(a, i){ packets.push({ arc: a, i: i, t: 0.55, out: true, speed: 0 }); });
      requestAnimationFrame(draw);
      return;
    }
    C.observe([canvas], function(_, inView){ visible = inView; if(inView){ layout(); start(); } }, { once: false, rootMargin: '100px 0px 100px 0px' });
  }

  function boot(){ if(window.Cognimorph) initWorld(window.Cognimorph); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
