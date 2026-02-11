'use client'

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'



type BlogChild = {
  title: string;
  desc: string;
  url: string;
  slug: string;
  author: string;
  date: string;
  tags: string[];
};

export type Blog = BlogChild & {
  children?: BlogChild[];
};

export type BlogIndex = {
    filters: Record<string, string[]>;
    blogs: Blog[];
};

interface BlogSearchProp { data: BlogIndex };
export default function BlogSearch({ data }: BlogSearchProp) {

    const [query, setQuery] = useState('')

    const fuse = useMemo(() => {
        return new Fuse(data.blogs, {
            keys: [
                'title',
                'desc',
                'author',
                'children.title',
                'children.desc',
            ],
            threshold: 0.35, // lower = stricter
            ignoreLocation: true,
        })
    }, [data.blogs])

    const blogs = useMemo(() => {
        if (!query.trim()) return data.blogs
            return fuse.search(query).map(result => result.item)
    }, [query, fuse, data.blogs])

    return (
        <>
        <section className="flex">
            <input className="text-8xl lg:text-[200px] max-w-xs lg:max-w-lg font-jet outline-none active:outline-none" placeholder="docs" value={query} onChange={(e) => setQuery(e.target.value)} ></input>
            <h1>({blogs.length})</h1>
        </section>

        <section className="flex flex-grow w-full h-0  scrollbar-thin-custom">
            <aside className="hidden lg:block bg-accent-color w-full max-w-xs max-h-fit p-3 select-none">
                <h1 className="">filters</h1>
                <FilterSidebar filters={data.filters} />
            </aside>

            <main className="font-jet w-full overflow-scroll my-scroll-area customscroll scrollbar-thin-custom">
                { blogs.map((blog, id) => <ListItem key={id} blog={blog} />) }
            </main>
        </section>
        </>
    )
};


interface FilterSidebarProp {
  filters: Record<string, string[]>;
}
function FilterSidebar({ filters }: FilterSidebarProp) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function toggleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);

    if (current.includes(value)) {
      params.delete(key);
      current.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }
  
  return Object.entries(filters).map(([key, value], i) => {
      const selected = searchParams.getAll(key);
      return (
    <section className="font-thin" key={i}>
      <h1 key={i}>{key}</h1>
      <section>
        {value.map((k, i) => (
          <h1
            className={`px-5 cursor-pointer ${selected.includes(k) && 'font-bold'}`}
            onClick={() => { toggleFilter(key, k); }}
            key={i}
          >
            {k}
          </h1>
        ))}
      </section>
    </section>

      );
  }
  );
}

interface ListItemProps { blog: Blog }
function ListItem({blog}: ListItemProps) {
    return (
        <>
            <section className="lg:hidden block">
                <Link href={blog.slug} className="flex space-x-4 itemsend hover:bg-accent-color w-full px5 py-3 items-baseline">
                    <h1 className="text-3xl ">{blog.title}</h1>
                </Link>
                { 
                    blog.children?.map((v, i) => 
                        <Link key={i} href={v.slug} 
                            className={`flex space-x-4 items-baseline hover:bg-accent-color w-full px-5 text-gray-500 ${(i + 1 == blog.children?.length) && 'mb-5'}`}>
                            <h1 className="text-3xl">{v.title}</h1>
                        </Link>)
                }
            </section>

            <section className="w-full hidden lg:block">
                <Link href={blog.slug} className="flex space-x-4 itemsend hover:bg-accent-color w-full px-5 py-3 items-baseline">
                    <span className="text-xs font-light whitespace-nowrap pb2"> {blog.date} </span>
                    <h1 className="text-3xl ">{blog.title}</h1>
                </Link>
                { 
                    blog.children?.map((v, i) => 
                        <Link key={i} href={v.slug} 
                            className={`flex space-x-4 items-baseline hover:bg-accent-color w-full px-16 text-gray-500 ${(i + 1 == blog.children?.length) && 'mb-5'}`}>
                            <span className="text-xs font-light whitespace-nowrap -mb-2"> {v.date} </span>
                            <h1 className="text-3xl">{v.title}</h1>
                        </Link>)
                }
            </section>
        </>
    )
};
