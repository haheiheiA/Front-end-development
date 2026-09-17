<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits(['close'])

const imageFailed = ref(false)
const confettiColors = ['#f7c948', '#ef7d57', '#4fb477', '#5a9bd5', '#d978af']
const confettiPieces = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  symbol: index % 3 === 0 ? '✦' : index % 3 === 1 ? '✧' : '•',
  left: `${(index * 17 + 5) % 100}%`,
  top: `${(index * 23 + 4) % 76}%`,
  color: confettiColors[index % confettiColors.length],
  delay: `${(index % 7) * 0.13}s`,
  rotation: `${(index * 43) % 360}deg`,
}))

function closeCelebration() {
  emit('close')
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeCelebration()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="celebration-backdrop" @click.self="closeCelebration">
      <section
        class="celebration"
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
      >
        <div class="celebration__confetti" aria-hidden="true">
          <span
            v-for="piece in confettiPieces"
            :key="piece.id"
            class="celebration__piece"
            :style="{
              left: piece.left,
              top: piece.top,
              color: piece.color,
              animationDelay: piece.delay,
              '--piece-rotation': piece.rotation,
            }"
          >
            {{ piece.symbol }}
          </span>
        </div>

        <div class="celebration__card">
          <div class="celebration__visual">
            <img
              v-if="!imageFailed"
              class="celebration__pingu"
              src="/assets/pingu/pingu.gif"
              alt="开心的 Pingu 正在庆祝"
              @error="imageFailed = true"
            />
            <span v-else class="celebration__fallback" aria-hidden="true">🐧</span>
          </div>

          <p class="celebration__eyebrow">DAY DONE</p>
          <h2 id="celebration-title">今天全部完成啦！🎉</h2>
          <p class="celebration__message">每一件小事都算数，今天也辛苦啦。</p>

          <button class="celebration__button" type="button" autofocus @click="closeCelebration">
            太棒了
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
