<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:svg="http://www.w3.org/2000/svg"
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns="http://www.w3.org/2000/svg"
  exclude-result-prefixes="html svg xlink">

  <xsl:strip-space elements="*" />
  <xsl:output method="xml" encoding="UTF-8" indent="yes"
   omit-xml-declaration="yes"
   doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN"
   doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
  
  <xsl:param name="anim_dur" select="'0.5s'"/>
   
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
  
  <xsl:template match="processing-instruction()"/>
  
  <xsl:template match="html:head">
    <head xmlns="http://www.w3.org/1999/xhtml">
      <xsl:apply-templates/>
      <link rel="stylesheet" type="text/css" href="svgstyle.css"/>
    </head>
  </xsl:template>
  
  <xsl:template match="html:img[@usemap]">
    <xsl:choose>
      <xsl:when test="system-property('xsl:vendor') != 'Microsoft'">
        <xsl:variable name="mapname" select="substring-after(@usemap, '#')"/>
        <!-- Store image width and height -->
        <xsl:variable name="imgwidth">
          <xsl:choose>
            <xsl:when test="@width">
              <xsl:value-of select="@width"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:text>100%</xsl:text>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="imgheight">
          <xsl:choose>
            <xsl:when test="@height">
              <xsl:value-of select="@height"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:text>100%</xsl:text>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <!-- Create a div that holds the SVG and the img -->
        <div xmlns="http://www.w3.org/1999/xhtml" class="svgmap">
          <xsl:apply-templates mode="map" select="//html:map[@name = $mapname]">
            <xsl:with-param name="imgwidth" select="$imgwidth"/>
            <xsl:with-param name="imgheight" select="$imgheight"/>
          </xsl:apply-templates>
          <xsl:copy-of select="."/>
        </div>
      </xsl:when>
      <xsl:otherwise>
        <xsl:copy-of select="."/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
   
  <xsl:template mode="map" match="html:map">
    <xsl:param name="imgwidth"/>
    <xsl:param name="imgheight"/>
    <svg style="position:absolute;" width="{$imgwidth}" height="{$imgheight}" pointer-events="visible">
      <defs>
        <script type="text/ecmascript"><![CDATA[
        function set_opacity(evt, value){
            evt.target.setAttributeNS(null, "opacity", value);
            var id = evt.target.getAttributeNS(null, "id");
            text_elem = document.getElementById(id+"_text");
            text_elem.setAttributeNS(null, "opacity", value);
        }
        ]]></script>
      </defs>
      <xsl:for-each select="html:area">
        <xsl:sort select="position()" data-type="number" order="descending"/>
        <xsl:apply-templates mode="area" select=".">
          <xsl:with-param name="imgwidth" select="$imgwidth"/>
        </xsl:apply-templates>
      </xsl:for-each>
    </svg>
  </xsl:template>

  <xsl:template mode="area" match="html:area">
    <xsl:param name="imgwidth"/>
    <xsl:variable name="id" select="generate-id()"/>
    <xsl:variable name="map" select="../@name"/>
    <xsl:choose>
      <!-- area with link -->
      <xsl:when test="@href">
        <a xlink:href="{@href}">
          <xsl:if test="@title">
            <xsl:attribute name="xlink:title">
              <xsl:value-of select="@title"/>
            </xsl:attribute>
          </xsl:if>
          <xsl:apply-templates mode="shape" select=".">
            <xsl:with-param name="id" select="$id"/>
          </xsl:apply-templates>
        </a>
      </xsl:when>
      <!-- area without link -->
      <xsl:otherwise>
        <xsl:apply-templates mode="shape" select=".">
          <xsl:with-param name="id" select="$id"/>
        </xsl:apply-templates>
      </xsl:otherwise>
    </xsl:choose>
    <!-- The title text -->
    <xsl:if test="@title">
      <g class="text" opacity="0" pointer-events="none" id="{$id}_text">
        <rect width="100%" height="35"/>
        <text x="{$imgwidth div 2}" y="25" text-anchor="middle">
          <xsl:value-of select="@title"/>
        </text>
        <animate attributeName="opacity" from="0" to="1" begin="{$id}.mouseover" dur="{$anim_dur}" fill="freeze"/>
        <animate attributeName="opacity" to="0" begin="{$id}.mouseout" dur="{$anim_dur}" fill="freeze"/>
      </g>
    </xsl:if>
  </xsl:template>
  
  <xsl:template mode="shape" match="html:area">
    <xsl:param name="id"/>
    <xsl:choose>
      <!-- Rectangle -->
      <xsl:when test="@shape = 'rect'">
        <rect id="{$id}" class="area">
          <xsl:variable name="x1" select="substring-before(@coords,',')"/>
          <xsl:variable name="y1" select="substring-before(substring-after(@coords,','),',')"/>
          <xsl:variable name="x2" select="substring-before(substring-after(substring-after(@coords,','),','),',')"/>
          <xsl:variable name="y2" select="substring-after(substring-after(substring-after(@coords,','),','),',')"/>
          <xsl:attribute name="x"><xsl:value-of select="$x1"/></xsl:attribute>
          <xsl:attribute name="y"><xsl:value-of select="$y1"/></xsl:attribute>
          <xsl:attribute name="width"><xsl:value-of select="$x2 -$x1"/></xsl:attribute>
          <xsl:attribute name="height"><xsl:value-of select="$y2 -$y1"/></xsl:attribute>
          <xsl:apply-templates mode="anim" select="."/>
        </rect>
      </xsl:when>
      <!-- Circle -->
      <xsl:when test="@shape = 'circle'">
        <circle id="{$id}" class="area">
          <xsl:attribute name="cx">
            <xsl:value-of select="substring-before(@coords,',')"/>
          </xsl:attribute>
          <xsl:attribute name="cy">
            <xsl:value-of select="substring-before(substring-after(@coords,','),',')"/>
          </xsl:attribute>
          <xsl:attribute name="r">
            <xsl:value-of select="substring-after(substring-after(@coords,','),',')"/>
          </xsl:attribute>
          <xsl:apply-templates mode="anim" select="."/>
        </circle>
      </xsl:when>
      <!-- Polygon -->
      <xsl:otherwise>
        <polygon id="{$id}" class="area" points="{@coords}">
          <xsl:apply-templates mode="anim" select="."/>
        </polygon>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template mode="anim" match="*">
    <xsl:attribute name="opacity">0</xsl:attribute>
    <xsl:attribute name="onmouseover">set_opacity(evt, 1);</xsl:attribute>
    <xsl:attribute name="onmouseout">set_opacity(evt, 0);</xsl:attribute>
    <xsl:if test="@title">
      <title><xsl:value-of select="@title"/></title>
    </xsl:if>
    <xsl:if test="@alt">
      <desc><xsl:value-of select="@alt"/></desc>
    </xsl:if>
    <animate attributeName="opacity" from="0" to="1" begin="mouseover" dur="{$anim_dur}" fill="freeze"/>
    <animate attributeName="opacity" to="0" begin="mouseout" dur="{$anim_dur}" fill="freeze"/>
  </xsl:template>
  
</xsl:stylesheet>
