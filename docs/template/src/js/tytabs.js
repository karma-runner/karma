/*
 * jQuery plugin "tytabs" by Tyler ( Gregory Jacob )
 * http://blog.carefordesign.com
 *
 * Copyright 2010, Gregory Jacob
 * Data : 31 decembre 2010
 */
(function($){$.fn.tytabs=function(options){var defaults={prefixtabs:"tab",prefixcontent:"content",classcontent:"tabscontent",tabinit:"1",catchget:"tab",fadespeed:"normal"},opts=$.extend({},defaults,options);return this.each(function(){var obj=$(this);opts.classcontent="."+opts.classcontent;opts.prefixcontent="#"+opts.prefixcontent;function showTab(id){$(opts.classcontent,obj).stop(true,true);var contentvisible=$(opts.classcontent+":visible",obj);if(contentvisible.length>0){contentvisible.fadeOut(opts.fadespeed,function(){fadeincontent(id)})}else{fadeincontent(id)}$("#"+opts.prefixtabs+opts.tabinit).removeAttr("class");$("#"+opts.prefixtabs+id).attr("class","current");opts.tabinit=id}function fadeincontent(id){$(opts.prefixcontent+id,obj).fadeIn(opts.fadespeed)}$("ul.tabs li",obj).click(function(){showTab($(this).attr("id").replace(opts.prefixtabs,""));return false});var tab=getvars(opts.catchget);showTab(((tab&&$(opts.prefixcontent+tab).length==1)?tab:($(opts.prefixcontent+opts.tabinit).length==1)?opts.tabinit:"1"))})};function getvars(q,s){s=(s)?s:window.location.search;var re=new RegExp("&"+q+"=([^&]*)","i");return(s=s.replace(/^\?/,"&").match(re))?s=s[1]:s=""}})(jQuery);