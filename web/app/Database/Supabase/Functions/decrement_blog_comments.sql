CREATE OR REPLACE FUNCTION decrement_blog_comments(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog
  SET comments = GREATEST(COALESCE(comments, 0) - 1, 0)
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql; 