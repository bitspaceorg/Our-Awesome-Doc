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

function flattenBlogs(items: Blog[]): Blog[] {
    const result: Blog[] = [];
    const walk = (list: Blog[]) => {
        for (const item of list) {
            result.push(item);
            if (item.children) walk(item.children as Blog[]);
        }
    };
    walk(items);
    return result;
}

function markAncestors(items: Blog[], slugs: Set<string>): boolean {
    let any = false;
    for (const item of items) {
        const childMatch = item.children ? markAncestors(item.children as Blog[], slugs) : false;
        if (slugs.has(item.slug) || childMatch) {
            slugs.add(item.slug);
            any = true;
        }
    }
    return any;
}

function filterTree(items: Blog[], slugs: Set<string>): Blog[] {
    return items
        .filter(item => slugs.has(item.slug))
        .map(item => item.children
            ? { ...item, children: filterTree(item.children as Blog[], slugs) as BlogChild[] }
            : item
        );
}

interface BlogSearchProp { data: BlogIndex };
export default function BlogSearch({ data }: BlogSearchProp) {

    const [query, setQuery] = useState('')

    const allItems = useMemo(() => flattenBlogs(data.blogs), [data.blogs])

    const fuse = useMemo(() => {
        return new Fuse(allItems, {
            keys: [
                'title',
                'description',
                'author',
                'tags',
            ],
            threshold: 0.4,
            ignoreLocation: true,
        })
    }, [allItems])

    const blogs = useMemo(() => {
        if (!query.trim()) return data.blogs
        const matchedSlugs = new Set(fuse.search(query).map(r => r.item.slug));
        markAncestors(data.blogs, matchedSlugs);
        return filterTree(data.blogs, matchedSlugs);
    }, [query, fuse, data.blogs])

    return (
        <>
        <section className="flex">
            <input className="text-8xl lg:text-[200px] w-full font-jet outline-none active:outline-none" placeholder="docs" value={query} onChange={(e) => setQuery(e.target.value)} ></input>
            <h1>({blogs.length})</h1>
        </section>

        <section className="flex flex-grow w-full min-h-0 scrollbar-thin-custom">
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

function ChildItems({ items, depth = 1 }: { items: BlogChild[], depth?: number }) {
    return (
        <>
            {items.map((v, i) => {
                const hasChildren = !!((v as Blog).children?.length);
                const isLeaf = !hasChildren;
                return (
                <div key={i}>
                    <section className="lg:hidden block">
                        <Link href={v.slug}
                            style={{ paddingLeft: `${depth * 1.25}rem` }}
                            className={`flex space-x-4 items-baseline hover:bg-accent-color w-full ${isLeaf ? 'text-gray-500' : ''} ${isLeaf && (i + 1 == items.length) && 'mb-5'}`}>
                            <h1 className="text-3xl">{v.title}</h1>
                        </Link>
                    </section>
                    <section className="w-full hidden lg:block">
                        <Link href={v.slug}
                            style={{ paddingLeft: `${depth * 4}rem` }}
                            className={`flex space-x-4 items-baseline hover:bg-accent-color w-full ${isLeaf ? 'text-gray-500' : ''} ${isLeaf && (i + 1 == items.length) && 'mb-5'}`}>
                            <span className="text-xs font-light whitespace-nowrap -mb-2"> {v.date} </span>
                            <h1 className="text-3xl">{v.title}</h1>
                        </Link>
                    </section>
                    {hasChildren && <ChildItems items={(v as Blog).children!} depth={depth + 1} />}
                </div>
                );
            })}
        </>
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
            </section>

            <section className="w-full hidden lg:block">
                <Link href={blog.slug} className="flex space-x-4 itemsend hover:bg-accent-color w-full px-5 py-3 items-baseline">
                    <span className="text-xs font-light whitespace-nowrap pb2"> {blog.date} </span>
                    <h1 className="text-3xl ">{blog.title}</h1>
                </Link>
            </section>

            {blog.children && <ChildItems items={blog.children} />}
        </>
    )
};
