'use client';
import React, { useCallback, useMemo } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';

export const Link = React.forwardRef(function Link({ to, href, children, state, ...props }, ref) {
  const target = href || to || '#';
  return (
    <NextLink ref={ref} href={target} {...props}>
      {children}
    </NextLink>
  );
});

export function useNavigate() {
  const router = useRouter();
  return useCallback((to, options = {}) => {
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
    state: null,
  }), [pathname, search, hash]);
}

export function useParams() {
  return useNextParams() || {};
}

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = useCallback((newParams, options = {}) => {
    const params = new URLSearchParams(typeof newParams === 'object' ? newParams : {});
    const query = params.toString() ? `?${params.toString()}` : '';
    if (options?.replace) {
      router.replace(`${pathname}${query}`);
    } else {
      router.push(`${pathname}${query}`);
    }
  }, [pathname, router]);

  return [searchParams || new URLSearchParams(), setSearchParams];
}

export function Navigate({ to, replace = false }) {
  const router = useRouter();
  React.useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}
