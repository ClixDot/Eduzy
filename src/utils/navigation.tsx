'use client';
import React, { useCallback, useMemo } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>, Partial<NextLinkProps> {
  to?: string;
  href?: string;
  state?: any;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  // `state` is a react-router prop with no Next.js equivalent; pulled out so it is not passed to <a>.
  { to, href, children, state: _state, ...props },
  ref
) {
  const target = href || to || '#';
  return (
    <NextLink ref={ref} href={target} {...(props as any)}>
      {children}
    </NextLink>
  );
});

export function useNavigate() {
  const router = useRouter();
  return useCallback((to: string | number, options: { replace?: boolean; state?: any } = {}) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router]);
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const [search, setSearch] = React.useState('');
  const [hash, setHash] = React.useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearch(window.location.search);
      setHash(window.location.hash);
    }
  }, [pathname]);

  return useMemo(() => ({
    pathname,
    search,
    hash,
    state: null as any,
  }), [pathname, search, hash]);
}

export function useParams<T = Record<string, string>>(): T {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useSearchParams(): [URLSearchParams, (newParams: any, options?: { replace?: boolean }) => void] {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = useCallback((newParams: any, options: { replace?: boolean } = {}) => {
    const params = new URLSearchParams(typeof newParams === 'object' && newParams !== null ? newParams : {});
    const query = params.toString() ? `?${params.toString()}` : '';
    if (options?.replace) {
      router.replace(`${pathname}${query}`);
    } else {
      router.push(`${pathname}${query}`);
    }
  }, [pathname, router]);

  return [searchParams || new URLSearchParams(), setSearchParams];
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useRouter();
  React.useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}
