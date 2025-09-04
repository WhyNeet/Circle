export function rsplitOnce(s: string, path: string): [string, string] {
  const idx = s.lastIndexOf(path);

  if (idx === -1) {
    return ["", s];
  } else {
    const partBefore = s.substring(0, idx);
    const partAfter = s.substring(idx + path.length);
    return [partAfter, partBefore];
  }
}
