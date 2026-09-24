import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { toExternalUrl, toInternalUrl } from "./lib/portal-host";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Subdomain portals: admin.* / reseller.* serve the /admin and /reseller
    // route trees at the root of their own host. See src/lib/portal-host.ts.
    rewrite: {
      input: toInternalUrl,
      output: toExternalUrl,
    },
    defaultPreloadStaleTime: 0,
    // This project intentionally runs with strictNullChecks off (ported codebase);
    // TanStack Router's types demand it, so cast past the compile-time guard.
  } as any);

  return router;
};
