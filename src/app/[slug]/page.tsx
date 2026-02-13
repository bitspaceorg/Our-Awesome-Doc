import { getRemoteMDX } from "@/components/getMDX";
import { DATA_URL, PROJECT_HOME_URL } from "@/utils";
import { Blog, BlogIndex } from "@/components/BlogSearch";

import Link from "next/link";
import { notFound } from "next/navigation";


const extractSlugs = (blogs: Blog[]): { slug: string, url: string }[] => {
  return blogs.flatMap(blog => [
    { slug: blog.slug, url: blog.url },
    ...(blog.children?.map(child => ({ slug: child.slug, url: child.url })) ?? [])
  ]);
};

export const dynamic = 'force-dynamic'

function truncateToWords(text: string, maxWords = 7) {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "…";
};


export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const res = await fetch(DATA_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch");

  const data: BlogIndex = await res.json();
  const slugsUrlMap = extractSlugs(data.blogs);

  const url = slugsUrlMap.find((val) => (val.slug == slug))?.url;
  if (!url) return notFound();

  const { content, frontmatter } = await getRemoteMDX(url);
  return (
    <main className="flex flex-col items-center font-jet bg-[#fbffeb]  ">
      <header className="w-full h-[500px] bg-accent-color p-5 flex flex-col justify-between cursor-default">
        <div className="flex w-full justify-between">
          <h1 className="font-bold text-right ">{frontmatter.date}</h1>
          <Link href={`/?author=${frontmatter.author}`} className="font-bold text-right bg-black text-accent-color p-2 cursor-pointer">{frontmatter.author?.toLowerCase()}</Link>
        </div>
        <h1 className=" text-5xl lg:text-9xl font-extralight pb-5">{truncateToWords(frontmatter.title.toLowerCase())}</h1>
      </header>

      <section className="bg-black text-accent-color p-2 px-5 w-full flex ">
        <Link href={PROJECT_HOME_URL} className="px-5 hover:bg-accent-color hover:text-foreground-color">home</Link>
        <Link href="/" className="px-5 hover:bg-accent-color hover:text-black">docs</Link>
      </section>

      <article className="prose mx-auto min-h-screen pt-10 p-5">
        {content}
      </article>


    </main>
  );
}

