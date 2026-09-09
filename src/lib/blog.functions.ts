/**
 * Blog de FlightPath — lectura pública de `blog_posts`.
 *
 * El contenido vive en la base de datos (no en el frontend): para publicar un
 * artículo nuevo basta con insertar una fila con status = 'published'.
 */
import { createServerFn } from "@tanstack/react-start";
import { activityClient } from "@/lib/activity.server";

export type BlogCategory = "CIAAC" | "Aerolíneas" | "Convocatorias";

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
  content: string;
  author: string;
  published_at: string | null;
  updated_at: string;
  reading_time: number;
  tags: string[];
  featured: boolean;
  cta_title: string | null;
  cta_text: string | null;
  cta_link: string | null;
}

/** Campos del listado (sin el cuerpo del artículo). */
export type BlogPostCard = Omit<BlogPostRow, "content">;

const LIST_FIELDS =
  "id,title,slug,excerpt,category,cover_image,author,published_at,updated_at,reading_time,tags,featured,cta_title,cta_text,cta_link";

/** Artículos publicados, del más reciente al más antiguo. */
export const listBlogPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<BlogPostCard[]> => {
    const supabase = activityClient(null);
    const { data, error } = await supabase
      .from("blog_posts")
      .select(LIST_FIELDS)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error || !data) return [];
    return data as unknown as BlogPostCard[];
  },
);

/** Un artículo publicado por slug (null si no existe). */
export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug ?? "") }))
  .handler(async ({ data }): Promise<{ post: BlogPostRow | null; related: BlogPostCard[] }> => {
    const supabase = activityClient(null);
    const { data: row } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!row) return { post: null, related: [] };
    const post = row as unknown as BlogPostRow;

    const { data: rel } = await supabase
      .from("blog_posts")
      .select(LIST_FIELDS)
      .eq("status", "published")
      .eq("category", post.category)
      .neq("slug", post.slug)
      .order("published_at", { ascending: false })
      .limit(3);
    return { post, related: (rel ?? []) as unknown as BlogPostCard[] };
  });
