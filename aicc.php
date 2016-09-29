<?php
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
$now = date("Y-m-d h:ia (l)");
$logfile = "logs/log.txt";
$datafile = "data/data.txt";

$logstring = "";
$logstring .= "--------------------------------------------\r\n";
$logstring .= "Date/Time: ".$now."\r\n";
$logstring .= "--------------------------------------------\r\n";

if(isset($_POST["command"]))
{
    $logstring .= "command: ".$_POST["command"]."\r\n";
}

if(isset($_POST["session_id"]))
{
	$logstring .= "session_id: ".$_POST["session_id"]."\r\n";
}
if(isset($_POST["aicc_data"]))
{
	$logstring .= "aicc_data:\r\n".$_POST["aicc_data"]."\r\n";
}

if(isset($_POST["command"]))
{
	if($_POST["command"] == "getparam")
	{
		$s = "";
		if(is_readable($datafile))
		{
			if(filesize($datafile) > 0)
			{
				$fh = fopen($datafile, 'r');
				$s = fread($fh, filesize($datafile));
				fclose($fh);
			}
		}
		
		if($s == "")
		{
			$s  = "error=0\r\n";
			$s .= "error_text=Successful\r\n";
			$s .= "version=2.0\r\n";
			$s .= "aicc_data=[core]\r\n";
			$s .= "student_id=demo\r\n";
			$s .= "student_name=demo\r\n";
			$s .= "output_file=\r\n";
			$s .= "lesson_location=\r\n";
			$s .= "credit=no-credit\r\n";
			$s .= "lesson_mode=\r\n";
			$s .= "lesson_status=N\r\n";
			$s .= "time=00:00:00\r\n";
			$s .= "score=\r\n";
			$s .= "[Core_Lesson]\r\n";
			$s .= "null\r\n";
			//$s .= "";
		}

		$logstring .= "Data Returned:\r\n--------------------------------------------\r\n".$s;

		$logstring .= "--------------------------------------------\r\n";
		$logstring .= "\r\n";

		echo $s;
	}
	elseif(($_POST["command"] == "putparam") || ($_POST["command"] == "exitau"))
	{
		if($_POST["command"] == "putparam")
		{
			if(is_writable($datafile))
			{
				$s  = "error=0\r\n";
				$s .= "error_text=Successful\r\n";
				$s .= "version=2.0\r\n";
				$s .= $_POST["aicc_data"];
				$fh = fopen($datafile, 'w');
				fwrite($fh, $s);
				fclose($fh);
			}
			else
			{
				echo "The file $datafile is not writable";
			}
		}
		echo "error=0\r\nversion=2.0\r\naicc_data=\r\n";
	}
	else
	{
		echo "error=1\r\nerror_text=Unknown command\r\nversion=2.0\r\naicc_data=\r\n";
	}

	$fh = fopen($logfile, 'a');
	fwrite($fh, $logstring);
	fclose($fh);
}
else
{
	if(isset($_GET["command"]))
	{
		if(($_GET["command"] == "getlog"))
		{
			$fh = fopen($logfile, 'r');
			if(filesize($logfile) > 0)
			{
				$s = fread($fh, filesize($logfile));
			}
			else
			{
				$s = 'Log file is empty!';
			}
			fclose($fh);
			echo $s;
		}
		if(($_GET["command"] == "getdata"))
		{
			$fh = fopen($datafile, 'r');
			if(filesize($datafile) > 0)
			{
				$s = fread($fh, filesize($datafile));
			}
			else
			{
				$s = 'Data file is empty!';
			}
			fclose($fh);
			echo $s;
		}
		elseif(($_GET["command"] == "clearlog"))
		{
			$fh = fopen($logfile, 'w');
			fwrite($fh, '');
			fclose($fh);
			echo "SUCCESS";
		}
		elseif(($_GET["command"] == "cleardata"))
		{
			$fh = fopen($datafile, 'w');
			fwrite($fh, '');
			fclose($fh);
			echo "SUCCESS";
		}
		elseif(($_GET["command"] == "test"))
		{
			$s = "";
			$fh = fopen($logfile, 'a');
			$s .= "--------------------------------------------\r\n";
			$s .= "AICC Script Test: ".date(DATE_RFC822)." \r\n";
			$s .= "--------------------------------------------\r\n";
			fwrite($fh, $s);
			fclose($fh);
			echo "SUCCESS";
		}
	}
	else
	{
		echo "error=1\r\nerror_text=Unknown command\r\nversion=2.0\r\naicc_data=\r\n";
	}
}

?>