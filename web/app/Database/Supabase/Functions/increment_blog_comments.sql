CREATE OR REPLACE FUNCTION increment_blog_comments(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog
  SET comments = COALESCE(comments, 0) + 1
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql; 