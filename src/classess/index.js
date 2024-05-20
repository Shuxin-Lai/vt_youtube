import { isString } from 'lodash-es'
import makeError from 'make-error'

function _ApiError(code, message, debugMessage) {
  if (isString(code)) {
    message = code
    // common error
    code = 1000
  }

  _ApiError.super.call(this, message)

  this.code = code
  this.debugMessage = debugMessage
}

export const ApiError = makeError(_ApiError)
