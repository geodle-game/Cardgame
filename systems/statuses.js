export function applyStatus(entity, status, amount) {
  entity.statuses[status] = (entity.statuses[status] || 0) + amount;
}

export function hasStatus(entity, status) {
  return (entity.statuses[status] || 0) > 0;
}

export function outgoingMultiplier(attacker) {
  return hasStatus(attacker, 'weak') ? 0.75 : 1;
}

export function incomingMultiplier(target) {
  return hasStatus(target, 'vulnerable') ? 1.5 : 1;
}

export function tickStatuses(entity) {
  for (const k of Object.keys(entity.statuses)) {
    entity.statuses[k]--;
    if (entity.statuses[k] <= 0) delete entity.statuses[k];
  }
}
