import { Blog } from "./BlogSearch";

type Filters = {
  [k: string]: string | string[] | undefined;
};

export function filterBlogs(blogs: Blog[], filters: Filters): Blog[] {
  return blogs.filter((blog) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;

      const values = Array.isArray(value) ? value : [value];

      switch (key) {
        case "author":
          return values.includes(blog.author);

        case "tag":
          return blog.tags?.some(tag => values.includes(tag));

        default:
          return true;
      }
    });
  });
}

