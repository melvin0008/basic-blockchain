const TIMEOUTWINDOW = 5 * 60;

class Request {
  constructor(walletAddress) {
    this.walletAddress = walletAddress;
    this.requestTimeStamp = new Date().getTime().toString().slice(0, -3);
    this.message = `${walletAddress}:${this.requestTimeStamp}:starRegistry`;
    this.validationWindow = Request.timeoutWindow;
  }

  static get timeoutWindow() {
    return TIMEOUTWINDOW;
  }
}

module.exports.Request = Request;
