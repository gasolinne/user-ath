const mw_convertPayload2Lowercase = (req, _, next) => {
    if (req.method === "GET") return next();
    //convert to lowercase when not get \
    let data = JSON.stringify(req.body).toLowerCase();
    req.body = JSON.parse(data);
    next();
  };
  
  module.exports = mw_convertPayload2Lowercase;