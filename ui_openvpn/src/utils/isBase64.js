export default function isBase64(s) {
  try {
    window.atob(s);
    return true;
  } catch (e) {
    return false;
    // something failed
    // if you want to be specific and only catch the error which means
    // the base 64 was invalid, then check for 'e.code === 5'.
    // (because 'DOMException.INVALID_CHARACTER_ERR === 5')
  }
}
