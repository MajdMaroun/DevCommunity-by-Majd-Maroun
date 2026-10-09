const BookmarksPage = () => {
  return (
    <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">Bookmarks</h1>
        <p className="text-sm text-gray-400">
          Here are all the posts you've bookmarked for later reading.
        </p>
        <div className="flex flex-col gap-4">
          {/* Bookmark items would go here */}
        </div>
      </div>
    
  );
};

export default BookmarksPage;