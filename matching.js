(function (root) {
  'use strict';
  const aliases = { 'cedar wood': 'cedarwood' };
  const thresholds = { high: .70, medium: .35 };
  function normalizeNote(value) {
    const key = String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    return aliases[key] || key;
  }
  function notes(perfume) {
    const values = Array.isArray(perfume.note_keys) ? perfume.note_keys : Object.values(perfume.notes || {}).flat();
    return [...new Set(values.filter(value => typeof value === 'string').map(normalizeNote).filter(Boolean))].sort();
  }
  function identity(perfume) {
    return perfume.id != null ? String(perfume.id) : JSON.stringify([perfume.brand, perfume.name, notes(perfume)]);
  }
  function buildProfile(favorites, excludedId) {
    const unique = new Map();
    favorites.forEach(perfume => {
      const id = identity(perfume);
      if (id !== excludedId && !unique.has(id)) unique.set(id, perfume);
    });
    const selected = [...unique.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([, perfume]) => perfume);
    const contributing = selected.filter(perfume => notes(perfume).length);
    const weights = new Map(), counts = new Map();
    contributing.forEach(perfume => {
      const keys = notes(perfume), contribution = 1 / Math.sqrt(keys.length) / contributing.length;
      keys.forEach(key => {
        weights.set(key, (weights.get(key) || 0) + contribution);
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
    const norm = Math.sqrt([...weights.values()].reduce((sum, weight) => sum + weight * weight, 0));
    return { weights, counts, norm, selectedCount: selected.length, contributingCount: contributing.length,
      excluded: selected.filter(perfume => !notes(perfume).length) };
  }
  function percentage(score) {
    return typeof score === 'number' && Number.isFinite(score) ? Math.round(Math.min(1, Math.max(0, score)) * 100) : null;
  }
  function category(score) {
    return score >= thresholds.high ? 'High overlap' : score >= thresholds.medium ? 'Medium overlap' : 'Low overlap';
  }
  function assess(target, favorites) {
    const profile = buildProfile(favorites, identity(target)), targetNotes = notes(target);
    const result = { profile, available: false, score: null, percentage: null, title: 'Not enough data', shared: [], different: [],
      selectedCount: profile.selectedCount, contributingCount: profile.contributingCount };
    if (profile.selectedCount < 2) return { ...result, title: 'Add another favorite', reason: 'too-few-favorites' };
    if (profile.contributingCount < 2 || !targetNotes.length) return { ...result, reason: 'missing-notes' };
    const shared = targetNotes.filter(key => profile.weights.has(key)).sort((a, b) =>
      profile.counts.get(b) - profile.counts.get(a) || profile.weights.get(b) - profile.weights.get(a) || (a < b ? -1 : a > b ? 1 : 0));
    const dot = shared.reduce((sum, key) => sum + profile.weights.get(key) / Math.sqrt(targetNotes.length), 0);
    const score = Math.min(1, Math.max(0, dot / profile.norm));
    return { ...result, available: true, score, percentage: percentage(score), title: category(score), shared,
      different: targetNotes.filter(key => !profile.weights.has(key)) };
  }
  function explain(result, displayName = key => key) {
    if (!result.available) return result.reason === 'too-few-favorites'
      ? 'Choose at least two perfumes you love to build your profile.'
      : 'We need listed notes for this perfume and at least two of your favorites.';
    const join = keys => keys.slice(0, 2).map(key => displayName(key).toLowerCase()).join(' and ');
    if (!result.shared.length) return `None of its listed notes appear in your favorites. This one lists ${join(result.different)}.`;
    const key = result.shared[0], count = result.profile.counts.get(key), total = result.contributingCount;
    const name = displayName(key), capitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const evidence = count === total ? (total === 2 ? 'both of your favorites' : `all ${total} of your favorites`) : `${count} of your ${total} favorites`;
    return `${capitalized} appears in ${evidence}. ${result.different.length
      ? `This one adds ${join(result.different)}.`
      : 'All its listed notes appear somewhere in your collection.'}`;
  }
  const api = { normalizeNote, notes, buildProfile, assess, percentage, category, thresholds, explain };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ScentMatcher = api;
})(typeof window !== 'undefined' ? window : globalThis);
