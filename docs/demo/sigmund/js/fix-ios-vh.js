// Webkit on iOS since pretty much its inception has had an annoying issue
// where 100vh doesn't actually mean "100% of the viewport"...
//
// The bottom bar (which on older iOS has buttons for stuff like bookmarks
// which now also functions as *the address bar* on newer iOS) isn't
// taken into account when calculating vh
//
// This means when you have a bottom aligned element that you want to stick to the
// bottom of the screen (in this case a footer) it will actually be hidden underneath
// the bottom bar. This is *apparently* intended behaviour for whatever reason, and it sucks.
//
// After trying many fixes I've found the CSS value -webkit-fill-available to be one that works.
// However, at least on desktop this value is not updated on vertical resize for whatever
// reason, making my footer only re-adjust when something like a CSS animation plays.
//
// So here we are, using JavaScript to fix the nightmare that Apple bestowed upon me by only using this fix
// when we detect an iOS useragent. I love the web!

const iOS =
    /iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;

if (iOS) {
    console.log("Detected iOS useragent, applying footer fix...");
    const footer = document.getElementById("layout");
    footer.classList.add("ios-screen-fix")
}