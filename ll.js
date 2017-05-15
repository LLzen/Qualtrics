/*
Requirements -

Look & Feel : Qualtrics 2014
Page Transition : None

PAGE TRANSITION MUST BE SET TO NONE!!!!!

include the partner css file.

We need a couple of persistent variables so, 

Survey flow needs:
forcedDelay = [seconds] // user must wait this amount of seconds
soundOn = [bool] // holds sound playing state
blockedCount = [int] // holds total user click quantity
UIS_debug = ${e://Field/debug} // so that we know if the url has debug (having it in survey flow means we can quickly disable within the qualtrics IDE - just set to false)

Note that the audio root directory is set in Qualtrics IDE 'Header'!

In header:
<script type="text/javascript">
var forcedDelay='${e://Field/forcedDelay}';
var soundIsPlaying='${e://Field/soundOn}';
var blockedCount='${e://Field/blockedCount}';
var UIS_debug='${e://Field/UIS_debug}';
var audioRoot='<URL to directory for sounds files>';
</script>

*/


var minimumWaitTime=-1, minimumWaitTimeDefault = 1000; //should be overridden by JS var forcedDelay (- set in Qualtrics IDE Survey Flow)
var fadeNextButtonOpacity = 0.5;
var tooFastMessage = "Husk &aring; lese teksten grundig.";

function UIS() {
    'use strict';
    var me = {};
    var currentDisplayObj;
    var toofastwarningObj;
    var timerObj;
    var ignoreForcedDelay = false;

    //clears the timeout - stops the wait
    me.enableNext = function () {
        uis.enableNextButton();
    }

    me.setTooFastMessage = function (str) {
        tooFastMessage = str;
    }

    me.nextButtonClicked = function () {
        //alert("nextButtonClicked");

        var trg = jQuery('#NextButton');
        if (trg.css('opacity') == fadeNextButtonOpacity) {
            blockedCount++;
            Qualtrics.SurveyEngine.setEmbeddedData('blockedCount', blockedCount);
            if (!me.toofastwarningObj) {
                jQuery("#toofastwarning").html(tooFastMessage);
                me.toofastwarningObj = 1;
            }
        } else {
            //question has been answered normally
        }
    }

    me.getNextButton = function () {
        return jQuery('#NextButton');
    }

    me.setQualtricsData = function (varName, value) {
        alert(varName + " = " + value);
    }

    me.qLoaded = function (obj, soundFile, overideWaitTimeSeconds) {
        var tmp;

        if (UIS_debug == "true") { ignoreForcedDelay = true; };

        currentDisplayObj = obj;

        if (typeof forcedDelay != 'undefined') {
            if (forcedDelay < 7 && forcedDelay >= 0) {
                forcedDelay = forcedDelay * 1000;
                minimumWaitTime = forcedDelay;
            }
        }

        if (overideWaitTimeSeconds) { minimumWaitTime = overideWaitTimeSeconds * 1000;}

        if (minimumWaitTime < 0) { minimumWaitTime = minimumWaitTimeDefault;}

        jQuery("#Buttons").prepend("<div id='toofastwarning'>&nbsp;</div>")
        me.toofastwarningObj = undefined;
      
        tmp = jQuery('#Buttons');
        tmp.css('z-index',21)
        //alert("buttons z: " + tmp.css('z-index'));
        tmp.click(function (trg) {
            //alert("click");
            uis.nextButtonClicked();
            event.stopPropagation();
            return true;
        });
        
        
        //if we already have an answer - show next button
        if (obj.getSelectedChoices().length < 1) {

            if (!ignoreForcedDelay) {
                //disable next button
                uis.disableNextButton();
            }
            clearTimeout(me.timerObj);
            me.timerObj = setTimeout(function () {
                jQuery("#toofastwarning").html("&nbsp;");
                uis.enableNextButton();
            }, minimumWaitTime);
        } 

        if (soundFile) {

            //if a iOS device then auto play is not possible - so we switch the UI back to not playing
            var iAmAMac = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;;
            if (iAmAMac) {
                soundIsPlaying = 'false';
                this.displaySoundStatus(false);
            }

            currentSound = soundFile;
            if (soundIsPlaying=='true') {
                this.playSound();
            }
        } else {
            //if there is no sound then we hide the sound control
            jQuery('#audioControls').html('');
        }
    }

    me.disableNextButton = function () {
        var trg = uis.getNextButton();
        var origNextButtonWidth = trg.css('width');
        trg.attr('type', '');
        trg.css('width', origNextButtonWidth);

        trg.css('opacity', fadeNextButtonOpacity);
        trg.prop("disabled", true);
    }

    me.enableNextButton = function () {
        clearTimeout(me.timerObj);
        currentDisplayObj.enableNextButton();

        var trg = uis.getNextButton();
        trg.css('opacity', 1);
        trg.attr('type', 'submit');
    }


    me.addTextAreaCaption = function (txt) {
        jQuery('textarea.InputText').attr('placeholder', txt);
    }

    me.getAudioObject = function () {
        return jQuery("#audioObj");
    }

    me.playSound = function (forceSoundFile) {

        if (forceSoundFile) {
            currentSound = forceSoundFile;
        }
        var src = audioRoot + currentSound;
        var audio = this.getAudioObject();
        audio.attr("src", src);

        audio[0].pause();
        audio[0].load();
        audio[0].play();
        soundIsPlaying = 'true';
        this.displaySoundStatus(true);
    }

    me.soundIconClick = function () {
        //alert("soundIconClick");
        if (soundIsPlaying=='true') {
            this.stopSound();
        } else {
            this.playSound();
        }
    }

    me.changeNextButtonTo = function (txt) {
        //alert("changeNextButtonTo:" + txt);
        jQuery("#NextButton").attr("value", txt + " >>");
        jQuery("#Buttons").css("margin-top", "0px");
        uis.enableNextButton();
    }

    me.stopSound = function () {
        //alert("stopSound");
        var audio = this.getAudioObject();
        audio[0].pause();
        soundIsPlaying = 'false';
        this.displaySoundStatus(false);
    }

    me.displaySoundStatus = function (trueIfPlaying) {
        Qualtrics.SurveyEngine.setEmbeddedData('soundOn', trueIfPlaying);
        if (trueIfPlaying) {
            jQuery('#audioControls').html('<div class="audioOuter"><img style="width:70px;vertical-align:middle;padding-top:10px;" src="https://www6.uis.no/Fag/Qualtrics/usay/SpeakerIcon.svg"><span>&nbsp;ON</span></div>');
        } else {
            jQuery('#audioControls').html(uis.getAudioOffHtml());
        }
    }

    me.getAudioOffHtml = function () {
        return '<div class="audioOuter"><img style="width:70px;vertical-align:middle;padding-top:10px;" src="https://www6.uis.no/Fag/Qualtrics/usay/SpeakerIcon.svg"><span>&nbsp;OFF</span></div>'
    }

    me.showNormalCheckbox = function () {
        alert("showNormalCheckbox");
        //jQuery('li').addClass('normalCheckbox');
    }

    me.redirectUser = function (url) {
        url = url.replace(new RegExp(" ", 'g'), "%20"); //beacuse an sso can contain spaces
        window.location.replace(url);
    }

    //init
    var currentSound;
    //me.stopSound();

    return me;

}

if (!uis) {
    var uis = UIS();
}

Qualtrics.SurveyEngine.addOnload(function () {
    'use strict';

    //show the next button when the user clicks an answer
    this.questionclick = function (event, element) {

    }
});





//utils
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//misc - 1 time only operations
jQuery(document).ready(function () {

    //remove advertising
    jQuery("#Plug").html("");

    //DOM alterations
    var headerImage = "<img style='width:250px' src='[URL to logo]'>"; //orig was a 746x369 png
    jQuery("#ProgressBar").prepend("<div id='topBar'>" + headerImage + "<div id='audioControls'>"+ uis.getAudioOffHtml() + "</div><audio id='audioObj'><source src='' type='audio/mpeg' /> Your browser does not support this audio format.</audio></div>");

    //audioControl click
    var trg = jQuery('#audioControls');
    trg.click(function () {
        uis.soundIconClick();
        return false;
    });


});
