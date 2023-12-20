require("dotenv").config();
const path = require("path");
const express = require("express");
require("express-async-errors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const logger = require("./config/logger");
const app = express();
const compression = require("compression");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors"); 


//* initial start
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(__dirname + '/uploads'));



//* mongoose connection



mongoose.set('strictQuery', true);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
// mongoose
//   .connect(process.env.DATABASE_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("connected to database"))
//   .catch((error) => logger.error(error));

//* copmresed requests
app.use(helmet());
//* copmresed requests
app.use(morgan('combined'));
//* copmresed requests
app.use(compression());
app.use(
  cors()
);

//* import user routes
// const user = require("./routes/users");
// app.use("/api/user", user);


//* import user routes
const countries = require("./routes/countries");
app.use("/api/countries", countries);




//* if write invalide url or end point send to user an error message
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "false",
    message: "Page not found !",
  });
});

//* listen on port 8080 local host

connectDB().then(() => {
  app.listen(process.env.PORT || 8080, () => {
      console.log("listening for requests");
  })
})

// app.listen(process.env.PORT || 8080, function () {
//   console.log("Expreass server listening on port 8080");
// });
