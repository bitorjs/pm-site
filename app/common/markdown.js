import xss from 'xss';
import MarkdownIt from 'markdown-it';


// allow class attr on code
xss.whiteList.code = ['class'];

var md = new MarkdownIt({
  html: true,
  linkify: true,
});

export default function (content, filterXss) {
  var html = md.render(content);
  if (filterXss !== false) {
    html = xss(html);
  }
  return html;
}
