# Qualtrics (Survey)
Responsive theme while attempting to look better that the original.

In Qualtrics:

Look & Feel -> Change theme -> 'Qualtrics 2014'.

Page Transition : None

PAGE TRANSITION MUST BE SET TO NONE!!!!!


Look & Feel -> Advanced -> Header EDIT :
  Include the .js, .css files and setup some JS vars (and any fonts):
  
    <script type="text/javascript" src="//[URL to js file]"></script>
    <link href="//fonts.googleapis.com/css?family=Roboto|Signika:700" rel="stylesheet" />
    <link href="//[URL to css file]" rel="stylesheet" />
    <script type="text/javascript">
    var forcedDelay='${e://Field/forcedDelay}';
    var soundIsPlaying='${e://Field/soundOn}';
    var blockedCount='${e://Field/blockedCount}';
    var UIS_debug='${e://Field/UIS_debug}'; //disble waiting
    var audioRoot='[URL to sound directory]'; //include end slash
    </script>


Have only tested with Qualtrics 2014.
