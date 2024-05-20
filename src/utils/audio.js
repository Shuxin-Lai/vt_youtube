export function convertSecToTimeline(seconds) {
  return convertMsToTimeline(seconds * 1000)
}

// console.log(convertMsToTimeline(1000)); // 00:01
// console.log(convertMsToTimeline(61000)); // 01:01
// console.log(convertMsToTimeline(3600000)); // 01:00:00
// console.log(convertMsToTimeline(3661000)); // 01:01:01
export function convertMsToTimeline(timestamp) {
  const seconds = Math.floor(timestamp / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingSeconds = seconds % 60
  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(remainingSeconds).padStart(2, '0')
  let res = `${formattedMinutes}:${formattedSeconds}`

  if (hours) {
    const remainingMinutes = minutes % 60
    const formattedHours = String(hours).padStart(2, '0')
    res = `${formattedHours}:${String(remainingMinutes).padStart(
      2,
      '0'
    )}:${formattedSeconds}`
  }

  return res
}

// console.log(convertTimelineToSecond("00:01")); // 1
// console.log(convertTimelineToSecond("01:01")); // 61
// console.log(convertTimelineToSecond("01:00:00")); // 3600
// console.log(convertTimelineToSecond("01:01:01")); // 3661
export function convertTimelineToSecond(timeline) {
  const parts = timeline.split(':')
  let m = ''
  let s = ''
  let h = ''

  if (parts.length === 2) {
    m = parts[0]
    s = parts[1]
  } else if (parts.length === 3) {
    h = parts[0]
    m = parts[1]
    s = parts[2]
  }

  const minutes = parseInt(m, 10) || 0
  const seconds = parseInt(s, 10) || 0
  const hours = parseInt(h, 10) || 0

  return hours * 3600 + minutes * 60 + seconds
}
