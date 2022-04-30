const express = require("express");
const app = express();
const { ExpressPeerServer } = require("peer");
const { Server } = require("socket.io");
const { v4 } = require("uuid");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const httpServer = require("http").createServer(app);

const peerServer = ExpressPeerServer(httpServer, {
    debug: true,
    port: 3001,
    proxied: true,
    path: "/myapp",
});

const io = new Server(httpServer);

app.set("view engine", "ejs");
app.use(cors());
app.use(express.static("public"));
app.use("/peerjs", peerServer);

io.use((socket, next) => {
    socket.id = v4();
    next();
});

app.get("/", (req, res) => {
    res.redirect(`/${v4()}`);
});

app.get("/:roomId", async (req, res) => {
    res.render("index.ejs", {
        roomId: req.params.roomId,
    });
});

httpServer.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
    console.log(`       ----------- connected: ${socket.id} -----------`);
    let allSockets;
    socket.on("join-room", async (ROOM_ID) => {
        let roomExists = io.sockets.adapter.rooms.get(ROOM_ID);
        socket.join(ROOM_ID);
        socket.in(ROOM_ID).emit("user-joined", socket.id);
        allSockets = Array.from((await io.in(ROOM_ID).allSockets()).keys());
        socket.to(allSockets[0]).emit("member-joined", socket.id);
        if (!roomExists) {
            console.log(`room: ${ROOM_ID}   -----   admin: ${socket.id}`);
            socket.to(socket.id).emit("room-admin");
        }
    });

    socket.on("disconnect", () => {
        console.log(
            `       ----------- disconnected: ${socket.id} -----------`
        );
    });
});
