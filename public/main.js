const socket = io();

socket.on("connect", () => {
    const peer = new Peer(socket.id, {
        host: location.hostname,
        debug: 1,
        path: "/peerjs/myapp",
        port: 3000,
    });

    peer.on("open", () => {
        console.log(`       ---------- Peer Id: ${peer.id} ----------`);
    });
    socket.emit("join-room", ROOM_ID);

    socket.on("room-admin", () => {
        alert("Im room admin");
    });

    socket.on("member-joined", async (member_id) => {
        console.log("new room member joined: ", member_id);
        let stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        peer.call(member_id, stream);
    });

    peer.on("call", async function (call) {
        let confirmAccept = true;
        if (confirmAccept) {
            let stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            call.answer(stream);
            let adminVideo = document.createElement("video");
            let acceptedOnce = false;
            call.on("stream", (adminStream) => {
                addVideoStream(adminVideo, adminStream, acceptedOnce);
                acceptedOnce = true;
            });
        } else {
            alert("Call rejected! Refresh for the prompt again!");
        }
    });
});

/**
 * Adds video to video grid
 * @param {HTMLVideoElement} video
 * @param {MediaStream} stream
 */
function addVideoStream(video, stream, acceptedOnce) {
    // Adding video element
    video.srcObject = stream;
    console.log(acceptedOnce);
    video.addEventListener("loadedmetadata", () => {
        video.play();

        // Saving the stream
        let recorderChunks = [];
        let mediaRecorder = null;
        let blob = null;

        if (!acceptedOnce) {
            // Adding buttons
            let button_container = document.createElement("div");
            button_container.classList.add("button-container");

            let start = document.createElement("button");
            start.textContent = "Start Recording";
            button_container.append(start);
            start.addEventListener("click", (e) => {
                e.stopPropagation();
                start.disabled = true;
                stop.disabled = false;
                if (!mediaRecorder) {
                    mediaRecorder = new MediaRecorder(stream, {
                        mimeType: "video/webm; codecs=vp9",
                    });
                    mediaRecorder.start();
                    mediaRecorder.addEventListener("dataavailable", (e) => {
                        if (e.data.size > 0) recorderChunks.push(e.data);
                    });
                }
            });
            let stop = document.createElement("button");
            stop.textContent = "Stop Recording";
            button_container.append(stop);
            stop.disabled = true;

            stop.addEventListener("click", (e) => {
                e.stopPropagation();
                mediaRecorder.stop();
                save.disabled = false;
            });

            let discard = document.createElement("button");
            discard.textContent = "Discard Recording";
            button_container.append(discard);

            discard.addEventListener("click", (e) => {
                e.stopPropagation();
                blob = null;
                recorderChunks = [];
                start.disabled = false;
                stop.disabled = true;
            });

            let save = document.createElement("button");
            save.textContent = "Save Recording";
            button_container.append(save);
            save.disabled = true;

            save.addEventListener("click", (e) => {
                e.stopPropagation();
                start.disabled = false;
                blob = new Blob(recorderChunks, { type: "video/webm" });
                let url = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = url;
                a.download = `${Date.now()}.webm`;
                a.click();
            });

            document.body.append(button_container);
        }
    });
    document.body.append(video);
}
