import type { AppConfig } from '@/store/useImageStore'

interface GenerationResponse {
  data: Array<{
    url?: string
    b64_json?: string
  }>
}

function getBasePath(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '')
}

function getAuthHeaders(config: AppConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  }
  return headers
}

function getGenUrl(config: AppConfig): string {
  const custom = config.genEndpoint.trim()
  if (custom) {
    return custom
  }
  return `${getBasePath(config.baseUrl)}/v1/images/generations`
}

function getEditUrl(config: AppConfig): string {
  const custom = config.editEndpoint.trim()
  if (custom) {
    return custom
  }
  return `${getBasePath(config.baseUrl)}/v1/images/edits`
}

const ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: 'API Key 无效或未授权',
  403: '无权限访问，请检查 API Key 或账户额度',
  429: '请求频率过高，请稍后重试',
  500: '服务端内部错误',
  502: '服务端网关错误，上游服务异常',
  503: '服务暂时不可用，请稍后重试',
  504: '服务端响应超时',
  554: '上游服务超时，请稍后重试或更换站点',
}

const ERROR_CODE_MESSAGES: Record<string, string> = {
  insufficient_user_quota: '账户额度已用完，请充值或更换 API Key',
  insufficient_quota: '账户额度不足',
  billing_not_active: '账户未激活计费',
  invalid_api_key: 'API Key 无效',
  account_deactivated: '账户已被停用',
  rate_limit_exceeded: '请求频率过高，请稍后重试',
  model_not_found: '模型不存在或不可用',
  context_length_exceeded: '提示词过长，超出模型上下文限制',
}

function getErrorMessage(status: number, serverBody: string): string {
  const statusMsg = ERROR_MESSAGES[status]
  let detail = ''

  try {
    const errorJson = JSON.parse(serverBody)
    const errorCode = errorJson.error?.code || ''
    const serverMsg = errorJson.error?.message || errorJson.message || ''

    if (errorCode && ERROR_CODE_MESSAGES[errorCode]) {
      return ERROR_CODE_MESSAGES[errorCode]
    }

    if (serverMsg && serverMsg !== (statusMsg || '')) {
      detail = serverMsg
    }
  } catch {
    // can't parse JSON, ignore
  }

  if (statusMsg) {
    return detail ? `${statusMsg}（${detail}）` : statusMsg
  }
  return detail || `请求失败 (${status})`
}

async function handleResponseError(response: Response): Promise<never> {
  const errorText = await response.text()
  const errorMessage = getErrorMessage(response.status, errorText)
  throw new Error(errorMessage)
}

export async function generateImage(
  config: AppConfig,
  prompt: string,
  size: string = '1024x1024',
  n: number = 1,
  signal?: AbortSignal
): Promise<GenerationResponse> {
  const url = getGenUrl(config)

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(config),
    body: JSON.stringify({
      model: config.modelId,
      prompt,
      n,
      size,
    }),
    signal,
  })

  if (!response.ok) {
    await handleResponseError(response)
  }

  return response.json()
}

export async function editImage(
  config: AppConfig,
  imageFile: File,
  prompt: string,
  size: string = '1024x1024',
  n: number = 1,
  signal?: AbortSignal
): Promise<GenerationResponse> {
  const url = getEditUrl(config)

  const formData = new FormData()
  formData.append('model', config.modelId)
  formData.append('image', imageFile)
  formData.append('prompt', prompt)
  formData.append('n', String(n))
  formData.append('size', size)

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.apiKey}`,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    signal,
  })

  if (!response.ok) {
    await handleResponseError(response)
  }

  return response.json()
}

export function getImageSrc(data: { url?: string; b64_json?: string }): string {
  if (data.url) {
    return data.url
  }
  if (data.b64_json) {
    return `data:image/png;base64,${data.b64_json}`
  }
  return ''
}
