/**
 * Compatibility layer mapping the subset of react-router-dom APIs used by the
 * ported GCOS app onto @tanstack/react-router. No react-router-dom code is
 * used; all routing is handled by TanStack Router underneath.
 */
import * as React from "react";
import {
  Link as TanLink,
  useNavigate as useTanNavigate,
  useParams as useTanParams,
  useLocation as useTanLocation,
  useRouter,
  useRouterState,
  Outlet,
} from "@tanstack/react-router";

export { Outlet };

type To = string | number;

export function useNavigate() {
  const navigate = useTanNavigate();
  const router = useRouter();
  return React.useCallback(
    (to: To, options?: { replace?: boolean; state?: unknown }) => {
      if (typeof to === "number") {
        if (to === -1) router.history.back();
        else if (to === 1) router.history.forward();
        else router.history.go(to);
        return;
      }
      // react-router resolves relative paths; the GCOS app uses absolute ones.
      void navigate({
        to: to as never,
        replace: options?.replace,
        state: options?.state as never,
      });
    },
    [navigate, router],
  );
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return (useTanParams as (opts: { strict: boolean }) => unknown)({ strict: false }) as T;
}

export function useLocation() {
  return useTanLocation();
}


/** Minimal URLSearchParams-based equivalent of react-router's useSearchParams. */
export function useSearchParams(): [
  URLSearchParams,
  (next: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams), opts?: { replace?: boolean }) => void,
] {
  const search = useRouterState({ select: (s) => s.location.search }) as unknown as Record<string, unknown>;
  const navigate = useTanNavigate();
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(search ?? {})) {
    if (v != null) params.set(k, String(v));
  }
  const setParams = React.useCallback(
    (
      next: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams),
      opts?: { replace?: boolean },
    ) => {
      const resolved =
        typeof next === "function" ? next(new URLSearchParams(params)) : next;
      const obj: Record<string, string> =
        resolved instanceof URLSearchParams
          ? Object.fromEntries(resolved.entries())
          : resolved;
      void navigate({ to: "." as never, search: obj as never, replace: opts?.replace });
    },
    [navigate, params],
  );
  return [params, setParams];
}

export function Navigate({
  to,
  replace = true,
}: {
  to: string;
  replace?: boolean;
}) {
  const navigate = useTanNavigate();
  React.useEffect(() => {
    void navigate({ to: to as never, replace });
  }, [navigate, to, replace]);
  return null;
}

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  replace?: boolean;
  state?: unknown;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state, ...rest },
  ref,
) {
  return <TanLink ref={ref} to={to as never} replace={replace} {...rest} />;
});

export interface NavLinkProps extends Omit<LinkProps, "className" | "style" | "children"> {
  end?: boolean;
  activeClassName?: string;
  pendingClassName?: string;
  className?: string | ((state: { isActive: boolean; isPending: boolean }) => string | undefined);
  style?:
    | React.CSSProperties
    | ((state: { isActive: boolean; isPending: boolean }) => React.CSSProperties | undefined);
  children?:
    | React.ReactNode
    | ((state: { isActive: boolean; isPending: boolean }) => React.ReactNode);
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { to, end, className, style, children, activeClassName, pendingClassName, ...rest },
  ref,
) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  const state = { isActive, isPending: false };

  const resolvedClassName =
    typeof className === "function"
      ? className(state)
      : [className, isActive ? activeClassName : undefined].filter(Boolean).join(" ") || undefined;
  const resolvedStyle = typeof style === "function" ? style(state) : style;
  const resolvedChildren = typeof children === "function" ? children(state) : children;

  return (
    <TanLink ref={ref} to={to as never} className={resolvedClassName} style={resolvedStyle} {...rest}>
      {resolvedChildren}
    </TanLink>
  );
});
