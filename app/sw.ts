import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

type PrecacheEntry = string | { url: string; revision?: string | null };

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: PrecacheEntry[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
