/* Noor — accounts & cloud sync (Supabase).
   Design: the whole app state is one JSON document. Each signed-in user has
   exactly one row in `user_data` (user_id → data jsonb). Row Level Security
   makes sure a user can only ever touch their own row.
   Sync rules: on sign-in, pull the cloud row; if it is newer than the last
   local sync, it replaces local data (page reloads). While signed in, any
   local change is pushed (debounced) — last write wins. */
(function () {
  'use strict';
  var META_KEY = 'noor.cloud.v1';
  var cfg = window.NOOR_CONFIG || {};
  function $(id) { return document.getElementById(id); }
  function meta() { try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch (e) { return {}; } }
  function setMeta(m) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) {} }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return String(h); }
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    var status = $('auth-status'), btn = $('auth-btn'), out = $('auth-out');
    if (!status || !btn) return;

    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      status.textContent = 'Cloud backup ka setup abhi pending hai — filhal data is device par save hota hai, aur backup file se doosre phone par ja sakta hai.';
      btn.style.display = 'none';
      return;
    }
    if (!window.supabase) {
      status.textContent = 'Cloud library load nahi hui (internet chahiye pehli dafa). Data is device par safe hai.';
      btn.style.display = 'none';
      return;
    }

    var client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    var session = null, pushing = false;

    function appState() { try { return (typeof S !== 'undefined' && S) ? S : {}; } catch (e) { return {}; } }
    function localHash() { try { return hash(JSON.stringify(appState())); } catch (e) { return ''; } }

    function render() {
      if (session) {
        var email = (session.user && session.user.email) || 'your account';
        var m = meta();
        status.textContent = 'Signed in: ' + email + (m.lastSyncAt ? ' · Last synced ' + new Date(m.lastSyncAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ' · Syncing…');
        btn.style.display = 'none'; out.classList.remove('hidden');
      } else {
        status.textContent = 'Sign in karo — tumhara data cloud me safe rahega, app delete ho ya phone badal jaye, sign in karte hi sab wapas.';
        btn.style.display = ''; out.classList.add('hidden');
      }
    }

    function push() {
      if (!session || pushing) return;
      var h = localHash(); if (!h || h === meta().lastHash) return;
      pushing = true;
      var now = new Date().toISOString();
      client.from('user_data').upsert({ user_id: session.user.id, data: appState(), updated_at: now }, { onConflict: 'user_id' })
        .then(function (res) {
          pushing = false;
          if (!res.error) { var m = meta(); m.lastHash = h; m.lastSyncAt = now; setMeta(m); render(); }
        });
    }

    function pull() {
      if (!session) return;
      client.from('user_data').select('data, updated_at').eq('user_id', session.user.id).maybeSingle()
        .then(function (res) {
          if (res.error || !res.data) { push(); return; }
          var cloud = res.data;
          var m = meta();
          var cloudHash = hash(JSON.stringify(cloud.data || {}));
          var cloudNewer = !m.lastSyncAt || new Date(cloud.updated_at) > new Date(m.lastSyncAt);
          if (cloudHash !== localHash() && cloudNewer) {
            try {
              localStorage.setItem('noor.data.v1', JSON.stringify(cloud.data));
              m.lastHash = cloudHash; m.lastSyncAt = cloud.updated_at; setMeta(m);
              location.reload();
            } catch (e) { push(); }
          } else {
            m.lastHash = cloudHash === localHash() ? cloudHash : m.lastHash;
            if (cloudHash === localHash()) { m.lastSyncAt = cloud.updated_at; setMeta(m); }
            render(); push();
          }
        });
    }

    btn.addEventListener('click', function () {
      client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: location.origin + location.pathname }
      });
    });
    out.addEventListener('click', function () {
      client.auth.signOut().then(function () { setMeta({}); location.reload(); });
    });

    client.auth.getSession().then(function (r) { session = r.data.session; render(); if (session) pull(); });
    client.auth.onAuthStateChange(function (_evt, s) { session = s; render(); if (session) pull(); });

    setInterval(push, 10000);
    document.addEventListener('visibilitychange', function () { if (document.hidden) push(); });
    window.addEventListener('beforeunload', push);
  });
})();
