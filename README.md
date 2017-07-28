# Simple AICC Test Environment
An environment for the rapid testing of AICC communication without an LMS.

## How the Test Environment Works
- AICC content (AU) is launched from the test environment by specifying the URL to the AU.
- All communication is stored in the supplied _log.txt_ file.
- Any data received from the AU, or set by default, is stored in the supplied _data.txt_ file.

## Setup

### PHP


### ASP (IIS)
- For newer versions of IIS, you must manually enable classic ASP support.
- Place the test environment's folder in a web-accessible folder supporting either classic ASP.
- Create a web application within the IIS manager, if necessary, and enable scripting support.
- Set the security on the "log.txt" and "data.txt" files to allow the system's IUSER/IIS Guest account "Full Control" over this file.
- Access the test environment via the web-accessible folder and click the "Test AICC Script" link under the "Actions:" header to test your environment.  A successful outcome will have been written into the "log.txt" file and the view will be refreshed.

## Configuration (_conf/conf.js_)
Configuration should be pretty straightforward. Edit the values you require, ensuring the correct script (\*.php/\*.asp) has been uncommented for use.

```
var DEFAULT_AU_URL = '';
var AICC_SID_PREFIX = 'SESSION_';
//var DEFAULT_AICC_SCRIPT_FILENAME = 'aicc.asp';
var DEFAULT_AICC_SCRIPT_FILENAME = 'aicc.php';
```

## Usage
- Place the AU in the supplied _content_ folder, or not. You can launch content hosted anywhere.
- Review the AICC params provided in the form to ensure settings are correct, or update the fields to suit your particular needs.
- Click the _Launch Content_ button to launch the content.  When the testing session is done, and the content window is closed, the communication logs area will contain the updated "log.txt" file, which is used to log the communication between the content and the AICC test environment.
- You may refresh the data file view at any time during a test session by clicking the _Show Persisted Data_ button. This will simply reload the text from the "data.txt" for review.
- Once you have completed the test, and have reviewed the results within the logs and the AICC Data area, clear the data file by clicking the _Clear All Data_ button.
