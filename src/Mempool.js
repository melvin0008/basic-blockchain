const bitcoinMessage = require('bitcoinjs-message');

const Request = require('./Request.js');
const RequestStarValidity = require('./RequestStarValidity');

const TimeoutRequestsWindowTime = Request.Request.timeoutWindow;
const TimeoutValidityWindow = RequestStarValidity.RequestStarValidity.timeoutWindow;

/* ===== Mempool Class ==========================
|  Class with a constructor for new mempool |
|  ================================================ */

class Mempool {
  constructor() {
    this.requestPool = {};
    this.timeoutRequest = {};

    this.requestValidityPool = {};
    this.timeoutRequestValidity = {};
  }

  isValid(address) {
    return address in this.requestValidityPool;
  }

  invalidateAddress(address) {
    if (address in this.requestValidityPool) {
      delete this.requestValidityPool[address];
    }

    if (address in this.timeoutRequestValidity) {
      delete this.timeoutRequestValidity[address];
    }
  }

  getOrAddRequest(address) {
    let request = this.getRequest(address);
    if (!request) {
      request = new Request.Request(address);
      this.requestPool[address] = request;
      this.timeoutRequest[address] = this.removeAddressOnTimeOut(address);
    }
    return request;
  }

  validateRequest(address, signature) {
    const request = this.getRequest(address);
    if (!request) {
      return null;
    }
    const isValid = bitcoinMessage.verify(request.message, address, signature);
    const requestValidity = new RequestStarValidity.RequestStarValidity(request, isValid);
    if (isValid) {
      const timeStampDiff = Mempool.getCurrentTimeStamp() - requestValidity.status.requestTimeStamp;
      const timeLeft = TimeoutValidityWindow - timeStampDiff;
      requestValidity.status.validationWindow = timeLeft;
      this.requestValidityPool[address] = requestValidity;
      this.timeoutRequestValidity[address] = this.removeAddressValidityOnTimeOut(address);
    }
    return requestValidity;
  }

  getRequest(address) {
    let request = null;
    if (address in this.requestPool) {
      request = this.requestPool[address];
      const timeStampDiff = Mempool.getCurrentTimeStamp() - request.requestTimeStamp;
      const timeLeft = TimeoutRequestsWindowTime - timeStampDiff;
      request.validationWindow = timeLeft;
    }
    return request;
  }

  removeAddressOnTimeOut(address) {
    const self = this;
    setTimeout(() => delete self.pool[address], TimeoutRequestsWindowTime * 1000);
  }

  removeAddressValidityOnTimeOut(address) {
    const self = this;
    setTimeout(() => delete self.requestValidityPool[address], TimeoutValidityWindow * 1000);
  }

  static getCurrentTimeStamp() {
    return new Date().getTime().toString().slice(0, -3);
  }
}

module.exports.Mempool = Mempool;
