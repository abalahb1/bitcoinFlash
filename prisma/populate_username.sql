-- Update username from email (extract part before @)
UPDATE "User" 
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL AND email IS NOT NULL;

-- For any remaining users without username, generate from id
UPDATE "User"
SET username = LOWER('user_' || SUBSTRING(id, 1, 8))
WHERE username IS NULL;
