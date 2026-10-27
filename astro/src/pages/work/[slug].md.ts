import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { markdownResponse } from "@/lib/markdown";

export const getStaticPaths = (async () =>
  (await getCollection("projects")).map((entry) => ({ params: { slug: entry.id }, props: { entry } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { title, year, tags, link } = props.entry.data;
  const facts = [`- Year: ${year}`, ...(tags.length ? [`- Services: ${tags.join(", ")}`] : []), ...(link ? [`- Link: ${link.startsWith("http") ? link : `https://${link}`}`] : [])];
  return markdownResponse(title, facts, props.entry.body);
};
