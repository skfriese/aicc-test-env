<?php
/**
 * FileUtils
 *
 * 
 */
class FileUtils
{
  private $log_file;
  private $data_file;

  function __construct($session_id)
  {
    // Strip non alpha-numeric characters
    $session_id = preg_replace("/[^A-Za-z0-9 ]/", '', $session_id);

    // Setup files for this session
    $this->log_file = "logs/{$session_id}.txt";
    $this->data_file = "data/{$session_id}.txt";

    if(!is_file($this->log_file))
    {
      file_put_contents($this->log_file, "");
    }

    if(!is_file($this->data_file))
    {
      file_put_contents($this->data_file, "");
    }
  }

  /**
   * [get_data description]
   * @param  string $default [description]
   * @return [type]          [description]
   */
  public function get_data($default="")
  {
    if(!is_file($this->data_file) || !is_readable($this->data_file))
    {
      return "Data file does not exist or is not writable.";
    }

    $s = "";
    if(filesize($this->data_file) > 0)
    {
      $fh = fopen($this->data_file, 'r');
      $s = fread($fh, filesize($this->data_file));
      fclose($fh);
    }

    if($s == "" && $default != "")
    { 
      $s = $default;
    }

    return $s;
  }

  /**
   * [set_data description]
   * @param [type] $s [description]
   */
  public function set_data($s)
  {
    if(is_file($this->data_file) && is_writable($this->data_file))
    {
      file_put_contents($this->data_file, urldecode($s));
      return "SUCCESS";
    }
    return "ERROR";
  }

  /**
   * [log description]
   * @param  [type] $s [description]
   * @return [type]    [description]
   */
  public function log($s)
  {
    if(is_file($this->log_file) && is_writable($this->log_file))
    {
      $fh = fopen($this->log_file, 'a');
      fwrite($fh, urldecode($s));
      fclose($fh);
      return "SUCCESS";
    }
    return "ERROR";
  }

  /**
   * [get_log description]
   * @param  string $default [description]
   * @return [type]          [description]
   */
  public function get_log($default="")
  {
    if(!is_file($this->log_file) || !is_readable($this->log_file))
    {
      return "Log file does not exist or is not writable.";
    }

    $s = "";
    if(filesize($this->log_file))
    {
      $fh = fopen($this->log_file, 'r');
      $s = fread($fh, filesize($this->log_file));
      fclose($fh);
    }    

    if($s == "" && $default != "")
    {
      $s = $default;
    }    

    return $s;
  }

  /**
   * [clear_log description]
   * @return [type] [description]
   */
  public function clear_log()
  {
    if(is_file($this->log_file) && is_writable($this->log_file))
    {
      file_put_contents($this->log_file, "");
      return "SUCCESS";
    }
    return "ERROR";
  }

}

/**
 * AICC
 *
 * 
 */
class AICC
{
  // Privates
  private $now;
  private $eol;
  private $line_sep;

  function __construct()
  {
    // Cache-Buster
    header("Cache-Control: no-cache, must-revalidate");
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");

    // All responses must be plain text
    header("Content-Type: text/plain");

    $this->now = date("Y-m-d h:ia");
    $this->eol = PHP_EOL;
    $this->line_sep = "--------------------------------------------{$this->eol}";

    if(isset($_REQUEST["session_id"]))
    {
      $this->session_id = $_REQUEST["session_id"];
    }
    else
    {
      echo "Invalid Request";
      exit();
    }

    $this->file_utils = new FileUtils($this->session_id);

    $this->handle_request();
  }

  /**
   * [get_logging_header description]
   * @return [type] [description]
   */
  private function get_logging_header()
  {
    $s = "";
    $s .= $this->line_sep;
    $s .= "Date/Time: {$this->now}{$this->eol}";
    $s .= $this->line_sep;

    if(isset($_POST["command"]))
    {
      $s .= "command: ".$_POST["command"]."{$this->eol}";
    }

    if(isset($_POST["session_id"]))
    {
      $s .= "session_id: ".$_POST["session_id"]."{$this->eol}";
    }

    if(isset($_POST["aicc_data"]))
    {
      $s .= "aicc_data:{$this->eol}".$_POST["aicc_data"]."{$this->eol}";
    }

    return $s;
  }

  /**
   * [get_default_data description]
   * @return [type] [description]
   */
  private function get_default_data()
  {
    $s  = "error=0{$this->eol}";
    $s .= "error_text=Successful{$this->eol}";
    $s .= "version=2.0{$this->eol}";
    $s .= "aicc_data=[core]{$this->eol}";
    $s .= "student_id=john.smith{$this->eol}";
    $s .= "student_name=Smith, John{$this->eol}";
    $s .= "lesson_location={$this->eol}";
    $s .= "credit=CREDIT{$this->eol}";
    $s .= "lesson_mode={$this->eol}";
    $s .= "lesson_status=N{$this->eol}";
    $s .= "time=00:00:00{$this->eol}";
    $s .= "score={$this->eol}";
    $s .= "[Core_Lesson]{$this->eol}";
    $s .= "[Core_Vendor]{$this->eol}";

    return $s;
  }

  /**
   * [get_default_response description]
   * @return [type] [description]
   */
  private function get_default_response()
  {
    $s  = "error=0{$this->eol}";
    $s .= "error_text=Successful{$this->eol}";
    $s .= "version=2.0{$this->eol}";
    return $s;
  }

  /**
   * [get_error_response description]
   * @param  [type] $msg [description]
   * @return [type]      [description]
   */
  private function get_error_response($msg)
  {
    $s  = "error=1{$this->eol}";
    $s .= "error_text={$msg}{$this->eol}";
    $s .= "version=2.0{$this->eol}";
    return $s;
  }

  /**
   * [error description]
   * @param  [type] $msg [description]
   * @return [type]      [description]
   */
  private function error($msg)
  {
    $logstring = "ERROR: {$msg}";
    $this->file_utils->log($logstring);
    
    echo $this->get_error_response($msg);
  }

  /**
   * [handle_request description]
   * @return [type] [description]
   */
  private function handle_request()
  {
    if(isset($_POST["command"]))
    {
      $command = strtolower($_POST["command"]);
      $this->handle_post($command);
    }
    else if(isset($_GET["command"]))
    {
      $command = strtolower($_GET["command"]);
      $this->handle_get($command);
    }
    else
    {
      $this->error("Unsupported Action");
      exit();
    }
  }

  /**
   * [handle_post description]
   * @param  [type] $command [description]
   * @return [type]          [description]
   */
  private function handle_post($command)
  {
    /*
     HACP Message Sequence Rules
      - Rule #1 - The first HACP message issued must be a GetParam.
      - Rule #2 - The last HACP message issued must be an ExitAU.
      - Rule #3 - At least one PutParam message must be issued prior to an Exit AU message.
      - Rule #4 - No HACP messages can be issued after a successfully issued ExitAU message
     */
    switch ($command) 
    {
      // The "GetParam" message is always the first message issued by the AU.
      case "getparam":
        $data = $this->file_utils->get_data($this->get_default_data());
        $s = $this->get_logging_header();
        $s .= "aicc_data:{$this->eol}";
        $s .= "{$data}";
        $s .= $this->line_sep;
        $s .= $this->eol;
        $this->file_utils->log($s);
        echo $data;
        exit();
      
      // Subseqent messages are handled here.
      case "putparam":
      case "putcomments":
      case "putobjectives":
      case "putpath":
      case "putinteractions":
      case "putperformance":
      case "exitau":
        $s = $this->get_logging_header();

        if(isset($_POST["aicc_data"]))
        {
          $this->file_utils->set_data($_POST["aicc_data"]);
        }
        
        $this->file_utils->log($s);

        echo $this->get_default_response();
        exit();

      default:
        $this->error("Unknown Command");
        exit();
    }
  }

  /**
   * [handle_get description]
   * @param  [type] $command [description]
   * @return [type]          [description]
   */
  private function handle_get($command)
  {
    switch ($command) {
      case "init":
        echo $this->file_utils->init($this->session_id);
        break;

      case "getlog":
        echo $this->file_utils->get_log("Logs are empty!");
        break;

      case "getdata":
        echo $this->file_utils->get_data("Data file is empty!");
        break;

      case "clearlog":
        echo $this->file_utils->clear_log();
        break;

      case "cleardata":
        echo $this->file_utils->set_data("");
        break;

      case "test":
        $s = $this->line_sep;
        $s .= "AICC Logging Test: ".date(DATE_RFC822).$this->eol;
        $s .= $this->line_sep;
        echo $this->file_utils->log($s);
        break;
      
      default:
        $this->error("Unknown Command");
        exit();
    }
  }
}

$aicc = new AICC();

?>