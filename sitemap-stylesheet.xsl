
<?xml version="1.0" encoding="UTF-8"?><xsl:stylesheet version="1.1"
		xmlns:html="http://www.w3.org/TR/REC-html40"
		xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
		xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
		xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
		xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>Sitemap Index</title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
				<meta name="robots" content="index,follow"/>
				<style type="text/css">
					body { font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-size: 14px; margin: 0; text-align: center; }
					a { text-decoration: none; color: #2d89c7; }
					a:hover { border-bottom: 1px solid; }
					.header { background-color: #82a745; color: #fff; padding: 30px 30px 20px; }
					.header h1 { margin: 0; }
					.header a, .footer a { border-bottom: 1px solid; color: inherit; }
					.header a:hover, .footer a:hover { border-bottom: none; }
					.footer { color: #666; font-size: 12px; margin-bottom: 30px; }
					.top-content { margin: 10px auto -12px; }
					.top-content a:hover { border-bottom: none; }
					table { max-width: 1024px; margin: 20px auto; font-size: 12px; color: #444; }
					table tr:first-child { background-color: #fff !important; }
					table tr:nth-child(odd) { background-color: #ecf4db; }
					table tr th, table tr td { padding: 10px 15px; text-align: left; }
					table tr th { border-bottom: 1px solid #ccc; }
					img { max-height: 100px; max-width: 100px; }
					.image + .image { margin-top: 5px; }
					.loc-item + .loc-item { margin-top: 5px; }
				</style>
			</head>
			<body>
				<div class="header">
					<h1>Sitemap Index</h1>
																	
															</div>
				<div class="top-content">
									</div>
				<table>
	<tr>
		<th>Sitemap</th>
		<th>Last Modified</th>
	</tr>
	<xsl:variable name="lower" select="'abcdefghijklmnopqrstuvwxyz'"/>
	<xsl:variable name="upper" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
	<xsl:for-each select="./sitemap:sitemapindex/sitemap:sitemap">
		<tr>
			<xsl:if test="position() mod 2 != 1">
				<xsl:attribute  name="class">high</xsl:attribute>
			</xsl:if>
			<td>
				<xsl:variable name="page">
					<xsl:value-of select="sitemap:loc"/>
				</xsl:variable>
				<a href="{$page}">
					<xsl:value-of select="sitemap:loc"/>
				</a>
			</td>
			<td>
				<xsl:value-of select="concat(substring(sitemap:lastmod, 0, 11), concat(' ', substring(sitemap:lastmod, 12, 5)))"/>
			</td>
		</tr>
	</xsl:for-each>
</table>									
							</body>
		</html>
	</xsl:template>
</xsl:stylesheet>