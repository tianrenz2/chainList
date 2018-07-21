rsync -r src/ doc/
rsync build/contracts/ChainList.json docs/
git add .
git commit -m "adding frontend files to pages on Github"
git push
