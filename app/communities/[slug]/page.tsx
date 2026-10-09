const CommunityPage = async ({ params}: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return (
    <div>
      <h1>Community Page for {slug}</h1>
      {/* Additional content for the community page can be added here */}
    </div>
  );
}
