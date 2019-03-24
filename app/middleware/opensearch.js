var template = '<?xml version="1.0" encoding="UTF-8"?>\
 <OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">\
   <ShortName>CNPM</ShortName>\
   <Description>Search packages in CNPM.</Description>\
   <Tags>CNPM</Tags>\
    <Url method="get" type="text/html" template="http://${host}/browse/keyword/{searchTerms}"/>\
 </OpenSearchDescription>';

export default async (ctx, next) => {
  if (ctx.path === '/opensearch.xml') {
    ctx.type = 'text/xml';
    ctx.charset = 'utf-8';
    ctx.body = template.replace('${host}', ctx.$config.opensearch.host || ctx.host);
  }
  await next();
}