//Catch async errors in the wrapped controllers and pass it to the error middleware
function runAsyncWrapper(callback) {
  return function (req, res, next) {
    callback(req, res, next).catch(next);
  };
}

export default runAsyncWrapper;
