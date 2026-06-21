import BlogForm from "@/components/BlogForm";

export default function NewBlogPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">สร้างบทความใหม่</h1>
      <BlogForm
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          published: false,
          images: [],
        }}
      />
    </div>
  );
}
