export function applyStatus(entity, status, amount) {
  entity.statuses[status] = (entity.statuses[status] || 0) + amount;
}

export function hasStatus(entity, status) {
  return (entity.statuses[status] || 0) > 0;
}

export function outgoingMultiplier(attacker) {
  let m = 1;
  if (hasStatus(attacker, 'weak')) m *= 0.75;
  return m;
}

export function outgoingFlatBonus(attacker) {
  return attacker.statuses?.strength || 0;
}

export function incomingMultiplier(target) {
  return hasStatus(target, 'vulnerable') ? 1.5 : 1;
}

export function tickStatuses(entity) {
  for (const k of Object.keys(entity.statuses)) {
    if (k === 'strength') continue;   // Strength doesn't decay
    entity.statuses[k]--;
    if (entity.statuses[k] <= 0) delete entity.statuses[k];
  }
}
