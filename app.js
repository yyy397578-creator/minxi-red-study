/* ============ 重走闽西长征路 —— 全站共享脚本 ============ */
(function () {
  'use strict';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- footer 注入当前年份 ---------- */
  $$('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 移动端导航开关 ---------- */
  var navToggle = $('#navToggle');
  var mainNav = $('#mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  /* ---------- 首页 Banner 轮播 ---------- */
  var hero = $('.hero');
  if (hero) {
    var slides = $$('.slide', hero);
    var dotsWrap = $('#heroDots');
    var dots = dotsWrap ? $$('button', dotsWrap) : [];
    var cur = 0;
    var timer = null;

    function go(i) {
      if (!slides.length) return;
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('active', k === cur); });
      dots.forEach(function (d, k) { d.classList.toggle('active', k === cur); });
    }
    function startAuto() {
      if (slides.length > 1) {
        timer = setInterval(function () { go(cur + 1); }, 5000);
      }
    }
    function resetAuto() {
      if (timer) clearInterval(timer);
      startAuto();
    }
    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { go(k); resetAuto(); });
    });
    var prevBtn = $('#heroPrev');
    var nextBtn = $('#heroNext');
    if (prevBtn) prevBtn.addEventListener('click', function () { go(cur - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(cur + 1); resetAuto(); });
    startAuto();
  }

  /* ---------- Tabs 通用切换 ---------- */
  $$('.tabs').forEach(function (tabs) {
    var scope = tabs.parentElement || document;
    $$('.tab', tabs).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-tab');
        $$('.tab', tabs).forEach(function (b) { b.classList.toggle('active', b === btn); });
        $$('.tab-panel', scope).forEach(function (p) { p.classList.toggle('active', p.id === id); });
      });
    });
  });

  /* ---------- 弹窗通用开关 ---------- */
  function openModal(m) { if (m) m.classList.add('open'); }
  function closeModal(m) { if (m) m.classList.remove('open'); }
  $$('.modal-back').forEach(function (back) {
    back.addEventListener('click', function (e) {
      if (e.target === back) closeModal(back);
    });
    $$('[data-close]', back).forEach(function (b) {
      b.addEventListener('click', function () { closeModal(back); });
    });
  });

  /* ---------- 研学地图：点位弹窗 / 打卡 / 模拟语音 ---------- */
  var pm = $('#pointModal');
  if (pm) {
    var pmTitle = $('#pmTitle');
    var pmDesc = $('#pmDesc');
    var pmOpen = $('#pmOpen');
    var pmAddr = $('#pmAddr');
    var pmCount = $('#pmCount');
    var pmCheck = $('#pmCheck');
    var curPointName = '';

    function fillModal(d, alreadyChecked) {
      curPointName = d.name || '';
      if (pmTitle) pmTitle.textContent = d.name || '研学点位';
      if (pmDesc) pmDesc.textContent = d.desc || '';
      if (pmOpen) pmOpen.textContent = d.open || '—';
      if (pmAddr) pmAddr.textContent = d.addr || '—';
      if (pmCount) pmCount.textContent = d.count || '0';
      if (pmCheck) {
        pmCheck.disabled = !!alreadyChecked;
        pmCheck.textContent = alreadyChecked ? '已打卡 ✓' : '立即打卡';
      }
      stopPlay();
      openModal(pm);
    }

    $$('[data-point]').forEach(function (el) {
      el.addEventListener('click', function () {
        var d = el.dataset || {};
        var checked = el.classList.contains('checked') || d.checked === '1';
        fillModal(d, checked);
      });
    });

    if (pmCheck) {
      pmCheck.addEventListener('click', function () {
        pmCheck.disabled = true;
        pmCheck.textContent = '已打卡 ✓';
        $$('g.point').forEach(function (g) {
          if (g.getAttribute('data-name') === curPointName) {
            g.classList.remove('unchecked');
            g.classList.add('checked');
          }
        });
      });
    }

    /* 语音导览（纯UI模拟播放） */
    var pmPlay = $('#pmPlay');
    var pmBar = $('#pmBar');
    var pmTime = $('#pmTime');
    var playTimer = null;

    function stopPlay() {
      if (playTimer) { clearInterval(playTimer); playTimer = null; }
      if (pmPlay) pmPlay.textContent = '▶';
      if (pmBar) pmBar.style.width = '0';
      if (pmTime) pmTime.textContent = '00:00 / 03:26';
    }
    if (pmPlay && pmBar && pmTime) {
      pmPlay.addEventListener('click', function () {
        if (playTimer) { stopPlay(); return; }
        pmPlay.textContent = '❚❚';
        var w = 0;
        playTimer = setInterval(function () {
          w += 1.2;
          if (w >= 100) { stopPlay(); return; }
          pmBar.style.width = w + '%';
          var sec = Math.round(w / 100 * 206);
          var mm = ('0' + Math.floor(sec / 60)).slice(-2);
          var ss = ('0' + (sec % 60)).slice(-2);
          pmTime.textContent = mm + ':' + ss + ' / 03:26';
        }, 200);
      });
    }
    /* 关闭弹窗时停止播放 */
    pm.addEventListener('click', function (e) {
      if (e.target === pm || (e.target.closest && e.target.closest('[data-close]'))) stopPlay();
    });
  }

  /* ---------- 答题闯关判定 ---------- */
  var quizScore = $('#quizScore');
  var quizList = $$('.quiz-q');
  if (quizList.length) {
    var answered = 0;
    var right = 0;
    quizList.forEach(function (q) {
      var opts = $$('.opt', q);
      var done = false;
      opts.forEach(function (o) {
        o.addEventListener('click', function () {
          if (done) return;
          done = true;
          answered++;
          if (o.getAttribute('data-c') === '1') {
            o.classList.add('correct');
            right++;
          } else {
            o.classList.add('wrong');
            opts.forEach(function (x) {
              if (x.getAttribute('data-c') === '1') x.classList.add('correct');
            });
          }
          opts.forEach(function (x) { x.classList.add('disabled'); });
          var ex = $('.explain', q);
          if (ex) ex.style.display = 'block';
          if (quizScore) {
            quizScore.textContent = '已作答 ' + answered + ' / ' + quizList.length + ' 题，答对 ' + right + ' 题';
          }
        });
      });
    });
  }

  /* ---------- 资源库：搜索与筛选 ---------- */
  var resSearch = $('#resSearch');
  var filterType = $('#filterType');
  var filterGroup = $('#filterGroup');
  if (resSearch || filterType || filterGroup) {
    var resItems = $$('.res-item');
    var resEmpty = $('#resEmpty');
    var resBtn = $('#resSearchBtn');

    function filterRes() {
      var kw = resSearch ? resSearch.value.replace(/\s+/g, '') : '';
      var t = filterType ? filterType.value : '全部类型';
      var g = filterGroup ? filterGroup.value : '全部群体';
      var shown = 0;
      resItems.forEach(function (it) {
        var ok = true;
        if (t !== '全部类型' && t !== '全部' && it.getAttribute('data-type') !== t) ok = false;
        if (g !== '全部群体' && g !== '全部' && it.getAttribute('data-group') !== g) ok = false;
        if (kw && it.textContent.indexOf(kw) === -1) ok = false;
        it.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (resEmpty) resEmpty.style.display = shown ? 'none' : 'block';
    }
    if (resSearch) resSearch.addEventListener('input', filterRes);
    if (resBtn) resBtn.addEventListener('click', filterRes);
    if (filterType) filterType.addEventListener('change', filterRes);
    if (filterGroup) filterGroup.addEventListener('change', filterRes);
  }

  /* ---------- 志愿平台：金点子留言 ---------- */
  var ideaBtn = $('#ideaBtn');
  var ideaInput = $('#ideaInput');
  var ideaList = $('#ideaList');
  if (ideaBtn && ideaInput && ideaList) {
    ideaBtn.addEventListener('click', function () {
      var v = ideaInput.value.replace(/^\s+|\s+$/g, '');
      if (!v) return;
      var div = document.createElement('div');
      div.className = 'idea-item';
      var who = document.createElement('div');
      who.className = 'who';
      who.textContent = '热心网友 · 刚刚';
      var p = document.createElement('p');
      p.textContent = v;
      div.appendChild(who);
      div.appendChild(p);
      ideaList.insertBefore(div, ideaList.firstChild);
      ideaInput.value = '';
    });
  }
})();
