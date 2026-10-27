import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { markdownResponse } from "@/lib/markdown";

export const getStaticPaths = (async () =>
  (await getCollection("blog")).map((entry) => ({ params: { slug: entry.id }, props: { entry } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { title, excerpt, publishedAt } = props.entry.data;
  return markdownResponse(title, [`Published ${publishedAt.toISOString().slice(0, 10)}.`, ...(excerpt ? ["", `> ${excerpt}`] : [])], props.entry.body);
};
