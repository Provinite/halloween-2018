shopt -s globstar
echo "Script world"
pwd
echo "sftp host";
echo $sftp_host;
cd packages/web-client/dist
for f in ./**;
do
  if [[ -d $f ]]; then
    continue;
  fi
  sftp_add_path=`dirname $f`/;
  curl --ftp-create-dirs --connect-timeout 20 --max-time 40 -T $f --user ${sftp_user}:${sftp_password} ftp://${sftp_host}${sftp_path}${sftp_add_path} || exit 1;
  break
done;