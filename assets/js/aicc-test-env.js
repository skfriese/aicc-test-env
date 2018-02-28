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

    for( var i=0; i < len; i++ )
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
   * [prepLogs description]
   * @param  {[type]} text [description]
   * @return {[type]}      [description]
   */
  var prepLogs = function(text)
  {
    var lineSep = "----------";
    var logs = removeTags(text);
    return logs.split(lineSep).join("<hr>");
  };

  /**
   * [openWindow description]
   * @param  {[type]} url_name    [description]
   * @param  {[type]} window_name [description]
   * @param  {[type]} w           [description]
   * @param  {[type]} h           [description]
   * @param  {[type]} options     [description]
   * @return {[type]}             [description]
   */
  var openWindow = function(url_name,window_name,w,h,options)
  {
    if (options === null) { options=""; }
    var winopts = "toolbar=" + (options.indexOf("toolbar") == -1 ? "no," : "yes,") +
    "location="  + (options.indexOf("location") == -1 ? "no," : "yes,") +
    "menubar=" + (options.indexOf("menubar") == -1 ? "no," : "yes,") +
    "scrollbars=" + (options.indexOf("scrollbars") == -1 ? "no," : "yes,") +
    "status=" + (options.indexOf("status") == -1 ? "no," : "yes,") +
    "resizable=" + (options.indexOf("resizable") == -1 ? "no," : "yes,") +
    "copyhistory=" + (options.indexOf("copyhistory") == -1 ? "no," : "yes,") +
    "width=" + w + ",height=" + h;
    return window.open(url_name,window_name,winopts);
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
      this.getPersistedSession();
      this.populateForm();
      this.getLogs();
      this.getData();

      return this;
    },

    /**
     * [populateForm description]
     * @return {[type]} [description]
     */
    populateForm: function()
    {
      $('#au_url').val(DEFAULT_AU_URL);
      $('#aicc_sid').val(this.sessionId);
      $('#aicc_url').val(getThisFolder()+DEFAULT_AICC_SCRIPT_FILENAME);
    },

    /**
     * [getPersistedSession description]
     * @return {[type]} [description]
     */
    getPersistedSession: function()
    {
      var sess = localStorage.getItem("aicc_test_env_session_id");
      if(!sess)
      {
        var sess = AICC_SID_PREFIX+getRandomId(8);
      }
      
      this.sessionId = sess;
      return sess;
    },

    /**
     * [persistSession description]
     * @return {[type]} [description]
     */
    persistSession: function()
    {
      var aicc_sid = $('#aicc_sid').val();
      if(aicc_sid == "")
      {
        this.getPersistedSession();
        $('#aicc_sid').val(this.sessionId);
      }

      this.sessionId = aicc_sid;
      localStorage.setItem("aicc_test_env_session_id", this.sessionId);
    },

    /**
     * [removeSession description]
     * @return {[type]} [description]
     */
    removeSession: function()
    {
      localStorage.removeItem("aicc_test_env_session_id");
      this.sessionId = null;
    },

    /**
     * [launch description]
     * @return {[type]} [description]
     */
    launch: function()
    {
      var au_url = $('#au_url').val();
      var au_params = $('#au_params').val();
      var aicc_sid = $('#aicc_sid').val();
      var aicc_url = $('#aicc_url').val();

      if(au_url == "")
      {
        this.warning("Enter the AU URL before launching");
        return;
      }

      this.persistSession();

      var initChar = (au_url.indexOf("?") > -1) ?  "&" : "?";
      var url = au_url + initChar + 'aicc_sid=' + encodeURIComponent(aicc_sid) + '&aicc_url=' + encodeURIComponent(aicc_url);
      if(au_params != "")
      {
        url = url + "&" + au_params;
      }
      this.auWin = openWindow(url,'auWin',1024,768,'resizable,location');
      if(this.auWin != null)
      {
        this.initSetTimeOut();
      }
    },

    /**
     * [getLogs description]
     * @return {[type]} [description]
     */
    getLogs: function()
    {
      var self = this;
      $.get($('#aicc_url').val() + '?command=getlog&session_id='+this.sessionId)
       .done(function(data){
        self.success('Refreshing logs...');
        $('#log-text').html(prepLogs(data));
        $('#log-text').scrollTop();
       })
       .fail(function(){
        self.warning('An error has occurred.');
       });
    },

    /**
     * [getData description]
     * @return {[type]} [description]
     */
    getData: function()
    {
      var self = this;
      $.get($('#aicc_url').val() + '?command=getdata&session_id='+this.sessionId)
       .done(function(data){
        self.success('Refreshing data...');
        $('#data').html(removeTags(data));
        $('#data').scrollTop();
       })
       .fail(function(){
        self.warning('An error has occurred.');
       });
    },

    /**
     * [deleteLogs description]
     * @return {[type]} [description]
     */
    deleteLogs: function()
    {
      var self = this;
      $.get($('#aicc_url').val() + '?command=clearlog&session_id='+this.sessionId)
        .done(function(data){
          self.success('Logs deleted for session '+self.sessionId);
          $('#log-text').html('');
          $('#log-text').scrollTop();
        })
        .fail(function(){
          self.warning('An error has occurred.');
        });
    },

    /**
     * [deleteData description]
     * @return {[type]} [description]
     */
    deleteData: function()
    {
      var self = this;
      $.get($('#aicc_url').val() + '?command=cleardata&session_id='+this.sessionId)
        .done(function(data){
          self.success('Data deleted for session '+self.sessionId);
        })
        .fail(function(){
          self.warning('An error has occurred.');
        });
    },

    /**
     * [clearSession description]
     * @return {[type]} [description]
     */
    clearSession: function()
    {
      var self = this;
      var sessionId = this.sessionId;
      $.get($('#aicc_url').val() + '?command=clearsession&session_id='+sessionId)
        .done(function(data){
          self.removeSession();
          self.getPersistedSession();
          $('#aicc_sid').val(self.sessionId);
          self.success('Session "'+sessionId+'" cleared');
          this.getLogs();
          this.getData();
        })
        .fail(function(){
          self.warning('An error has occurred.');
        });
    },

    /**
     * [testScript description]
     * @return {[type]} [description]
     */
    testScript: function()
    {
      this.persistSession();

      var self = this;
      $.get($('#aicc_url').val() + '?command=test&session_id='+this.sessionId)
       .done(function(data){
        self.getLogs();
       })
       .fail(function(){
        self.warning('An error has occurred. The AICC test script is not accessible, or an error is causing it to malfunction.');
       });
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
            setTimeout(function(){self.getLogs();},1000);
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

// Ready... set... go.
$(document).ready(function(){

  window.aiccTest = new AiccTestEnvironment().initialize();

  $("[data-click]").click(function(){
    aiccTest[$(this).data("click")]();
  });

});
