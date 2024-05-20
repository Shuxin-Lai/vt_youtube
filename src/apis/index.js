import axios from 'axios'
import { get } from 'lodash-es'
import { ApiError } from '../classess'
import { getIdFromUrl } from '../utils/youtube'

const instance = axios.create({
  baseURL:
    'https://1498364537772566.us-west-1.fc.aliyuncs.com/2016-08-15/proxy/app_services.LATEST/v_services/api',
})

instance.interceptors.response.use(response => {
  const res = response.data
  const { code, data } = res
  if (code == 0) return data
  const message = get(
    res,
    'error.message',
    get(res, 'message', 'Unknown error')
  )

  return Promise.reject(new ApiError(code, message))
})

function normalize(xmlString) {
  const parser = new DOMParser()
  const document = parser.parseFromString(xmlString, 'text/xml')

  // Check if the XML has an <error> tag
  const errorTag = document.getElementsByTagName('error')
  if (errorTag.length > 0) {
    const errorText = errorTag[0].textContent.replace('Error:', '').trim()
    throw new ApiError(errorText)
  }

  // Parse the transcript if present
  const transcriptTag = document.getElementsByTagName('transcript')
  if (transcriptTag.length > 0) {
    const textTags = transcriptTag[0].getElementsByTagName('text')
    const result = Array.from(textTags).map(textTag => {
      const start = textTag.getAttribute('start') || ''
      const text = textTag.textContent

      return {
        start: Math.round(parseFloat(start) || 0.0),
        content: text,
      }
    })

    return result
  }

  return []
}

export class YoutubeApis {
  static getTranscript(id, options = {}) {
    if (id && id.toLowerCase().includes('youtu')) {
      id = getIdFromUrl(id)
    }
    if (!id) {
      throw new ApiError('Invalid video id')
    }

    return instance
      .get(`/youtube/${id}`, {
        params: options,
      })
      .then(res => {
        return normalize(res)
      })
  }

  static getDetails(id, options = {}) {
    if (id && id.toLowerCase().includes('youtu')) {
      id = getIdFromUrl(id)
    }
    if (!id) {
      throw new ApiError('Invalid video id')
    }

    return instance.get(`/youtube/${id}`, {
      params: {
        ...options,
        type: 'details',
      },
    })
  }
}
