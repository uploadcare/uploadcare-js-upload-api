import * as factory from '../_fixtureFactory'
import multipartUpload from '../../src/api/multipartUpload'
import { getSettingsForTesting } from '../_helpers'
import multipartStart from '../../src/api/multipartStart'
import { UploadClientError } from '../../src/tools/errors'
import CancelController from '../../src/tools/CancelController'

let parts: [string, Blob | Buffer][] = []

jest.setTimeout(60000)

beforeAll(async () => {
  const file = factory.file(11)
  const settings = getSettingsForTesting({
    publicKey: factory.publicKey('multipart'),
    contentType: 'application/octet-stream'
  })

  const { parts: urls } = await multipartStart(file.size, settings)

  parts = urls.map((url, index) => {
    const start = settings.multipartChunkSize * index
    const end = Math.min(start + settings.multipartChunkSize, file.size)
    return [url, file.data.slice(start, end)]
  })
})

describe('API - multipartUpload', () => {
  const settings = getSettingsForTesting({
    publicKey: factory.publicKey('multipart')
  })

  it('should be able to upload multipart file', async () => {
    const [url, part] = parts[0]

    await expect(multipartUpload(part, url, settings)).resolves.toBeTruthy()
  })

  it('should be able to cancel uploading', async () => {
    const [url, part] = parts[1]

    const cntr = new CancelController()
    const options = getSettingsForTesting({
      publicKey: factory.publicKey('multipart'),
      cancel: cntr
    })

    setTimeout(() => {
      cntr.cancel()
    })

    await expect(multipartUpload(part, url, options)).rejects.toThrowError(
      new UploadClientError('Request canceled')
    )
  })

  it('should be able to handle progress', async () => {
    const onProgress = jest.fn()
    const options = getSettingsForTesting({
      publicKey: factory.publicKey('multipart'),
      onProgress
    })

    const [url, part] = parts[2]
    await multipartUpload(part, url, options)

    expect(onProgress).toHaveBeenCalled()
    expect(onProgress).toHaveBeenCalledWith({ value: 1 })
  })
})
