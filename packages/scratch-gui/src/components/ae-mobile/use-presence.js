import { useEffect, useRef, useState } from 'react';

/**
 * How long an element stays mounted after `open` turns false so its exit
 * animation can play. Must match `--ae-dur-exit` in css/ae-tokens.css.
 */
export const EXIT_MS = 200;

/**
 * Keeps a conditionally rendered element alive long enough to animate out.
 *
 * The shell used to mount and unmount panels and popups on a boolean, so every
 * one of them appeared and vanished in a single frame while the paint editor
 * animated its popovers. This hook splits "should be visible" into
 * "is still in the DOM" + "is leaving", which is what the CSS needs.
 *
 * @param {boolean} open whether the element should be shown
 * @param {number} exitMs how long to keep it after open flips to false
 * @returns {{mounted: boolean, closing: boolean}}
 */
const usePresence = (open, exitMs = EXIT_MS) => {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const clear = () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };

    if (open) {
      clear();
      setClosing(false);
      setMounted(true);
      return clear;
    }

    if (!mounted) return clear;

    setClosing(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setClosing(false);
      setMounted(false);
    }, exitMs);

    return clear;
  }, [open, mounted, exitMs]);

  return { mounted, closing };
};

export default usePresence;
