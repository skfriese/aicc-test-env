/**
 * Returns a reference to the AiccTestEnvironment class
 * @param  {Object} $   jQuery reference 
 * @return {Function}   AiccTestEnvironment reference
 */
var AiccTestEnvironment = (function($){

  "use strict"

  /* Private Utility Methods */

  /**
   * Returns the current folder from the URL
   * @return {String} The full URL of the current folder
   */
  var getThisFolder = function()
  {
    return document.URL.substring(0,document.URL.lastIndexOf("/"))+"/";
  };

  /**
   * Converts linebreaks to BR tags
   * @param  {String} s The text to alter
   * @return {String}   The altered text
   */
  var lineBreakToBrTag = function(s)
  {
    return s.replace(/\n/g, "<br />");
  };

  /**
   * Returns a random string of [len] length
   * @param  {Number} len The length of the random string returned
   * @return {String}     The random string
   */
  var getRandomId = function(len)
  {
    var text = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i <= len; i++ )
    {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return text;
  };

  /**
   * Strips tags using jQuery's "text" method
   * @param  {String} text The text to alter
   * @return {[type]}      The altered text
   */
  var removeTags = function(text)
  {
    var $div = $("<div/>");
    var safeText = $div.html(text).text();
    $div.remove();
    return safeText;
  };

  /**
   * The AiccTestEnvironment constructor
   */
  function AiccTestEnvironment()
  {
    this.auWin = null;
  }

  /* Public Prototype Methods */

  AiccTestEnvironment.prototype = {

    /**
     * [initialize description]
     * @return {[type]} [description]
     */
    initialize: function()
    {
      this.populateForm();
      this.showData();

      return this;
    },

    /**
     * [openWindow description]
     * @param  {[type]} url_name    [description]
     * @param  {[type]} window_name [description]
     * @param  {[type]} w           [description]
     * @param  {[type]} h           [description]
     * @param  {[type]} options     [description]
     * @return {[type]}             [description]
     */
    openWindow: function(url_name,window_name,w,h,options)
    {
      if (options === null) { options=""; }
      winopts = "toolbar=" + (options.indexOf("toolbar") == -1 ? "no," : "yes,") +
      "location="  + (options.indexOf("location") == -1 ? "no," : "yes,") +
      "menubar=" + (options.indexOf("menubar") == -1 ? "no," : "yes,") +
      "scrollbars=" + (options.indexOf("scrollbars") == -1 ? "no," : "yes,") +
      "status=" + (options.indexOf("status") == -1 ? "no," : "yes,") +
      "resizable=" + (options.indexOf("resizable") == -1 ? "no," : "yes,") +
      "copyhistory=" + (options.indexOf("copyhistory") == -1 ? "no," : "yes,") +
      "width=" + w + ",height=" + h;
      return window.open(url_name,window_name,winopts);
    },

    /**
     * [populateForm description]
     * @return {[type]} [description]
     */
    populateForm: function()
    {
      $('#au_url').val(DEFAULT_AU_URL);
      $('#aicc_sid').val(AICC_SID_PREFIX+getRandomId(32));
      $('#aicc_url').val(getThisFolder()+DEFAULT_AICC_SCRIPT_FILENAME);
    },

    /**
     * [launch description]
     * @return {[type]} [description]
     */
    launch: function()
    {
      var initChar = ($('#au_url').val().indexOf("?") > -1) ?  "&" : "?";
      var url_name = $('#au_url').val() + initChar + 'aicc_sid=' + $('#aicc_sid').val() + '&aicc_url=' + $('#aicc_url').val();
      this.auWin = openWindow(url_name,'auWin',1024,768,'resizable');
      if(this.auWin != null)
      {
        this.initSetTimeOut();
      }
    },

    /**
     * [refreshLogFile description]
     * @return {[type]} [description]
     */
    refreshLogFile: function()
    {
      var xmlhttp =  new XMLHttpRequest();
      xmlhttp.open('GET', $('#aicc_url').val() + '?command=getlog', true);
      this.success('Refreshing logs...');
      xmlhttp.onreadystatechange = function()
      {
        if(xmlhttp.readyState == 4)
        {
          $('#log-text').html(removeTags(xmlhttp.responseText));
          $('#log-text').scrollTop();
        }
      }

      xmlhttp.send(null);
    },

    /**
     * [showData description]
     * @return {[type]} [description]
     */
    showData: function()
    {
      var xmlhttp =  new XMLHttpRequest();
      xmlhttp.open('GET', $('#aicc_url').val() + '?command=getdata', true);
      this.success('Requesting persisted data...');
      xmlhttp.onreadystatechange = function()
      {
        if(xmlhttp.readyState == 4)
        {
          $('#data').html(removeTags(xmlhttp.responseText));
          $('#data').scrollTop();
        }
      }

      xmlhttp.send(null);
    },

    /**
     * [clearLogFile description]
     * @return {[type]} [description]
     */
    clearLogFile: function()
    {
      var self = this;
      var xmlhttp =  new XMLHttpRequest();
      xmlhttp.open('GET', $('#aicc_url').val() + '?command=clearlog', true);

      xmlhttp.onreadystatechange = function()
      {
        if(xmlhttp.readyState == 4)
        {
          if(xmlhttp.responseText == 'SUCCESS')
          {
            self.success('Log File Cleared');
            $('#log-text').html('');
            $('#log-text').scrollTop();
          }
          else
          {
            self.warning('An error has occurred.');
          }
        }
      }

      xmlhttp.send(null);
    },

    /**
     * [clearDataFile description]
     * @return {[type]} [description]
     */
    clearDataFile: function()
    {
      var self = this;
      var xmlhttp =  new XMLHttpRequest();
      xmlhttp.open('GET', $('#aicc_url').val() + '?command=cleardata', true);

      xmlhttp.onreadystatechange = function()
      {
        if(xmlhttp.readyState == 4)
        {
          if(xmlhttp.responseText == 'SUCCESS')
          {
            self.success('Data File Cleared');
          }
          else
          {
            self.warning('An error has occurred.');
          }
        }
      }

      xmlhttp.send(null);
    },

    /**
     * [testScript description]
     * @return {[type]} [description]
     */
    testScript: function()
    {
      var self = this;
      var xmlhttp =  new XMLHttpRequest();
      xmlhttp.open('GET', $('#aicc_url').val() + '?command=test', true);

      xmlhttp.onreadystatechange = function()
      {
        if(xmlhttp.readyState == 4)
        {
          if(xmlhttp.responseText == 'SUCCESS')
          {
            self.refreshLogFile();
          }
          else
          {
            self.warning('An error has occurred. The AICC test script is not accessible, or an error is causing it to malfunction.');
          }
        }
      }

      xmlhttp.send(null);
    },

    /**
     * [initSetTimeOut description]
     * @return {[type]} [description]
     */
    initSetTimeOut: function()
    {
      var self = this;
      setTimeout(function(){self.checkWindowState();}, 500)
    },

    /**
     * [checkWindowState description]
     * @return {[type]} [description]
     */
    checkWindowState: function()
    {
      var self = this;
      try
      {
        if(this.auWin)
        {
          if(this.auWin.closed)
          {      
            this.auWin = null;
            setTimeout(function(){self.refreshLogFile();},1000);
          }
          else
          {
            this.initSetTimeOut();
          }
        }
      }
      catch(e){};
    },

    /**
     * [showMessage description]
     * @param  {[type]} selector [description]
     * @param  {[type]} message  [description]
     * @return {[type]}          [description]
     */
    showMessage: function(selector, message)
    {
      $(selector+" .message").html(message);
      $(selector).show("fast", function(){
        setTimeout(function(){
          $(selector).hide("fast");
        },3000);
      });
    },

    /**
     * [warning description]
     * @param  {[type]} message [description]
     * @return {[type]}         [description]
     */
    warning: function(message)
    {
      this.showMessage("#warning", message);
    },

    /**
     * [success description]
     * @param  {[type]} message [description]
     * @return {[type]}         [description]
     */
    success: function(message)
    {
      this.showMessage("#success", message);
    }    

  };

  return AiccTestEnvironment;

})(jQuery);

$(document).ready(function(){

  window.aiccTest = new AiccTestEnvironment().initialize();

  $("[data-click]").click(function(){
    aiccTest[$(this).data("click")]();
  });

});
