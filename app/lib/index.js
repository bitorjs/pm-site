const path = require('path');
const fs = require('fs');

export function checkDirExist(p) {
  if (!fs.existsSync(p)) {
    var pathtmp;
    p.split("/").forEach(function (dirname) {
      if (pathtmp) {
        pathtmp = path.join(pathtmp, dirname);
      } else {
        //如果在linux系统中，第一个dirname的值为空，所以赋值为"/"
        if (dirname) {
          pathtmp = dirname;
        } else {
          pathtmp = "/";
        }
      }
      if (!fs.existsSync(pathtmp)) {
        if (!fs.mkdirSync(pathtmp)) {
          return false;
        }
      }
    });
  }
}

export function getUploadFileExt(name) {
  let ext = name.split('.');
  return ext[ext.length - 1];
}

export function getUploadDirName() {
  const date = new Date();
  let month = Number.parseInt(date.getMonth()) + 1;
  month = month.toString().length > 1 ? month : `0${month}`;
  const dir = `${date.getFullYear()}${month}${date.getDate()}`;
  return dir;
}

export function getUploadFileName(ext) {
  return new Date().getTime() + '.' + ext;
}
// http://www.ptbird.cn/koa-body-diy-upload-dir-and-filename.html