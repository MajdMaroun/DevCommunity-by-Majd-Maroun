const BlogPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return (
    <div>
      <h1>Blog Page for {slug}</h1>
      {/* Additional content for the blog page can be added here */}
    </div>
  );
}

export default BlogPage;