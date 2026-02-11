import BlogSearch, { BlogIndex } from "@/components/BlogSearch";
import { filterBlogs } from "@/components/SearchHelper";
import { DATA_URL } from "@/utils";

export default async function Home({ searchParams, }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const res = await fetch(DATA_URL, {
        cache: 'force-cache'
    });
    const data: BlogIndex = await res.json();

    const activeFilters = Object.fromEntries(
        Object.entries((await searchParams)).filter(([, v]) => v !== undefined)
    );

    const filteredBlogs = filterBlogs(data.blogs, activeFilters);

    const prop: BlogIndex = {
        blogs: filteredBlogs,
        filters: data.filters
    };


  return (
    <main className="min-h-screen w-full p-5 lg:p-10 bg-tinted-accent-color text-foreground-color font-jet flex flex-col ">
        <BlogSearch data={prop}/>
    </main>

  );
}
