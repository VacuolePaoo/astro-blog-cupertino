<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title><xsl:value-of select="/*[local-name()='feed']/*[local-name()='title'] | /*[local-name()='rss']/*[local-name()='channel']/*[local-name()='title']" /></title>
        <style>
          :root{font-family:Inter,system-ui,sans-serif;color-scheme:light dark}body{max-width:760px;margin:0 auto;padding:64px 24px;background:#fff;color:#111}h1{font-size:42px;letter-spacing:-.04em}.intro{color:#6e6e73;margin-bottom:44px}.entry{border-top:1px solid #dedee3;padding:22px 0}.entry a{color:inherit;text-decoration:none}.entry a:hover h2{color:#0071e3}.entry h2{margin:0;font-size:21px}.entry p{color:#6e6e73;margin:7px 0 0;line-height:1.65}.entry time{display:block;color:#6e6e73;font-size:13px;margin-top:8px}@media(prefers-color-scheme:dark){body{background:#000;color:#f5f5f7}.entry{border-color:#303034}}
        </style>
      </head>
      <body>
        <h1><xsl:value-of select="/*[local-name()='feed']/*[local-name()='title'] | /*[local-name()='rss']/*[local-name()='channel']/*[local-name()='title']" /></h1>
        <p class="intro">这是一个订阅源。复制当前地址到你的 RSS 阅读器，即可持续接收更新。</p>
        <main>
          <xsl:for-each select="//*[local-name()='entry'] | //*[local-name()='item']">
            <article class="entry">
              <a>
                <xsl:attribute name="href"><xsl:value-of select="*[local-name()='link']/@href | *[local-name()='link'][not(@href)]" /></xsl:attribute>
                <h2><xsl:value-of select="*[local-name()='title']" /></h2>
                <p><xsl:value-of select="*[local-name()='summary'] | *[local-name()='description']" disable-output-escaping="yes" /></p>
                <time><xsl:value-of select="*[local-name()='published'] | *[local-name()='pubDate']" /></time>
              </a>
            </article>
          </xsl:for-each>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
