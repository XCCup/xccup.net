export function addMetaTag(tag: string, content: string) {
  const meta = document.createElement("meta");
  meta.setAttribute(tag, content);
  document.getElementsByTagName("head")[0].appendChild(meta);
}
