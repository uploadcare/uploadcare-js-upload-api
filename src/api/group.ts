import { Uuid, GroupInfo } from './types'
import { FailedResponse } from '../request/types'

import request from '../request/request.node'
import getUrl from '../tools/getUrl'

import CancelController from '../tools/CancelController'
import defaultSettings from '../defaultSettings'
import { getUserAgent } from '../tools/userAgent'
import camelizeKeys from '../tools/camelizeKeys'
import { UploadClientError } from '../tools/errors'
import retryIfThrottled from '../tools/retryIfThrottled'

export type GroupOptions = {
  publicKey: string

  baseURL?: string
  jsonpCallback?: string
  secureSignature?: string
  secureExpire?: string

  cancel?: CancelController

  source?: string // ??
  integration?: string

  retryThrottledRequestMaxTimes?: number
}

type Response = GroupInfo | FailedResponse

/**
 * Create files group.
 */
export default function group(
  uuids: Uuid[],
  {
    publicKey,
    baseURL = defaultSettings.baseURL,
    jsonpCallback,
    secureSignature,
    secureExpire,
    cancel,
    source,
    integration,
    retryThrottledRequestMaxTimes = defaultSettings.retryThrottledRequestMaxTimes
  }: GroupOptions
): Promise<GroupInfo> {
  return retryIfThrottled(
    () =>
      request({
        method: 'POST',
        headers: {
          'X-UC-User-Agent': getUserAgent({ publicKey, integration })
        },
        url: getUrl(baseURL, '/group/', {
          jsonerrors: 1,
          pub_key: publicKey,
          files: uuids,
          callback: jsonpCallback,
          signature: secureSignature,
          expire: secureExpire,
          source
        }),
        cancel
      }).then(({ data, headers, request }) => {
        const response = camelizeKeys<Response>(JSON.parse(data))

        if ('error' in response) {
          throw new UploadClientError(
            `[${response.error.statusCode}] ${response.error.content}`,
            request,
            response.error,
            headers
          )
        } else {
          return response
        }
      }),
    retryThrottledRequestMaxTimes
  )
}
