cd /app/games
echo "3D Games:"
grep -l "engine3d.js" *.html | head -n 1
echo "Tycoon Games:"
grep -l "engineTycoon.js" *.html | head -n 1
echo "Shmup Games:"
grep -l "engineShmup.js" *.html | head -n 1
echo "Platformer Games:"
grep -l "enginePlatformer.js" *.html | head -n 1
