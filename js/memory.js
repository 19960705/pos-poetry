window.PosMemory = (function () {
  const KEY = "ye-ban-shi-pu";

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function blank() {
    return {
      visits: 0,
      firstAt: 0,
      lastAt: 0,
      lastDay: "",
      printsToday: 0,
      points: 0,
      kept: [],
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      return Object.assign(blank(), JSON.parse(raw));
    } catch (err) {
      return blank();
    }
  }

  function save(mem) {
    try {
      localStorage.setItem(KEY, JSON.stringify(mem));
    } catch (err) {
      mem.kept = mem.kept.slice(0, 4);
      try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e2) {}
    }
  }

  return {
    load,
    save,
    todayStr,
    touchVisit(mem) {
      const now = Date.now();
      const day = todayStr();
      if (mem.lastDay !== day) mem.printsToday = 0;
      const gap = now - (mem.lastAt || 0);
      if (!mem.visits) {
        mem.visits = 1;
        mem.firstAt = now;
      } else if (mem.lastDay !== day || gap > 6 * 3600 * 1000) {
        mem.visits += 1;
      }
      mem.lastAt = now;
      mem.lastDay = day;
      save(mem);
      return mem;
    },
    addPrint(mem) {
      const day = todayStr();
      if (mem.lastDay !== day) mem.printsToday = 0;
      mem.printsToday += 1;
      mem.points += 1;
      mem.lastDay = day;
      mem.lastAt = Date.now();
      save(mem);
    },
    keep(mem, slip) {
      mem.kept.unshift(slip);
      if (mem.kept.length > 10) mem.kept.length = 10;
      save(mem);
    },
    fade(keptAt) {
      const days = (Date.now() - (keptAt || Date.now())) / 86400000;
      return Math.max(0.36, 1 - days / 14);
    },
  };
})();
