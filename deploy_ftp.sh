shopt -s globstar
cd packages/web-client/dist
for f in ./**;
do
  if [[ -d $f ]]; then
    continue;
  fi
  sftp_add_path=`dirname $f`/;
  curl --ftp-create-dirs -T $f --user ${sftp_user}:${sftp_password} ftp://${sftp_host}${sftp_deploy_dir}${sftp_add_path};
done;