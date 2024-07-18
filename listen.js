const app = require("./app");
const { PORT = 9005 } = process.env

app.listen(PORT, () => console.log(`Listening on ${PORT}...`))