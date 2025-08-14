cd C:\Jenkins\workspace\pointmatter-2.0
TIMEOUT /T 2 /NOBREAK

git checkout develop-2.0
TIMEOUT /T 2 /NOBREAK

git pull origin develop-2.0
TIMEOUT /T 3 /NOBREAK

git push BitBucket develop-2.0
TIMEOUT /T 3 /NOBREAK
