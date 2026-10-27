/**
 * A link to a section of the home page. On the home page itself it's a plain
 * #hash (smooth-scrolled by Lenis); on other pages it goes home first.
 * `here` lists the section ids that exist on the current page.
 */
export const toSection = (id: string, here: readonly string[]) => (here.includes(id) ? `#${id}` : `/#${id}`);

/** The sections on the home page. */
export const HOME_SECTIONS = ["communities", "where-to-live", "homes", "buying", "from-abroad", "selling", "viewing"] as const;
