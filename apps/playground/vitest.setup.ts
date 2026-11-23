// jsdom has no matchMedia; the colour-scheme store reads it. Report "light".
if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) => {
    const list: Partial<MediaQueryList> = {
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    };
    return list as MediaQueryList;
  };
}
