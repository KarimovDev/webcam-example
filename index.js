const { Webcam, tracking } = window;

const snapPromises = [];
let catchCounter;
const plotContainer = document.getElementById('plot-container');
let trackerTask;

const userMediaSupported = () => {
    const result = navigator.getUserMedia || false;
    console.log(`User media support ${result}`);
    return result;
}

const pasteSnapshot = dataUri => {
    document.getElementById('my_result').innerHTML = document.getElementById('my_result').innerHTML + '<img src="'+dataUri+'"/>';
}

const pasteAll = () => {

    Promise.all(snapPromises).then((dataUriArr) => {

        dataUriArr.forEach(dataUri => {
            pasteSnapshot(dataUri);
        });

        stopWebcam();
    });
}

const plotRectangle = rect => {

    plotContainer.innerHTML = '';

    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.border = '2px solid ' + (rect.color || 'magenta');
    div.style.width = rect.width + 'px';
    div.style.height = rect.height + 'px';
    div.style.left = rect.x + 'px';
    div.style.top = rect.y + 'px';

    plotContainer.appendChild(div);
}

const takeSnapshot = () => {

    return new Promise((resolve) => {
        Webcam.snap(dataUri => {

            console.log('webcam: make snapshot');

            resolve(dataUri);

        });
    });

}

const trackFace = () => {

    console.log('webcam: start tracking');

    const objects = new tracking.ObjectTracker(['face']);

    catchCounter = 0;
    objects.setInitialScale(6);
    objects.setStepSize(3.5);
    objects.setEdgesDensity(0.1);

    objects.on('track', event => {

        event.data.forEach(rect => {

            console.log('webcam: found face !');

            plotRectangle(rect);

            catchCounter++;
            snapPromises.push(takeSnapshot());

            if (catchCounter === 6) {
                pasteAll();
            }
        });

    });

    trackerTask = tracking.track('video', objects);
}

const initWebCam = () => {

    console.log('webcam: connecting');

    Webcam.set({
        width: 640,
        height: 480,
        // dest_width: 640,
        // dest_height: 480,
        // crop_width: 640,
        // crop_height: 480,
        image_format: 'jpeg',
        jpeg_quality: 100
    });

    Webcam.attach('#my_camera');

    Webcam.on('live', () => {

        if (userMediaSupported) {

            setTimeout(() => {
                console.log('start traking');
                trackFace();
            }, 2000);

        }

    });

    Webcam.on('error', (err) => {
        console.error(err);
    });
}

const stopWebcam = () => {
    console.log('webcam: disconnecting');

    if (trackerTask) {

        console.log('webcam: stop tracking');

        trackerTask.stop();
    }

    Webcam.off('live');
    Webcam.reset();

    console.log('webcam: shut down');
}
    
initWebCam();