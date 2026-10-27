// Markdown twin of a page for language models (see llms.txt): the entry's own source, headed by
// its title and summary, served at <page>.md.
export const markdownResponse = (title: string, lines: string[], body: string | undefined) =>
  new Response(`${[`# ${title}`, "", ...lines, "", body ?? ""].join("\n").trim()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
