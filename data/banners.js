// Combat backdrops. Each entry is a list of candidates; one is chosen
// at random when the combat starts, so fights don't look identical.

export const COMBAT_BANNERS = {
  monster: [
    'assets/banner1.jpg',
    'assets/banner2.jpg',
    'assets/banner4.jpg',
    'assets/banner6.jpg',
  ],
  elite: [
    'assets/banner5.jpg',
  ],
  boss: [
    'assets/banner3.jpg',
    'assets/banner5.jpg',
  ],
};

export function bannerForCombat(kind, rng = Math.random) {
  const list = COMBAT_BANNERS[kind] ?? COMBAT_BANNERS.monster;
  return list[Math.floor(rng() * list.length)];
}
