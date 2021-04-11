var current_url = "";
var paper_domains_regex = /(arxiv\.org\/(abs|pdf)|arxiv-vanity\.com\/papers\/\d+|aclweb\.org|ieee\.org|openreview\.net|emnlp\.org|semanticscholar\.org|paperswithcode\.com|dl\.acm\.org|papers\.nips\.cc|openaccess\.thecvf\.com)/

function runExtension() {

    current_url = document.location.origin + document.location.pathname + document.location.search;

    switch (true) {

        case /https:\/\/www\.catalyzex\.com/.test(current_url):
            function pollDOM1 () {
                    const el = document.querySelector("#hellobar-bar");
                    if (el == null) {
                        setTimeout(pollDOM1, 20);
                    }   else {
                        el.remove();
                    }
            }
            pollDOM1();
            break;

        case /https:\/\/scholar\.google\.[a-z]{2,3}(\.[a-z]{2,3})?\/scholar/.test(current_url):
            var paper_title_node_list = document.querySelectorAll("h3.gs_rt");
            var i;
            for(i=0;i<paper_title_node_list.length;i++){
                let paper_title_node = paper_title_node_list[i];
                let paper_title_node_anchor = paper_title_node.querySelectorAll("a")[0];
                let paper_url = paper_title_node_anchor.href;

                // z-index clash fix
                paper_title_node.style.zIndex = 99;

                if (paper_url.match(/(arxiv\.org\/(abs|pdf)|arxiv-vanity\.com\/papers)/) != null) {
                        paper_url = paper_url.split('?')[0];
                        if (paper_url.endsWith('/')) paper_url = paper_url.substring(0, paper_url.length-1);
                        let paper_arxiv_id = paper_url.split('/').pop().replace( /\.pdf.*$/, '' );
                        fetchCode(paper_title_node, title = null, arxiv_id = paper_arxiv_id);

                }  else {
                    let title = paper_title_node_anchor.textContent.trim();
                    fetchCode(paper_title_node, title = title, arxiv_id = null, url = paper_url);
                }
            }
            break;

        case /https:\/\/scholar\.google\.[a-z]{2,3}(\.[a-z]{2,3})?\/citations/.test(current_url):
            var paper_title_node_list = document.querySelectorAll("td.gsc_a_t");
            var i;
            for(i=0;i<paper_title_node_list.length;i++){
                let paper_title_node = paper_title_node_list[i];
                let paper_title_node_anchor = paper_title_node.querySelectorAll("a")[0];
                let paper_url = paper_title_node_anchor.href;

                if (paper_url.match(/(arxiv\.org\/(abs|pdf)|arxiv-vanity\.com\/papers)/) != null) {
                        paper_url = paper_url.split('?')[0];
                        if (paper_url.endsWith('/')) paper_url = paper_url.substring(0, paper_url.length-1);
                        let paper_arxiv_id = paper_url.split('/').pop().replace( /\.pdf.*$/, '' );
                        fetchCode(paper_title_node, title = null, arxiv_id = paper_arxiv_id);

                }  else {
                    let title = paper_title_node_anchor.textContent.trim();
                    fetchCode(paper_title_node, title = title);
                }
            }
            break;

        case /https:\/\/www\.google\.[a-z]{2,3}(\.[a-z]{2,3})?\/search/.test(current_url):
            let flag = false;
            try {
                let scholar_node = document.querySelector("div > div > div > table > tbody > tr > td > h3 > a");
                let paper_title_node = scholar_node.parentElement;
                let title = paper_title_node.querySelector("em").textContent;
                // fetchCode(paper_title_node, title = title);
                flag = (scholar_node.href.match(/scholar\.google\.[a-z]{2,3}(\.[a-z]{2,3})?\/scholar/) != null);
            } catch(err){}

            var paper_title_node_list = document.querySelectorAll("div.g > div > div a > h3");

            // Check if scholar results shown or urls from any relevant domain present
            flag = flag || Array.from(paper_title_node_list).map(function(x) {return paper_domains_regex.test(x.parentElement.href) }).includes(true);

            if (flag){
                let search_title = document.querySelector("input[name='q'][type='text']").value;
                let search_overview_node = document.querySelector("div#result-stats");
                fetchCode(search_overview_node, title = search_title);
                search_overview_node.style.overflow = 'visible';

                var i;
                for(i=0;i<paper_title_node_list.length;i++){
                    let paper_title_node = paper_title_node_list[i].parentElement.parentElement;

                    let paper_url = paper_title_node_list[i].parentElement.href;

                    if (paper_url.match(/(arxiv\.org\/(abs|pdf)|arxiv-vanity\.com\/papers\/\d+)/) != null) {
                        paper_url = paper_url.split('?')[0];
                        paper_url = paper_url.split('#')[0];
                        if (paper_url.endsWith('/')) paper_url = paper_url.substring(0, paper_url.length-1);
                        let paper_arxiv_id = paper_url.split('/').pop().replace( /\.pdf.*$/, '' );
                        fetchCode(paper_title_node, title = null, arxiv_id = paper_arxiv_id);
                    } else {
                        let title = paper_title_node.querySelector("a h3").textContent.trim();
                        fetchCode(paper_title_node, title = title, arxiv_id = null, url = paper_url);
                    }
                }
            }
            break;

        case /https:\/\/arxiv\.org\/(abs|pdf)/.test(current_url):
            var paper_title_node = document.querySelectorAll("h1.title")[0];
            var title = paper_title_node.childNodes[1].nodeValue.trim();
            current_url = current_url.split('?')[0];
            current_url = current_url.split('#')[0];
            var paper_arxiv_id = current_url.split('/').pop().replace( /\.pdf.*$/, '' );
            fetchCode(paper_title_node, title = title, arxiv_id = paper_arxiv_id);

            if (document.querySelectorAll(".bib-ds-select")[0] !== undefined) {

                function pollDOM2 () {
                        const el = document.querySelectorAll(".bib-paper-container > .bib-paper-overhang > .bib-paper-links")[0];

                        if (el == null) {
                            setTimeout(pollDOM2, 200);
                        } else {
                            var paper_title_node_list = document.querySelectorAll(".bib-paper-container > .bib-paper-overhang > .bib-paper-links");
                            var i;
                            for(i=0;i<paper_title_node_list.length;i++){
                                let paper_title_node = paper_title_node_list[i];
                                let title = paper_title_node.parentElement.querySelector(".bib-paper > a").textContent.trim();

                                var arxiv_bib_section_node = document.createElement('div');
                                paper_title_node.appendChild(arxiv_bib_section_node);

                                fetchCode(arxiv_bib_section_node, title = title);
                            }
                        }
                }
                if (document.readyState == "complete") {
                    pollDOM2();
                }
            }
            break;

        // TODO:
        // case /https:\/\/ieeeexplore\.org\//.test(current_url):
        //     break;

        // case /https:\/\/semanticscholar\.org\//.test(current_url):
        //     break;

        // case /https:\/\/bing\.com\//.test(current_url):
        //     break;

        // case /https:\/\/duckduckgo\.com\//.test(current_url):
        //     break;

        case /https:\/\/arxiv\.org\/search/.test(current_url):
            var paper_title_node_list = document.querySelectorAll("li.arxiv-result p.title");
            var i;
            for(i=0;i<paper_title_node_list.length;i++){
                let paper_title_node = paper_title_node_list[i];
                let title = paper_title_node.textContent.trim();
                let paper_url = paper_title_node.parentElement.querySelector("div > p > a").href;
                let paper_arxiv_id = paper_url.split('/').pop();

                fetchCode(paper_title_node, title = title, arxiv_id = paper_arxiv_id, url = paper_url);
            }
            break;

        case /twitter\.com\/(\w)*\/status\//.test(current_url):

            function pollDOM () {
                const el = document.querySelectorAll("article span+a")[0];

                if (el == null) {
                    setTimeout(pollDOM, 200);
                } else {
                    var tweet_node = el.parentElement;
                    var tweet_text = tweet_node.querySelectorAll("span")[0].textContent.trim();

                    var link;
                    var paper_id_matcher;

                    var link_nodes = tweet_node.querySelectorAll("a");

                    let papers_found = new Set();
                    var i;
                    for(i=0;i<link_nodes.length;i++){

                        var link_node = link_nodes[i];
                        if (link_node !== undefined && (link = link_node.textContent.trim()) && paper_domains_regex.test(link)) {
                            let paper_arxiv_id = link.split('/').pop().replace( /\.pdf.*$/, '' );
                            // Prevent duplicates, for e.g. when abs and pdf both linked for a paper
                            if (!papers_found.has(paper_arxiv_id)){
                                papers_found.add(paper_arxiv_id);
                                fetchCode(tweet_node, title = null, arxiv_id = paper_arxiv_id);
                            }
                        }
                    }

                    if ((paper_id_matcher = tweet_text.match(/arxiv:(\d+\.\d+)/i)) && paper_id_matcher != null) {
                        let paper_arxiv_id = paper_id_matcher[1];
                        fetchCode(tweet_node, title = null, arxiv_id = paper_arxiv_id);
                    }
                }
            }

            if (document.readyState == "complete") {
                pollDOM();
            }
            break;

        default:
            break;
    }
}

function fetchCode(paper_title_node, title = null, arxiv_id = null, url = null) {

    let xhr = new XMLHttpRequest();
    try{
        cx_api_url = "https://www.catalyzex.com/api/code?extension=true";

        if (arxiv_id != null){
            cx_api_url += "&paper_arxiv_id="+encodeURIComponent(arxiv_id)
        }
        if (title != null){
            cx_api_url += "&paper_title="+encodeURIComponent(title)
        }
        if (url != null){
            cx_api_url += "&paper_url="+encodeURIComponent(url)
        }

        xhr.open("GET", cx_api_url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");

        function isDarkMode() {
            var dummy = document.createElement('span');
            dummy.style.display = "none";
            dummy.style.setProperty("background-color", "rgb(0, 0, 0)");
            document.body.appendChild(dummy);
            window.getComputedStyle(dummy, null).getPropertyValue("background-color");
            return document.querySelector("body").style["background-color"] == window.getComputedStyle(dummy, null).getPropertyValue("background-color");
        }

        function isDimMode() {
            var dummy2 = document.createElement('span');
            dummy2.style.display = "none";
            dummy2.style.setProperty("background-color", "rgb(21, 32, 43)");
            document.body.appendChild(dummy2);
            window.getComputedStyle(dummy2, null).getPropertyValue("background-color");
            return document.querySelector("body").style["background-color"] == window.getComputedStyle(dummy2, null).getPropertyValue("background-color");
        }

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                try{
                    var resp = JSON.parse(xhr.responseText);
                    if(resp.hasOwnProperty('code_url')){

                        var code_url = resp.code_url;

                        var a = document.createElement('a');
                        a.setAttribute('class', "cx_code");
                        a.setAttribute('href', code_url);
                        a.setAttribute('data-lynx-uri', "https://www.catalyzex.com/redirect?url=" + code_url);
                        a.setAttribute('data-lynx-mode', "hover");
                        a.addEventListener('mouseover', function() {
                            a.href = code_url;
                        });
                        a.addEventListener('mouseout', function() {
                            a.style.backgroundColor = "black";
                        });
                        a.addEventListener('click', function() {
                            a.href = a.getAttribute('data-lynx-uri');
                        });
                        a.addEventListener('contextmenu', function() {
                            a.href = a.getAttribute('data-lynx-uri');
                        });
                        a.setAttribute('title',"Code implementation found - CatalyzeX");
                        a.setAttribute('target', "_blank");

                        var share_icon_img_url = chrome.extension.getURL("/socialicons/share.png");
                        var codebtn_icon_img_url = chrome.extension.getURL("/branding/code_button_3.5x_latest.png");

                        a.style.textDecoration = "none";
                        a.style.display = "inline-block";
                        a.style.border = "1px solid currentColor";
                        a.style.margin = "2px 5px";
                        a.style.fontWeight = "bold";
                        a.style.backgroundColor = "black";
                        a.style.fontSize = "initial";
                        a.style.borderRadius = "5px";
                        a.style.width = "fit-content";
                        a.style.alignItems = "center";
                        a.style.verticalAlign = "text-bottom";
                        a.innerHTML = '<img class="btn_image" style="width: 80px; height: 26px;" src="' + codebtn_icon_img_url + '" />';
                        a.style.height = "26px";
                        paper_title_node.appendChild(a);

                        var sharebuttons = document.createElement('sharebuttons');
                        sharebuttons.style.textDecoration = "none";
                        sharebuttons.style.display = "inline-block";
                        sharebuttons.style.position = "absolute";
                     
                        sharebuttons.style.padding = "2px 5px";
                        sharebuttons.style.paddingLeft = "2px";
                        sharebuttons.style.transform = "scale(0.85)";
                
                        sharebuttons.style.fontSize = "18px";
                        sharebuttons.style.alignItems = "center";
                   
                        if (title != null){
                            paper_title_or_link = title;
                        } else if (arxiv_id != null) {
                            paper_title_or_link = "https://www.catalyzex.com/paper/arxiv:" + encodeURIComponent(arxiv_id);
                        } else {
                            paper_title_or_link = encodeURIComponent(url);
                        }
                    
                        var copytoclipboard_url_codebtn = "Found code for " + paper_title_or_link + " at " + code_url + " via the CatalyzeX extension (bit.ly/code_finder_chrome | bit.ly/code_finder_firefox)";
                        var email_url_codebtn = "mailto:?subject=Code%20for%20" + paper_title_or_link + "&body=Found%20code%20for%20" + paper_title_or_link + "%20at%20" + code_url + "%20with%20the%20CatalyzeX%20extension%20(chrome:%20bit.ly%2Fcode_finder_chrome%20|%20firefox:%20bit.ly%2Fcode_finder_firefox)";
                        var twitter_url_codebtn = "https://twitter.com/intent/tweet?text=Found%20code%20for%20" + paper_title_or_link + "%20at%20" + code_url + "%20with%20the%20CatalyzeX%20extension%20(bit.ly%2Fcode_finder_chrome%20%7C%20bit.ly%2Fcode_finder_firefox)";
                        var facebook_url_codebtn = "https://www.facebook.com/dialog/share?app_id=704241106642044&display=popup&href=" + code_url + "&redirect_uri=https%3A%2F%2Fcatalyzex.com&quote=Check%20out%20code%20for%20" + paper_title_or_link + "%20at%20" + code_url + "%0D%0A%0D%0A—%20found%20via%20the%20CatalyzeX%20extension%20(bit.ly%2Fcode_finder_chrome%20|%20bit.ly%2Fcode_finder_firefox)";
                        var whatsapp_url_codebtn = "https://api.whatsapp.com/send?text=Check%20out%20code%20for%20" + paper_title_or_link + "%20at%20" + code_url + "%20—%20found%20via%20the%20CatalyzeX%20extension%20(bit.ly%2Fcode_finder_chrome%20|%20bit.ly%2Fcode_finder_firefox)";
                        var messenger_url_codebtn = "https://www.facebook.com/dialog/send?app_id=704241106642044&link=" + encodeURIComponent(code_url) + "&redirect_uri=https%3A%2F%2Fcatalyzex.com";
                        var linkedin_url_codebtn = "https://www.linkedin.com/sharing/share-offsite/?url=" + code_url;
                        var reddit_url_codebtn = "https://www.reddit.com/submit?title=Code%20for%20" + paper_title_or_link + "&text=Check%20out%20code%20for%20" + paper_title_or_link + "%20at%20" + code_url + "%20—%20found%20via%20the%20CatalyzeX%20extension%20(bit.ly%2Fcode_finder_chrome%20|%20bit.ly%2Fcode_finder_firefox)";

                        var share_icon_img_url = chrome.extension.getURL("/socialicons/share.png");
                        var copytoclipboard_img_url = chrome.extension.getURL("/socialicons/link.png");
                        var email_img_url = chrome.extension.getURL("/socialicons/filled-message.png");
                        var twitter_img_url = chrome.extension.getURL("/socialicons/twitter.png");
                        var facebook_img_url = chrome.extension.getURL("/socialicons/facebook-new.png");
                        var whatsapp_img_url = chrome.extension.getURL("/socialicons/whatsapp.png");
                        var messenger_img_url = chrome.extension.getURL("/socialicons/facebook-messenger--v2.png");
                        var linkedin_img_url = chrome.extension.getURL("/socialicons/linkedin.png");
                        var reddit_img_url = chrome.extension.getURL("/socialicons/reddit.png");

                        sharebuttons.innerHTML = 
                        '<div class="btn_wrap" style="border-radius: 5px;">'
                        +   '<span class="share_icon_slider" style="border-radius: 8px;">'
                        +       '<img style="margin-left: -5px;height: auto;" class="sharebtnicon" alt="share icon" src="' + share_icon_img_url + '" />'
                        +   '</span>'
                        +    '<div class="containerone" style="width: 0px;">'
                        +        '<a style="margin-left: -35px;" title="Copy link" class="share-btn copytext" id="copytext" target="_blank" copytext="' + copytoclipboard_url_codebtn + '" target="_blank">'
                        +            '<i class="sharing_icons_extension"><img class="clipboard" src="' + copytoclipboard_img_url + '" /></i>'
                        +        '</a>'
                        +        '<a title="Share via email" href="' + email_url_codebtn + '" class="share-btn" target="_blank">'
                        +            '<i class="sharing_icons_extension"><img class="emailslider" src="' + email_img_url + '"/></i>'
                        +        '</a>'
                        +        '<a title="Share on Twitter" href="' + twitter_url_codebtn + '" class="share-btn" target="_blank">'
                        +            '<i class="sharing_icons_extension"><img class="twitterslider" src="' + twitter_img_url + '" /></i>'
                        +        '</a>'
                        +        '<a title="Share on Facebook" class="share-btn" href="' + facebook_url_codebtn + '" target="_blank">'
                        +            '<i class="sharing_icons_extension"><img class="facebookslider" src="' + facebook_img_url + '" /></i>'
                        +        '</a>'
                        +        '<a title="Send via Whatsapp" href="' + whatsapp_url_codebtn + '" class="share-btn" target="_blank">'
                        +            '<i class="sharing_icons_extension"><img class="whatsappslider" src="' + whatsapp_img_url + '" /></i>'
                        +        '</a>'
                        +        '<a title="Send via Messenger" href="' + messenger_url_codebtn + '" class="share-btn" target="_blank">'
                        +            '<i class="sharing_icons_extension"><img class="messengerslider" src="' + messenger_img_url + '" /></i>'
                        +        '</a>'
                        +        '<a title="Share on LinkedIn" href="' + linkedin_url_codebtn + '" class="share-btn" target="_blank">'
                        +            '<i class="sharing_icons_extension"><img class="linkedinslider" src="' + linkedin_img_url + '" /></i>'
                        +        '</a>'
                        +        '<a title="Share on Reddit" href="' + reddit_url_codebtn + '" class="share-btn" target="_blank">'
                        +            '<i class="sharing_icons_extension"><img class="redditslider" src="' + reddit_img_url + '" /></i>'
                        +        '</a>'
                        +    '</div>'
                        + '</div>';

                        //Black background and white border for social button slider if twitter dim/dark mode
                        var iconlistbg = sharebuttons.querySelector('.btn_wrap');
                        
                        if (/twitter\.com\/(\w)*\/status\//.test(current_url) && (isDarkMode() || isDimMode())) {
                            // a.style.color = "greenyellow";
                            a.style.color = "white";
                            // iconlistbg.style.borderColor = "white";
                            iconlistbg.style.border = "1px solid white";
                            iconlistbg.style.background = "black";

                        } else { //light mode
                            // a.style.color = "black";
                            a.style.color = "black";
                            // iconlistbg.style.borderColor = "white";
                            iconlistbg.style.border = "1px solid white";
                            // iconlistbg.style.border = "none";

                            // Special CSS for results by GSearch bar
                            if (paper_title_node.id == "result-stats" && /https:\/\/www\.google\.[a-z]{2,3}(\.[a-z]{2,3})?\/search/.test(current_url)) {
                                iconlistbg.querySelector("div.containerone").style.paddingTop = "10px";
                            }
                        }

                        let copycodetext = sharebuttons.querySelector('.share-btn.copytext');
                        copycodetext.addEventListener('click', function() {
                            const el = document.createElement('textarea');
                            el.value = copycodetext.getAttribute('copytext');
                            document.body.appendChild(el);
                            el.select();
                            document.execCommand('copy');
                            document.body.removeChild(el);
                            return false;
                        });

                        paper_title_node.appendChild(sharebuttons);
                    }
                } catch(err){}
            }
            else if (xhr.status == 404 && arxiv_id != null && /\.google\.[a-z]{2,3}(\.[a-z]{2,3})?\//.test(current_url)) {
                var code_url = "https://www.catalyzex.com/paper/arxiv:" + arxiv_id + "/code";

                var a = document.createElement('a');
                a.setAttribute('class', "cx_code");
                a.setAttribute('href', code_url);
                a.setAttribute('data-lynx-uri', "https://www.catalyzex.com/redirect?url=" + code_url);
                a.setAttribute('data-lynx-mode', "hover");
                a.addEventListener('mouseover', function() {
                    a.href = code_url;
                    a.style.backgroundColor = "#ebebeb";
                });
                a.addEventListener('mouseout', function() {
                    a.style.backgroundColor = "white";
                });
                a.addEventListener('click', function() {
                    a.href = a.getAttribute('data-lynx-uri');
                });
                a.addEventListener('contextmenu', function() {
                    a.href = a.getAttribute('data-lynx-uri');
                });
                a.setAttribute('title',"Request code implementation - CatalyzeX");
                a.setAttribute('target', "_blank");

                a.style.color = "#4d5156";

                a.style.textDecoration = "none";
                a.style.display = "inline-block";
                a.style.border = "1px solid currentColor";
                a.style.padding = "0 4px";
                
                a.style.fontSize = "10px";
                a.style.borderRadius = "2px";
                
                a.style.verticalAlign = "middle";
                a.style.textAlign = "center";
                a.style.letterSpacing = "0.75px";
                a.style.lineHeight = "16px";
                a.style.height = "14px";

                a.style.margin = "0 2px 3px 6px";

                a.innerText = "REQUEST CODE";

                paper_title_node.appendChild(a);
            }
        }
        xhr.send();
    } catch(err1) {}
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        let new_url = document.location.origin + document.location.pathname + document.location.search;
        if (request.type == "runExtension" && current_url != new_url) {          
            runExtension();
        }
    }
);