import { Innertube } from 'youtubei.js';

let instance: Innertube | null = null;
let createdAt = 0;
const SESSION_TTL = 25 * 60 * 1000; // 25 minutes

export async function getInnertube(): Promise<Innertube> {
  const now = Date.now();
  if (instance && now - createdAt < SESSION_TTL) {
    return instance;
  }

  instance = await Innertube.create({
    generate_session_locally: true,
    retrieve_player: true,
  });

  createdAt = now;
  return instance;
}

export async function refreshInnertube(): Promise<Innertube> {
  instance = null;
  return getInnertube();
}
