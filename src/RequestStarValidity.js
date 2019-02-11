const TIMEOUTWINDOW = 30 * 60;

class RequestStarValidity {
  constructor(request, isValid) {
    this.registerStar = true;
    this.status = {
      address: request.walletAddress,
      requestTimeStamp: request.requestTimeStamp,
      message: request.message,
      validationWindow: request.validationWindow,
      messageSignature: isValid,
    };
  }

  static get timeoutWindow() {
    return TIMEOUTWINDOW;
  }
}

module.exports.RequestStarValidity = RequestStarValidity;
