<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>
<%@ Page language="C#" MasterPageFile="~masterurl/default.master"
Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=12.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" %>
<%@ Register
Tagprefix="SharePoint"
Namespace="Microsoft.SharePoint.WebControls"
Assembly="Microsoft.SharePoint, Version=12.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register
Tagprefix="Utilities"
Namespace="Microsoft.SharePoint.Utilities"
Assembly="Microsoft.SharePoint, Version=12.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Import Namespace="Microsoft.SharePoint" %>
<%@ Register
Tagprefix="WebPartPages"
Namespace="Microsoft.SharePoint.WebPartPages"
Assembly="Microsoft.SharePoint, Version=12.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="description" content="<$=props.appName$> App">
<meta name="viewport" content="width=device-width, initial-scale=1">

<link rel="stylesheet" href="/SiteAssets/dynamic-home/hr-home.css">
<link rel="stylesheet" href="/SiteAssets/dynamic-home/theme.min.css">
<link rel="stylesheet" href="/SiteAssets/dynamic-home/customGlobal.css">
 
  </asp:Content>

  <%-- Contains application title--%>
  <asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">ADM(HR-CIV)</asp:Content>

  <%-- Contains Application mark up--%>
  <asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

  <body vocab="http://schema.org/" typeof="WebPage">
    <main role="main" property="mainContentOfPage" class="container">
        <h1>ADM(HR-CIV) HOME</h1>

        <!-- HOME SLIDER -->
        <div id="home-slider"></div>
        
        <br><br>

        <!-- HOME NAV -->
        <div id="home-nav"></div>

        <!-- <section>
          <div class="wb-tabs">
            <div class="tabpanels">
              <details id="details-panel1">
                <summary>Exemple 1</summary>
                <div class="col-md-9">
                  <h2 class=" bg-corp-med  h5">What’s new?</h2>
                  <ul>
                    <li><a href="http://hrciv-rhciv.mil.ca/en/dynamic-article.page?doc=new-tool-helps-managers-with-recruitment/iqdinx3r"><strong><span class="small">New tool helps managers with recruitment</span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=message-to-government-of-canada-employees-about-pay/iqdinobr"><strong><span class="small"><span><span>Message to Government of Canada employees about pay</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=students-at-defence-participate-in-discussion-with-senior-leaders-for-national-public-service-week/iq3d97uw"><strong><span class="small"><span><span>Students at Defence participate in discussion with senior leaders for National Public Service Week</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="/en/e-compensation-pay-it-forward.page"><strong><span class="small"><span><span>Pay it Forward</span></span></span></strong></a>&nbsp;<strong></strong></li>
                    <li><strong><span class="small"><span><span><a href="/en/l1-carling-campus-job-match.page">Carling Campus Job Match</a></span></span></span></strong>&nbsp;</li>
                  </ul>
                  
                </div>
                <div class="col-md-9">
                  <h2 class=" bg-corp-med  h5">What’s new?</h2>
                  <ul>
                    <li><a href="http://hrciv-rhciv.mil.ca/en/dynamic-article.page?doc=new-tool-helps-managers-with-recruitment/iqdinx3r"><strong><span class="small"><span><span>New tool helps managers with recruitment</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=message-to-government-of-canada-employees-about-pay/iqdinobr"><strong><span class="small"><span><span>Message to Government of Canada employees about pay</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=students-at-defence-participate-in-discussion-with-senior-leaders-for-national-public-service-week/iq3d97uw"><strong><span class="small"><span><span>Students at Defence participate in discussion with senior leaders for National Public Service Week</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="/en/e-compensation-pay-it-forward.page"><strong><span class="small"><span><span>Pay it Forward</span></span></span></strong></a>&nbsp;<strong></strong></li>
                    <li><strong><span class="small"><span><span><a href="/en/l1-carling-campus-job-match.page">Carling Campus Job Match</a></span></span></span></strong>&nbsp;</li>
                  </ul>
                  
                </div>
                <div class="col-md-9">
                  <h2 class=" bg-corp-med  h5">What’s new?</h2>
                  <ul>
                    <li><a href="http://hrciv-rhciv.mil.ca/en/dynamic-article.page?doc=new-tool-helps-managers-with-recruitment/iqdinx3r"><strong><span class="small"><span><span>New tool helps managers with recruitment</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=message-to-government-of-canada-employees-about-pay/iqdinobr"><strong><span class="small"><span><span>Message to Government of Canada employees about pay</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=students-at-defence-participate-in-discussion-with-senior-leaders-for-national-public-service-week/iq3d97uw"><strong><span class="small"><span><span>Students at Defence participate in discussion with senior leaders for National Public Service Week</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="/en/e-compensation-pay-it-forward.page"><strong><span class="small"><span><span>Pay it Forward</span></span></span></strong></a>&nbsp;<strong></strong></li>
                    <li><strong><span class="small"><span><span><a href="/en/l1-carling-campus-job-match.page">Carling Campus Job Match</a></span></span></span></strong>&nbsp;</li>
                  </ul>
                  
                </div>
              </details>
              <details id="details-panel2" open="open">
                <summary>Exemple 2</summary>
                <div class="col-md-9">
                  <h2 class=" bg-corp-med  h5">What’s new? Second Tab</h2>
                  <ul>
                    <li><a href="http://hrciv-rhciv.mil.ca/en/dynamic-article.page?doc=new-tool-helps-managers-with-recruitment/iqdinx3r"><strong><span class="small"><span><span>New tool helps managers with recruitment</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=message-to-government-of-canada-employees-about-pay/iqdinobr"><strong><span class="small"><span><span>Message to Government of Canada employees about pay</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=students-at-defence-participate-in-discussion-with-senior-leaders-for-national-public-service-week/iq3d97uw"><strong><span class="small"><span><span>Students at Defence participate in discussion with senior leaders for National Public Service Week</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="/en/e-compensation-pay-it-forward.page"><strong><span class="small"><span><span>Pay it Forward</span></span></span></strong></a>&nbsp;<strong></strong></li>
                    <li><strong><span class="small"><span><span><a href="/en/l1-carling-campus-job-match.page">Carling Campus Job Match</a></span></span></span></strong>&nbsp;</li>
                  </ul>
                  
                </div>
                <div class="col-md-9">
                  <h2 class=" bg-corp-med  h5">What’s new?</h2>
                  <ul>
                    <li><a href="http://hrciv-rhciv.mil.ca/en/dynamic-article.page?doc=new-tool-helps-managers-with-recruitment/iqdinx3r"><strong><span class="small"><span><span>New tool helps managers with recruitment</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=message-to-government-of-canada-employees-about-pay/iqdinobr"><strong><span class="small"><span><span>Message to Government of Canada employees about pay</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=students-at-defence-participate-in-discussion-with-senior-leaders-for-national-public-service-week/iq3d97uw"><strong><span class="small"><span><span>Students at Defence participate in discussion with senior leaders for National Public Service Week</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="/en/e-compensation-pay-it-forward.page"><strong><span class="small"><span><span>Pay it Forward</span></span></span></strong></a>&nbsp;<strong></strong></li>
                    <li><strong><span class="small"><span><span><a href="/en/l1-carling-campus-job-match.page">Carling Campus Job Match</a></span></span></span></strong>&nbsp;</li>
                  </ul>
                  
                </div>
                <div class="col-md-9">
                  <h2 class=" bg-corp-med  h5">What’s new?</h2>
                  <ul>
                    <li><a href="http://hrciv-rhciv.mil.ca/en/dynamic-article.page?doc=new-tool-helps-managers-with-recruitment/iqdinx3r"><strong><span class="small"><span><span>New tool helps managers with recruitment</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=message-to-government-of-canada-employees-about-pay/iqdinobr"><strong><span class="small"><span><span>Message to Government of Canada employees about pay</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=students-at-defence-participate-in-discussion-with-senior-leaders-for-national-public-service-week/iq3d97uw"><strong><span class="small"><span><span>Students at Defence participate in discussion with senior leaders for National Public Service Week</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="/en/e-compensation-pay-it-forward.page"><strong><span class="small"><span><span>Pay it Forward</span></span></span></strong></a>&nbsp;<strong></strong></li>
                    <li><strong><span class="small"><span><span><a href="/en/l1-carling-campus-job-match.page">Carling Campus Job Match</a></span></span></span></strong>&nbsp;</li>
                  </ul>
                  
                </div>
              </details>
              <details id="details-panel3">
                <summary>Exemple 3</summary>
                <div class="col-md-9">
                  <h2 class=" bg-corp-med  h5">What’s new? Third Tab</h2>
                  <ul>
                    <li><a href="http://hrciv-rhciv.mil.ca/en/dynamic-article.page?doc=new-tool-helps-managers-with-recruitment/iqdinx3r"><strong><span class="small"><span><span>New tool helps managers with recruitment</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=message-to-government-of-canada-employees-about-pay/iqdinobr"><strong><span class="small"><span><span>Message to Government of Canada employees about pay</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=students-at-defence-participate-in-discussion-with-senior-leaders-for-national-public-service-week/iq3d97uw"><strong><span class="small"><span><span>Students at Defence participate in discussion with senior leaders for National Public Service Week</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="/en/e-compensation-pay-it-forward.page"><strong><span class="small"><span><span>Pay it Forward</span></span></span></strong></a>&nbsp;<strong></strong></li>
                    <li><strong><span class="small"><span><span><a href="/en/l1-carling-campus-job-match.page">Carling Campus Job Match</a></span></span></span></strong>&nbsp;</li>
                  </ul>
                  
                </div>
                <div class="col-md-9">
                  <h2 class=" bg-corp-med  h5">What’s new?</h2>
                  <ul>
                    <li><a href="http://hrciv-rhciv.mil.ca/en/dynamic-article.page?doc=new-tool-helps-managers-with-recruitment/iqdinx3r"><strong><span class="small"><span><span>New tool helps managers with recruitment</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=message-to-government-of-canada-employees-about-pay/iqdinobr"><strong><span class="small"><span><span>Message to Government of Canada employees about pay</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=students-at-defence-participate-in-discussion-with-senior-leaders-for-national-public-service-week/iq3d97uw"><strong><span class="small"><span><span>Students at Defence participate in discussion with senior leaders for National Public Service Week</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="/en/e-compensation-pay-it-forward.page"><strong><span class="small"><span><span>Pay it Forward</span></span></span></strong></a>&nbsp;<strong></strong></li>
                    <li><strong><span class="small"><span><span><a href="/en/l1-carling-campus-job-match.page">Carling Campus Job Match</a></span></span></span></strong>&nbsp;</li>
                  </ul>
                  
                </div>
                <div class="col-md-9">
                  <h2 class=" bg-corp-med  h5">What’s new?</h2>
                  <ul>
                    <li><a href="http://hrciv-rhciv.mil.ca/en/dynamic-article.page?doc=new-tool-helps-managers-with-recruitment/iqdinx3r"><strong><span class="small"><span><span>New tool helps managers with recruitment</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=message-to-government-of-canada-employees-about-pay/iqdinobr"><strong><span class="small"><span><span>Message to Government of Canada employees about pay</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="http://intranet.mil.ca/en/news/articles.page?doc=students-at-defence-participate-in-discussion-with-senior-leaders-for-national-public-service-week/iq3d97uw"><strong><span class="small"><span><span>Students at Defence participate in discussion with senior leaders for National Public Service Week</span></span></span></strong></a>&nbsp;</li>
                    <li><a href="/en/e-compensation-pay-it-forward.page"><strong><span class="small"><span><span>Pay it Forward</span></span></span></strong></a>&nbsp;<strong></strong></li>
                    <li><strong><span class="small"><span><span><a href="/en/l1-carling-campus-job-match.page">Carling Campus Job Match</a></span></span></span></strong>&nbsp;</li>
                  </ul>
                  
                </div>
              </details>
            </div>
          </div>
        </section>   -->    
    </main>

<script src="/SiteAssets/dynamic-home/deps/jquery.min.js"></script>
<script src="/SiteAssets/dynamic-home/deps/jquery.SPServices-2014.02.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.14.0/lodash.min.js"></script>

<!-- <script src="/SiteAssets/dynamic-home/deps/react-with-addons.min.js"></script> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.2.1/react-with-addons.js"></script>
<script src="/SiteAssets/dynamic-home/deps/react-dom.min.js"></script>
<script src="/SiteAssets/dynamic-home/deps/browser.min.js"></script>

<script src="/SiteAssets/dynamic-home/hr-home.js"></script>
<!-- <script type="text/babel" src="/SiteAssets/dynamic-home/home-slider.js"></script> -->
<script type="text/babel" src="/SiteAssets/dynamic-home/home-nav.js"></script>

<script src="/SiteAssets/dynamic-home/deps/wet-boew.min.js"></script>
</body>
</asp:Content>
