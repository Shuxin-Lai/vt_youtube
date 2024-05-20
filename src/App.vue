<template>
  <main class="p-4 flex flex-col gap-4">
    <div>
      <input
        v-model="id"
        type="text"
        placeholder="url"
        class="input input-bordered w-full max-w-xs"
      />
      <button class="btn btn-outline" @click="handlePaste">Paste</button>
      <button
        :disabled="isLoading"
        :class="isLoading ? 'loading' : ''"
        class="btn btn-outline"
        @click="handleClick"
      >
        fetch
      </button>
      <button class="btn btn-outline" @click="handleCache">Cache</button>
    </div>

    <div v-if="errorMessage">Error: {{ errorMessage }}</div>

    <article class="prose">
      <h2 v-if="details && details.title">
        {{ details.title }}
      </h2>
    </article>

    <div v-if="html">
      <div v-html="html"></div>
    </div>
    <div role="tablist" class="tabs tabs-lifted">
      <a
        role="tab"
        class="tab"
        :class="tab == 0 ? 'tab-active' : ''"
        @click="() => handleChange(0)"
      >
        Timeline
        <button class="btn btn-sm btn-ghost" @click.stop="handleCopy">
          <span class="text-sm font-normal">
            {{ timelineCopied ? 'Copied' : 'Copy' }}
          </span>
        </button>
      </a>
      <a
        role="tab"
        class="tab"
        :class="tab == 1 ? 'tab-active' : ''"
        @click="() => handleChange(1)"
      >
        Transcript
        <button class="btn btn-sm btn-ghost" @click.stop="handleCopyTranscript">
          <span class="text-sm font-normal">
            {{ transcriptCopied ? 'Copied' : 'Copy' }}
          </span>
        </button>
      </a>
    </div>

    <section v-show="tab == 0">
      <section>
        <p v-for="i in withTimeline" class="m-0">
          {{ i }}
        </p>
      </section>
    </section>

    <section v-show="tab == 1">
      <section>
        <p v-for="i in withoutTimeline">
          {{ i }}
        </p>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { YoutubeApis } from '@/apis'
import clipboard from 'clipboardy'
import { convertSecToTimeline } from '@/utils'
import { useClipboard, useUrlSearchParams } from '@vueuse/core'

const params = useUrlSearchParams()
const vid = params['vid'] || ''
const cache = params['cache'] || '1'
const id = ref(vid)
const list = ref([])
const details = ref({})
const errorMessage = ref('')
const isLoading = ref(false)
const tab = ref(0)

const withTimeline = computed(() => {
  return list.value.map(item => {
    const { start, content } = item
    return `${convertSecToTimeline(start)}: ${content}`
  })
})
const withTimelineText = computed(() => {
  return withTimeline.value.join('\n')
})

const withoutTimeline = computed(() => {
  return list.value.map(item => {
    const { content } = item
    return `${content}`
  })
})
const withoutTimelineText = computed(() => {
  return withoutTimeline.value.join('\n')
})

const withTranscript = computed(() => {
  return list.value.map(item => {
    const { start, content } = item
    return `${start}: ${content}`
  })
})

const html = computed(() => {
  const h = details.value.html
  if (!h) return ''

  return h
    .replace(/width=\"\d+\"/, 'width="100%"')
    .replace(/height=\"\d+\"/, 'height="400"')
})

const { copied: timelineCopied, copy: copyTimeline } = useClipboard({
  source: withTimelineText,
})

const { copied: transcriptCopied, copy: copyTranscript } = useClipboard({
  source: withoutTimelineText,
})

const handlePaste = async () => {
  const text = await clipboard.read()
  id.value = text
}

const handleClick = async () => {
  if (isLoading.value) return

  isLoading.value = true

  try {
    isLoading.value = true
    const transcript = await YoutubeApis.getTranscript(id.value)
    list.value = transcript

    const d = await YoutubeApis.getDetails(id.value)
    details.value = d

    document.title = details.title

    return { list: transcript, details: d }
  } catch (err) {
    console.log('err: ', err.message)
    errorMessage.value = err.message

    throw err
  } finally {
    isLoading.value = false
  }
}

const handleChange = index => {
  tab.value = index
  params.t = `${index}`
}

const handleCopy = () => {
  copyTimeline()
}

const handleCopyTranscript = () => {
  copyTranscript()
}

const handleCache = () => {
  const key = `ytb_${id.value}`
  window.localStorage.setItem(
    key,
    JSON.stringify({
      list: list.value,
      details: details.value,
    })
  )

  params.vid = id.value
}

onMounted(() => {
  if (!vid) return

  const key = `ytb_${vid}`
  if (cache) {
    const data = window.localStorage.getItem(key)
    if (data) {
      const cachedData = JSON.parse(data)

      list.value = cachedData.list || []
      details.value = cachedData.details || {}
    } else {
      handleClick().then(res => {
        window.localStorage.setItem(key, JSON.stringify(res))
      })
    }
  }
})

onMounted(() => {
  const tid = params['t']
  if (tid != null) {
    tab.value = parseInt(tid) || 0
  }
})
</script>

<style scoped></style>
