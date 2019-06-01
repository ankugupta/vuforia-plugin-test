import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  @ViewChild("myaudio")
  public myAudio: ElementRef;
  // Vuforia license
  vuforiaLicense = "AfwNugr/////AAABmXSkhi4Wc0y2k2u/t+KF1/iJ4ZMm1p1k8duNetuGt2xMVstBzN2aOC3aNkUMWuCQjUcdoluNVL+wkRqiden+ZsuveS8ccvkbGFZyPLexUsFBZrlrycv4c+O+tH6stLswQ8oh9mpwqFj09Kajfgr8Mabf40Y+QjtGffxa/Un93OMnULUCebsQVJVlY18GsUydNSSc5ijLmKqQpTLFp5xDWnSsVD3Pz9gE5z7Bvyv+2oI35uccwY/gEsKQhHs4oCbgESgTqMyTxvICvQO4vYEljmt3Ac4g4CQjVZcttQiAiRLxTDFcfY0xxORaXc9CltcVq4TWrviKRKAZsqDMLz2eOepHdHI42gpCfIJHDGnfMpTF";
  // Are we launching Vuforia with simple options?
  simpleOptions = null;
  // Which images have we matched?
  matchedImages = [];
  // Application Constructor
  constructor(private platform: Platform) {
  }

  public startAndStop() {
    this.startVuforia(true);

    console.log('Starting timer...');

    // Wait for a timeout, then automatically stop Vuforia
    setTimeout(function () {
      this.stopVuforia();
    }, 5000);
  }

  public recognizeInSeq() {
    var imagesMatched = 0,
      imageSequence = ['iceland', ['canterbury-grass', 'brick-lane'], 'iceland'];

    var successCallback = function (data) {
      console.log('Found ' + data.result.imageName);

      imagesMatched++;

      this.playSound(); // Play a sound so that the user has some feedback

      // Are there more images to match?
      if (imagesMatched < imageSequence.length) {
        var newTargets = [imageSequence[imagesMatched]];

        console.log('Updating targets to: ' + newTargets);

        (<any>navigator).VuforiaPlugin.updateVuforiaTargets(
          newTargets,
          function (data) {
            console.log(data);
            console.log('Updated targets');
          },
          function (data) {
            alert("Error: " + data);
          }
        );
      } else {
        (<any>navigator).VuforiaPlugin.stopVuforia(function () {
          alert("Congratulations!\nYou found all three images!");
        },
          this.errorHandler);
      }
    };

    var options = {
      databaseXmlFile: 'PluginTest.xml',
      targetList: ['iceland'],
      overlayMessage: 'Scan images in the order: \'iceland\', (\'canterbury-grass\' or \'brick-lane\'), then \'iceland\'.',
      vuforiaLicense: this.vuforiaLicense,
      autostopOnImageFound: false
    };

    // Start Vuforia with our options
    (<any>navigator).VuforiaPlugin.startVuforia(
      options,
      successCallback,
      function (data) {
        alert("Error: " + data);
      }
    );
  }

  // Start the Vuforia plugin
  public startVuforia(simpleOptions, successCallback?, overlayMessage?, targets?) {
    var options;

    if (typeof overlayMessage == 'undefined')
      overlayMessage = 'Point your camera at a test image...';

    if (typeof targets == 'undefined')
      targets = ['iceland', 'canterbury-grass'];

    // Reset the matched images
    this.matchedImages = [];

    // Set the global simpleOptions flag
    this.simpleOptions = simpleOptions;

    // Log out wether or not we are using simpleOptions
    console.log('Simple options: ' + !!this.simpleOptions);

    // Load either simple, or full options
    if (!!this.simpleOptions) {
      options = {
        databaseXmlFile: 'PluginTest.xml',
        targetList: targets,
        overlayMessage: overlayMessage,
        vuforiaLicense: this.vuforiaLicense
      };
    } else {
      options = {
        databaseXmlFile: 'PluginTest.xml',
        targetList: targets,
        vuforiaLicense: this.vuforiaLicense,
        overlayMessage: overlayMessage,
        showDevicesIcon: true,
        showAndroidCloseButton: true,
        autostopOnImageFound: false
      };
    }

    // Start Vuforia with our options
    (<any>navigator).VuforiaPlugin.startVuforia(
      options,
      successCallback || this.vuforiaMatch,
      function (data) {
        alert("Error: " + data);
      }
    );
  }

  vuforiaMatch = (data) => {
    // To see exactly what `data` can contain, see 'Success callback `data` API' within the plugin's documentation.
    console.log(data);

    // Have we found an image?
    if (data.status.imageFound) {
      // If we are using simple options, alert the image name
      if (this.simpleOptions) {
        alert("Image name: " + data.result.imageName);
      } else { // If we are using full options, add the image to an array of images matched
        this.matchedImages.push(data.result.imageName);
        this.playSound(); // Play a sound so that the user has some feedback
      }
    }
    // Are we manually closing?
    else if (data.status.manuallyClosed) {
      // Let the user know they've manually closed Vuforia
      alert("User manually closed Vuforia!");

      // If we've matched any images, tell the user what we found
      if (this.matchedImages.length) {
        alert("Found:\n" + this.matchedImages);
      }
    }
  }
  // Stop the Vuforia plugin
  public stopVuforia() {
    (<any>navigator).VuforiaPlugin.stopVuforia(function (data) {
      console.log(data);

      if (data.success == 'true') {
        alert('TOO SLOW! You took too long to find an image.');
      } else {
        alert('Couldn\'t stop Vuforia\n' + data.message);
      }
    }, function (data) {
      console.log("Error stopping Vuforia:\n" + data);
    });
  }
  // Play a bell sound
  public playSound() {
    // Where are we playing the sound from?
    var soundURL = this.getMediaURL("sounds/sound.wav");

    this.myAudio.nativeElement.src = soundURL;
    this.myAudio.nativeElement.play();
    (<any>navigator).VuforiaPlugin.startVuforiaTrackers(
      function () {
        console.log('Started tracking again')
      },
      function () {
        console.log('Could not start tracking again')
      }
    );
  }
  // Get the correct media URL for both Android and iOS
  public getMediaURL(s) {
    if (this.platform.is("android")) return "/android_asset/www/" + s;
    return s;
  }
 
}
