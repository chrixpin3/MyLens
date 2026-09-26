import { ZipLoader } from "@/components/zip/ZipLoader";

/**
 * App Router route-transition loader. The client-side provider picks the same
 * overlay up for in-app navigations; this covers the server wait + streaming
 * handoff so there is never a blank frame.
 */
export default function Loading() {
  return <ZipLoader isNetworkAware variant="overlay" />;
}
