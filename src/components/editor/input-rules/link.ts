import { linkSchema } from "@milkdown/kit/preset/commonmark";
import { InputRule } from "@milkdown/kit/prose/inputrules";
import { $inputRule } from "@milkdown/kit/utils";

export const linkInputRule = $inputRule(
  (ctx) =>
    new InputRule(/\[([^\]]+)\]\(([^)]+)\)$/, (state, match, start, end) => {
      const [okay, text, rawHref] = match;
      const href = rawHref.trim();
      const { tr } = state;
      if (!okay || !text.length || !href.length) return null;
      return tr.delete(start, end).insertText(text, start).addMark(start, start + text.length, linkSchema.type(ctx).create({ href }));
    }),
);
