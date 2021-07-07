const express = require("express");
const postsRouter = require("./posts/postsRouter");
const server = express();
server.get("/", (req, res) => {
  res.status(200).json({ hello: "welcome to my app!" });
});
const port = process.env.PORT || 1000;
server.use(express.json());
server.use("/api/posts", postsRouter);
server.listen(port, () => console.log("server is up and running :)"));
