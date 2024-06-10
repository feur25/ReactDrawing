import express from 'express';

const app = express();
const port = 9000;


app.use("/", (req, res) => {
  res.json({message:"Server is running"})
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
} );
