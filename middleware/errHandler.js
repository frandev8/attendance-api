const errHandler = (err, req, res) => {
  console.log(`Error :${req.method}\t${err.message}`);
};

module.exports = errHandler;
