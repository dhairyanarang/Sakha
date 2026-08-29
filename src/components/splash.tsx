/**
 * The first thing she sees.
 *
 * Replaces the blank frame between tapping the icon and the app having
 * anything to show. This is a Server Component on purpose: the markup is in
 * the initial HTML and the animation is pure CSS, so the splash is painted on
 * the very first frame rather than waiting for React to hydrate — waiting is
 * what produced the black screen in the first place.
 *
 * It plays once per app session. The inline script below runs before this
 * element is parsed, so on a full page load mid-session — the auth callback
 * redirect is the common one — the overlay is hidden before it can paint
 * rather than fading out afterwards.
 *
 * The lockup is not translated. "Sakha, elder care made simple" is the
 * product's name and descriptor, the same pairing that names the app on a home
 * screen and in its metadata, and it stays in one language the way the mark
 * does.
 */
export function Splash() {
  return (
    <>
      <script
        // Synchronous and above the overlay: it decides whether the splash
        // exists before the browser has anything to paint. Wrapped because
        // sessionStorage throws outright in some privacy modes, and a splash
        // is never worth breaking the app for — the catch simply means it
        // plays again.
        dangerouslySetInnerHTML={{
          __html:
            "try{var k='sakha:launched';if(sessionStorage.getItem(k)){document.documentElement.setAttribute('data-splash','done')}else{sessionStorage.setItem(k,'1')}}catch(e){}",
        }}
      />
      {/* aria-hidden: it is decorative, it is gone in under two seconds, and
          the real screen is already behind it for anyone reading the page. */}
      <div className="splash" aria-hidden="true">
        {/* Two elements, two jobs: the outer one centres and is never
            animated, the inner one moves. Keeping them apart is what lets the
            lockup be exactly centred at any width even if the animation never
            finishes. */}
        <div className="splash-group">
          <div className="splash-shift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/onboarding/sakha-mark-white.svg"
              alt=""
              width={60}
              height={60}
              className="splash-mark"
            />
            <div className="splash-text">
              <p className="splash-name">Sakha</p>
              <p className="splash-tagline">Elder care, made simple</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
