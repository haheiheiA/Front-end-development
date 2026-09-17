import { onBeforeUnmount, onMounted, ref } from 'vue'

const HOME_STATE = {
  view: 'home',
  overlay: null,
  payload: null,
}

function createHistoryState(uiState) {
  return {
    daydone: true,
    ui: {
      view: uiState.view || 'home',
      overlay: uiState.overlay || null,
      payload: uiState.payload || null,
    },
  }
}

export function useUiHistory() {
  const activeView = ref('home')
  const isItemManagerOpen = ref(false)
  const noteEditor = ref(null)
  const isCelebrationOpen = ref(false)

  function applyUiState(uiState = HOME_STATE) {
    activeView.value = uiState.view || 'home'
    isItemManagerOpen.value = uiState.overlay === 'item-manager'
    noteEditor.value = uiState.overlay === 'note-editor' ? uiState.payload : null
    isCelebrationOpen.value = uiState.overlay === 'celebration'
  }

  function pushUiState(uiState) {
    const nextState = createHistoryState(uiState)
    window.history.pushState(nextState, '')
    applyUiState(nextState.ui)
  }

  function replaceWithHomeState() {
    const homeState = createHistoryState(HOME_STATE)
    window.history.replaceState(homeState, '')
    applyUiState(homeState.ui)
  }

  function navigateToView(view) {
    if (
      activeView.value === view &&
      !isItemManagerOpen.value &&
      !noteEditor.value &&
      !isCelebrationOpen.value
    ) {
      return
    }

    pushUiState({ view, overlay: null, payload: null })
  }

  function openItemManager() {
    pushUiState({ view: activeView.value, overlay: 'item-manager' })
  }

  function openNoteEditor(payload) {
    pushUiState({ view: activeView.value, overlay: 'note-editor', payload })
  }

  function openCelebration() {
    pushUiState({ view: activeView.value, overlay: 'celebration' })
  }

  function closeOverlay(overlay) {
    const currentUiState = window.history.state?.daydone
      ? window.history.state.ui
      : null

    if (currentUiState?.overlay === overlay) {
      window.history.back()
      return
    }

    applyUiState({
      view: activeView.value,
      overlay: null,
      payload: null,
    })
  }

  function handlePopState(event) {
    const uiState = event.state?.daydone ? event.state.ui : HOME_STATE
    applyUiState(uiState)
  }

  onMounted(() => {
    replaceWithHomeState()
    window.addEventListener('popstate', handlePopState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', handlePopState)
  })

  return {
    activeView,
    isItemManagerOpen,
    noteEditor,
    isCelebrationOpen,
    navigateToView,
    openItemManager,
    openNoteEditor,
    openCelebration,
    closeItemManager: () => closeOverlay('item-manager'),
    closeNoteEditor: () => closeOverlay('note-editor'),
    closeCelebration: () => closeOverlay('celebration'),
  }
}
