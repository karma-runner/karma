VERSION=$1
TEMP=".changelog.tmp"

echo "### $VERSION" > $TEMP
git log --pretty=%s $VERSION..HEAD >> $TEMP
echo -e "\n" >> $TEMP

vim CHANGELOG.md -c ":0r $TEMP"

