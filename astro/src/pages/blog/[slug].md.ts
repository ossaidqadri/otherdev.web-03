import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { markdownResponse } from "@/lib/markdown";

export const getStaticPaths = (async () =>
  (await getCollection("blog")).map((entry) => ({ params: { slug: entry.id }, props: { entry } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { title, publishedAt } = props.entry.data;
  return markdownResponse(title, [`Published ${publishedAt.toISOString().slice(0, 10)}.`], props.entry.body);
};
