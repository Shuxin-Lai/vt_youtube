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
    </div>

    <div v-if="errorMessage">Error: {{ errorMessage }}</div>

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
        <p>
          {{ withoutTimeline }}
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
  return list.value
    .map(item => {
      const { content } = item
      return `${content}`
    })
    .join(' ')
})
const withTranscript = computed(() => {
  return list.value.map(item => {
    const { start, content } = item
    return `${start}: ${content}`
  })
})

const { copied: timelineCopied, copy: copyTimeline } = useClipboard({
  source: withTimelineText,
})

const { copied: transcriptCopied, copy: copyTranscript } = useClipboard({
  source: withoutTimeline,
})

const handlePaste = async () => {
  const text = await clipboard.read()
  id.value = text
}

const handleClick = () => {
  if (isLoading.value) return

  isLoading.value = true
  return YoutubeApis.getTranscript(id.value)
    .then(res => {
      list.value = res
      return res
    })
    .catch(err => {
      console.log('err: ', err.message)
      errorMessage.value = err.message

      throw err
    })
    .finally(() => {
      isLoading.value = false
    })
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

onMounted(() => {
  if (!vid) return

  const key = `youtube_${vid}`
  if (cache) {
    const data = window.localStorage.getItem(key)
    if (data) {
      list.value = JSON.parse(data)
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
