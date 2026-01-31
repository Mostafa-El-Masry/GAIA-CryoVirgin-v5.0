import { useEffect } from "react";

/**
 * Hook for infinite scroll functionality.
 * Automatically loads more items when user scrolls near bottom of page.
 *
 * @param items - Array of items to paginate through
 * @param setItemsToShow - State setter function to update number of visible items
 */
export function useInfiniteScroll(
  items: any[],
  setItemsToShow: React.Dispatch<React.SetStateAction<number>>,
): void {
  useEffect(() => {
    const handleScroll = () => {
      // Check if user scrolled within 100px of bottom
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        // Load next batch of items (increment by 20)
        setItemsToShow((prev: number) => Math.min(prev + 20, items.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items.length, setItemsToShow]);
}
