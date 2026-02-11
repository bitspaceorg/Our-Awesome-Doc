export interface PostMeta {
  slug: string;
  url: string;
}

export interface Frontmatter {
  title: string;
  author?: string;
  description?: string;
  date?: string;
  tags?: string[];
}

// lib/getRemoteMDX.ts
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

export async function getRemoteMDX(url: string): Promise<{
  content: React.ReactNode;
  frontmatter: Frontmatter;
}> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error("Failed to fetch MDX");

  const source = await res.text();

  const { content, frontmatter } = await compileMDX<Frontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeHighlight],
      },
    },
  });

  return { content, frontmatter };
}

